const express = require('express');
const {validationResult} = require('express-validator');
const router = express.Router();
const usersRepo = require('../../repositories/users');
const signInTemplate = require('../../views/admin/auth/signin');
const signUpTemplate = require('../../views/admin/auth/signup');
const {handleErrors} = require('./middlewares');
const {requirePassword, requireEmail, requirePasswordConfirmation, requireLoginEmail, requireLoginPassword} = require('./validator');

router.get('/signup', (req, res) => {
  res.send(signUpTemplate({ req }))
})

router.post('/signup',
  [requirePassword, requireEmail, requirePasswordConfirmation],
  handleErrors(signUpTemplate),
  async (req, res) => {
    const errors = validationResult(req);
    // const resStatus;
    console.log(errors);
    const {email, password, passwordConfirmation} = req.body;
    const user = await usersRepo.create({ email, password });
    console.log(user);
    console.log(`${user} has been created`)
    req.session.userId = user.id;
    res.redirect('/admin/products');
    // res.redirect('/admin/test')
  })

router.get('/signout', async (req, res) => {
  req.session = null;

  res.redirect('/signin');
})

router.get('/signin', async (req, res) => {
  res.send(signInTemplate({}))
})

router.post('/signin',
  [requireLoginEmail, requireLoginPassword],
  handleErrors(signInTemplate),
  async (req, res) => {
    const errors = validationResult(req);
    console.log(errors);
    const { email, password } = req.body;
    const user = await usersRepo.getOneBy({ email });
    req.session.userId = user.id;
    res.redirect('/admin/products')
})

module.exports = router;
