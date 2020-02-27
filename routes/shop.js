const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator/check');

const User = require('../models/User');
const Shop = require('../models/Shop');

// @route     GET api/shops
// @desc      Get all users shops
// @access    Private
router.get('/', auth, async (req, res) => {
  try {
    const shops = await Shop.find({ user: req.user.id }).sort({
      date: -1
    });
    res.json(shops);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route     POST api/shops
// @desc      Add new shop
// @access    Private
router.post(
  '/',
  [
    auth,
    [
      check('name', 'Name is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, type } = req.body;

    try {
      const newShop = new Shop({
        name,
        email,
        phone,
        type,
        user: req.user.id
      });

      const shop = await newShop.save();

      res.json(shop);
    } catch (err) {
      console.error(er.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route     PUT api/shops/:id
// @desc      Update shop
// @access    Private
router.put('/:id', auth, async (req, res) => {
  const { name, email, phone, type } = req.body;

  // Build shop object
  const shopFields = {};
  if (name) shopFields.name = name;
  if (email) shopFields.email = email;
  if (phone) shopFields.phone = phone;
  if (type) shopFields.type = type;

  try {
    let shop = await Shop.findById(req.params.id);

    if (!shop) return res.status(404).json({ msg: 'Shop not found' });

    // Make sure user owns shop
    if (shop.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    shop = await Shop.findByIdAndUpdate(
      req.params.id,
      { $set: shopFields },
      { new: true }
    );

    res.json(shop);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route     DELETE api/shops/:id
// @desc      Delete shop
// @access    Private
router.delete('/:id', auth, async (req, res) => {
  try {
    let shop = await Shop.findById(req.params.id);

    if (!shop) return res.status(404).json({ msg: 'Shop not found' });

    // Make sure user owns shop
    if (shop.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await Shop.findByIdAndRemove(req.params.id);

    res.json({ msg: 'Shop removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
