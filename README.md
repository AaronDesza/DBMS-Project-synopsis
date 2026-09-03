# 🌍 Wanderlust - Travel & Tour Management System (DBMS Project)

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

---

## 🚀 How to Run the Project

### 1. Start the Backend API (Port 5000)
```bash
cd backend
npm install
npm run init-db   # Initializes schema.sql and seeds.sql
npm start         # Runs at http://localhost:5000
```

### 2. Start the Frontend Application (Port 5173)
```bash
cd frontend
npm install
npm run dev       # Runs at http://localhost:5173
```

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

