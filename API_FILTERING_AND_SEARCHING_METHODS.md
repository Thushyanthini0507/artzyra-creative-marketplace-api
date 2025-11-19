# Complete API Filtering and Searching Methods Reference

This document provides a complete reference of all API endpoints that support filtering and searching functionality.

---

## Table of Contents
1. [Customer Endpoints](#customer-endpoints)
2. [Artist Endpoints](#artist-endpoints)
3. [Admin Endpoints](#admin-endpoints)
4. [Payment Endpoints](#payment-endpoints)
5. [Review Endpoints](#review-endpoints)
6. [Category Endpoints](#category-endpoints)
7. [Public Artist Endpoints](#public-artist-endpoints)
8. [Quick Reference Table](#quick-reference-table)

---

## Customer Endpoints

### 1. Get Customer Bookings
**Endpoint:** `GET /api/customer/bookings`  
**Authentication:** Required (Customer)  
**Description:** Get all bookings for the logged-in customer with filtering and search

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `search` | string | Searches in `location` and `specialRequests` fields (case-insensitive) | `?search=wedding` |
| `status` | string | Filter by booking status | `?status=pending` |
| | | Values: `pending`, `accepted`, `rejected`, `completed`, `cancelled` | |
| `paymentStatus` | string | Filter by payment status | `?paymentStatus=paid` |
| | | Values: `pending`, `paid`, `refunded` | |
| `artist` | string | Filter by artist ID | `?artist=691aa51d3e6a1cca987f9223` |
| `category` | string | Filter by category ID | `?category=69159852bcea8d9de167502f` |
| `startDate` | date | Filter bookings from this date (ISO: YYYY-MM-DD) | `?startDate=2024-01-01` |
| `endDate` | date | Filter bookings until this date (ISO: YYYY-MM-DD) | `?endDate=2024-12-31` |
| `minAmount` | number | Minimum booking amount | `?minAmount=100` |
| `maxAmount` | number | Maximum booking amount | `?maxAmount=500` |
| `page` | number | Page number (default: 1) | `?page=2` |
| `limit` | number | Items per page (default: 10) | `?limit=20` |
| `sortBy` | string | Field to sort by (default: `bookingDate`) | `?sortBy=totalAmount` |
| `sortOrder` | string | Sort direction: `asc` or `desc` (default: `desc`) | `?sortOrder=asc` |

**Example Request:**
```bash
GET /api/customer/bookings?search=wedding&status=accepted&startDate=2024-01-01&minAmount=100&page=1&limit=10
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "bookingDate": "2024-06-15",
      "status": "accepted",
      "totalAmount": 500,
      "location": "Wedding Venue",
      "specialRequests": "Outdoor ceremony"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "limit": 10,
    "totalItems": 5,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

---

### 2. Get Customer Reviews
**Endpoint:** `GET /api/customer/reviews`  
**Authentication:** Required (Customer)  
**Description:** Get all reviews written by the logged-in customer

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `search` | string | Searches in `comment` field (case-insensitive) | `?search=excellent` |
| `artist` | string | Filter by artist ID | `?artist=691aa51d3e6a1cca987f9223` |
| `minRating` | number | Minimum rating (1-5) | `?minRating=4` |
| `maxRating` | number | Maximum rating (1-5) | `?maxRating=5` |
| `startDate` | date | Filter reviews from this date | `?startDate=2024-01-01` |
| `endDate` | date | Filter reviews until this date | `?endDate=2024-12-31` |
| `page` | number | Page number (default: 1) | `?page=1` |
| `limit` | number | Items per page (default: 10) | `?limit=10` |
| `sortBy` | string | Field to sort by (default: `createdAt`) | `?sortBy=rating` |
| `sortOrder` | string | Sort direction: `asc` or `desc` (default: `desc`) | `?sortOrder=desc` |

**Example Request:**
```bash
GET /api/customer/reviews?minRating=4&search=great&page=1&limit=10
```

---

## Artist Endpoints

### 3. Get Artist Bookings
**Endpoint:** `GET /api/artist/bookings`  
**Authentication:** Required (Artist)  
**Description:** Get all bookings for the logged-in artist with filtering

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `search` | string | Searches in `location` and `specialRequests` | `?search=outdoor` |
| `status` | string | Filter by booking status | `?status=pending` |
| `paymentStatus` | string | Filter by payment status | `?paymentStatus=paid` |
| `category` | string | Filter by category ID | `?category=69159852bcea8d9de167502f` |
| `startDate` | date | Filter bookings from this date | `?startDate=2024-01-01` |
| `endDate` | date | Filter bookings until this date | `?endDate=2024-12-31` |
| `minAmount` | number | Minimum booking amount | `?minAmount=200` |
| `maxAmount` | number | Maximum booking amount | `?maxAmount=1000` |
| `page` | number | Page number (default: 1) | `?page=1` |
| `limit` | number | Items per page (default: 10) | `?limit=10` |
| `sortBy` | string | Field to sort by (default: `bookingDate`) | `?sortBy=totalAmount` |
| `sortOrder` | string | Sort direction: `asc` or `desc` (default: `desc`) | `?sortOrder=asc` |

**Example Request:**
```bash
GET /api/artist/bookings?status=accepted&startDate=2024-06-01&endDate=2024-06-30&page=1&limit=20
```

---

### 4. Get Artist Reviews
**Endpoint:** `GET /api/artist/reviews`  
**Authentication:** Required (Artist)  
**Description:** Get all visible reviews for the logged-in artist

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `search` | string | Searches in `comment` field | `?search=professional` |
| `minRating` | number | Minimum rating (1-5) | `?minRating=4` |
| `maxRating` | number | Maximum rating (1-5) | `?maxRating=5` |
| `startDate` | date | Filter reviews from this date | `?startDate=2024-01-01` |
| `endDate` | date | Filter reviews until this date | `?endDate=2024-12-31` |
| `page` | number | Page number (default: 1) | `?page=1` |
| `limit` | number | Items per page (default: 10) | `?limit=10` |
| `sortBy` | string | Field to sort by (default: `createdAt`) | `?sortBy=rating` |
| `sortOrder` | string | Sort direction: `asc` or `desc` (default: `desc`) | `?sortOrder=desc` |

**Example Request:**
```bash
GET /api/artist/reviews?minRating=4&maxRating=5&page=1&limit=10
```

---

## Admin Endpoints

### 5. Get Users by Role
**Endpoint:** `GET /api/admin/users`  
**Authentication:** Required (Admin)  
**Description:** Get users (artists or customers) with comprehensive filtering

**Query Parameters:**

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `role` | string | **Yes** | User role: `artist` or `customer` | `?role=artist` |
| `search` | string | No | Searches in name, email, bio (artists), skills (artists) | `?search=photography` |
| `isApproved` | boolean | No | Filter by approval status | `?isApproved=true` |
| `isActive` | boolean | No | Filter by active status | `?isActive=true` |
| `category` | string | No | Filter artists by category ID (artists only) | `?category=69159852bcea8d9de167502f` |
| `minRating` | number | No | Minimum rating for artists (0-5) | `?minRating=4` |
| `maxHourlyRate` | number | No | Maximum hourly rate for artists | `?maxHourlyRate=100` |
| `page` | number | No | Page number (default: 1) | `?page=1` |
| `limit` | number | No | Items per page (default: 10) | `?limit=20` |
| `sortBy` | string | No | Field to sort by (default: `createdAt`) | `?sortBy=rating` |
| `sortOrder` | string | No | Sort direction: `asc` or `desc` (default: `desc`) | `?sortOrder=asc` |

**Example Request:**
```bash
GET /api/admin/users?role=artist&search=photography&isApproved=true&minRating=4&page=1&limit=20
```

**Search Fields:**
- **For Artists:** `name`, `email`, `bio`, `skills` (array)
- **For Customers:** `name`, `email`

---

### 6. Get All Bookings (Admin)
**Endpoint:** `GET /api/admin/bookings`  
**Authentication:** Required (Admin)  
**Description:** Get all bookings in the system with admin-level filtering

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `search` | string | Searches in `location` and `specialRequests` | `?search=wedding` |
| `status` | string | Filter by booking status | `?status=pending` |
| `paymentStatus` | string | Filter by payment status | `?paymentStatus=paid` |
| `customer` | string | Filter by customer ID | `?customer=691aa51d3e6a1cca987f9223` |
| `artist` | string | Filter by artist ID | `?artist=691aa51d3e6a1cca987f9223` |
| `category` | string | Filter by category ID | `?category=69159852bcea8d9de167502f` |
| `startDate` | date | Filter bookings from this date | `?startDate=2024-01-01` |
| `endDate` | date | Filter bookings until this date | `?endDate=2024-12-31` |
| `minAmount` | number | Minimum booking amount | `?minAmount=100` |
| `maxAmount` | number | Maximum booking amount | `?maxAmount=5000` |
| `page` | number | Page number (default: 1) | `?page=1` |
| `limit` | number | Items per page (default: 10) | `?limit=50` |
| `sortBy` | string | Field to sort by (default: `createdAt`) | `?sortBy=totalAmount` |
| `sortOrder` | string | Sort direction: `asc` or `desc` (default: `desc`) | `?sortOrder=desc` |

**Example Request:**
```bash
GET /api/admin/bookings?status=pending&startDate=2024-01-01&endDate=2024-12-31&page=1&limit=50
```

---

## Payment Endpoints

### 7. Get Payments
**Endpoint:** `GET /api/payments`  
**Authentication:** Required (Customer/Artist/Admin)  
**Description:** Get payments with role-based access and filtering

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `search` | string | Searches in `transactionId` field | `?search=TXN123` |
| `status` | string | Filter by payment status | `?status=completed` |
| | | Values: `pending`, `completed`, `refunded` | |
| `paymentMethod` | string | Filter by payment method | `?paymentMethod=credit_card` |
| `customer` | string | Filter by customer ID (admin only) | `?customer=691aa51d3e6a1cca987f9223` |
| `artist` | string | Filter by artist ID (admin only) | `?artist=691aa51d3e6a1cca987f9223` |
| `booking` | string | Filter by booking ID | `?booking=691aa51d3e6a1cca987f9223` |
| `startDate` | date | Filter payments from this date | `?startDate=2024-01-01` |
| `endDate` | date | Filter payments until this date | `?endDate=2024-12-31` |
| `minAmount` | number | Minimum payment amount | `?minAmount=50` |
| `maxAmount` | number | Maximum payment amount | `?maxAmount=1000` |
| `page` | number | Page number (default: 1) | `?page=1` |
| `limit` | number | Items per page (default: 10) | `?limit=10` |
| `sortBy` | string | Field to sort by (default: `createdAt`) | `?sortBy=amount` |
| `sortOrder` | string | Sort direction: `asc` or `desc` (default: `desc`) | `?sortOrder=desc` |

**Role-Based Access:**
- **Customer:** Can only see their own payments
- **Artist:** Can only see payments for their services
- **Admin:** Can see all payments and filter by customer/artist

**Example Request:**
```bash
GET /api/payments?status=completed&startDate=2024-01-01&endDate=2024-12-31&minAmount=100&page=1&limit=20
```

---

## Review Endpoints

### 8. Get Reviews by Artist
**Endpoint:** `GET /api/reviews/artist/:artistId`  
**Authentication:** Not Required (Public)  
**Description:** Get all visible reviews for a specific artist

**URL Parameters:**
- `artistId` - Artist ID (required)

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `search` | string | Searches in `comment` field | `?search=excellent` |
| `minRating` | number | Minimum rating (1-5) | `?minRating=4` |
| `maxRating` | number | Maximum rating (1-5) | `?maxRating=5` |
| `startDate` | date | Filter reviews from this date | `?startDate=2024-01-01` |
| `endDate` | date | Filter reviews until this date | `?endDate=2024-12-31` |
| `page` | number | Page number (default: 1) | `?page=1` |
| `limit` | number | Items per page (default: 10) | `?limit=10` |
| `sortBy` | string | Field to sort by (default: `createdAt`) | `?sortBy=rating` |
| `sortOrder` | string | Sort direction: `asc` or `desc` (default: `desc`) | `?sortOrder=desc` |

**Example Request:**
```bash
GET /api/reviews/artist/691aa51d3e6a1cca987f9223?minRating=4&maxRating=5&page=1&limit=10
```

---

## Category Endpoints

### 9. Get All Categories
**Endpoint:** `GET /api/categories`  
**Authentication:** Not Required (Public)  
**Description:** Get all categories with search and filtering

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `search` | string | Searches in `name` and `description` fields | `?search=photography` |
| `isActive` | boolean | Filter by active status | `?isActive=true` |
| `page` | number | Page number (default: 1) | `?page=1` |
| `limit` | number | Items per page (default: 10) | `?limit=10` |

**Example Request:**
```bash
GET /api/categories?search=photography&isActive=true&page=1&limit=10
```

---

### 10. Get Artists by Category
**Endpoint:** `GET /api/categories/:categoryId/artists`  
**Authentication:** Not Required (Public)  
**Description:** Get all approved and active artists in a specific category

**URL Parameters:**
- `categoryId` - Category ID (required)

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `search` | string | Searches in `name`, `bio`, and `skills` fields | `?search=photography` |
| `minRating` | number | Minimum rating (0-5) | `?minRating=4` |
| `maxRate` | number | Maximum hourly rate | `?maxRate=100` |
| `page` | number | Page number (default: 1) | `?page=1` |
| `limit` | number | Items per page (default: 10) | `?limit=10` |

**Example Request:**
```bash
GET /api/categories/69159852bcea8d9de167502f/artists?minRating=4&maxRate=100&page=1&limit=20
```

**Note:** Results are sorted by rating (highest first), then by creation date.

---

## Public Artist Endpoints

### 11. Get All Artists (Public)
**Endpoint:** `GET /api/artists`  
**Authentication:** Not Required (Public)  
**Description:** Get all approved and active artists with search and filtering

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `category` | string | Filter by category ID | `?category=69159852bcea8d9de167502f` |
| `search` | string | Searches in `name`, `bio`, and `skills` fields | `?search=photography` |
| `page` | number | Page number (default: 1) | `?page=1` |
| `limit` | number | Items per page (default: 10, max: 100) | `?limit=20` |

**Example Request:**
```bash
GET /api/artists?category=69159852bcea8d9de167502f&search=photography&page=1&limit=20
```

**Search Fields:**
- `name` - Artist name
- `bio` - Artist biography
- `skills` - Skills array

---

## Quick Reference Table

### All Available Filter Parameters

| Filter Type | Parameter | Used In | Description |
|------------|----------|---------|-------------|
| **Text Search** | `search` | All list endpoints | Case-insensitive text search |
| **Status** | `status` | Bookings | Filter by booking status |
| **Payment Status** | `paymentStatus` | Bookings, Payments | Filter by payment status |
| **User Status** | `isApproved` | Admin users | Filter by approval status |
| **User Status** | `isActive` | Admin users, Categories | Filter by active status |
| **Date Range** | `startDate` | Bookings, Reviews, Payments | Filter from date |
| **Date Range** | `endDate` | Bookings, Reviews, Payments | Filter to date |
| **Amount Range** | `minAmount` | Bookings, Payments | Minimum amount |
| **Amount Range** | `maxAmount` | Bookings, Payments | Maximum amount |
| **Rating Range** | `minRating` | Reviews, Artists | Minimum rating (1-5) |
| **Rating Range** | `maxRating` | Reviews | Maximum rating (1-5) |
| **Price Range** | `maxHourlyRate` | Artists | Maximum hourly rate |
| **Price Range** | `maxRate` | Artists by category | Maximum hourly rate |
| **ID Filter** | `artist` | Bookings, Reviews | Filter by artist ID |
| **ID Filter** | `customer` | Admin bookings, Payments | Filter by customer ID |
| **ID Filter** | `category` | Bookings, Artists | Filter by category ID |
| **ID Filter** | `booking` | Payments | Filter by booking ID |
| **Pagination** | `page` | All list endpoints | Page number |
| **Pagination** | `limit` | All list endpoints | Items per page |
| **Sorting** | `sortBy` | All list endpoints | Field to sort by |
| **Sorting** | `sortOrder` | All list endpoints | `asc` or `desc` |

---

## Common Query Parameter Values

### Status Values

**Booking Status:**
- `pending` - Booking is pending approval
- `accepted` - Booking has been accepted
- `rejected` - Booking has been rejected
- `completed` - Booking has been completed
- `cancelled` - Booking has been cancelled

**Payment Status:**
- `pending` - Payment is pending
- `paid` - Payment has been completed
- `refunded` - Payment has been refunded

**Payment Status (Payments):**
- `pending` - Payment is pending
- `completed` - Payment is completed
- `refunded` - Payment has been refunded

### Boolean Values

For `isApproved`, `isActive` parameters:
- `true` - String "true" or boolean true
- `false` - String "false" or boolean false

### Date Format

All date parameters use ISO 8601 format:
- Format: `YYYY-MM-DD`
- Example: `2024-01-15`
- Example: `2024-12-31`

### Sort Order Values

- `asc` - Ascending order (A-Z, 1-9, oldest first)
- `desc` - Descending order (Z-A, 9-1, newest first)

---

## Pagination Response Format

All filtered endpoints return pagination metadata:

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

---

## Example Usage Scenarios

### Scenario 1: Customer Finding Their Pending Bookings
```bash
GET /api/customer/bookings?status=pending&page=1&limit=10
```

### Scenario 2: Admin Finding High-Value Bookings
```bash
GET /api/admin/bookings?minAmount=500&status=accepted&startDate=2024-01-01&page=1&limit=20
```

### Scenario 3: Searching for Photography Artists
```bash
GET /api/artists?search=photography&category=69159852bcea8d9de167502f&page=1&limit=20
```

### Scenario 4: Finding Top-Rated Artists in Category
```bash
GET /api/categories/69159852bcea8d9de167502f/artists?minRating=4&maxRate=150&page=1&limit=10
```

### Scenario 5: Admin Finding Unapproved Artists
```bash
GET /api/admin/users?role=artist&isApproved=false&page=1&limit=20
```

### Scenario 6: Customer Finding Their High-Rated Reviews
```bash
GET /api/customer/reviews?minRating=4&maxRating=5&page=1&limit=10
```

### Scenario 7: Artist Finding Their Upcoming Bookings
```bash
GET /api/artist/bookings?status=accepted&startDate=2024-06-01&endDate=2024-12-31&page=1&limit=20
```

### Scenario 8: Admin Finding Completed Payments in Date Range
```bash
GET /api/payments?status=completed&startDate=2024-01-01&endDate=2024-12-31&minAmount=100&page=1&limit=50
```

---

## Search Field Reference

### What Fields Are Searched?

| Endpoint | Search Fields |
|----------|---------------|
| Customer Bookings | `location`, `specialRequests` |
| Customer Reviews | `comment` |
| Artist Bookings | `location`, `specialRequests` |
| Artist Reviews | `comment` |
| Admin Users (Artists) | `name`, `email`, `bio`, `skills` |
| Admin Users (Customers) | `name`, `email` |
| Admin Bookings | `location`, `specialRequests` |
| Payments | `transactionId` |
| Reviews by Artist | `comment` |
| Categories | `name`, `description` |
| Artists by Category | `name`, `bio`, `skills` |
| Public Artists | `name`, `bio`, `skills` |

---

## Tips for Using Filters

1. **Combine Multiple Filters:** You can combine multiple filters for precise results
   ```
   ?status=pending&startDate=2024-01-01&minAmount=100
   ```

2. **Use Date Ranges:** Date ranges work with either start or end date, or both
   ```
   ?startDate=2024-01-01        # From this date onwards
   ?endDate=2024-12-31          # Until this date
   ?startDate=2024-01-01&endDate=2024-12-31  # Date range
   ```

3. **Numeric Ranges:** Use min/max for ranges
   ```
   ?minAmount=100&maxAmount=500  # Amount between 100 and 500
   ?minRating=4                   # Rating 4 or higher
   ```

4. **Pagination:** Always use pagination for large datasets
   ```
   ?page=1&limit=20  # First 20 results
   ?page=2&limit=20  # Next 20 results
   ```

5. **Sorting:** Combine with filters for organized results
   ```
   ?status=pending&sortBy=bookingDate&sortOrder=asc  # Oldest pending first
   ?minRating=4&sortBy=rating&sortOrder=desc          # Highest rated first
   ```

---

## Error Handling

If invalid parameters are provided, the API will return appropriate error responses:

- **Invalid date format:** Returns 400 Bad Request
- **Invalid ObjectId:** Returns 400 Bad Request
- **Invalid status value:** Returns filtered results (no error, just no matches)
- **Missing required parameter:** Returns 400 Bad Request (e.g., `role` in admin users endpoint)

---

**Last Updated:** 2024  
**Version:** 1.0  
**Total Endpoints with Filtering:** 11


