const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  place: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Place",
    required: true,
  },
  bookingDate: {
    type: Date,
    required: true,
  },
  bookingPrice: {
    type: Number,
    required: true,
  },
  ticketNumber: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model('Booking', bookingSchema);