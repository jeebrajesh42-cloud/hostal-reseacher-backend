# Hostel Research & Expense Tracker

> A production-ready, full-stack web application designed for students to discover and compare nearby hostels, calculate transparent estimated monthly living costs, and track living expenditures with intelligent budgeting insights.

---

## Table of Contents
1. [Architecture & Technology Stack](#1-architecture--technology-stack)
2. [Project Structure](#2-project-structure)
3. [Core Features](#3-core-features)
4. [Database Design & Supabase Setup](#4-database-design--supabase-setup)
5. [Row Level Security (RLS)](#5-row-level-security-rls)
6. [Environment Variables](#6-environment-variables)
7. [Installation & Development Quickstart](#7-installation--development-quickstart)
8. [Backend REST API Specification](#8-backend-rest-api-specification)
9. [Smart Spending Insights & Living Cost Logic](#9-smart-spending-insights--living-cost-logic)
10. [Automated Testing](#10-automated-testing)
11. [Security Practices](#11-security-practices)
12. [Future Improvements](#12-future-improvements)

---

## 1. Architecture & Technology Stack

The application strictly separates client and server concerns into two dedicated directories: `/frontend` and `/backend`.

### Frontend
- **Framework**: React 18 with Vite for ultra-fast HMR and bundling
- **Routing**: React Router DOM (v6) with protected client routes
- **Styling**: Tailwind CSS with custom design system (Primary: `#2563EB`, Secondary: `#0F172A`, Surface: `#F8FAFC`)
- **Visualizations**: Recharts (Monthly Area Trend, Category Distribution Donut, Stacked Monthly Bar Charts)
- **Icons**: Lucide React
- **HTTP Client**: Axios with request/response interceptors for JWT token management and error normalization

### Backend
- **Runtime**: Node.js & Express.js
- **Pattern**: Strict MVC Architecture (`Routes` -> `Controllers` -> `Services` -> `Models / Database`)
- **Authentication**: JWT (JSON Web Tokens) with `bcryptjs` password hashing (salt rounds: 12)
- **Security**: Helmet HTTP headers, CORS origin verification, express-rate-limit protection
- **Logging**: Morgan HTTP logger
- **Error Handling**: Centralized error middleware with structured JSON responses

### Database
- **Engine**: Supabase PostgreSQL
- **Security**: Row Level Security (RLS) policies isolating user expenses, budgets, and favorites
- **Persistence Adapter**: Dual-mode database layer that runs live Supabase PostgreSQL when credentials are provided in `.env`, and seamlessly falls back to a persistent in-memory demo engine for immediate zero-config testing.

---

## 2. Project Structure

```
hostel-research-expense-tracker/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx              # Responsive navigation with GPS indicator & mobile drawer
│   │   │   ├── Sidebar.jsx             # Authenticated student navigation & budget widget
│   │   │   ├── HostelCard.jsx          # Rich card with badges, rent, distance & actions
│   │   │   ├── HostelGrid.jsx          # Responsive card grid with skeleton loaders
│   │   │   ├── HostelDetails.jsx       # Comprehensive hostel specs & interactive cost calculator
│   │   │   ├── SearchBar.jsx           # Debounced search, city picker & GPS Geolocation trigger
│   │   │   ├── FilterPanel.jsx         # Multi-criteria filter drawer (Price, Type, Amenities, Rating)
│   │   │   ├── HostelComparison.jsx    # Side-by-side comparison matrix (up to 4 hostels)
│   │   │   ├── ExpenseCard.jsx         # Individual expense item with category icons & actions
│   │   │   ├── ExpenseForm.jsx         # Modal dialog for recording and updating expenses
│   │   │   ├── ExpenseChart.jsx        # Recharts visualizations (Area, Donut, Bar)
│   │   │   ├── Rating.jsx              # Star rating component (interactive & display modes)
│   │   │   ├── ImageGallery.jsx        # Gallery with thumbnail bar & fullscreen lightbox modal
│   │   │   ├── LoadingSpinner.jsx      # Spinner and skeleton loader states
│   │   │   └── EmptyState.jsx          # Reusable zero-data presentation with CTA
│   │   ├── pages/
│   │   │   ├── Home.jsx                # Landing hero, search box, top areas, featured hostels
│   │   │   ├── ExploreHostels.jsx      # Live filtered exploration with active filter pills
│   │   │   ├── HostelDetailsPage.jsx   # Dedicated hostel details & student review page
│   │   │   ├── CompareHostels.jsx      # Full comparison table page
│   │   │   ├── Favorites.jsx           # Saved hostels shortlist page
│   │   │   ├── Expenses.jsx            # Student expense manager with budget progress bar
│   │   │   ├── Analytics.jsx           # Financial analytics with 7d/30d/3m/6m/1y filters
│   │   │   ├── Dashboard.jsx           # Student overview with greeting, budget, & quick actions
│   │   │   ├── Login.jsx               # Sign in page with fast 1-click Demo credentials
│   │   │   ├── Register.jsx            # Student registration page
│   │   │   └── Profile.jsx             # Profile preferences, budget targets, & Admin tools
│   │   ├── services/
│   │   │   ├── api.js                  # Axios client with JWT interceptor
│   │   │   ├── authService.js          # Authentication API calls
│   │   │   ├── hostelService.js        # Hostel search & details API calls
│   │   │   └── expenseService.js       # Expense CRUD, analytics & favorites API calls
│   │   ├── context/
│   │   │   ├── AuthContext.jsx         # Global user & authentication state
│   │   │   └── AppContext.jsx          # Comparison list, favorites, GPS location, toast state
│   │   ├── App.jsx                     # Route configuration & toast notification container
│   │   ├── main.jsx                    # React entrypoint
│   │   └── index.css                   # Custom scrollbar, glassmorphic styles & design tokens
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── .env.example
│
├── backend/
│   ├── database/
│   │   ├── schema.sql                  # Complete Supabase PostgreSQL schema with indexes
│   │   ├── rls.sql                     # Row Level Security policies
│   │   └── seed.sql                    # Realistic demo student hostels across Indian hubs
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.js                  # Environment variable validation
│   │   │   └── db.js                   # Supabase client & in-memory fallback engine
│   │   ├── controllers/
│   │   │   ├── authController.js       # Register, login, getMe handlers
│   │   │   ├── hostelController.js     # Discovery, search, reviews, admin management
│   │   │   ├── expenseController.js    # Expense CRUD, analytics, monthly trends, budgets
│   │   │   ├── favoriteController.js   # User favorites handlers
│   │   │   └── userController.js       # Profile management handlers
│   │   ├── models/
│   │   │   ├── userModel.js
│   │   │   ├── hostelModel.js
│   │   │   ├── expenseModel.js
│   │   │   ├── favoriteModel.js
│   │   │   ├── reviewModel.js
│   │   │   └── budgetModel.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── hostelRoutes.js
│   │   │   ├── expenseRoutes.js
│   │   │   ├── favoriteRoutes.js
│   │   │   └── userRoutes.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js       # JWT validation & role-based access control
│   │   │   ├── errorMiddleware.js      # Centralized error handler
│   │   │   └── validationMiddleware.js # Strict server-side payload validators
│   │   ├── services/
│   │   │   ├── authService.js          # Password hashing & JWT generation
│   │   │   ├── hostelService.js        # Haversine distance, multi-filters & cost math
│   │   │   └── expenseService.js       # Financial aggregations & smart spending insights
│   │   ├── app.js                      # Express configuration, Helmet, CORS, Rate limiting
│   │   └── server.js                   # Server launcher with graceful shutdown
│   ├── tests/
│   │   ├── auth.test.js                # Auth integration test suite
│   │   ├── hostels.test.js             # Hostel search & distance test suite
│   │   └── expenses.test.js            # Expense CRUD & analytics test suite
│   ├── package.json
│   └── .env.example
│
├── package.json                        # Root workspace runner
├── .gitignore
└── README.md
```

---

## 3. Core Features

### 1. Advanced Hostel Discovery & Filters
- **Location Search**: Search by current location, city, area, college, landmark, or pincode.
- **GPS Distance Calculation**: Built-in Haversine formula calculates approximate distance (`1.2 km away`) when permission is granted.
- **Multi-Factor Filters**: Filter by rent price slider, hostel type (Boys / Girls / Co-ed), room capacity (Single / Double / Triple / 4-sharing), and amenities (Wi-Fi, AC, Food Mess, Laundry, Parking, Power Backup, CCTV, Study Room, Gym).
- **Sorting**: Lowest price, highest rated, nearest to user, most popular, recently updated.

### 2. Hostel Details & Interactive Cost Calculator
- **Image Gallery**: Full-width stage with thumbnail strip and full-screen lightbox preview modal.
- **Estimated Monthly Living Cost Calculator**: Live interactive sliders allowing students to calculate real monthly living costs:
  $$\text{Total Cost} = \text{Rent} + \text{Mess Food} + \text{Electricity} + \text{Internet} + \text{Laundry} + \text{Transport} + \text{Misc}$$
- **Room Types & Availability**: Real-time breakdown of single, double, and triple occupancy options with prices and room vacancy indicators.
- **Hostel Reviews**: View ratings and submit verified student feedback.

### 3. Side-by-Side Hostel Comparison
- Compare up to 4 hostels side-by-side in a structured comparison matrix.
- Evaluates monthly rent, security deposits, mess plans, electricity terms, Wi-Fi, AC, security, and total estimated living cost.
- Factual and unbiased comparison without automated biased declarations.

### 4. Student Expense Tracker
- **Complete CRUD**: Create, Read, Update, and Delete expenses.
- **14 Predefined Categories**: Hostel Rent, Security Deposit, Food, Electricity, Water, Internet, Laundry, Transportation, Groceries, Education, Entertainment, Medical, Shopping, Other.
- **Attributes**: Amount, Category, Date, Linked Hostel tag, Payment Method (UPI, Cash, Card, Net Banking), Recurring flag, and Notes.

### 5. Financial Dashboard & Recharts Analytics
- **KPI Cards**: Total Spending, Hostel Rent, Food, Transportation, and Other.
- **Visual Charts**:
  - Spending Trend (Interactive Area Chart over 6 months)
  - Category Distribution (Donut / Pie Chart with percentage shares)
  - Stacked Cost Breakdown (Bar Chart comparing Hostel vs Food vs Other)
- **Time Range Windows**: 7 Days, 30 Days, 3 Months, 6 Months, 1 Year.

### 6. Smart Rule-Based Spending Insights
- Non-investment, practical budget insights such as:
  - *"Your food expenses account for 28% of your total spending."*
  - *"Your monthly spending increased by 12% compared with last month."*
  - *"Your hostel-related living costs account for 52% of your total expenses."*
- **Budget Progress Indicator**: Track current monthly spending against user-defined budget targets with visual health indicators (Green / Amber / Red).

---

## 4. Database Design & Supabase Setup

The database schema is fully defined in [`backend/database/schema.sql`](file:///c:/Users/braje/OneDrive/Desktop/my/hostal%20tracker/backend/database/schema.sql).

### Tables:
1. `users`: Stores student accounts, password hashes, budget limits, preferred city.
2. `hostels`: Stores hostel specifications, pricing, coordinates, contact info, rules, and demo flag.
3. `hostel_images`: Multi-image storage referencing hostels.
4. `room_types`: Room configurations (`single`, `double`, `triple`, `four_sharing`) with pricing.
5. `amenities`: Standardized amenity catalog.
6. `hostel_amenities`: Many-to-many relationship linking hostels to amenities.
7. `expenses`: Student expense records tagged to users and optionally hostels.
8. `favorites`: Saved hostel bookmarks per user.
9. `reviews`: Student ratings (1-5) and feedback for hostels.
10. `budgets`: Custom monthly budget targets per user.

### To Apply to Live Supabase:
1. Open your Supabase Dashboard -> **SQL Editor**.
2. Run the SQL statements in [`backend/database/schema.sql`](file:///c:/Users/braje/OneDrive/Desktop/my/hostal%20tracker/backend/database/schema.sql).
3. Run the SQL statements in [`backend/database/rls.sql`](file:///c:/Users/braje/OneDrive/Desktop/my/hostal%20tracker/backend/database/rls.sql).
4. Run the SQL statements in [`backend/database/seed.sql`](file:///c:/Users/braje/OneDrive/Desktop/my/hostal%20tracker/backend/database/seed.sql).

---

## 5. Row Level Security (RLS)

All tables in [`backend/database/rls.sql`](file:///c:/Users/braje/OneDrive/Desktop/my/hostal%20tracker/backend/database/rls.sql) enforce strict RLS:

- **Users**: Users can only `SELECT` and `UPDATE` their own profile records (`auth.uid() = id`).
- **Hostels & Amenities**: Public `SELECT` allowed for all users. Write operations (`INSERT`, `UPDATE`, `DELETE`) are restricted to users with role `'admin'`.
- **Expenses**: Users can only perform CRUD operations on their own expenses (`auth.uid() = user_id`).
- **Favorites & Budgets**: Isolated strictly to the authenticated owner (`auth.uid() = user_id`).
- **Reviews**: Public `SELECT`; only authenticated users can insert their own reviews.

---

## 6. Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=super_secure_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

# Optional: Add your live Supabase credentials (leave empty to use demo mode)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 7. Installation & Development Quickstart

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Step 1: Install Dependencies
From the root workspace directory, install dependencies for both folders:

```bash
# In backend:
cd backend
npm install

# In frontend:
cd ../frontend
npm install
```

### Step 2: Start Backend Server
```bash
cd backend
npm run dev
# Starts REST API on http://localhost:5000
# Health check available at http://localhost:5000/api/health
```

### Step 3: Start Frontend Dev Server
```bash
cd frontend
npm run dev
# Starts Vite application on http://localhost:5173
```

### Demo Accounts for Testing
For convenient evaluation, the built-in database includes pre-configured demo users:
- **Student User**: `student@demo.com` / `password123`
- **Admin User**: `admin@demo.com` / `admin123`

*(You can also click the "Demo Student" or "Demo Admin" quick buttons on the Login page for 1-click sign-in).*

---

## 8. Backend REST API Specification

### Authentication
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new student account | No |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT token | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes (Bearer Token) |

### Hostels
| Method | Endpoint | Description | Query Parameters / Body |
|---|---|---|---|
| `GET` | `/api/hostels` | List hostels with filters & distance | `q, city, area, minRent, maxRent, hostelType, roomType, amenities, rating, userLat, userLng, sort` |
| `GET` | `/api/hostels/search` | Search hostels | Same as `/api/hostels` |
| `GET` | `/api/hostels/:id` | Get detailed hostel with living cost | `userLat, userLng` |
| `GET` | `/api/hostels/:id/reviews`| Get all reviews for a hostel | None |
| `POST` | `/api/hostels/:id/reviews`| Post a review (1-5 rating & text) | `{ rating: 5, review_text: "..." }` |
| `POST` | `/api/hostels` | Add hostel listing (Admin role) | Full hostel JSON body |
| `PUT` | `/api/hostels/:id` | Update hostel listing (Admin role) | Partial hostel JSON body |
| `DELETE`| `/api/hostels/:id` | Delete hostel listing (Admin role) | None |

### Expenses & Budget
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/expenses` | List student expenses | Yes |
| `POST` | `/api/expenses` | Record a new expense | Yes |
| `GET` | `/api/expenses/:id` | Get expense record | Yes |
| `PUT` | `/api/expenses/:id` | Update expense record | Yes |
| `DELETE`| `/api/expenses/:id` | Delete expense record | Yes |
| `GET` | `/api/expenses/analytics` | Fetch KPIs, trends & smart insights | Yes (`timeRange=7d\|30d\|3m\|6m\|1y`) |
| `GET` | `/api/expenses/budget` | Get current monthly budget target | Yes |
| `POST` | `/api/expenses/budget` | Set monthly budget target | Yes (`{ amount: 18000 }`) |

### Favorites
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/favorites` | Get user saved hostels shortlist | Yes |
| `POST` | `/api/favorites` | Bookmark a hostel | Yes (`{ hostelId: "..." }`) |
| `DELETE`| `/api/favorites/:hostelId` | Remove bookmark | Yes |

---

## 9. Smart Spending Insights & Living Cost Logic

### Estimated Monthly Living Cost Formula
When a student views a hostel, the baseline recurring living cost is computed dynamically:
$$\text{Cost} = \text{Monthly Rent} + \text{Food Mess} + \text{Electricity} + \text{Internet} + \text{Maintenance} + \text{Laundry} + \text{Commute} + \text{Other}$$
The student can interactively modify any value via sliders to simulate shared rooms or self-cooking options.

### Rule-Based Insights Engine
Located in [`backend/src/services/expenseService.js`](file:///c:/Users/braje/OneDrive/Desktop/my/hostal%20tracker/backend/src/services/expenseService.js):
1. **Category Concentration Alert**: Triggers if Food or Hostel costs exceed 35% of overall budget.
2. **Month-over-Month Velocity**: Detects percentage variance between current and previous month spending.
3. **Transportation Spike**: Identifies increases in commute expenses vs previous periods.
4. **Budget Utilization Thresholds**:
   - `Utilization < 75%`: Healthy budget status.
   - `75% - 89%`: Warning status to review discretionary categories.
   - `> 90%`: Critical status alert.

---

## 10. Automated Testing

The backend includes a comprehensive Jest and Supertest test suite covering authentication, hostel search algorithms, distance calculations, input validations, and expense tracker operations.

Run all tests from the backend directory:
```bash
cd backend
npm test
```

Test Results Summary:
```
PASS tests/expenses.test.js
PASS tests/hostels.test.js
PASS tests/auth.test.js

Test Suites: 3 passed, 3 total
Tests:       20 passed, 20 total
Snapshots:   0 total
```

---

## 11. Security Practices

- **Bcrypt Password Hashing**: Passwords hashed with salt rounds = 12. Plain text passwords are never stored.
- **JWT Protection**: All state-modifying expense and profile endpoints require a valid Bearer JWT.
- **No Sensitive Leakage**: Password hashes are strictly omitted from user objects and API responses.
- **Rate Limiting**: Configured with `express-rate-limit` to prevent brute-force attacks.
- **HTTP Header Hardening**: Helmet enables strict HTTP headers.
- **SQL Injection Prevention**: Parameterized queries via Supabase client.
- **Client Separation**: Sensitive Supabase service-role keys are strictly kept server-side in backend environment variables and never exposed to React.

---

## 12. Future Improvements

- Integration with Mapbox or Google Maps SDK for interactive pin navigation.
- Roommate matching algorithm based on study habits and preferences.
- Push notifications for recurring rent and mess payment due dates.
- Export expense reports to CSV and PDF formats for student scholarship submissions.
