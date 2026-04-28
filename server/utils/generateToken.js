const jwt = require('jsonwebtoken');

/**
 * Creates a signed JWT with the fields needed for role checks and room joins.
 *
 * @param {object} account - Passenger or driver mongoose document.
 * @returns {string}
 */
const generateToken = (account) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }

  return jwt.sign(
    {
      id: account._id.toString(),
      role: account.role,
      name: account.name,
      email: account.email
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d'
    }
  );
};

module.exports = generateToken;
