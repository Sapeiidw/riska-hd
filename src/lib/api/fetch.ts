/**
 * Global auth redirect - redirect to login immediately
 */
export function redirectToLogin(): never {
  if (typeof window !== "undefined") {
    window.location.replace("/sign-in");
  }
  // Throw to stop execution
  throw new Error("Redirecting to login...");
}

/**
 * Check API response for unauthorized error and redirect
 */
export function checkUnauthorized(response: { error?: { code?: string } }): void {
  if (response.error?.code === "UNAUTHORIZED") {
    redirectToLogin();
  }
}
