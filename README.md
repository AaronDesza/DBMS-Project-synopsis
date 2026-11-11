# 🌍 TourQuest - Travel & Tour Management System 

A complete, full-stack Relational Database Management System (DBMS) project designed for academic presentation, synopsis review, and real-world travel exploration.


<img width="3584" height="757" alt="Gemini_Generated_Image_kgbewekgbewekgbe" src="https://github.com/user-attachments/assets/cc2c7649-3258-4467-aa04-d8c1bbfd5e75" />


---

## 📁 Project Structure

```text
DBMS-Project-synopsis/
│
├── 🌐 Frontend (Client-Side & UI)
│   ├── public/                  
│   │   ├── css/style.css        # Application stylesheets
│   │   ├── images/hampi.png     # Frontend image assets
│   │   ├── js/app.js            # Client-side JavaScript
│   │   └── index.html           # Main frontend entry page
│   └── index.html               # Root fallback/entry HTML file
│
├── ⚙️ Backend (Server-Side, API & Database)
│   ├── api/                     
│   │   └── index.js             # Vercel serverless API entry point
│   ├── backend/db/              
│   │   ├── dedupe.sql           # SQL script for removing duplicates
│   │   ├── migration_unique_constraints.sql # Schema migration constraints
│   │   ├── pool.js              # PostgreSQL database connection pool
│   │   ├── schema.sql           # Database tables and relationships DDL
│   │   └── seed.sql             # Dummy data injection for testing
│   ├── middleware/              
│   │   └── auth.js              # RBAC & authentication middleware
│   ├── routes/                  # Modular Express.js API endpoints
│   │   ├── admin.js, auth.js, bookings.js, destinations.js
│   │   └── hotels.js, packages.js, payments.js, reviews.js, transport.js
│   ├── app.js                   # Core Express application logic
│   ├── server.js                # Main Node.js server listener
│   └── travel_booking_db.sql    # Raw SQL dump for DB recreation
│
├── 🛠️ Tools, Scripts & Configuration
│   ├── scripts/                 # Additional backend utility scripts
│   ├── .github/workflows/       
│   │   └── deploy.yml           # GitHub Actions CI/CD pipeline
│   ├── .vscode/                 
│   │   └── settings.json        # Workspace specific editor settings
│   ├── .env.example             # Template for secure environment variable
│   ├── .gitignore               # Version control exclusion list
│   ├── package.json             # NPM project metadata and dependencies
│   ├── package-lock.json        # Locked dependency tree for stability
│   └── vercel.json              # Vercel deployment and routing rules
│
└── 📄 README.md                 # Main project documentation
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


## 🗄️ Relational Schema Highlights

1. **`users`**: Manages registered standard travellers and system administrators with secure authentication credentials (RBAC)
2. **`destinations`**: Stores details for 15 world historical heritage sites, including geographic locations, monument descriptions, and high-resolution image references
3. **`tours`**: Curated itineraries (e.g., Golden Triangle & Taj Royal Explorer) detailing base pricing, package duration, and linked historical sites.
4. **`hotels`**: Accommodation database featuring luxury stays with dynamic per-night pricing tiers.
5. **`transport`**: Transit mode registry (e.g., trains, tour coaches) with integrated fare calculations.
6. **`bookings` & `payments`**: ACID transactional records linking users to customized packages, tracking real-time status (confirmed, pending, cancelled), total amounts, and payment timestamps.

---

## 💡 DBMS Features for Academic Presentation

- **Live Admin Analytics Dashboard**: Utilizes SQL aggregate functions (COUNT(), SUM(), GROUP BY) to generate real-time metrics for total revenue, active destinations, and registered travellers.
- **Relational Integrity & Constraints**: Strict enforcement of Primary Key (PK) and Foreign Key (FK) constraints across users, packages, and bookings to prevent orphaned records.
- **Database Normalization**: Structured up to 3NF to eliminate data redundancy across destination details, pricing computations, and user profiles.
- **Cloud-Native Deployment**:robust backend hosted on Neon PostgreSQL, ensuring high availability, atomic transaction handling during checkout, and seamless API integration.

