// middleware/role.js
export const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (req.user && req.user.roles) {
      const hasRole = req.user.roles.some((role) =>
        allowedRoles.includes(role)
      );

      if (hasRole) {
        return next();
      }
    }

    return res
      .status(403)
      .json({ message: `Access denied: ${allowedRoles.join(", ")} required` });
  };
};
