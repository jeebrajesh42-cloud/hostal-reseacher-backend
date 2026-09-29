# Hostel Research & Expense Tracker - Frontend 🎓🏠

A modern, responsive, feature-rich web client built with **React (Vite)**, **TailwindCSS**, and **Lucide Icons** designed for students to research verified hostels, compare amenities, track monthly living expenses, and find nearby student accommodations with live Google Maps integration.

---

## 🌟 Key Features

1. **Hostel Exploration & Discovery:**
   - Real-time search across hostel names, localities, coaching hubs (e.g. Kota Allen, Bhopal MP Nagar), and cities.
   - Distance calculation based on user's live GPS coordinates.
   - Verified establishment badges and direct links to Google Maps place listings & official providers.

2. **Hostel Comparison:**
   - Side-by-side comparison of rent, food inclusion, security deposits, room types, and amenities.

3. **Student Expense Tracker:**
   - Categorized expense logging (Rent, Food, Books, Transit, Utilities, Entertainment, Personal).
   - Monthly budget threshold tracker with spending alert badges.
   - Interactive charts and category breakdown.

4. **Favorites & Shortlisting:**
   - Bookmark prospective hostels with 1-click favorite management.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```env
VITE_API_BASE_URL=http://localhost:5001/api
VITE_SUPABASE_URL=https://zcebcsdxgbzaetgvvsjt.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_FJdz1nzSnyUiPXTPRg1Nug_PXvvRem3
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

---

## 📂 Project Structure
```
frontend/
├── src/
│   ├── components/     # Reusable UI components (HostelCard, SearchBar, ExpenseForm, etc.)
│   ├── context/        # App and Auth state management
│   ├── pages/          # Main application views (Home, ExploreHostels, Expenses, Analytics, etc.)
│   ├── services/       # API and Supabase clients
│   ├── App.jsx         # Routing & Layout
│   ├── main.jsx        # App entry point
│   └── index.css       # Global styles
├── index.html
├── package.json
└── vite.config.js
```
