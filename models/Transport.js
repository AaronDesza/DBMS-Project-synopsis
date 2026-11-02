const mongoose = require('mongoose');

const transportSchema = new mongoose.Schema({
  type: { type: String, required: true },
  operatorName: { type: String, required: true },
  price: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Transport', transportSchema);