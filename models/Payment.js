const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
  amount: { type: Number, required: true },
  paymentMode: { type: String, enum: ['UPI', 'Credit Card', 'Debit Card', 'Net Banking'], required: true },
  paymentDate: { type: Date, default: Date.now },
  receiptNo: { type: String, required: true, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);