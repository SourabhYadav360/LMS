export const hasPermission = (user, permission) => {
  if (!user) {
    return false;
  }

  // Super Admin has everything
  if (user.role === "SUPER_ADMIN") {
    return true;
  }

  return user[permission] === true;
};