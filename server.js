// server.js
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const { User, Admin, Destination, TourPackage, Hotel, Transport, Booking, Payment, Review } = require('./models/Schemas');

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(cors());
app.use(express.json());
app.use(session({ secret: 'travel_booking_secret_key', resave: false, saveUninitialized: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Module 1: Auth API
app.post('/api/auth', async (req, res) => {
    const action = req.query.action;
    const { name, email, password, phone, role } = req.body;
    try {
        if (action === 'register') {
            if (!name || !email || !password || !phone) return res.json({ status: 'error', message: 'All fields required.' });
            const existing = await User.findOne({ email });
            if (existing) return res.json({ status: 'error', message: 'Email already registered.' });
            const hashedPassword = await bcrypt.hash(password, 10);
            await User.create({ name, email, password: hashedPassword, phone });
            return res.json({ status: 'success', message: 'Registration successful!' });
        }
        if (action === 'login') {
            if (role === 'admin') {
                const admin = await Admin.findOne({ email });
                if (admin && await bcrypt.compare(password, admin.password)) {
                    req.session.admin_id = admin._id;
                    return res.json({ status: 'success', role: 'admin', user: { id: admin._id, name: admin.name } });
                }
            } else {
                const user = await User.findOne({ email });
                if (user && await bcrypt.compare(password, user.password)) {
                    req.session.user_id = user._id;
                    return res.json({ status: 'success', role: 'traveller', user: { id: user._id, name: user.name } });
                }
            }
            return res.json({ status: 'error', message: 'Invalid credentials.' });
        }
        if (action === 'logout') {
            req.session.destroy();
            return res.json({ status: 'success', message: 'Logged out.' });
        }
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Modules 2, 3, 4, 5: Explore API
app.get('/api/explore', async (req, res) => {
    try {
        const { category = '', search = '' } = req.query;
        const filter = {};
        if (category && category !== 'All') filter.category = category;
        if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { location: { $regex: search, $options: 'i' } }];

        const destinationsList = await Destination.find(filter).sort({ createdAt: -1 }).lean();
        const packages = await TourPackage.find().lean();
        const reviews = await Review.find().lean();

        const enrichedDestinations = destinationsList.map(dest => {
            const linkedPkg = packages.find(pkg => pkg.destinations.some(id => id.toString() === dest._id.toString()));
            const destReviews = reviews.filter(r => r.destination_id.toString() === dest._id.toString());
            const avgRating = destReviews.length ? (destReviews.reduce((sum, r) => sum + r.rating, 0) / destReviews.length).toFixed(1) : 0;
            return {
                destination_id: dest._id, name: dest.name, location: dest.location, category: dest.category,
                description: dest.description, image_url: dest.image_url,
                package_id: linkedPkg ? linkedPkg._id : null, package_name: linkedPkg ? linkedPkg.package_name : 'Custom Tour',
                duration_days: linkedPkg ? linkedPkg.duration_days : 1, package_price: linkedPkg ? linkedPkg.price : 0,
                avg_rating: avgRating, review_count: destReviews.length
            };
        });

        const hotels = await Hotel.find().sort({ rating: -1 }).lean();
        const transports = await Transport.find().sort({ price: 1 }).lean();

        res.json({ status: 'success', destinations: enrichedDestinations, hotels: hotels.map(h => ({ ...h, hotel_id: h._id })), transports: transports.map(t => ({ ...t, transport_id: t._id })) });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Modules 6 & 7: Booking & Payment API
app.post('/api/book-trip', async (req, res) => {
    try {
        let user_id = req.session.user_id || req.body.user_id;
        if (!user_id) { const firstUser = await User.findOne(); user_id = firstUser ? firstUser._id : null; }
        const { package_id, hotel_id, transport_id, travel_date, payment_mode = 'UPI' } = req.body;

        const [pkg, hotel, transport] = await Promise.all([TourPackage.findById(package_id), Hotel.findById(hotel_id), Transport.findById(transport_id)]);
        if (!pkg || !hotel || !transport) return res.json({ status: 'error', message: 'Invalid selections.' });

        const total_amount = pkg.price + (hotel.price_per_night * pkg.duration_days) + transport.price;
        const booking = await Booking.create({ user_id, package_id, hotel_id, transport_id, travel_date, total_amount, status: 'Confirmed' });
        const payment = await Payment.create({ booking_id: booking._id, amount: total_amount, payment_mode });

        res.json({ status: 'success', message: 'Booking Confirmed!', receipt: { booking_id: booking._id, payment_id: payment._id, total_amount } });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Module 8: Reviews API
app.get('/api/reviews', async (req, res) => {
    try {
        const { destination_id } = req.query;
        const reviews = await Review.find(destination_id ? { destination_id } : {}).populate('user_id', 'name').populate('destination_id', 'name').sort({ review_date: -1 }).lean();
        res.json({ status: 'success', reviews: reviews.map(r => ({ review_id: r._id, traveller_name: r.user_id?.name || 'Traveller', destination_name: r.destination_id?.name || '', rating: r.rating, comment: r.comment })) });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

app.post('/api/reviews', async (req, res) => {
    try {
        let user_id = req.session.user_id || req.body.user_id;
        if (!user_id) { const firstUser = await User.findOne(); user_id = firstUser?._id; }
        const { destination_id, rating = 5, comment } = req.body;
        await Review.create({ user_id, destination_id, rating: Number(rating), comment: comment.trim() });
        res.json({ status: 'success', message: 'Review published!' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Module 9: Admin Management API
app.post('/api/admin', async (req, res) => {
    const action = req.query.action;
    try {
        if (action === 'add_destination_package') {
            const { name, location, category, description, image_url, package_name, duration_days, price } = req.body;
            const admin = await Admin.findOne();
            const newDest = await Destination.create({ admin_id: admin?._id, name, location, category, description, image_url });
            await TourPackage.create({ admin_id: admin?._id, package_name, duration_days: Number(duration_days), price: Number(price), destinations: [newDest._id] });
            return res.json({ status: 'success', message: 'Destination & Package added!' });
        }
        if (action === 'delete_review') {
            await Review.findByIdAndDelete(req.body.review_id);
            return res.json({ status: 'success', message: 'Review deleted.' });
        }
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
