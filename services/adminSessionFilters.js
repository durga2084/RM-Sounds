export function getActiveSessionWhere(adminLoginID, now = new Date()) {
  return {
    AdminLoginID: adminLoginID,
    IsActive: true,
    OR: [{ ExpiresAt: null }, { ExpiresAt: { gt: now } }],
  };
}

export function getExpiredSessionWhere(adminLoginID, now = new Date()) {
  return {
    AdminLoginID: adminLoginID,
    IsActive: true,
    ExpiresAt: { lt: now },
  };
}
