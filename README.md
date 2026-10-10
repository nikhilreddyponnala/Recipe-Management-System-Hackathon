# RecipeHub — MERN Stack Recipe Management Platform

A modern, full-stack, professional **Recipe Management Platform** built with the **MERN** stack (MongoDB, Express.js, React.js, Node.js), featuring JSON Web Token (JWT) authentication, bcrypt password hashing, role-based access control (RBAC), multi-criteria recipe filtering, favorites management, and real-time MongoDB statistics.

---

## 🍳 Features Overview

### 1. Modern UI / UX & Food Aesthetic
- Warm cream (`#FAF7F2`), forest green (`#2E7D32`), and terracotta orange (`#E86A33`) palette.
- High-resolution culinary photography and responsive recipe cards.
- Clean typography pairing: **Playfair Display** (editorial serif) and **Plus Jakarta Sans** (clean modern sans).
- Zero-Pill metadata discipline with typographic separators (`·`).

### 2. Full CRUD Recipe Management
- **Create**: Add recipes with title, description, category, prep time, cook time, servings, difficulty level, dietary tags, dynamic ingredient list (quantity + name), step-by-step cooking instructions, and food imagery.
- **Read**: Interactive recipe detail modal featuring serving scaling, prep checklist with strikethrough, and step progression markers.
- **Update**: Edit authored recipes in real-time.
- **Delete**: Safely delete recipes with double-confirmation dialogs.

### 3. Advanced Search & Multi-Filter System
- Search across recipe title, description, ingredient names, and dietary tags.
- Categorical filter: *Breakfast*, *Lunch*, *Dinner*, *Snacks*, *Desserts*, *Vegetarian*.
- Difficulty filter: *Easy*, *Medium*, *Hard*.
- Dietary filter: *Vegetarian*, *Vegan*, *Gluten-Free*, *Dairy-Free*, *High-Protein*, *Low-Carb*.
- Max cooking time filter: *Under 15 mins*, *Under 30 mins*, *Under 45 mins*, *Under 60 mins*.
- Sort options: *Newest First*, *Alphabetical (A-Z)*, *Fastest Prep Time*, *Most Popular*.

### 4. Saved Favorites
- Authenticated users can bookmark or un-favorite recipes with duplicate prevention.
- Dedicated "My Favorites" cookbook page with sub-category filtering.
- Persisted in MongoDB database.

### 5. Authentication & Role-Based Access Control (RBAC)
- Password hashing with salted **bcrypt**.
- Stateless session management with signed **JWT (JSON Web Tokens)**.
- Roles:
  - **User**: Browse recipes, create and manage personal recipes, save favorites.
  - **Admin**: Full platform content moderation, delete any inappropriate recipe, inspect registered user accounts.
- Pre-seeded Demo Accounts:
  - **Admin**: `admin@recipehub.com` / `admin123` (*Chef Marcus Vance*)
  - **User**: `sophia@recipehub.com` / `user123` (*Sophia Laurent*)
  - **User**: `demo@recipehub.com` / `demo123` (*Alex Chen*)

### 6. Interactive Kitchen Dashboard
- Live database metrics: Total recipes, User authored recipes, Saved favorites, Community members.
- Category distribution breakdown chart with percentage bars.
- Cooking skill level distribution.
- Manage authored recipes table with quick edit and delete actions.

### 7. Postman API Test Suite
- In-app interactive test modal with direct endpoints, sample payloads, Bearer header snippets.
- One-click **Download Postman Collection (.json)** for direct import into Postman.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, Lucide React, Axios |
| **Backend** | Node.js, Express.js, TypeScript (tsx) |
| **Database** | MongoDB with Mongoose (with automated persistent fallback store) |
| **Security** | JWT (`jsonwebtoken`), `bcryptjs`, CORS middleware |

---

## 📡 REST API Documentation

### Authentication
- `POST /api/auth/register` — Register a new account (`{ name, email, password }`)
- `POST /api/auth/login` — Sign in and receive JWT token (`{ email, password }`)
- `GET /api/auth/me` — Retrieve current authenticated user profile (`Bearer <token>`)

### Recipes (CRUD)
- `GET /api/recipes` — List & search recipes (Query: `search`, `category`, `difficulty`, `dietaryTag`, `maxTime`, `sort`, `author`)
- `GET /api/recipes/:id` — Get full recipe details by ID
- `POST /api/recipes` — Create new recipe (Requires Auth)
- `PUT /api/recipes/:id` — Update authored recipe (Requires Auth, Owner/Admin only)
- `DELETE /api/recipes/:id` — Delete recipe (Requires Auth, Owner/Admin only)

### Favorites
- `GET /api/favorites` — Get all recipes saved by logged-in user
- `POST /api/favorites/:recipeId` — Add recipe to favorites (Duplicate safe)
- `DELETE /api/favorites/:recipeId` — Remove recipe from favorites
- `GET /api/favorites/:recipeId/status` — Check if a recipe is saved

### Administration (Admin Only)
- `GET /api/admin/users` — List registered users, roles, and recipe counts
- `GET /api/admin/recipes` — List all recipes across the platform for moderation
- `DELETE /api/admin/users/:id` — Remove a user account and their submitted content

### Dashboard
- `GET /api/dashboard/stats` — Retrieve aggregated platform metrics and category distribution

---

## 🚀 Local Installation & Execution

### Prerequisites
- Node.js >= 18
- npm or yarn
- MongoDB (optional; system includes automatic zero-config persistent storage if MongoDB daemon is not running)

### Setup Steps

1. **Clone and install dependencies**:
   ```bash
   git clone <repo-url>
   cd recipe-management-platform
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Set your configuration:
   ```env
   PORT=3000
   JWT_SECRET=recipehub_super_secret_jwt_key_2026_dev_seed
   MONGODB_URI=mongodb://localhost:27017/recipehub
   ```

3. **Run the Full-Stack Application**:
   ```bash
   npm run dev
   ```
   The Express backend and Vite frontend will start concurrently on `http://localhost:3000`.

4. **Production Build**:
   ```bash
   npm run build
   npm start
   ```

---

## 🧪 Testing with Postman

1. Log in via `POST /api/auth/login` with `{"email": "admin@recipehub.com", "password": "admin123"}`.
2. Copy the `token` from the response JSON.
3. In Postman, add the header:
   ```http
   Authorization: Bearer <your_copied_token>
   ```
4. Test protected routes (`POST /api/recipes`, `GET /api/favorites`, `GET /api/admin/users`).
