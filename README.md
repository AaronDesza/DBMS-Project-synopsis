# 🌍 TourQuest - Travel & Tour Management System (DBMS Project)

A complete, full-stack Relational Database Management System (DBMS) project designed for academic presentation, synopsis review, and real-world travel exploration.

---

## 📁 Project Structure

```text
DBMS/
├── backend/                  # Express.js REST API & Relational Database Layer
│   ├── src/
│   │   ├── config/database.js# SQLite connection & PRAGMA configuration
│   │   ├── controllers/      # Business logic & SQL query execution
│   │   ├── routes/           # API Endpoints (/tours, /bookings, /reviews, /dbms)
│   │   ├── db/
│   │   │   ├── schema.sql    # DDL: Tables, constraints, foreign keys, views & indexes
│   │   │   ├── seeds.sql     # DML: Realistic seed records (tours, bookings, guides, reviews)
│   │   │   └── initDb.js     # Automatic database migration and seeding
│   │   └── server.js         # Express server entry point
│   ├── database.sqlite       # Relational SQLite database file
│   └── package.json
│
├── frontend/                 # React (Vite) UI & Interactive DBMS Console
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Tab routing with badge counters
│   │   │   ├── HeroBanner.jsx       # Interactive search & category filter pills
│   │   │   ├── TourCard.jsx         # Card preview with ratings & pricing
│   │   │   ├── TourDetailModal.jsx  # Itinerary viewer, guides & live review posting
│   │   │   ├── BookingModal.jsx     # Transactional booking flow
│   │   │   ├── MyBookings.jsx       # Reservations dashboard & cancellation
│   │   │   ├── DbmsExplorer.jsx     # Relational table browser & Live SQL playground
│   │   │   ├── AnalyticsView.jsx    # Real-time SQL aggregations & metrics
│   │   │   └── ArchitectureView.jsx # ER diagrams, 3NF normalization docs
│   │   ├── index.css                # Polished design system (Glassmorphism & dark accents)
│   │   ├── App.jsx                  # State coordinator
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── DBMS-Project-synopsis/    # Project documentation & synopsis
```
👤 User Handling & Role-Based Access Control (RBAC)
TourQuest implements comprehensive user handling and account management, distinguishing between standard travellers and system admins. The database tracks user registration details, contact numbers, secure authentication credentials, and assigned roles, which are fully viewable and manageable via the administrative directory interface.

🌍 Landing Page & Destination Exploration
The landing page serves as the entry point of TourQuest, featuring a responsive hero banner and a high-resolution photographic collection of 15 world heritage sites. Each destination card displays badges for historical categories and ratings, along with quick actions to view detailed information and reviews.
![Landing Page Description](image_c1d65a.jpg)

🗺️ Curated Tour Packages
TourQuest provides hand-picked itineraries complete with historic tours, accommodations, and transport. Users can inspect package durations, base pricing, and included monument sites before proceeding to instant booking and customization.
<img src="image_c1d5fc.jpg" alt="Curated tour packages section showcasing Golden Triangle and Vijayanagara Heritage Trail" width="100%">

⚙️ Itinerary Customization & Live Fare Estimation
The interactive customization engine allows travellers to tailor their trip by choosing specific luxury accommodations (e.g., The Oberoi Amarvilas Heritage), transit modes (such as train and tour coach), and departure dates. The interface computes all-inclusive live fare estimates instantly before checkout.
<img src="image_c1dd1d.png" alt="Customize and Book Tour interface showing hotel selection, transit mode, travel date, and live fare breakdown" width="100%">

<img src="image_c1d9f9.png" alt="TourQuest official e-ticket and booking confirmation voucher with confirmed status badge and breakdown" width="100%">

💳 Secure Payment Gateway
The secure payment gateway supports multiple transaction methods including UPI/QR code scanning, Credit/Debit cards, and Net Banking. It displays a real-time order summary with itemized pricing, guarantees 256-bit SSL encryption, and includes VPA handle inputs.
<img src="image_c1da57.png" alt="Payment Gateway interface displaying UPI QR code scan options, card payment tabs, and order summary" width="100%">

---


## 🗄️ Relational Schema Highlights

1. **`users`**: Travelers, guides, and system administrators.
2. **`destinations`**: Countries, regions, climate info, and travel seasons.
3. **`tours`**: Tour packages with prices, duration, difficulty, and ratings.
4. **`itinerary_items`**: Daily itinerary linked to tours (`1:N` cascade relationship).
5. **`guides` & `tour_guides`**: Multi-lingual guides linked to tours via `M:N` junction table.
6. **`bookings` & `payments`**: ACID transactional booking records with reference IDs.
7. **`reviews`**: Ratings and user comments with automated average recalculation.

---

## 💡 DBMS Features for Academic Presentation / Viva

- **Interactive SQL Playground**: Execute custom queries (`SELECT`, `JOIN`, `GROUP BY`, `HAVING`) directly within the browser with live millisecond timing.
- **Relational Table Inspector**: View raw records and column definitions for all 8 tables and views.
- **Database Normalization**: Structured up to 3NF/BCNF with zero data redundancy.
- **Cross-Database Compatibility**: Compatible with SQLite, MySQL, and PostgreSQL.

