const express = require('express');
// auth
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Models
const User = require('../models/user');

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Username or Email already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, parseInt(process.env.SALT_ROUNDS));


    const user = await User.create({ 
      username, 
      email, 
      hashedPassword,  
      role 
    });

    const token = jwt.sign(
      {
        _id: user._id,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET
    );

    return res.status(201).json({ 
      user: { _id: user._id, username: user.username, email: user.email, role: user.role }, 
      token 
    });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong, try again.'});
  }
});

router.post('/signin', async (req, res) => {
  try {
    const { username, password } = req.body;

    const existingUser = await User.findOne({ username });

    if (!existingUser) {
      return res.status(400).json({ error: 'Invalid Credentials' });
    }

    const isValidPassword = bcrypt.compareSync(password, existingUser.hashedPassword);

    if (!isValidPassword) {
      throw Error('Invalid Credentials');
    }

    const token = jwt.sign(
      {
        _id: existingUser._id,
        username: existingUser.username,
        role: existingUser.role 
      },
      process.env.JWT_SECRET
    );

    return res.status(200).json({  
      user: { _id: existingUser._id, username: existingUser.username, email: existingUser.email, role: existingUser.role }, 
      token 
    });
  } catch (error) {
    res.status(400).json({ error: 'Something went wrong, try again.' });
  }
});

router.get('/my-bookings', async (req, res) => {
  try {
    const userId = req.user._id; 

    const user = await User.findById(userId).populate({
      path: 'bookings',
      populate: { path: 'place' } 
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ bookings: user.bookings });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = router;
