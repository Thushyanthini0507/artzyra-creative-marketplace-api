# Filtering and Searching - Complete Code Explanation

This document explains all filtering and searching functionality implemented across all controllers (except notification controller).

---

## Table of Contents
1. [Overview](#overview)
2. [Common Patterns](#common-patterns)
3. [Controller-by-Controller Breakdown](#controller-by-controller-breakdown)
4. [MongoDB Query Operators Explained](#mongodb-query-operators-explained)
5. [Code Examples](#code-examples)

---

## Overview

All list endpoints now support:
- **Text Search** - Case-insensitive search across multiple fields
- **Status Filters** - Filter by status fields
- **Date Range Filters** - Filter by date ranges
- **Numeric Range Filters** - Filter by amount, rating, price ranges
- **Pagination** - Page-based navigation
- **Sorting** - Customizable sorting by any field

---

## Common Patterns

### 1. Query Parameter Extraction
```javascript
const { search, status, page = 1, limit = 10 } = req.query;
```
**Explanation:** Extracts query parameters from URL. Default values provided for pagination.

### 2. Base Query Building
```javascript
const query = { customer: req.userId }; // Start with base filter
```
**Explanation:** Start with base query (e.g., user-specific data), then add filters.

### 3. Text Search Pattern
```javascript
if (search) {
  query.$or = [
    { name: { $regex: search, $options: "i" } },
    { email: { $regex: search, $options: "i" } },
  ];
}
```
**Explanation:** 
- `$or` = Match ANY of these conditions
- `$regex` = Pattern matching
- `"i"` option = Case-insensitive
- Searches multiple fields simultaneously

### 4. Date Range Filter Pattern
```javascript
if (startDate || endDate) {
  query.bookingDate = {};
  if (startDate) {
    query.bookingDate.$gte = new Date(startDate);
  }
  if (endDate) {
    query.bookingDate.$lte = new Date(endDate);
  }
}
```
**Explanation:**
- `$gte` = Greater than or equal to (>=)
- `$lte` = Less than or equal to (<=)
- Creates date range filter

### 5. Numeric Range Filter Pattern
```javascript
if (minAmount || maxAmount) {
  query.totalAmount = {};
  if (minAmount) {
    query.totalAmount.$gte = parseFloat(minAmount);
  }
  if (maxAmount) {
    query.totalAmount.$lte = parseFloat(maxAmount);
  }
}
```
**Explanation:** Similar to date range but for numeric values.

### 6. Pagination Pattern
```javascript
const skip = (parseInt(page) - 1) * parseInt(limit);
const limitNum = parseInt(limit);
```
**Explanation:**
- `skip` = Number of documents to skip
- `limit` = Number of documents to return
- Example: page=2, limit=10 → skip=10, limit=10 (shows items 11-20)

### 7. Sorting Pattern
```javascript
const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
```
**Explanation:**
- Dynamic field sorting
- `1` = Ascending, `-1` = Descending
- Example: `{ bookingDate: -1 }` = Sort by bookingDate descending

---

## Controller-by-Controller Breakdown

### 1. Customer Controller

#### `getBookings` - Customer Bookings Filtering

**Endpoint:** `GET /api/customer/bookings`

**Query Parameters:**
- `search` - Searches in: `location`, `specialRequests`
- `status` - Booking status: `pending`, `accepted`, `rejected`, `completed`, `cancelled`
- `paymentStatus` - Payment status: `pending`, `paid`, `refunded`
- `artist` - Filter by artist ID
- `category` - Filter by category ID
- `startDate` - Filter from date (ISO: YYYY-MM-DD)
- `endDate` - Filter to date (ISO: YYYY-MM-DD)
- `minAmount` - Minimum booking amount
- `maxAmount` - Maximum booking amount
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `sortBy` - Field to sort by (default: `bookingDate`)
- `sortOrder` - `asc` or `desc` (default: `desc`)

**Code Explanation:**
```javascript
// 1. Extract all query parameters
const { search, status, paymentStatus, ... } = req.query;

// 2. Start with base query (only this customer's bookings)
const query = { customer: req.userId };

// 3. Add status filters (exact match)
if (status) {
  query.status = status; // Exact match: status === "pending"
}

// 4. Add date range filter (MongoDB operators)
if (startDate || endDate) {
  query.bookingDate = {};
  if (startDate) {
    query.bookingDate.$gte = new Date(startDate); // >= startDate
  }
  if (endDate) {
    query.bookingDate.$lte = new Date(endDate);   // <= endDate
  }
}

// 5. Add search filter (regex pattern matching)
if (search) {
  query.$or = [
    { location: { $regex: search, $options: "i" } },
    { specialRequests: { $regex: search, $options: "i" } },
  ];
  // $or = match ANY of these conditions
  // $regex = pattern matching
  // "i" = case-insensitive
}

// 6. Execute query with pagination and sorting
const bookings = await Booking.find(query)
  .skip(skip)      // Skip for pagination
  .limit(limitNum) // Limit results
  .sort(sort);     // Sort results
```

#### `getReviews` - Customer Reviews Filtering

**Endpoint:** `GET /api/customer/reviews`

**Query Parameters:**
- `search` - Searches in: `comment`
- `artist` - Filter by artist ID
- `minRating` - Minimum rating (1-5)
- `maxRating` - Maximum rating (1-5)
- `startDate` - Filter from date
- `endDate` - Filter to date
- `page`, `limit`, `sortBy`, `sortOrder` - Pagination and sorting

**Code Explanation:**
```javascript
// Rating range filter
if (minRating || maxRating) {
  query.rating = {};
  if (minRating) {
    query.rating.$gte = parseInt(minRating); // rating >= minRating
  }
  if (maxRating) {
    query.rating.$lte = parseInt(maxRating);  // rating <= maxRating
  }
}
```

---

### 2. Artist Controller

#### `getBookings` - Artist Bookings Filtering

**Same as customer bookings** but filtered by `artist: req.userId` instead of `customer: req.userId`.

#### `getReviews` - Artist Reviews Filtering

**Same filtering as customer reviews** but:
- Base query: `{ artist: req.userId, isVisible: true }`
- Only shows visible reviews for the artist

---

### 3. Admin Controller

#### `getUsersByRole` - User Management Filtering

**Endpoint:** `GET /api/admin/users?role=artist`

**Query Parameters:**
- `role` - **REQUIRED** - `"artist"` or `"customer"`
- `search` - Searches in:
  - For artists: `name`, `email`, `bio`, `skills`
  - For customers: `name`, `email`
- `isApproved` - Filter by approval status (`true`/`false`)
- `isActive` - Filter by active status (`true`/`false`)
- `category` - Filter artists by category ID
- `minRating` - Minimum rating for artists (0-5)
- `maxHourlyRate` - Maximum hourly rate for artists
- `page`, `limit`, `sortBy`, `sortOrder` - Pagination and sorting

**Code Explanation:**
```javascript
// Dynamic model selection based on role
let User;
if (role === "artist") {
  User = Artist;
} else if (role === "customer") {
  User = Customer;
}

// Search with role-specific fields
if (search) {
  query.$or = [
    { name: { $regex: search, $options: "i" } },
    { email: { $regex: search, $options: "i" } },
  ];
  // Add artist-specific search fields
  if (role === "artist") {
    query.$or.push(
      { bio: { $regex: search, $options: "i" } },
      { skills: { $in: [new RegExp(search, "i")] } }
    );
    // $in with RegExp = search in array fields
  }
}

// Boolean filter conversion
if (isApproved !== undefined) {
  query.isApproved = isApproved === "true"; // Convert string to boolean
}
```

#### `getAllBookings` - Admin Booking Management

**Endpoint:** `GET /api/admin/bookings`

**Query Parameters:**
- All same as customer bookings
- Plus: `customer`, `artist` filters (admin can filter by any user)

**Code Explanation:**
```javascript
// Admin can see ALL bookings (no base filter)
const query = {};

// Admin can filter by specific users
if (customer) {
  query.customer = customer;
}
if (artist) {
  query.artist = artist;
}
```

---

### 4. Payment Controller

#### `getPayments` - Payment Filtering

**Endpoint:** `GET /api/payments`

**Query Parameters:**
- `search` - Searches in: `transactionId`
- `status` - Payment status: `pending`, `completed`, `refunded`
- `paymentMethod` - Filter by payment method
- `customer` - Filter by customer ID (admin only)
- `artist` - Filter by artist ID (admin only)
- `booking` - Filter by booking ID
- `startDate` - Filter from date
- `endDate` - Filter to date
- `minAmount` - Minimum payment amount
- `maxAmount` - Maximum payment amount
- `page`, `limit`, `sortBy`, `sortOrder` - Pagination and sorting

**Code Explanation:**
```javascript
// ROLE-BASED SECURITY FILTER
// Customers/artists can only see their own payments
// Admins can see all payments
const query = {};
if (req.userRole === "customer") {
  query.customer = req.userId; // Security: restrict to own payments
} else if (req.userRole === "artist") {
  query.artist = req.userId;  // Security: restrict to own payments
}

// Admin can add additional filters
if (req.userRole === "admin") {
  if (customer) {
    query.customer = customer; // Admin can filter by any customer
  }
}
```

---

### 5. Review Controller

#### `getReviewsByArtist` - Public Review Filtering

**Endpoint:** `GET /api/reviews/artist/:artistId`

**Query Parameters:**
- `search` - Searches in: `comment`
- `minRating` - Minimum rating (1-5)
- `maxRating` - Maximum rating (1-5)
- `startDate` - Filter from date
- `endDate` - Filter to date
- `page`, `limit`, `sortBy`, `sortOrder` - Pagination and sorting

**Code Explanation:**
```javascript
// Base query - only visible reviews for this artist
const query = {
  artist: artistId,    // From URL parameter
  isVisible: true,     // Only show visible reviews
};

// Search in comment field
if (search) {
  query.comment = { $regex: search, $options: "i" };
}
```

---

### 6. Category Controller

#### `getAllCategories` - Category Filtering

**Endpoint:** `GET /api/categories`

**Query Parameters:**
- `search` - Searches in: `name`, `description`
- `isActive` - Filter by active status (`true`/`false`)
- `page`, `limit` - Pagination

**Code Explanation:**
```javascript
// Search across multiple fields
if (search) {
  query.$or = [
    { name: { $regex: search, $options: "i" } },
    { description: { $regex: search, $options: "i" } },
  ];
}
```

#### `getArtistsByCategory` - Artists in Category Filtering

**Endpoint:** `GET /api/categories/:categoryId/artists`

**Query Parameters:**
- `search` - Searches in: `name`, `bio`, `skills`
- `minRating` - Minimum rating (0-5)
- `maxRate` - Maximum hourly rate
- `page`, `limit` - Pagination

**Code Explanation:**
```javascript
// Base query - category + approved + active
const query = {
  category: categoryId,
  isApproved: true,
  isActive: true,
};

// Search in array field (skills)
if (search) {
  query.$or = [
    { name: { $regex: search, $options: "i" } },
    { bio: { $regex: search, $options: "i" } },
    { skills: { $in: [new RegExp(search, "i")] } },
    // $in with RegExp searches within array elements
  ];
}
```

---

### 7. Artist Public Controller

#### `getArtists` - Public Artist Search

**Endpoint:** `GET /api/artists`

**Query Parameters:**
- `category` - Filter by category ID
- `search` - Searches in: `name`, `bio`, `skills`
- `page`, `limit` - Pagination

**Code Explanation:**
```javascript
// Base query - only approved and active
const query = { isApproved: true, isActive: true };

// Category validation
if (category) {
  // Validate MongoDB ObjectId format
  if (!mongoose.Types.ObjectId.isValid(category)) {
    throw new BadRequestError("Invalid category id");
  }
  query.category = category;
}

// Search with RegExp
if (search) {
  const regex = new RegExp(search, "i"); // Create regex once
  query.$or = [
    { name: regex },
    { bio: regex },
    { skills: regex }, // Works for array fields too
  ];
}

// Parallel execution for performance
const [artists, total] = await Promise.all([
  Artist.find(query).skip(skip).limit(limitNum),
  Artist.countDocuments(query),
]);
```

---

## MongoDB Query Operators Explained

### Comparison Operators

| Operator | Meaning | Example | Use Case |
|----------|---------|---------|----------|
| `$gte` | Greater than or equal | `{ age: { $gte: 18 } }` | Minimum values, date ranges |
| `$lte` | Less than or equal | `{ price: { $lte: 100 } }` | Maximum values, date ranges |
| `$gt` | Greater than | `{ rating: { $gt: 4 } }` | Strict minimum |
| `$lt` | Less than | `{ amount: { $lt: 50 } }` | Strict maximum |

### Logical Operators

| Operator | Meaning | Example | Use Case |
|----------|---------|---------|----------|
| `$or` | Match ANY condition | `{ $or: [{status: "A"}, {status: "B"}] }` | Search multiple fields |
| `$and` | Match ALL conditions | `{ $and: [{age: {$gte: 18}}, {active: true}] }` | Multiple required filters |
| `$in` | Match value in array | `{ status: { $in: ["pending", "accepted"] } }` | Multiple status values |

### Text Search Operators

| Operator | Meaning | Example | Use Case |
|----------|---------|---------|----------|
| `$regex` | Pattern matching | `{ name: { $regex: "john", $options: "i" } }` | Text search |
| `$options: "i"` | Case-insensitive | Part of `$regex` | Case-insensitive search |

---

## Code Examples

### Example 1: Customer Booking Search

**Request:**
```
GET /api/customer/bookings?search=wedding&status=accepted&startDate=2024-01-01&page=1&limit=10
```

**Query Built:**
```javascript
{
  customer: "691aa51d3e6a1cca987f9223",  // From req.userId
  $or: [
    { location: { $regex: "wedding", $options: "i" } },
    { specialRequests: { $regex: "wedding", $options: "i" } }
  ],
  status: "accepted",
  bookingDate: { $gte: new Date("2024-01-01") }
}
```

**MongoDB Query:**
```javascript
Booking.find({
  customer: ObjectId("691aa51d3e6a1cca987f9223"),
  $or: [
    { location: /wedding/i },
    { specialRequests: /wedding/i }
  ],
  status: "accepted",
  bookingDate: { $gte: ISODate("2024-01-01T00:00:00.000Z") }
})
.skip(0)
.limit(10)
.sort({ bookingDate: -1 })
```

### Example 2: Admin User Search

**Request:**
```
GET /api/admin/users?role=artist&search=photography&isApproved=true&minRating=4&page=1&limit=20
```

**Query Built:**
```javascript
{
  $or: [
    { name: { $regex: "photography", $options: "i" } },
    { email: { $regex: "photography", $options: "i" } },
    { bio: { $regex: "photography", $options: "i" } },
    { skills: { $in: [/photography/i] } }
  ],
  isApproved: true,
  rating: { $gte: 4 }
}
```

### Example 3: Payment Date Range Filter

**Request:**
```
GET /api/payments?startDate=2024-01-01&endDate=2024-12-31&status=completed&minAmount=50
```

**Query Built:**
```javascript
{
  customer: "691aa51d3e6a1cca987f9223",  // From req.userId (if customer)
  paymentDate: {
    $gte: new Date("2024-01-01"),
    $lte: new Date("2024-12-31")
  },
  status: "completed",
  amount: { $gte: 50 }
}
```

---

## Pagination Response Format

All filtered endpoints return:

```json
{
  "success": true,
  "data": [
    // ... array of results
  ],
  "pagination": {
    "currentPage": 1,
    "limit": 10,
    "totalItems": 50,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false,
    "nextPage": 2,
    "prevPage": null
  }
}
```

**Explanation:**
- `currentPage` - Current page number
- `limit` - Items per page
- `totalItems` - Total matching documents
- `totalPages` - Total number of pages
- `hasNextPage` - Boolean, true if more pages exist
- `hasPrevPage` - Boolean, true if previous pages exist
- `nextPage` - Next page number or null
- `prevPage` - Previous page number or null

---

## Performance Considerations

### 1. Index Usage
- Date fields (`bookingDate`, `createdAt`) should be indexed
- Status fields (`status`, `paymentStatus`) should be indexed
- User ID fields (`customer`, `artist`) should be indexed

### 2. Query Optimization
- Use `Promise.all()` for parallel queries (count + data)
- Limit results with `.limit()` to prevent large datasets
- Use `.select()` to exclude unnecessary fields (like passwords)

### 3. Search Performance
- Regex searches can be slow on large collections
- Consider text indexes for better search performance
- Limit search to indexed fields when possible

---

## Testing Filtering

### Test Case 1: Basic Search
```bash
GET /api/artists?search=photography
```
**Expected:** Returns artists with "photography" in name, bio, or skills

### Test Case 2: Combined Filters
```bash
GET /api/customer/bookings?status=pending&startDate=2024-01-01&minAmount=100&page=1&limit=5
```
**Expected:** Returns pending bookings from 2024-01-01 onwards with amount >= 100

### Test Case 3: Date Range
```bash
GET /api/admin/bookings?startDate=2024-01-01&endDate=2024-12-31
```
**Expected:** Returns all bookings in 2024

### Test Case 4: Rating Filter
```bash
GET /api/reviews/artist/691aa51d3e6a1cca987f9223?minRating=4&maxRating=5
```
**Expected:** Returns only 4-5 star reviews

---

## Summary

✅ **All Controllers Updated (except notification):**
- Customer Controller ✅
- Artist Controller ✅
- Admin Controller ✅
- Payment Controller ✅
- Review Controller ✅
- Category Controller ✅
- Artist Public Controller ✅

✅ **Features Implemented:**
- Text search (case-insensitive)
- Status filtering
- Date range filtering
- Numeric range filtering
- Pagination
- Sorting
- Comprehensive inline code explanations

✅ **Code Quality:**
- No linting errors
- Consistent patterns across controllers
- Well-documented with explanations
- Performance optimized

---

**Last Updated:** 2024  
**Version:** 1.0


