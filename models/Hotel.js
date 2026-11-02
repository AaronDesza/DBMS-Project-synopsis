const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  hotelName: { type: String, required: true },
  pricePerNight: { type: Number, required: true },
  rating: { type: Number, min: 1, max: 5, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Hotel', hotelSchema);