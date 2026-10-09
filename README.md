# <img src="./client/src/assets/logo.png" alt="ShopLocal Logo" width="45"> ShopLocal - Discover Nearby Shops & Weekly Markets

**ShopLocal** is a modern **full-stack local commerce platform** that helps users **discover nearby shops** and **weekly markets** in their area. Users can **explore local businesses**, **search and filter shops**, **browse products**, **view locations on interactive maps**, **manage their cart**, **place orders**, and **review shops, products, and markets**, while shop owners can **manage their business** through a dedicated **seller dashboard** with **product, order, customer, review, analytics, and shop management features**.

---

## 📖 Table of Contents

- 🏪 [Overview](#overview)
- 🌐 [Live Demo](#live-demo)
- 🚀 [Features](#features)
- 📍 [Location-Based Shop Discovery](#location-based-shop-discovery)
- 🗺️ [Maps & Location Services](#maps--location-services)
- 🛍️ [Shopping & Orders](#shopping--orders)
- 🏪 [Weekly Markets](#weekly-markets)
- 🤝 [Community Contributions](#community-contributions)
- 📊 [Seller Dashboard](#seller-dashboard)
- ⭐ [Reviews & Ratings](#reviews--ratings)
- 🔐 [Authentication & Security](#authentication--security)
- ☁️ [Image Uploads & Media](#image-uploads--media)
- 🔄 [How It Works](#how-it-works)
- 🛠️ [Tech Stack](#tech-stack)
- 📂 [Project Architecture](#project-architecture)
- 📡 [API Endpoints](#api-endpoints)
- 🔧 [Local Setup for Developers](#local-setup-for-developers)
- 📖 [Documentation](#documentation)
- 👨‍💻 [Developer](#developer)

---

# Overview

**ShopLocal** is a **full-stack local commerce and discovery platform** designed to connect customers with **nearby shops** and **recurring weekly markets**.

The platform allows users to **discover local shops**, **search for products and businesses**, **view detailed shop information**, **find weekly markets**, **check locations on interactive maps**, **browse products**, **add items to their cart**, **place orders**, and **share their experience through reviews**.

ShopLocal also provides a dedicated **seller experience** where shop owners can **register their business** and **manage their shop, products, orders, customers, reviews, analytics, and settings** from a **centralized dashboard**.

The platform also includes a **community contribution system**, allowing **authenticated users** to **contribute information about local shops and weekly markets** that can be **added to the platform**.

> 🏪 _Built with the **MERN stack**, ShopLocal demonstrates practical full-stack development, geolocation-based discovery, MongoDB geospatial queries, interactive maps, e-commerce functionality, authentication, cloud image storage, REST APIs, and responsive UI development._

---

# Live Demo

#### 🌐 Access ShopLocal live here: [Visit ShopLocal](https://shoplocal-nearby.vercel.app/)

---

# Features

- 🏪 **Local Shop Discovery**
  - Discover local shops and explore detailed shop information.

- 🔎 **Search & Filtering**
  - Search across shops, products, and weekly markets and explore available results using relevant filters.

- 📍 **Location-Based Discovery**
  - Use the user's current location to find nearby shops and calculate their distance.

- 🗺️ **Interactive Maps**
  - View shop and market locations using MapLibre and MapTiler.

- 🛍️ **Product Browsing**
  - Browse products offered by local shops and view individual product details.

- 🛒 **Shopping Cart**
  - Add products to the cart, update quantities, remove products, and review the cart before checkout.

- 💳 **Checkout & Orders**
  - Enter delivery information, select available payment methods, and place orders.

- 📦 **Order Management**
  - Customers can view their orders and cancel eligible orders, while sellers can manage incoming orders and update their status.

- 🏪 **Weekly Markets**
  - Discover recurring weekly markets with information about their location, Market schedule, and category.

- 🤝 **Community Contributions**
  - Authenticated users can contribute local shops and weekly markets to the platform.

- 📊 **Seller Dashboard**
  - Shop owners can manage their shop, products, orders, customers, reviews, analytics, and settings.

- ⭐ **Reviews & Ratings**
  - Users can review shops, products, and markets, while sellers can reply to reviews.

- 🔐 **Secure Authentication**
  - Separate customer and seller authentication with JWT-based protected routes and password hashing.

- ☁️ **Cloud Image Uploads**
  - Shop, product, market, and contribution images can be uploaded and stored using Cloudinary.

- 📱 **Responsive Interface**
  - The application adapts to desktop, tablet, and mobile screen sizes.

- ⚠️ **Error Handling**
  - Handles authentication, API, validation, location, and other application errors with user-friendly feedback.

---

# Location-Based Shop Discovery

Location-based discovery is one of the main features of ShopLocal.

The platform can use the user's browser location or a manually entered location to obtain **latitude and longitude** for finding nearby shops.

## 📍 How Location Discovery Works

ShopLocal supports two ways to provide a location:

```text
                    User Location
                         |
              ┌──────────┴──────────┐
              |                     |
              v                     v
       Allow Location         Enter Location
          Access                Manually
              |                     |
              v                     v
     Browser Geolocation      Forward Geocoding
            API                  (Nominatim)
              |                     |
              └──────────┬──────────┘
                         |
                         v
                Latitude + Longitude
                         |
                         v
                  ShopLocal Backend
                         |
                         v
              MongoDB Geospatial Query
                         |
                         v
                  Nearby Shops
                         |
                         v
                Distance in Kilometers
```

### Browser Location

When the user allows location access, ShopLocal uses the browser's **Geolocation API** to obtain the user's current latitude and longitude.

### Manual Location

If the user does not want to use their current location, they can enter a location manually.

ShopLocal sends the entered location to the **OpenStreetMap Nominatim API** for forward geocoding.

```text
Manual Location
      |
      v
Nominatim Forward Geocoding
      |
      v
Latitude + Longitude
      |
      v
Nearby Shop Search
```

The application uses the Nominatim base URL:

```text
https://nominatim.openstreetmap.org
```

This converts a location such as a city, area, or address into geographic coordinates that can be used for nearby-shop discovery.

## 📐 Distance Calculation

ShopLocal stores shop locations as **GeoJSON Point coordinates**.

The coordinate structure is:

```text
[longitude, latitude]
```

The backend uses MongoDB's **2dsphere geospatial index** and `$geoNear` aggregation to find shops based on their distance from the user's location.

The backend first calculates the distance in meters and then converts it into kilometers before returning the shop data.

```text
User Coordinates
       |
       v
MongoDB $geoNear
       |
       v
distanceMeters
       |
       v
distanceKm
       |
       v
Nearby Shop Results
```

This allows ShopLocal to display shops according to their actual geographic distance instead of simply filtering by city or area.

## 📍 Search Radius

The nearby-shop API accepts a distance parameter and uses a default search radius when no specific distance is provided.

This makes it possible to request shops within a particular geographic range around the user's selected or current location.

```text
User Location
      |
      v
Search Radius
      |
      v
MongoDB Geospatial Query
      |
      v
Shops Within Radius
```

This location-based approach helps users discover relevant local shops based on their actual geographic proximity.

---

# Maps & Location Services

ShopLocal uses interactive maps to make local discovery easier.

The frontend uses:

- **MapLibre GL**
- **MapTiler**

The map can display the location of shops and markets using their latitude and longitude coordinates.

## 🗺️ Map Flow

```text
Shop / Market
      |
      v
Latitude + Longitude
      |
      v
MapLibre GL
      |
      v
MapTiler Map Style
      |
      v
Interactive Location
```

## 📍 Geocoding

Shop addresses can be converted into geographic coordinates using **OpenStreetMap Nominatim**.

ShopLocal supports:

- Forward geocoding
- Reverse geocoding
- Address formatting
- Latitude and longitude handling

### Forward Geocoding

```text
Address
   |
   v
Nominatim
   |
   v
Latitude + Longitude
```

### Reverse Geocoding

```text
Latitude + Longitude
          |
          v
       Nominatim
          |
          v
Readable Address
```

This allows the application to work with both human-readable addresses and geographic coordinates.

---

# Shopping & Orders

ShopLocal provides a complete shopping flow for products offered by local shops.

## 🛍️ Shopping Flow

```text
Shop
 |
 v
Browse Products
 |
 v
Product Details
 |
 v
Add to Cart
 |
 v
Cart
 |
 v
Checkout
 |
 v
Place Order
 |
 v
Order Success
```

Users can:

- Browse products
- View product details
- Add products to their cart
- Change product quantities
- Remove products
- Review cart totals
- Enter delivery information
- Select available payment methods
- Place orders
- View previous orders
- Cancel eligible orders

## 📦 Order Data

Orders contain information such as:

- Customer
- Seller
- Shop
- Ordered products
- Product quantities
- Product prices
- Subtotal
- Delivery fee
- Total amount
- Delivery address
- Payment method
- Order status
- Cancellation information

The order stores the relevant product information at the time the order is created so that the order remains consistent even if product information changes later.

---

# Weekly Markets

ShopLocal is not limited to permanent shops.

The platform also helps users discover **weekly and recurring local markets**.

Users can view market information such as:

- Market name
- Description
- Category
- Address
- City
- State
- Pincode
- Latitude
- Longitude
- Market schedule
- Reviews
- Market images

## 🏪 Market Discovery Flow

```text
Weekly Markets
      |
      v
Search / Explore
      |
      v
Market Card
      |
      v
Market Details
      |
      +---- Location
      |
      +---- Schedule
      |
      +---- Contact
      |
      +---- Reviews
```

Markets have dedicated listing and detail pages so that users can explore them separately from local shops.

---

# Community Contributions

ShopLocal allows authenticated users to contribute information about local shops and weekly markets.

This helps expand the platform beyond businesses that are already registered by sellers.

## 🤝 Contribution Types

Users can contribute:

```text
Local Shop
    OR
Weekly Market
```

## 🏪 Shop Contribution

A shop contribution can include information such as:

- Shop name
- Category
- Description
- About
- Address
- City
- State
- Pincode
- Phone
- Email
- Opening time
- Closing time
- Latitude
- Longitude
- Shop logo
- Shop banner
- Gallery images

## 🏪 Market Contribution

A market contribution can include:

- Market name
- Description
- Category
- Address
- City
- State
- Pincode
- Market day
- Start time
- End time
- Latitude
- Longitude
- Phone
- Email
- Market image

## 🔄 Contribution Flow

```text
Authenticated User
        |
        v
Contribution Form
        |
        v
Client-side Validation
        |
        v
POST /api/contributions
        |
        v
Authentication Check
        |
        v
Server-side Validation
        |
        v
Image Upload
        |
        v
Create Shop / Market
        |
        v
Create Contribution Record
        |
        v
Approved Contribution
```

The contribution backend validates the submitted data and geographic coordinates before creating the corresponding Shop or Market document.

Uploaded contribution images are stored in Cloudinary.

The contribution record stores information about the submitting user and the document created from the contribution.

Currently, contributed shops and markets are **automatically approved** after successful validation and creation.

---

# Seller Dashboard

ShopLocal provides a separate dashboard for shop owners.

The seller dashboard gives shop owners a centralized place to manage their business.

## 📊 Dashboard Sections

### 🏪 Shop Information

Sellers can create and manage their shop information, including:

- Shop name
- Category
- Description
- Contact information
- Address
- Opening hours
- Shop images
- Delivery and takeaway options
- Payment methods
- Other shop information

### 🛍️ Product Management

Sellers can:

- Add products
- Edit products
- Delete products
- Search products
- Filter products
- Manage product information
- Manage availability
- Manage stock
- Upload product images

### 📦 Order Management

Sellers can:

- View incoming orders
- Search orders
- Filter orders
- View order details
- Update order status

### 👥 Customer Management

Sellers can:

- View customers
- Search customers
- Filter customers
- View customer details
- View customer order information

### ⭐ Review Management

Sellers can:

- View shop reviews
- View product reviews
- Search reviews
- Filter reviews by rating
- View review details
- Reply to customer reviews

### 📈 Analytics

The analytics section provides seller-focused information such as:

- Sales information
- Order performance
- Customer insights
- Top products
- Sales charts

### ⚙️ Settings

Sellers can manage account, shop, order, and notification-related settings from the settings section.

---

# Reviews & Ratings

ShopLocal allows authenticated users to submit reviews for supported platform entities.

Reviews can contain:

- Rating
- Comment
- Target type
- Target ID

The platform supports reviews for:

- Shops
- Products
- Markets

## ⭐ Review Flow

```text
User
 |
 v
Shop / Product / Market
 |
 v
Write Review
 |
 v
Rating + Comment
 |
 v
Review API
 |
 v
MongoDB
 |
 v
Review Display
```

Sellers can also reply to customer reviews from their dashboard.

This allows communication between customers and shop owners while keeping reviews connected to the relevant shop or product.

---

# Authentication & Security

ShopLocal uses separate authentication systems for **customers and sellers**.

## 🔐 Customer Authentication

Customer authentication supports:

- Signup
- Login
- Current-user access
- Profile updates
- Password updates
- Logout

Customer routes are protected using authentication middleware.

## 🏪 Seller Authentication

Seller authentication supports:

- Seller registration
- Seller login
- Current-seller access
- Seller profile updates
- Password changes
- Logout

Seller dashboard routes are protected using dedicated seller authentication middleware.

## 🔑 JWT Authentication

JSON Web Tokens are used to authenticate protected API requests.

The frontend stores separate authentication tokens for customers and sellers and sends the appropriate token when communicating with protected backend routes.

```text
Customer
   |
   v
Customer Login
   |
   v
JWT Token
   |
   v
Protected Customer Routes
```

```text
Seller
   |
   v
Seller Login
   |
   v
JWT Token
   |
   v
Protected Seller Routes
```

## 🔒 Password Security

Passwords are hashed using **bcryptjs** before being stored in the database.

Plain-text passwords are not stored directly.

## 🛡️ Backend Security

The backend uses:

- **Helmet** for security-related HTTP headers
- **CORS** for controlled cross-origin communication
- **JWT** for protected authentication
- **bcryptjs** for password hashing
- **Environment variables** for sensitive configuration
- Authentication middleware for protected resources

---

# Image Uploads & Media

ShopLocal uses **Cloudinary** for cloud-based image storage.

Images are used for:

- Shop banners
- Shop logos
- Shop gallery images
- Product images
- Market images
- Community contribution images

## ☁️ Upload Flow

```text
Frontend
   |
   v
Image Selection
   |
   v
Multipart Form Data
   |
   v
Express Backend
   |
   v
Multer
   |
   v
Cloudinary
   |
   v
Image URL
   |
   v
MongoDB Document
```

The backend uses Multer and Cloudinary integration to process uploaded images and store their resulting URLs with the relevant application data.

---

# How It Works

ShopLocal follows a **frontend → backend → database/services → backend → frontend** architecture.

## 🔄 Main Application Flow

1. **User opens ShopLocal**
   - The React frontend loads the application.

2. **User chooses a location**
   - The browser can provide the user's current latitude and longitude.

3. **User explores shops or markets**
   - The frontend requests shop or market data from the backend API.

4. **Backend processes the request**
   - Express routes and controllers handle the request.

5. **MongoDB provides application data**
   - Shop, product, market, review, user, seller, and order information is stored in MongoDB.

6. **Location requests use geospatial queries**
   - Nearby shop requests can use MongoDB `$geoNear` and the shop's 2dsphere index.

7. **Frontend displays the results**
   - React renders the shops, products, markets, maps, and other information.

8. **Customer can shop**
   - Products can be added to the cart and ordered through checkout.

9. **Seller manages the business**
   - Sellers use the protected dashboard to manage their shop and customer activity.

## 🔗 Simplified Architecture Flow

```text
                         ┌──────────────────┐
                         │      User        │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │ React Frontend   │
                         │     + Vite       │
                         └────────┬─────────┘
                                  │
                                  │ REST API
                                  ▼
                         ┌──────────────────┐
                         │ Express Backend  │
                         │    + Node.js     │
                         └───────┬──────────┘
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
                ▼                ▼                ▼
        ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
        │   MongoDB    │  │  Cloudinary  │  │  Geocoding   │
        │   Database   │  │    Images    │  │   Services   │
        └──────────────┘  └──────────────┘  └──────────────┘
```

---

# Tech Stack

### 💻 Frontend

- **React.js**
  - Builds the interactive customer and seller interfaces.

- **Vite**
  - Provides the frontend development server and production build system.

- **Tailwind CSS**
  - Provides utility-based styling for the responsive user interface.

- **React Router**
  - Handles client-side routing between public, customer, authentication, and seller dashboard pages.

- **Axios**
  - Handles communication between the frontend and backend API.

- **TanStack React Query**
  - Supports API data fetching and server-state management.

- **React Helmet Async**
  - Manages page metadata and document information.

- **Lucide React**
  - Provides interface icons.

- **React Icons**
  - Provides additional icons used throughout the application.

- **Recharts**
  - Used for seller analytics and data visualization.

- **MapLibre GL**
  - Provides interactive maps and location visualization.

### 🖥 Backend

- **Node.js**
  - Provides the server-side JavaScript runtime.

- **Express.js**
  - Handles backend routing, middleware, and REST API endpoints.

- **Multer**
  - Handles multipart file uploads.

- **Cloudinary**
  - Stores uploaded images in the cloud.

- **CORS**
  - Controls cross-origin communication between the frontend and backend.

- **Morgan**
  - Logs HTTP requests during development.

- **Dotenv**
  - Loads environment variables from `.env`.

### 🗄️ Database

- **MongoDB**
  - Stores users, sellers, shops, products, orders, markets, reviews, addresses, and contribution records.

- **Mongoose**
  - Provides schemas, models, validation, and MongoDB interaction.

- **MongoDB Geospatial Indexes**
  - Support location-based shop discovery using GeoJSON and 2dsphere indexing.

### 🔐 Authentication & Security

- **JSON Web Token**
  - Provides authentication tokens for protected customer and seller routes.

- **bcryptjs**
  - Hashes user and seller passwords.

- **Helmet**
  - Adds security-related HTTP headers.

---

# Project Architecture

> The project follows a modular architecture that keeps ShopLocal scalable, maintainable, and easy to extend.

```bash
ShopLocal-Full-Stack-Local-Commerce-Platform/
│
├── .gitignore
├── README.md
│
├── client/
|   ├── .env
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── vercel.json
│   ├── vite.config.js
│   │
│   └── src/
│       ├── main.jsx
│       │
│       ├── app/
│       │   ├── App.jsx
│       │   ├── providers.jsx
│       │   └── router.jsx
│       │
│       ├── assets/
│       │   ├── herosection.png
│       │   └── logo.png
│       │
│       ├── modules/
│       │   │
│       │   ├── about/
│       │   │   ├── components/
│       │   │   │   ├── AboutCTA.jsx
│       │   │   │   ├── AboutCustomers.jsx
│       │   │   │   ├── AboutFeatures.jsx
│       │   │   │   ├── AboutHero.jsx
│       │   │   │   ├── AboutHowItWorks.jsx
│       │   │   │   ├── AboutMission.jsx
│       │   │   │   └── AboutShopOwners.jsx
│       │   │   │
│       │   │   └── pages/
│       │   │       └── AboutPage.jsx
│       │   │
│       │   ├── auth/
│       │   │   └── pages/
│       │   │       ├── LoginPage.jsx
│       │   │       ├── SellerLoginPage.jsx
│       │   │       ├── SellerRegisterPage.jsx
│       │   │       └── SignupPage.jsx
│       │   │
│       │   ├── cart/
│       │   │   ├── components/
│       │   │   │   ├── CartItem.jsx
│       │   │   │   └── CartSummary.jsx
│       │   │   │
│       │   │   └── pages/
│       │   │       ├── CartPage.jsx
│       │   │       ├── CheckoutPage.jsx
│       │   │       └── OrderSuccessPage.jsx
│       │   │
│       │   ├── dashboard/
│       │   │   ├── components/
│       │   │   │   ├── header/
│       │   │   │   │   └── DashboardHeader.jsx
│       │   │   │   │
│       │   │   │   ├── sidebar/
│       │   │   │   │   └── DashboardSidebar.jsx
│       │   │   │   │
│       │   │   │   └── LogoutModal.jsx
│       │   │   │
│       │   │   └── pages/
│       │   │       │
│       │   │       ├── analytics/
│       │   │       │   ├── AnalyticsPage.jsx
│       │   │       │   └── components/
│       │   │       │       ├── AnalyticsStatCard.jsx
│       │   │       │       ├── CustomerInsights.jsx
│       │   │       │       ├── OrderPerformance.jsx
│       │   │       │       ├── SalesChart.jsx
│       │   │       │       └── TopProducts.jsx
│       │   │       │
│       │   │       ├── customers/
│       │   │       │   ├── CustomersPage.jsx
│       │   │       │   └── components/
│       │   │       │       ├── CustomerDetailsModal.jsx
│       │   │       │       ├── CustomerFilters.jsx
│       │   │       │       ├── CustomerStatusBadge.jsx
│       │   │       │       └── CustomerTable.jsx
│       │   │       │
│       │   │       ├── dashboardhome/
│       │   │       │   └── DashboardHome.jsx
│       │   │       │
│       │   │       ├── orders/
│       │   │       │   ├── OrdersPage.jsx
│       │   │       │   └── components/
│       │   │       │       ├── OrderDetailsModal.jsx
│       │   │       │       ├── OrderFilters.jsx
│       │   │       │       ├── OrderStatusBadge.jsx
│       │   │       │       └── OrderTable.jsx
│       │   │       │
│       │   │       ├── products/
│       │   │       │   ├── ProductsPage.jsx
│       │   │       │   └── components/
│       │   │       │       ├── ProductCard.jsx
│       │   │       │       ├── ProductDeleteModal.jsx
│       │   │       │       ├── ProductForm.jsx
│       │   │       │       └── ProductList.jsx
│       │   │       │
│       │   │       ├── reviews/
│       │   │       │   ├── ReviewsPage.jsx
│       │   │       │   └── components/
│       │   │       │       ├── ProductReviews.jsx
│       │   │       │       ├── ReviewDetailsModal.jsx
│       │   │       │       ├── ReviewFilters.jsx
│       │   │       │       ├── ReviewRatingBadge.jsx
│       │   │       │       ├── ReviewSummary.jsx
│       │   │       │       └── ShopReviews.jsx
│       │   │       │
│       │   │       ├── settings/
│       │   │       │   ├── SettingsPage.jsx
│       │   │       │   └── components/
│       │   │       │       ├── AccountSettings.jsx
│       │   │       │       ├── NotificationSettings.jsx
│       │   │       │       ├── OrderSettings.jsx
│       │   │       │       ├── SettingsSection.jsx
│       │   │       │       └── ShopSettings.jsx
│       │   │       │
│       │   │       └── ShopInfo/
│       │   │           ├── ShopInfoPage.jsx
│       │   │           └── components/
│       │   │               ├── RegisterShopModal.jsx
│       │   │               ├── ShopForm.jsx
│       │   │               └── ShopInformation.jsx
│       │   │
│       │   ├── home/
│       │   │   ├── components/
│       │   │   │   ├── CategorySection.jsx
│       │   │   │   ├── HeroSection.jsx
│       │   │   │   ├── HowItWorksSection.jsx
│       │   │   │   ├── NearbyShopsSection.jsx
│       │   │   │   ├── ShopOwnerCTASection.jsx
│       │   │   │   └── WeeklyMarketsSection.jsx
│       │   │   │
│       │   │   └── pages/
│       │   │       └── HomePage.jsx
│       │   │
│       │   ├── maps/
│       │   │   └── components/
│       │   │       └── MapLibreMap.jsx
│       │   │
│       │   ├── markets/
│       │   │   ├── components/
│       │   │   │   ├── MarketFilters.jsx
│       │   │   │   ├── MarketGrid.jsx
│       │   │   │   ├── MarketHero.jsx
│       │   │   │   ├── MarketInfo.jsx
│       │   │   │   ├── MarketLocation.jsx
│       │   │   │   └── MarketSearch.jsx
│       │   │   │
│       │   │   └── pages/
│       │   │       ├── MarketDetailsPage.jsx
│       │   │       └── MarketsPage.jsx
│       │   │
│       │   ├── reviews/
│       │   │   └── components/
│       │   │       ├── ReviewForm.jsx
│       │   │       ├── ReviewItem.jsx
│       │   │       ├── ReviewList.jsx
│       │   │       └── ReviewSection.jsx
│       │   │
│       │   ├── shops/
│       │   │   ├── components/
│       │   │   │   ├── ProductCard.jsx
│       │   │   │   ├── ProductDescription.jsx
│       │   │   │   ├── ProductDetailsHero.jsx
│       │   │   │   ├── ProductPurchaseCard.jsx
│       │   │   │   ├── ProductSpecifications.jsx
│       │   │   │   ├── RelatedProducts.jsx
│       │   │   │   └── ShopCard.jsx
│       │   │   │
│       │   │   ├── pages/
│       │   │   │   ├── ProductDetailsPage.jsx
│       │   │   │   ├── ShopDetailsPage.jsx
│       │   │   │   └── ShopsPage.jsx
│       │   │   │
│       │   │   └── sections/
│       │   │       ├── LocationSection.jsx
│       │   │       ├── ProductSection.jsx
│       │   │       ├── ShopBanner.jsx
│       │   │       ├── ShopOverviewSection.jsx
│       │   │       ├── ShopsFilterSection.jsx
│       │   │       ├── ShopsGrid.jsx
│       │   │       ├── ShopsHero.jsx
│       │   │       └── SimilarShopsSection.jsx
│       │   │
│       │   └── user/
│       │       ├── MyProfile.jsx
│       │       └── Orders.jsx
│       │
│       ├── services/
│       │   ├── api.js
│       │   ├── authService.js
│       │   ├── locationService.js
│       │   └── shopService.js
│       │
│       ├── shared/
│       │   ├── components/
│       │   │   ├── ContributionPage.jsx
│       │   │   ├── LocationModal.jsx
│       │   │   ├── PageNotFoundPage.jsx
│       │   │   ├── ProtectedRoute.jsx
│       │   │   ├── ProtectedSellerRoute.jsx
│       │   │   ├── QuickActionCards.jsx
│       │   │   │
│       │   │   └── navigation/
│       │   │       ├── Footer.jsx
│       │   │       └── Navbar.jsx
│       │   │
│       │   ├── context/
│       │   │   ├── AuthContext.jsx
│       │   │   ├── CartContext.jsx
│       │   │   ├── LocationContext.jsx
│       │   │   └── ReviewContext.jsx
│       │   │
│       │   ├── layouts/
│       │   │   ├── DashboardLayout.jsx
│       │   │   └── PublicLayout.jsx
│       │   │
│       │   ├── meta/
│       │   │   ├── MetaWrapper.jsx
│       │   │   ├── PageMeta.jsx
│       │   │   └── pageTitles.js
│       │   │
│       │   └── utils/
│       │       └── distance.js
│       │
│       └── styles/
│           ├── animations.css
│           ├── globals.css
│           └── variables.css
│
└── server/
    ├── .env
    ├── package-lock.json
    ├── package.json
    │
    └── src/
        ├── app.js
        ├── server.js
        │
        ├── config/
        │   ├── cloudinary.js
        │   └── db.js
        │
        ├── controllers/
        │   ├── analyticsController.js
        │   ├── contributionController.js
        │   ├── customerController.js
        │   ├── marketController.js
        │   ├── orderController.js
        │   ├── productController.js
        │   ├── reviewController.js
        │   ├── sellerAuthController.js
        │   ├── sellerSettingsController.js
        │   ├── shopController.js
        │   ├── userAddressController.js
        │   └── userAuthController.js
        │
        ├── init/
        │   ├── data.js
        │   └── index.js
        │
        ├── middleware/
        │   ├── sellerAuthMiddleware.js
        │   ├── uploadMiddleware.js
        │   └── userAuthMiddleware.js
        │
        ├── models/
        │   ├── Market.js
        │   ├── Order.js
        │   ├── Product.js
        │   ├── Review.js
        │   ├── Seller.js
        │   ├── Shop.js
        │   ├── User.js
        │   └── UserContribution.js
        │
        ├── routes/
        │   ├── analyticsRoutes.js
        │   ├── contributionRoutes.js
        │   ├── customerRoutes.js
        │   ├── marketRoutes.js
        │   ├── orderRoutes.js
        │   ├── productRoutes.js
        │   ├── reviewRoutes.js
        │   ├── sellerAuthRoutes.js
        │   ├── sellerSettingsRoutes.js
        │   ├── sellerShopRoutes.js
        │   ├── shopRoutes.js
        │   ├── userAddressRoutes.js
        │   └── userAuthRoutes.js
        │
        └── utils/
            ├── geocodeAddress.js
            ├── token.js
            └── uploadToCloudinary.js

```

---

# API Endpoints

### 🔐 User Authentication

| Method | Endpoint                  | Description                    |
| ------ | ------------------------- | ------------------------------ |
| POST   | `/api/auth/user/signup`   | Register a customer account    |
| POST   | `/api/auth/user/login`    | Login as a customer            |
| GET    | `/api/auth/user/me`       | Get the authenticated customer |
| PUT    | `/api/auth/user/profile`  | Update customer profile        |
| PUT    | `/api/auth/user/password` | Change customer password       |
| POST   | `/api/auth/user/logout`   | Logout the customer            |

### 🏪 Seller Authentication

| Method | Endpoint                    | Description                  |
| ------ | --------------------------- | ---------------------------- |
| POST   | `/api/auth/seller/signup`   | Register a seller account    |
| POST   | `/api/auth/seller/login`    | Login as a seller            |
| GET    | `/api/auth/seller/me`       | Get the authenticated seller |
| PUT    | `/api/auth/seller/profile`  | Update seller profile        |
| PUT    | `/api/auth/seller/password` | Change seller password       |
| POST   | `/api/auth/seller/logout`   | Logout the seller            |

### 🏪 Shops

| Method | Endpoint           | Description              |
| ------ | ------------------ | ------------------------ |
| GET    | `/api/shops`       | Get available shops      |
| GET    | `/api/shops/:id`   | Get a specific shop      |
| POST   | `/api/seller/shop` | Create a seller shop     |
| GET    | `/api/seller/shop` | Get the seller's shop    |
| PUT    | `/api/seller/shop` | Update the seller's shop |

### 🛍️ Products

| Method | Endpoint               | Description            |
| ------ | ---------------------- | ---------------------- |
| GET    | `/api/products`        | Get products           |
| GET    | `/api/products/:id`    | Get a specific product |
| GET    | `/api/products/seller` | Get seller products    |
| POST   | `/api/products`        | Create a product       |
| PUT    | `/api/products/:id`    | Update a product       |
| DELETE | `/api/products/:id`    | Delete a product       |

### 📦 Orders

| Method | Endpoint                        | Description                |
| ------ | ------------------------------- | -------------------------- |
| POST   | `/api/orders`                   | Create an order            |
| GET    | `/api/orders/my`                | Get customer's orders      |
| GET    | `/api/orders/:id`               | Get a customer's order     |
| PUT    | `/api/orders/:id/cancel`        | Cancel a customer order    |
| GET    | `/api/orders/seller`            | Get seller orders          |
| GET    | `/api/orders/seller/:id`        | Get seller order details   |
| PUT    | `/api/orders/seller/:id/status` | Update seller order status |

### 👥 Customers

| Method | Endpoint                    | Description           |
| ------ | --------------------------- | --------------------- |
| GET    | `/api/customers`            | Get seller customers  |
| GET    | `/api/customers/:id`        | Get customer details  |
| GET    | `/api/customers/:id/orders` | Get customer's orders |

### 🏪 Weekly Markets

| Method | Endpoint           | Description           |
| ------ | ------------------ | --------------------- |
| GET    | `/api/markets`     | Get weekly markets    |
| GET    | `/api/markets/:id` | Get a specific market |

### ⭐ Reviews

| Method | Endpoint                             | Description                |
| ------ | ------------------------------------ | -------------------------- |
| GET    | `/api/reviews/:targetType/:targetId` | Get reviews for a target   |
| POST   | `/api/reviews`                       | Create a review            |
| GET    | `/api/reviews/my`                    | Get the customer's reviews |
| PUT    | `/api/reviews/:id`                   | Update a review            |
| DELETE | `/api/reviews/:id`                   | Delete a review            |
| GET    | `/api/reviews/seller`                | Get seller reviews         |
| PUT    | `/api/reviews/:id/reply`             | Reply to a review          |

### 🤝 Community Contributions

| Method | Endpoint             | Description                          |
| ------ | -------------------- | ------------------------------------ |
| POST   | `/api/contributions` | Submit a shop or market contribution |

### 📈 Seller Analytics

| Method | Endpoint                | Description          |
| ------ | ----------------------- | -------------------- |
| GET    | `/api/seller/analytics` | Get seller analytics |

### ⚙️ Seller Settings

| Method | Endpoint               | Description            |
| ------ | ---------------------- | ---------------------- |
| GET    | `/api/seller/settings` | Get seller settings    |
| PUT    | `/api/seller/settings` | Update seller settings |

### 📍 User Addresses

| Method | Endpoint                      | Description         |
| ------ | ----------------------------- | ------------------- |
| GET    | `/api/users/me/addresses`     | Get saved addresses |
| POST   | `/api/users/me/addresses`     | Add an address      |
| PUT    | `/api/users/me/addresses/:id` | Update an address   |
| DELETE | `/api/users/me/addresses/:id` | Delete an address   |

### ❤️ Health Check

| Method | Endpoint      | Description                                |
| ------ | ------------- | ------------------------------------------ |
| GET    | `/api/health` | Check whether the ShopLocal API is running |

<br>

> All API routes were tested using **Thunder Client**.

---

# Local Setup for Developers

#### To set up ShopLocal locally, follow these steps:

1. Fork the repository on GitHub and clone it

```bash
  git clone <your-forked-repo-url>
```

2. Install backend dependencies

```bash
cd server
npm install
```

3. Install frontend dependencies

Open another terminal:

```bash
cd client
npm install
```

4. Set up environment variables

Create a `.env` file inside the **server** folder.

```env
PORT=5000
NODE_ENV=development

MONGO_URI=your-mongodb-connection-string

JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d

CLIENT_URL=http://localhost:5173

CLOUD_NAME=your-cloudinary-cloud-name
CLOUD_API_KEY=your-cloudinary-api-key
CLOUD_API_SECRET=your-cloudinary-api-secret
```

> `JWT_SECRET` can be any random string used to sign authentication tokens.

Create a `.env` file inside the **client** folder.

```env
VITE_API_URL=http://localhost:5000/api
VITE_MAPTILER_API_KEY=your-maptiler-api-key
```

5. Start the development servers

**Backend:**

Inside the `server` folder:

```bash
cd server
npm run dev
```

**Frontend:**

Inside the `client` folder:

```bash
cd client
npm run dev
```

> Both servers run in development mode. The frontend port may vary depending on your system.

6. Visit the application

Open the URL displayed in the terminal (usually `http://localhost:5173`) in your browser to use the frontend.

7. Build for production

Inside the `client` folder:

```bash
cd client
npm run build
```

> This creates an optimized production build of the frontend.

8. Preview the production build

After building the frontend, run:

```bash
npm run preview
```

> The terminal will display the URL where you can preview the production build.

---

# Documentation

📖 **Complete project documentation link will be added soon.**

---

# Developer

| Developed by         | LinkedIn                                                 | GitHub                                         |
| -------------------- | -------------------------------------------------------- | ---------------------------------------------- |
| **Harshal Waghmare** | [LinkedIn](https://www.linkedin.com/in/harshalwaghmare/) | [GitHub](https://github.com/HarshalWaghmare89) |
