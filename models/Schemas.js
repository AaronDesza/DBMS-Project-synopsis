// models/Schemas.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, required: true, trim: true }
}, { timestamps: true });

const adminSchema = new Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true }
}, { timestamps: true });

const destinationSchema = new Schema({
    admin_id: { type: Schema.Types.ObjectId, ref: 'Admin', default: null },
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    image_url: { type: String, default: '' }
}, { timestamps: true });

const tourPackageSchema = new Schema({
    admin_id: { type: Schema.Types.ObjectId, ref: 'Admin', default: null },
    package_name: { type: String, required: true, trim: true },
    duration_days: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    destinations: [{ type: Schema.Types.ObjectId, ref: 'Destination' }]
}, { timestamps: true });

const hotelSchema = new Schema({
    hotel_name: { type: String, required: true, trim: true },
    price_per_night: { type: Number, required: true, min: 0 },
    rating: { type: Number, required: true, min: 1, max: 5 }
});

const transportSchema = new Schema({
    type: { type: String, enum: ['Flight', 'Train', 'Bus', 'Cab'], required: true },
    operator_name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 }
});

const bookingSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    package_id: { type: Schema.Types.ObjectId, ref: 'TourPackage', required: true },
    hotel_id: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true },
    transport_id: { type: Schema.Types.ObjectId, ref: 'Transport', required: true },
    booking_date: { type: Date, default: Date.now },
    travel_date: { type: Date, required: true },
    total_amount: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled'], default: 'Confirmed' }
});

const paymentSchema = new Schema({
    booking_id: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    amount: { type: Number, required: true },
    payment_date: { type: Date, default: Date.now },
    payment_mode: { type: String, enum: ['UPI', 'Credit Card', 'Debit Card', 'Net Banking'], required: true }
});

const reviewSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    destination_id: { type: Schema.Types.ObjectId, ref: 'Destination', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    review_date: { type: Date, default: Date.now }
});

module.exports = {
    User: mongoose.model('User', userSchema),
    Admin: mongoose.model('Admin', adminSchema),
    Destination: mongoose.model('Destination', destinationSchema),
    TourPackage: mongoose.model('TourPackage', tourPackageSchema),
    Hotel: mongoose.model('Hotel', hotelSchema),
    Transport: mongoose.model('Transport', transportSchema),
    Booking: mongoose.model('Booking', bookingSchema),
    Payment: mongoose.model('Payment', paymentSchema),
    Review: mongoose.model('Review', reviewSchema)
};
