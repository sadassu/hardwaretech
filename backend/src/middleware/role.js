// middleware/role.js
export const requireRole = (role) => {
  return (req, res, next) => {
    if (req.user && req.user.roles && req.user.roles.includes(role)) {
      next();
    } else {
      return res
        .status(403)
        .json({ message: `Access denied: ${role} role required` });
    }
  };
};
