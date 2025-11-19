# Search Methods - URLs Only

Complete list of all API endpoints that support search functionality with their URLs and search parameters.

---

## Customer Endpoints

### 1. Search Customer Bookings
**URL:** `GET /api/customer/bookings?search={search_term}`

**Search Fields:**
- `location`
- `specialRequests`

**Example:**
```
GET /api/customer/bookings?search=wedding
GET /api/customer/bookings?search=outdoor%20ceremony
```

---

### 2. Search Customer Reviews
**URL:** `GET /api/customer/reviews?search={search_term}`

**Search Fields:**
- `comment`

**Example:**
```
GET /api/customer/reviews?search=excellent
GET /api/customer/reviews?search=professional
```

---

## Artist Endpoints

### 3. Search Artist Bookings
**URL:** `GET /api/artist/bookings?search={search_term}`

**Search Fields:**
- `location`
- `specialRequests`

**Example:**
```
GET /api/artist/bookings?search=wedding
GET /api/artist/bookings?search=birthday%20party
```

---

### 4. Search Artist Reviews
**URL:** `GET /api/artist/reviews?search={search_term}`

**Search Fields:**
- `comment`

**Example:**
```
GET /api/artist/reviews?search=amazing
GET /api/artist/reviews?search=great%20service
```

---

## Admin Endpoints

### 5. Search Users by Role
**URL:** `GET /api/admin/users?role={role}&search={search_term}`

**Search Fields (for Artists):**
- `name`
- `email`
- `bio`
- `skills` (array)

**Search Fields (for Customers):**
- `name`
- `email`

**Examples:**
```
GET /api/admin/users?role=artist&search=photography
GET /api/admin/users?role=artist&search=john
GET /api/admin/users?role=customer&search=jane@email.com
```

---

### 6. Search All Bookings (Admin)
**URL:** `GET /api/admin/bookings?search={search_term}`

**Search Fields:**
- `location`
- `specialRequests`

**Example:**
```
GET /api/admin/bookings?search=wedding
GET /api/admin/bookings?search=corporate%20event
```

---

## Payment Endpoints

### 7. Search Payments
**URL:** `GET /api/payments?search={search_term}`

**Search Fields:**
- `transactionId`

**Example:**
```
GET /api/payments?search=TXN123
GET /api/payments?search=PAY456
```

---

## Review Endpoints

### 8. Search Reviews by Artist
**URL:** `GET /api/reviews/artist/{artistId}?search={search_term}`

**Search Fields:**
- `comment`

**Example:**
```
GET /api/reviews/artist/691aa51d3e6a1cca987f9223?search=excellent
GET /api/reviews/artist/691aa51d3e6a1cca987f9223?search=professional
```

---

## Category Endpoints

### 9. Search Categories
**URL:** `GET /api/categories?search={search_term}`

**Search Fields:**
- `name`
- `description`

**Example:**
```
GET /api/categories?search=photography
GET /api/categories?search=music
```

---

### 10. Search Artists by Category
**URL:** `GET /api/categories/{categoryId}/artists?search={search_term}`

**Search Fields:**
- `name`
- `bio`
- `skills` (array)

**Example:**
```
GET /api/categories/69159852bcea8d9de167502f/artists?search=photography
GET /api/categories/69159852bcea8d9de167502f/artists?search=portrait
```

---

## Public Artist Endpoints

### 11. Search All Artists (Public)
**URL:** `GET /api/artists?search={search_term}`

**Search Fields:**
- `name`
- `bio`
- `skills` (array)

**Example:**
```
GET /api/artists?search=photography
GET /api/artists?search=wedding%20photographer
GET /api/artists?search=portrait
```

---

## Quick Reference - All Search URLs

| # | Endpoint | URL Pattern | Search Fields |
|---|----------|-------------|---------------|
| 1 | Customer Bookings | `/api/customer/bookings?search={term}` | location, specialRequests |
| 2 | Customer Reviews | `/api/customer/reviews?search={term}` | comment |
| 3 | Artist Bookings | `/api/artist/bookings?search={term}` | location, specialRequests |
| 4 | Artist Reviews | `/api/artist/reviews?search={term}` | comment |
| 5 | Admin Users | `/api/admin/users?role={role}&search={term}` | name, email, bio, skills |
| 6 | Admin Bookings | `/api/admin/bookings?search={term}` | location, specialRequests |
| 7 | Payments | `/api/payments?search={term}` | transactionId |
| 8 | Reviews by Artist | `/api/reviews/artist/{id}?search={term}` | comment |
| 9 | Categories | `/api/categories?search={term}` | name, description |
| 10 | Artists by Category | `/api/categories/{id}/artists?search={term}` | name, bio, skills |
| 11 | Public Artists | `/api/artists?search={term}` | name, bio, skills |

---

## Search Behavior

- **Case-Insensitive:** All searches are case-insensitive
- **Partial Matching:** Searches match partial text (not exact match)
- **Multiple Fields:** When multiple fields are searched, it uses OR logic (matches any field)
- **URL Encoding:** Use URL encoding for special characters (e.g., `%20` for space)

---

## Example URLs with Full Paths

### Local Development
```
http://localhost:8000/api/customer/bookings?search=wedding
http://localhost:8000/api/artists?search=photography
http://localhost:8000/api/admin/users?role=artist&search=john
```

### Production
```
https://yourdomain.com/api/customer/bookings?search=wedding
https://yourdomain.com/api/artists?search=photography
https://yourdomain.com/api/admin/users?role=artist&search=john
```

---

## Search Examples

### Example 1: Search for "wedding" in customer bookings
```
GET /api/customer/bookings?search=wedding
```
**Matches:** Bookings with "wedding" in location or specialRequests

### Example 2: Search for "photography" in artists
```
GET /api/artists?search=photography
```
**Matches:** Artists with "photography" in name, bio, or skills

### Example 3: Search for "excellent" in reviews
```
GET /api/customer/reviews?search=excellent
```
**Matches:** Reviews with "excellent" in comment

### Example 4: Search for artist by name
```
GET /api/admin/users?role=artist&search=john
```
**Matches:** Artists with "john" in name, email, bio, or skills

### Example 5: Search categories
```
GET /api/categories?search=music
```
**Matches:** Categories with "music" in name or description

---

## Notes

- All search parameters are optional
- Search works with other filters (you can combine search with status, date, etc.)
- Search uses MongoDB regex with case-insensitive option (`$regex` with `$options: "i"`)
- For array fields (like `skills`), search uses `$in` operator with regex
- Empty search parameter returns all results (no filtering)

---

**Total Search Endpoints:** 11  
**Last Updated:** 2024


