const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  package: { type: mongoose.Schema.Types.ObjectId, ref: 'TourPackage', required: true },
  hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  transport: { type: mongoose.Schema.Types.ObjectId, ref: 'Transport', required: true },
  travelDate: { type: Date, required: true },
  priceBreakdown: {
    packagePrice: Number,
    hotelTotal: Number,
    transportPrice: Number
  },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);