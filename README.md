<img width="1024" height="838" alt="image" src="https://github.com/user-attachments/assets/f6a6bc8f-882b-45a1-be49-ab96bac57caf" /><img width="1057" height="857" alt="image" src="https://github.com/user-attachments/assets/023371f6-2f8b-4a02-b87b-71ff123a162f" /># 🌍 TourQuest - Travel & Tour Management System (DBMS Project)

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
![Uploading image.png…]()

🗺️ Curated Tour Packages
TourQuest provides hand-picked itineraries complete with historic tours, accommodations, and transport. Users can inspect package durations, base pricing, and included monument sites before proceeding to instant booking and customization.

⚙️ Itinerary Customization & Live Fare Estimation
The interactive customization engine allows travellers to tailor their trip by choosing specific luxury accommodations (e.g., The Oberoi Amarvilas Heritage), transit modes (such as train and tour coach), and departure dates. The interface computes all-inclusive live fare estimates instantly before checkout.

💳 Secure Payment Gateway
The secure payment gateway supports multiple transaction methods including UPI/QR code scanning, Credit/Debit cards, and Net Banking. It displays a real-time order summary with itemized pricing, guarantees 256-bit SSL encryption, and includes VPA handle inputs.

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

