const express = require('express');
const multer = require('multer');

const productsRepo = require('../../repositories/products');
const productsNew = require('../../views/admin/products/new');
const {handleErrors, requireAuth} = require('./middlewares');
const {requireTitle, requirePrice} = require('./validator');
const productIndexTemplate = require('../../views/admin/products/index');
const productsEditTemplate = require('../../views/admin/products/edit');

const router = express.Router();
const upload = multer({storage: multer.memoryStorage()});


router.get('/admin/products',
  // requireAuth,
  async (req, res) => {
    const products = await productsRepo.getAll();
    // res.send(productIndexTemplate({products}))
    res.send(JSON.stringify(products))
    console.log(`User id is: ${req.session.userId} (requireAuth removed)`);
});

router.get('/admin/products/new',
  requireAuth,
  (req, res) => {
    res.send(productsNew({}));
  });

router.post('/admin/products/new',
  requireAuth,
  upload.single('image'),
  [requireTitle, requirePrice],
  handleErrors(productsNew),
  async (req, res) => {
    const errors = validationResult(req);
    const image = req.file.buffer.toString('base64');
    const {title, price} = req.body;
    await productsRepo.create({title, price, image})
    res.send('submitted');
});

router.get('/admin/products/:id/edit',
  requireAuth,
  async (req, res) => {
    const product = await productsRepo.getOne(req.params.id);
    if (!product) {
      res.send('Product not found')
    }
    res.send(productsEditTemplate({product}))
  }
);

router.post('/admin/products/:id/edit',
  requireAuth,
  upload.single('image'),
  [requireTitle, requirePrice],
  handleErrors(productsEditTemplate),
  async(req, res) => {
    const changes = req.body;
    if (req.file) {
      changes.image = req.file.buffer.toString('base64');
    }

    try {
      await productsRepo.update(req.params.id, changes);
    } catch (err) {
      return res.send('Could not find item');
    }

    res.redirect('/admin/products');
  }
);

router.get('/admin/test', requireAuth, (req, res) => {
  res.send('Test')
})

module.exports = router;
