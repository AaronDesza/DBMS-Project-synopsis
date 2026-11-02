const mongoose = require('mongoose');

const tourPackageSchema = new mongoose.Schema({
  packageName: { type: String, required: true },
  durationDays: { type: Number, required: true },
  price: { type: Number, required: true },
  details: { type: String, required: true },
  destinations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Destination' }]
}, { timestamps: true });

module.exports = mongoose.model('TourPackage', tourPackageSchema);