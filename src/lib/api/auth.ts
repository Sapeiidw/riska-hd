import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";
import { hasPermission } from "@/lib/permissions";
import { unauthorizedResponse, forbiddenResponse } from "./response";

export async function getSession(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  return session;
}

export async function requireAuth(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return { error: unauthorizedResponse("Authentication required") };
  }
  return { session };
}

export async function requirePermission(
  request: NextRequest,
  permission: string
) {
  const session = await getSession(request);
  if (!session) {
    return { error: unauthorizedResponse("Authentication required") };
  }

  if (!hasPermission(session.user as { role?: string | null }, permission)) {
    return {
      error: forbiddenResponse("You do not have permission to access this resource"),
    };
  }

  return { session };
}
