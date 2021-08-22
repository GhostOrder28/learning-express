const usersRepo = require('../../repositories/users');
const { check } = require('express-validator');

module.exports = {
  requireTitle: check('title')
    .trim()
    .isLength({min: 5, max: 40})
    .withMessage('Title should have between 5 - 40 characters.'),
  requirePrice: check('price')
    .trim()
    .toFloat()
    .isFloat({min: 1})
    .withMessage('Price should be a number minimum of 1'),
  requireEmail: check('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Invalid email format')
    .custom(async email => {
      const existingUser = await usersRepo.getOneBy({email});
      if (existingUser) throw new Error('Email already taken');
    }),
  requirePassword: check('password')
    .trim()
    .isLength({min: 3, max: 64})
    .withMessage('Password must have between 3 - 64 characters'),
  requirePasswordConfirmation: check('passwordConfirmation')
    .trim()
    .isLength({min: 3, max: 64})
    .withMessage('Password must have between 3 - 64 characters')
    .custom((passwordConfirmation, { req }) => {
      if (passwordConfirmation !== req.body.password) {
        throw new Error('Password confirmation does not match')
      }
      return true;
    }),
  requireLoginEmail: check('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Must provide a valid email')
    .custom(async email => {
      const user = await usersRepo.getOneBy({ email });
      if (!user) throw new Error('email not found')
    }),
  requireLoginPassword: check('password')
    .trim()
    .custom(async (password, {req}) => {
      const user = await usersRepo.getOneBy({ email: req.body.email });
      if (!user) throw new Error('Invalid password');
      const validPwd = await usersRepo.comparePasswords(user.password, password);
      if (!validPwd) throw new Error('Invalid password');
    })
}
