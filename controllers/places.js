// controllers/places.js

const express = require('express');
const verifyToken = require('../middleware/verify-token.js');
const Place = require('../models/place.js');

const router = express.Router();

// ============= Public Routes ===============

// Get all places
router.get('/', async (req, res) => {
  try {
    const places = await Place.find({}).populate('author').sort({ createdAt: 'desc' });
    res.status(200).json(places);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Get a single place by ID
router.get('/:placeId', async (req, res) => {
  try {
    const place = await Place.findById(req.params.placeId).populate('author').populate({
      path: 'reviews',
      populate: { path: 'author', select: 'username' },
    });
    res.status(200).json(place);
  } catch (error) {
    res.status(500).json(error);
  }
});




// ============= Protected Routes ===============

router.use(verifyToken);

// Create a new place
router.post('/', async (req, res) => {
  try {
    req.body.author = req.user._id;
    const place = await Place.create(req.body);
    place._doc.author = req.user;
    res.status(201).json(place);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

// Update a place
router.put('/:placeId', async (req, res) => {
  try {
    const place = await Place.findById(req.params.placeId);
    if (!place.author.equals(req.user._id)) {
      return res.status(403).send("You're not allowed to do that!");
    }
    const updatedPlace = await Place.findByIdAndUpdate(req.params.placeId, req.body, { new: true });
    updatedPlace._doc.author = req.user;
    res.status(200).json(updatedPlace);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Delete a place
router.delete('/:placeId', async (req, res) => {
  try {
    const place = await Place.findById(req.params.placeId);
    if (!place.author.equals(req.user._id)) {
      return res.status(403).send("You're not allowed to do that!");
    }
    const deletedPlace = await Place.findByIdAndDelete(req.params.placeId);
    res.status(200).json(deletedPlace);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

// ============= Comments ===============

router.post('/:placeId/reviews', async (req, res) => {
  try {
    console.log("Received request for adding review");
    console.log("Place ID:", req.params.placeId);
    console.log("Request body:", req.body);

    const place = await Place.findById(req.params.placeId);
    if (!place) {
      return res.status(404).json({ message: 'Place not found' });
    }

    // Ensure reviews array exists (it should always exist due to schema)
    if (!place.reviews) {
      place.reviews = [];
    }

    // Add author to request body
    req.body.author = req.user._id;

    // Push the new review into the reviews array
    place.reviews.push(req.body);
    await place.save();

    res.status(200).json(place.reviews[place.reviews.length - 1]);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});


// Update a comment on a place
router.put('/:placeId/comments/:commentId', async (req, res) => {
  try {
    const place = await Place.findById(req.params.placeId);
    const comment = place.comments.id(req.params.commentId);
    comment.text = req.body.text;
    await place.save();
    res.status(200).json({ message: 'Ok' });
  } catch (error) {
    res.status(500).json(error);
  }
});

// Delete a comment from a place
router.delete('/:placeId/comments/:commentId', async (req, res) => {
  try {
    const place = await Place.findById(req.params.placeId);
    place.comments.remove({ _id: req.params.commentId });
    await place.save();
    res.status(200).json({ message: 'Ok' });
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
