const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized. User context missing.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden. Access denied for role '${req.user.role}'. Required role(s): [${allowedRoles.join(', ')}]`,
      });
    }

    next();
  };
};

module.exports = {
  checkRole,
};
