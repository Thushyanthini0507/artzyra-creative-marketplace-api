# Complete API Methods - Filtering, Pagination & Searching with URLs

Complete reference of all API endpoints with filtering, pagination, and searching capabilities including full URL paths.

---

## Table of Contents
1. [Customer Endpoints](#customer-endpoints)
2. [Artist Endpoints](#artist-endpoints)
3. [Admin Endpoints](#admin-endpoints)
4. [Payment Endpoints](#payment-endpoints)
5. [Review Endpoints](#review-endpoints)
6. [Category Endpoints](#category-endpoints)
7. [Public Artist Endpoints](#public-artist-endpoints)
8. [Quick Reference](#quick-reference)

---

## Customer Endpoints

### 1. Get Customer Bookings
**Base URL:** `GET /api/customer/bookings`  
**Authentication:** Required (Customer)

**Full URL with Parameters:**
```
GET /api/customer/bookings?search={term}&status={status}&paymentStatus={status}&artist={id}&category={id}&startDate={date}&endDate={date}&minAmount={number}&maxAmount={number}&page={number}&limit={number}&sortBy={field}&sortOrder={asc|desc}
```

**Parameters:**

| Parameter | Type | Description | Example Value |
|-----------|------|-------------|---------------|
| `search` | string | Search in location, specialRequests | `wedding` |
| `status` | string | Filter by status: pending, accepted, rejected, completed, cancelled | `pending` |
| `paymentStatus` | string | Filter by payment status: pending, paid, refunded | `paid` |
| `artist` | string | Filter by artist ID | `691aa51d3e6a1cca987f9223` |
| `category` | string | Filter by category ID | `69159852bcea8d9de167502f` |
| `startDate` | date | Filter from date (YYYY-MM-DD) | `2024-01-01` |
| `endDate` | date | Filter to date (YYYY-MM-DD) | `2024-12-31` |
| `minAmount` | number | Minimum booking amount | `100` |
| `maxAmount` | number | Maximum booking amount | `500` |
| `page` | number | Page number (default: 1) | `1` |
| `limit` | number | Items per page (default: 10) | `10` |
| `sortBy` | string | Field to sort by (default: bookingDate) | `totalAmount` |
| `sortOrder` | string | Sort direction: asc or desc (default: desc) | `asc` |

**Example URLs:**
```
GET /api/customer/bookings?search=wedding&status=accepted&page=1&limit=10
GET /api/customer/bookings?startDate=2024-01-01&endDate=2024-12-31&minAmount=100
GET /api/customer/bookings?status=pending&sortBy=bookingDate&sortOrder=asc
```

**Search Fields:** `location`, `specialRequests`

---

### 2. Get Customer Reviews
**Base URL:** `GET /api/customer/reviews`  
**Authentication:** Required (Customer)

**Full URL with Parameters:**
```
GET /api/customer/reviews?search={term}&artist={id}&minRating={number}&maxRating={number}&startDate={date}&endDate={date}&page={number}&limit={number}&sortBy={field}&sortOrder={asc|desc}
```

**Parameters:**

| Parameter | Type | Description | Example Value |
|-----------|------|-------------|---------------|
| `search` | string | Search in comment field | `excellent` |
| `artist` | string | Filter by artist ID | `691aa51d3e6a1cca987f9223` |
| `minRating` | number | Minimum rating (1-5) | `4` |
| `maxRating` | number | Maximum rating (1-5) | `5` |
| `startDate` | date | Filter from date (YYYY-MM-DD) | `2024-01-01` |
| `endDate` | date | Filter to date (YYYY-MM-DD) | `2024-12-31` |
| `page` | number | Page number (default: 1) | `1` |
| `limit` | number | Items per page (default: 10) | `10` |
| `sortBy` | string | Field to sort by (default: createdAt) | `rating` |
| `sortOrder` | string | Sort direction: asc or desc (default: desc) | `desc` |

**Example URLs:**
```
GET /api/customer/reviews?search=excellent&minRating=4&page=1&limit=10
GET /api/customer/reviews?artist=691aa51d3e6a1cca987f9223&minRating=4&maxRating=5
GET /api/customer/reviews?startDate=2024-01-01&sortBy=rating&sortOrder=desc
```

**Search Fields:** `comment`

---

## Artist Endpoints

### 3. Get Artist Bookings
**Base URL:** `GET /api/artist/bookings`  
**Authentication:** Required (Artist)

**Full URL with Parameters:**
```
GET /api/artist/bookings?search={term}&status={status}&paymentStatus={status}&category={id}&startDate={date}&endDate={date}&minAmount={number}&maxAmount={number}&page={number}&limit={number}&sortBy={field}&sortOrder={asc|desc}
```

**Parameters:**

| Parameter | Type | Description | Example Value |
|-----------|------|-------------|---------------|
| `search` | string | Search in location, specialRequests | `wedding` |
| `status` | string | Filter by status: pending, accepted, rejected, completed, cancelled | `accepted` |
| `paymentStatus` | string | Filter by payment status: pending, paid, refunded | `paid` |
| `category` | string | Filter by category ID | `69159852bcea8d9de167502f` |
| `startDate` | date | Filter from date (YYYY-MM-DD) | `2024-01-01` |
| `endDate` | date | Filter to date (YYYY-MM-DD) | `2024-12-31` |
| `minAmount` | number | Minimum booking amount | `200` |
| `maxAmount` | number | Maximum booking amount | `1000` |
| `page` | number | Page number (default: 1) | `1` |
| `limit` | number | Items per page (default: 10) | `10` |
| `sortBy` | string | Field to sort by (default: bookingDate) | `totalAmount` |
| `sortOrder` | string | Sort direction: asc or desc (default: desc) | `asc` |

**Example URLs:**
```
GET /api/artist/bookings?status=accepted&startDate=2024-06-01&endDate=2024-12-31
GET /api/artist/bookings?search=outdoor&paymentStatus=paid&page=1&limit=20
GET /api/artist/bookings?minAmount=200&maxAmount=1000&sortBy=totalAmount&sortOrder=desc
```

**Search Fields:** `location`, `specialRequests`

---

### 4. Get Artist Reviews
**Base URL:** `GET /api/artist/reviews`  
**Authentication:** Required (Artist)

**Full URL with Parameters:**
```
GET /api/artist/reviews?search={term}&minRating={number}&maxRating={number}&startDate={date}&endDate={date}&page={number}&limit={number}&sortBy={field}&sortOrder={asc|desc}
```

**Parameters:**

| Parameter | Type | Description | Example Value |
|-----------|------|-------------|---------------|
| `search` | string | Search in comment field | `professional` |
| `minRating` | number | Minimum rating (1-5) | `4` |
| `maxRating` | number | Maximum rating (1-5) | `5` |
| `startDate` | date | Filter from date (YYYY-MM-DD) | `2024-01-01` |
| `endDate` | date | Filter to date (YYYY-MM-DD) | `2024-12-31` |
| `page` | number | Page number (default: 1) | `1` |
| `limit` | number | Items per page (default: 10) | `10` |
| `sortBy` | string | Field to sort by (default: createdAt) | `rating` |
| `sortOrder` | string | Sort direction: asc or desc (default: desc) | `desc` |

**Example URLs:**
```
GET /api/artist/reviews?minRating=4&maxRating=5&page=1&limit=10
GET /api/artist/reviews?search=amazing&startDate=2024-01-01&sortBy=rating&sortOrder=desc
```

**Search Fields:** `comment`

---

## Admin Endpoints

### 5. Get Users by Role
**Base URL:** `GET /api/admin/users`  
**Authentication:** Required (Admin)

**Full URL with Parameters:**
```
GET /api/admin/users?role={artist|customer}&search={term}&isApproved={true|false}&isActive={true|false}&category={id}&minRating={number}&maxHourlyRate={number}&page={number}&limit={number}&sortBy={field}&sortOrder={asc|desc}
```

**Parameters:**

| Parameter | Type | Required | Description | Example Value |
|-----------|------|----------|-------------|---------------|
| `role` | string | **Yes** | User role: artist or customer | `artist` |
| `search` | string | No | Search in name, email, bio (artists), skills (artists) | `photography` |
| `isApproved` | boolean | No | Filter by approval status | `true` |
| `isActive` | boolean | No | Filter by active status | `true` |
| `category` | string | No | Filter artists by category ID | `69159852bcea8d9de167502f` |
| `minRating` | number | No | Minimum rating for artists (0-5) | `4` |
| `maxHourlyRate` | number | No | Maximum hourly rate for artists | `100` |
| `page` | number | No | Page number (default: 1) | `1` |
| `limit` | number | No | Items per page (default: 10) | `20` |
| `sortBy` | string | No | Field to sort by (default: createdAt) | `rating` |
| `sortOrder` | string | No | Sort direction: asc or desc (default: desc) | `asc` |

**Example URLs:**
```
GET /api/admin/users?role=artist&search=photography&isApproved=true&minRating=4
GET /api/admin/users?role=artist&isApproved=false&page=1&limit=20
GET /api/admin/users?role=customer&search=john&page=1&limit=10
GET /api/admin/users?role=artist&category=69159852bcea8d9de167502f&maxHourlyRate=100
```

**Search Fields:**
- **Artists:** `name`, `email`, `bio`, `skills`
- **Customers:** `name`, `email`

---

### 6. Get All Bookings (Admin)
**Base URL:** `GET /api/admin/bookings`  
**Authentication:** Required (Admin)

**Full URL with Parameters:**
```
GET /api/admin/bookings?search={term}&status={status}&paymentStatus={status}&customer={id}&artist={id}&category={id}&startDate={date}&endDate={date}&minAmount={number}&maxAmount={number}&page={number}&limit={number}&sortBy={field}&sortOrder={asc|desc}
```

**Parameters:**

| Parameter | Type | Description | Example Value |
|-----------|------|-------------|---------------|
| `search` | string | Search in location, specialRequests | `wedding` |
| `status` | string | Filter by status: pending, accepted, rejected, completed, cancelled | `pending` |
| `paymentStatus` | string | Filter by payment status: pending, paid, refunded | `paid` |
| `customer` | string | Filter by customer ID | `691aa51d3e6a1cca987f9223` |
| `artist` | string | Filter by artist ID | `691aa51d3e6a1cca987f9223` |
| `category` | string | Filter by category ID | `69159852bcea8d9de167502f` |
| `startDate` | date | Filter from date (YYYY-MM-DD) | `2024-01-01` |
| `endDate` | date | Filter to date (YYYY-MM-DD) | `2024-12-31` |
| `minAmount` | number | Minimum booking amount | `100` |
| `maxAmount` | number | Maximum booking amount | `5000` |
| `page` | number | Page number (default: 1) | `1` |
| `limit` | number | Items per page (default: 10) | `50` |
| `sortBy` | string | Field to sort by (default: createdAt) | `totalAmount` |
| `sortOrder` | string | Sort direction: asc or desc (default: desc) | `desc` |

**Example URLs:**
```
GET /api/admin/bookings?status=pending&startDate=2024-01-01&endDate=2024-12-31
GET /api/admin/bookings?customer=691aa51d3e6a1cca987f9223&status=completed
GET /api/admin/bookings?search=wedding&minAmount=500&page=1&limit=50
```

**Search Fields:** `location`, `specialRequests`

---

## Payment Endpoints

### 7. Get Payments
**Base URL:** `GET /api/payments`  
**Authentication:** Required (Customer/Artist/Admin)

**Full URL with Parameters:**
```
GET /api/payments?search={term}&status={status}&paymentMethod={method}&customer={id}&artist={id}&booking={id}&startDate={date}&endDate={date}&minAmount={number}&maxAmount={number}&page={number}&limit={number}&sortBy={field}&sortOrder={asc|desc}
```

**Parameters:**

| Parameter | Type | Description | Example Value |
|-----------|------|-------------|---------------|
| `search` | string | Search in transactionId field | `TXN123` |
| `status` | string | Filter by status: pending, completed, refunded | `completed` |
| `paymentMethod` | string | Filter by payment method | `credit_card` |
| `customer` | string | Filter by customer ID (admin only) | `691aa51d3e6a1cca987f9223` |
| `artist` | string | Filter by artist ID (admin only) | `691aa51d3e6a1cca987f9223` |
| `booking` | string | Filter by booking ID | `691aa51d3e6a1cca987f9223` |
| `startDate` | date | Filter from date (YYYY-MM-DD) | `2024-01-01` |
| `endDate` | date | Filter to date (YYYY-MM-DD) | `2024-12-31` |
| `minAmount` | number | Minimum payment amount | `50` |
| `maxAmount` | number | Maximum payment amount | `1000` |
| `page` | number | Page number (default: 1) | `1` |
| `limit` | number | Items per page (default: 10) | `10` |
| `sortBy` | string | Field to sort by (default: createdAt) | `amount` |
| `sortOrder` | string | Sort direction: asc or desc (default: desc) | `desc` |

**Example URLs:**
```
GET /api/payments?status=completed&startDate=2024-01-01&endDate=2024-12-31
GET /api/payments?search=TXN123&minAmount=100&page=1&limit=20
GET /api/payments?status=completed&sortBy=amount&sortOrder=desc
```

**Search Fields:** `transactionId`

**Note:** Role-based access - customers/artists see only their payments, admins see all.

---

## Review Endpoints

### 8. Get Reviews by Artist
**Base URL:** `GET /api/reviews/artist/{artistId}`  
**Authentication:** Not Required (Public)

**Full URL with Parameters:**
```
GET /api/reviews/artist/{artistId}?search={term}&minRating={number}&maxRating={number}&startDate={date}&endDate={date}&page={number}&limit={number}&sortBy={field}&sortOrder={asc|desc}
```

**URL Parameters:**
- `artistId` - Artist ID (required in path)

**Query Parameters:**

| Parameter | Type | Description | Example Value |
|-----------|------|-------------|---------------|
| `search` | string | Search in comment field | `excellent` |
| `minRating` | number | Minimum rating (1-5) | `4` |
| `maxRating` | number | Maximum rating (1-5) | `5` |
| `startDate` | date | Filter from date (YYYY-MM-DD) | `2024-01-01` |
| `endDate` | date | Filter to date (YYYY-MM-DD) | `2024-12-31` |
| `page` | number | Page number (default: 1) | `1` |
| `limit` | number | Items per page (default: 10) | `10` |
| `sortBy` | string | Field to sort by (default: createdAt) | `rating` |
| `sortOrder` | string | Sort direction: asc or desc (default: desc) | `desc` |

**Example URLs:**
```
GET /api/reviews/artist/691aa51d3e6a1cca987f9223?minRating=4&maxRating=5
GET /api/reviews/artist/691aa51d3e6a1cca987f9223?search=excellent&page=1&limit=10
GET /api/reviews/artist/691aa51d3e6a1cca987f9223?startDate=2024-01-01&sortBy=rating&sortOrder=desc
```

**Search Fields:** `comment`

---

## Category Endpoints

### 9. Get All Categories
**Base URL:** `GET /api/categories`  
**Authentication:** Not Required (Public)

**Full URL with Parameters:**
```
GET /api/categories?search={term}&isActive={true|false}&page={number}&limit={number}
```

**Parameters:**

| Parameter | Type | Description | Example Value |
|-----------|------|-------------|---------------|
| `search` | string | Search in name, description | `photography` |
| `isActive` | boolean | Filter by active status | `true` |
| `page` | number | Page number (default: 1) | `1` |
| `limit` | number | Items per page (default: 10) | `10` |

**Example URLs:**
```
GET /api/categories?search=photography&isActive=true
GET /api/categories?page=1&limit=20
GET /api/categories?search=music
```

**Search Fields:** `name`, `description`

---

### 10. Get Artists by Category
**Base URL:** `GET /api/categories/{categoryId}/artists`  
**Authentication:** Not Required (Public)

**Full URL with Parameters:**
```
GET /api/categories/{categoryId}/artists?search={term}&minRating={number}&maxRate={number}&page={number}&limit={number}
```

**URL Parameters:**
- `categoryId` - Category ID (required in path)

**Query Parameters:**

| Parameter | Type | Description | Example Value |
|-----------|------|-------------|---------------|
| `search` | string | Search in name, bio, skills | `photography` |
| `minRating` | number | Minimum rating (0-5) | `4` |
| `maxRate` | number | Maximum hourly rate | `100` |
| `page` | number | Page number (default: 1) | `1` |
| `limit` | number | Items per page (default: 10) | `10` |

**Example URLs:**
```
GET /api/categories/69159852bcea8d9de167502f/artists?minRating=4&maxRate=100
GET /api/categories/69159852bcea8d9de167502f/artists?search=portrait&page=1&limit=20
GET /api/categories/69159852bcea8d9de167502f/artists?minRating=4
```

**Search Fields:** `name`, `bio`, `skills`

---

## Public Artist Endpoints

### 11. Get All Artists (Public)
**Base URL:** `GET /api/artists`  
**Authentication:** Not Required (Public)

**Full URL with Parameters:**
```
GET /api/artists?category={id}&search={term}&page={number}&limit={number}
```

**Parameters:**

| Parameter | Type | Description | Example Value |
|-----------|------|-------------|---------------|
| `category` | string | Filter by category ID | `69159852bcea8d9de167502f` |
| `search` | string | Search in name, bio, skills | `photography` |
| `page` | number | Page number (default: 1) | `1` |
| `limit` | number | Items per page (default: 10, max: 100) | `20` |

**Example URLs:**
```
GET /api/artists?category=69159852bcea8d9de167502f&search=photography
GET /api/artists?search=wedding%20photographer&page=1&limit=20
GET /api/artists?category=69159852bcea8d9de167502f&page=1&limit=10
```

**Search Fields:** `name`, `bio`, `skills`

---

## Quick Reference

### All Endpoints Summary

| # | Endpoint | Base URL | Search | Filter | Pagination | Sort |
|---|----------|----------|--------|--------|------------|------|
| 1 | Customer Bookings | `/api/customer/bookings` | ✅ | ✅ | ✅ | ✅ |
| 2 | Customer Reviews | `/api/customer/reviews` | ✅ | ✅ | ✅ | ✅ |
| 3 | Artist Bookings | `/api/artist/bookings` | ✅ | ✅ | ✅ | ✅ |
| 4 | Artist Reviews | `/api/artist/reviews` | ✅ | ✅ | ✅ | ✅ |
| 5 | Admin Users | `/api/admin/users` | ✅ | ✅ | ✅ | ✅ |
| 6 | Admin Bookings | `/api/admin/bookings` | ✅ | ✅ | ✅ | ✅ |
| 7 | Payments | `/api/payments` | ✅ | ✅ | ✅ | ✅ |
| 8 | Reviews by Artist | `/api/reviews/artist/{id}` | ✅ | ✅ | ✅ | ✅ |
| 9 | Categories | `/api/categories` | ✅ | ✅ | ✅ | ❌ |
| 10 | Artists by Category | `/api/categories/{id}/artists` | ✅ | ✅ | ✅ | ❌ |
| 11 | Public Artists | `/api/artists` | ✅ | ✅ | ✅ | ❌ |

### Common Parameters Across All Endpoints

#### Pagination Parameters
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100 for public artists)

#### Sorting Parameters
- `sortBy` - Field to sort by (varies by endpoint)
- `sortOrder` - `asc` or `desc` (default: `desc`)

#### Search Parameter
- `search` - Text search (case-insensitive, partial matching)

### Filter Types by Endpoint

#### Booking Endpoints (Customer, Artist, Admin)
- Status filters: `status`, `paymentStatus`
- ID filters: `artist`, `category`, `customer` (admin only)
- Date range: `startDate`, `endDate`
- Amount range: `minAmount`, `maxAmount`

#### Review Endpoints
- ID filters: `artist`
- Rating range: `minRating`, `maxRating`
- Date range: `startDate`, `endDate`

#### User Endpoints (Admin)
- Status filters: `isApproved`, `isActive`
- ID filters: `category` (artists only)
- Rating/Price: `minRating`, `maxHourlyRate` (artists only)

#### Payment Endpoints
- Status filters: `status`, `paymentMethod`
- ID filters: `customer`, `artist`, `booking` (admin only)
- Date range: `startDate`, `endDate`
- Amount range: `minAmount`, `maxAmount`

#### Category Endpoints
- Status filters: `isActive`

#### Artist Endpoints (Public, by Category)
- ID filters: `category`
- Rating/Price: `minRating`, `maxRate` (by category only)

---

## Complete URL Examples

### Example 1: Customer Bookings with All Features
```
GET /api/customer/bookings?search=wedding&status=accepted&startDate=2024-01-01&endDate=2024-12-31&minAmount=100&maxAmount=500&page=1&limit=10&sortBy=bookingDate&sortOrder=asc
```

### Example 2: Admin User Search with Filters
```
GET /api/admin/users?role=artist&search=photography&isApproved=true&minRating=4&maxHourlyRate=100&page=1&limit=20&sortBy=rating&sortOrder=desc
```

### Example 3: Public Artist Search
```
GET /api/artists?category=69159852bcea8d9de167502f&search=wedding%20photographer&page=1&limit=20
```

### Example 4: Payment Filtering
```
GET /api/payments?status=completed&startDate=2024-01-01&endDate=2024-12-31&minAmount=50&maxAmount=1000&page=1&limit=20&sortBy=amount&sortOrder=desc
```

### Example 5: Reviews with Rating Filter
```
GET /api/reviews/artist/691aa51d3e6a1cca987f9223?search=excellent&minRating=4&maxRating=5&page=1&limit=10&sortBy=rating&sortOrder=desc
```

---

## Response Format

All endpoints return data with pagination metadata:

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

## URL Encoding

When using special characters in URLs, use URL encoding:

| Character | Encoded | Example |
|-----------|---------|---------|
| Space | `%20` | `wedding%20photographer` |
| & | `%26` | `music%26dance` |
| + | `%2B` | `photography%2Bvideo` |

**Example:**
```
GET /api/artists?search=wedding%20photographer
```

---

## Base URLs

### Local Development
```
http://localhost:8000
```

### Production
```
https://yourdomain.com
```

**Full Example:**
```
http://localhost:8000/api/customer/bookings?search=wedding&page=1&limit=10
```

---

## Notes

1. **All parameters are optional** except `role` in admin users endpoint
2. **Search is case-insensitive** and uses partial matching
3. **Date format:** YYYY-MM-DD (e.g., `2024-01-15`)
4. **Boolean values:** Use `true` or `false` as strings
5. **Combine multiple filters** for precise results
6. **Pagination defaults:** page=1, limit=10
7. **Sorting defaults:** Varies by endpoint (usually createdAt or bookingDate, desc)

---

**Total Endpoints:** 11  
**All Support:** Search ✅ | Filtering ✅ | Pagination ✅  
**Last Updated:** 2024

