export function getAdminSessionToken(): string {
  if (typeof window === "undefined") return "";

  try {
    const cookieToken = document.cookie
      .split("; ")
      .find((entry) => entry.startsWith("token="))
      ?.split("=")[1];

    if (cookieToken) return decodeURIComponent(cookieToken);

    const localToken = window.localStorage.getItem("AdminToken");
    return localToken || "";
  } catch {
    return "";
  }
}

export function hasAdminSession(): boolean {
  return Boolean(getAdminSessionToken());
}
