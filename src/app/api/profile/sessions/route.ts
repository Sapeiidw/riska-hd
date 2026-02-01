import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { session } from "@/db/schema";
import { requireAuth, getSession } from "@/lib/api/auth";
import {
  successResponse,
  serverErrorResponse,
} from "@/lib/api/response";
import { eq, and, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if ("error" in authResult) return authResult.error;

  try {
    const { session: authSession } = authResult;

    // Get all sessions for the current user
    const sessions = await db
      .select({
        id: session.id,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
      })
      .from(session)
      .where(eq(session.userId, authSession.user.id))
      .orderBy(desc(session.createdAt));

    // Get current session token from auth
    const currentSession = await getSession(request);
    const currentSessionId = currentSession?.session?.id;

    // Mark which session is current
    const sessionsWithCurrent = sessions.map((s) => ({
      ...s,
      isCurrent: s.id === currentSessionId,
    }));

    return successResponse(sessionsWithCurrent);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return serverErrorResponse("Gagal memuat daftar sesi");
  }
}

export async function DELETE(request: NextRequest) {
  const authResult = await requireAuth(request);
  if ("error" in authResult) return authResult.error;

  try {
    const { session: authSession } = authResult;
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return serverErrorResponse("Session ID diperlukan");
    }

    // Get current session
    const currentSession = await getSession(request);
    const currentSessionId = currentSession?.session?.id;

    // Prevent deleting current session via this endpoint
    if (sessionId === currentSessionId) {
      return serverErrorResponse("Tidak dapat menghapus sesi aktif. Gunakan logout.");
    }

    // Delete the session (only if it belongs to the current user)
    await db
      .delete(session)
      .where(
        and(
          eq(session.id, sessionId),
          eq(session.userId, authSession.user.id)
        )
      );

    return successResponse({ message: "Sesi berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting session:", error);
    return serverErrorResponse("Gagal menghapus sesi");
  }
}
