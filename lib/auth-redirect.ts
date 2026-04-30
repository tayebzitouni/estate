export function getPostAuthRedirect(role: string, locale: string) {
  if (role === "ADMIN") {
    return `/${locale}/admin`;
  }

  if (role === "OWNER" || role === "AGENT" || role === "PROPERTY_MANAGER") {
    return `/${locale}/dashboard`;
  }

  return `/${locale}`;
}
