// controllers/recipes.js

const express = require('express');
const verifyToken = require('../middleware/verify-token.js');
const Recipe = require('../models/recipe.js');

const router = express.Router();

// ============= public routes ===============



router.get('/', async (req, res) => {
    try {
      const recipes = await Recipe.find({}).populate('author').sort({ createdAt: 'desc' });
      res.status(200).json(recipes);
    } catch (error) {
      res.status(500).json(error);
    }
  });


  router.get('/:recipeId', async (req, res) => {
    try {
      const recipe = await Recipe.findById(req.params.recipeId).populate("author").populate( {
        path: 'comments',
        populate: { path: 'author', select: 'username' }
      })
      res.status(200).json(recipe);
    } catch (error) {
      res.status(500).json(error);
    }
  });

// ============= Protected Routes ===============
router.use(verifyToken);

// Create a new recipe
router.post('/', async (req, res) => {
  try {
    req.body.author = req.user._id;
    const recipe = await Recipe.create(req.body);
    recipe._doc.author = req.user;
    res.status(201).json(recipe);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

// Update a recipe
router.put('/:recipeId', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.recipeId);
    if (!recipe.author.equals(req.user._id)) {
      return res.status(403).send("You're not allowed to do that!");
    }
    const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.recipeId, req.body, { new: true });
    updatedRecipe._doc.author = req.user;
    res.status(200).json(updatedRecipe);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Delete a recipe
router.delete('/:recipeId', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.recipeId);
    if (!recipe.author.equals(req.user._id)) {
      return res.status(403).send("You're not allowed to do that!");
    }
    const deletedRecipe = await Recipe.findByIdAndDelete(req.params.recipeId);
    res.status(200).json(deletedRecipe);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

// ============= Comments ===============

// Add a comment to a recipe
router.post('/:recipeId/comments', async (req, res) => {
  try {
    
    req.body.author = req.user._id;
    
    const recipe = await Recipe.findById(req.params.recipeId);
    recipe.comments.push(req.body);
    await recipe.save();
    const newComment = recipe.comments[recipe.comments.length - 1];
    newComment._doc.author = req.user;
    res.status(200).json(newComment);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Update a comment on a recipe
router.put('/:recipeId/comments/:commentId', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.recipeId);
    const comment = recipe.comments.id(req.params.commentId);
    comment.text = req.body.text;
    await recipe.save();
    res.status(200).json({ message: 'Ok' });
  } catch (error) {
    res.status(500).json(error);
  }
});

// Delete a comment from a recipe
router.delete('/:recipeId/comments/:commentId', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.recipeId);
    recipe.comments.remove({ _id: req.params.commentId });
    await recipe.save();
    res.status(200).json({ message: 'Ok' });
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
