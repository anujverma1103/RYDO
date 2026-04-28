/**
 * Allows access only when the decoded JWT role matches the required role.
 *
 * @param {'passenger'|'driver'} role - Required account role.
 * @returns {Function}
 */
const roleCheck = (role) => (req, res, next) => {
  if (!req.user || req.user.role !== role) {
    return res.status(403).json({ message: 'You do not have permission to access this resource' });
  }

  return next();
};

module.exports = roleCheck;
