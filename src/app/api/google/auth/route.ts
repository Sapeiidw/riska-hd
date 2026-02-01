import { NextRequest, NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/google/calendar";
import { requireAuth } from "@/lib/api/auth";

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if ("error" in authResult) return authResult.error;

  try {
    const { searchParams } = new URL(request.url);
    const returnUrl = searchParams.get("returnUrl") || "/schedules/nurses";

    // Include user ID and return URL in state
    const state = JSON.stringify({
      userId: authResult.session.user.id,
      returnUrl,
    });

    const authUrl = getAuthUrl(Buffer.from(state).toString("base64"));

    return NextResponse.json({ url: authUrl });
  } catch (error) {
    console.error("Error generating auth URL:", error);
    return NextResponse.json(
      { error: "Failed to generate authorization URL" },
      { status: 500 }
    );
  }
}
