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
## 👤 User Handling & Role-Based Access Control (RBAC)
TourQuest implements comprehensive user handling and account management, distinguishing between standard travellers and system admins. The database tracks user registration details, contact numbers, secure authentication credentials, and assigned roles, which are fully viewable and manageable via the administrative directory interface.

## 🌍 Landing Page & Destination Exploration
The landing page serves as the entry point of TourQuest, featuring a responsive hero banner and a high-resolution photographic collection of 15 world heritage sites. Each destination card displays badges for historical categories and ratings, along with quick actions to view detailed information and reviews.
<img width="1182" height="862" alt="Screenshot 2026-11-12 003226" src="https://github.com/user-attachments/assets/2043aaad-7435-4cc5-9967-907b11131a6f" />


## 🗺️ Curated Tour Packages
TourQuest provides hand-picked itineraries complete with historic tours, accommodations, and transport. Users can inspect package durations, base pricing, and included monument sites before proceeding to instant booking and customization.
<img width="1151" height="853" alt="Screenshot 2026-11-12 003249" src="https://github.com/user-attachments/assets/d69839db-2681-4031-96a6-d6810154179b" />


## ⚙️ Itinerary Customization & Live Fare Estimation
The interactive customization engine allows travellers to tailor their trip by choosing specific luxury accommodations (e.g., The Oberoi Amarvilas Heritage), transit modes (such as train and tour coach), and departure dates. The interface computes all-inclusive live fare estimates instantly before checkout.
<img width="747" height="605" alt="Screenshot 2026-11-12 003305" src="https://github.com/user-attachments/assets/842680ef-4df2-497e-aad6-56267e0c9bc4" />

## 💳 Secure Payment Gateway
The secure payment gateway supports multiple transaction methods including UPI/QR code scanning, Credit/Debit cards, and Net Banking. It displays a real-time order summary with itemized pricing, guarantees 256-bit SSL encryption, and includes VPA handle inputs.
<img width="680" height="631" alt="Screenshot 2026-11-12 003322" src="https://github.com/user-attachments/assets/75c7c611-41f8-4772-8adc-be60a58f6f4e" />


<img width="687" height="611" alt="Screenshot 2026-11-12 003353" src="https://github.com/user-attachments/assets/cf4d4cea-cc10-45b6-875c-ab99ef4827e2" />

---

## 🌍 Full System Overview & Admin Dashboard Integration
The platform seamlessly integrates the core exploration features with the backend administrative console. Logged-in administrators have a unified view, accessing the high-resolution frontend hero banner alongside a top navigation bar with dedicated admin profile controls. The dashboard features a quick-action "Add New Destination" button allowing for dynamic expansion of the database offerings, and a custom footer displaying the project's academic credentials
<img width="620" height="791" alt="Screenshot 2026-11-12 005350" src="https://github.com/user-attachments/assets/334c3810-38f7-41e2-8ca9-16b647ed7c52" />


## 📋 Admin Management Console: Bookings & Revenue Analytics
The "All Bookings" interface acts as the financial and operational heart of the system. It features four live aggregate metric cards tracking platform growth: Registered Travellers, Total Bookings, Total Revenue (in ₹), and Active Destinations. The detailed data grid lists comprehensive transaction records including unique Booking IDs, traveller contact details, package names, transaction dates, and total amounts. Administrators can easily monitor operational workflows using visual color-coded status badges (green for confirmed, red for cancelled, yellow for pending) and execute instant database updates using the interactive Confirm/Cancel action buttons.
<img width="1257" height="840" alt="Screenshot 2026-11-12 005443" src="https://github.com/user-attachments/assets/bd3534c2-f37b-45f9-8af9-d24dbffef212" />

## 👥 User Directory & Role-Based Access Control
The "Registered Users" tab gives administrators full visibility into platform engagement and strict data separation. The user grid extracts real-time database records, displaying each member's full name, email address, contact number, and exact joining date. To ensure robust access control, the interface uses distinct visual role badges to instantly differentiate standard 'traveller' accounts from privileged 'admin' accounts, demonstrating a secure and clear implementation of RBAC.
<img width="1210" height="528" alt="Screenshot 2026-11-12 005500" src="https://github.com/user-attachments/assets/f45863ea-701d-4780-aa9f-c1d8b5ee9787" />

---

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

