import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { googleCalendarToken } from "@/db/schema";
import { getTokensFromCode } from "@/lib/google/calendar";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const stateParam = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      console.error("Google OAuth error:", error);
      return NextResponse.redirect(
        new URL("/schedules/nurses?error=google_auth_denied", request.url)
      );
    }

    if (!code || !stateParam) {
      return NextResponse.redirect(
        new URL("/schedules/nurses?error=missing_params", request.url)
      );
    }

    // Decode state
    let state: { userId: string; returnUrl: string };
    try {
      state = JSON.parse(Buffer.from(stateParam, "base64").toString());
    } catch {
      return NextResponse.redirect(
        new URL("/schedules/nurses?error=invalid_state", request.url)
      );
    }

    // Exchange code for tokens
    const tokens = await getTokensFromCode(code);

    if (!tokens.access_token) {
      return NextResponse.redirect(
        new URL("/schedules/nurses?error=no_access_token", request.url)
      );
    }

    // Check if user already has tokens
    const existingToken = await db
      .select()
      .from(googleCalendarToken)
      .where(eq(googleCalendarToken.userId, state.userId))
      .limit(1);

    if (existingToken.length > 0) {
      // Update existing token
      await db
        .update(googleCalendarToken)
        .set({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token || existingToken[0].refreshToken,
          expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
          updatedAt: new Date(),
        })
        .where(eq(googleCalendarToken.userId, state.userId));
    } else {
      // Insert new token
      await db.insert(googleCalendarToken).values({
        userId: state.userId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || null,
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      });
    }

    return NextResponse.redirect(
      new URL(`${state.returnUrl}?google_connected=true`, request.url)
    );
  } catch (error) {
    console.error("Error in Google callback:", error);
    return NextResponse.redirect(
      new URL("/schedules/nurses?error=callback_failed", request.url)
    );
  }
}
