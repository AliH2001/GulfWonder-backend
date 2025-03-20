const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },

    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    rating: {
        type:Number,
        min:0, 
        max:5
    },  

    date: { 
        type: Date, 
        default: Date.now 
    }
  },
  { timestamps: true }
);



const recipeSchema = new mongoose.Schema({
  title: {
     type: String,
    required: true
 },
  category: { 
    type: String, 
    required: true, 
    enum: ['Main Course','Desserts','Snacks','Drinks'] 
},
  ingredients: { 
    type: String, 
    required: true 
},
  instructions: { 
    type: String 
},
  time: { 
    type: Number,
    min: 0 
    },
  description: { 
    type: String 
},
  imageUrl: { 
    type: String,
    default: 'https://theme-assets.getbento.com/sensei/11492d5.sensei/assets/images/catering-item-placeholder-704x520.png'
 },
  author: { 
    type: mongoose.Schema.Types.ObjectId, ref: 'User',
    
},
comments: [commentSchema],
});
const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;