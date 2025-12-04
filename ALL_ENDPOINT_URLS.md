# All API Endpoint URLs

## Base URL

- **Local:** `http://localhost:3000`
- **Vercel:** `https://your-vercel-app.vercel.app`

---

## 🔐 Authentication Endpoints (`/api/auth`)

### Public Routes

1. **Register Customer**

   - `POST /api/auth/register/customer`
   - Body: `{ "email": "string", "password": "string", "name": "string" }`

2. **Register Artist**

   - `POST /api/auth/register/artist`
   - Body: `{ "email": "string", "password": "string", "name": "string", "bio": "string", "category": "string", "skills": ["string"], "hourlyRate": number }`

3. **Login**
   - `POST /api/auth/login`
   - Body: `{ "email": "string", "password": "string" }`

### Protected Routes (Requires Authentication)

4. **Get Current User**

   - `GET /api/auth/me`
   - Headers: `Authorization: Bearer <token>`

5. **Logout**
   - `POST /api/auth/logout`
   - Headers: `Authorization: Bearer <token>`

---

## 👥 Admin Endpoints (`/api/admin`)

**All routes require:** `Authorization: Bearer <token>` + Admin role

6. **Get Users by Role**

   - `GET /api/admin/users?role=customer|artist|admin`

7. **Get User by ID**

   - `GET /api/admin/users/:role/:userId`

8. **Get Pending Artists**

   - `GET /api/admin/pending/artists`

9. **Get All Bookings**

   - `GET /api/admin/bookings`

10. **Get Dashboard Status**
    - `GET /api/admin/dashboard/status`

---

## 🎨 Artist Endpoints (`/api/artists`)

### Public Routes (No Authentication Required)

11. **Get All Approved Artists**

    - `GET /api/artists`
    - Query params: `?page=1&limit=10&search=string&category=id&minRating=number&maxRating=number&sortBy=rating&sortOrder=desc`

12. **Get Artist by ID**
    - `GET /api/artists/:id`

### Protected Routes - Artist Only

13. **Get Artist Profile**

    - `GET /api/artists/profile`
    - Requires: Artist role

14. **Update Artist Profile**

    - `PUT /api/artists/profile`
    - Requires: Artist role
    - Body: `{ "name": "string", "bio": "string", "category": "string", "skills": ["string"], "hourlyRate": number, "availability": {}, "profileImage": "string" }`

15. **Get Artist Bookings**

    - `GET /api/artists/bookings`
    - Requires: Artist role
    - Query params: `?status=pending&customer=id&page=1&limit=10`

16. **Accept Booking**

    - `PUT /api/artists/bookings/:bookingId/accept`
    - Requires: Artist role

17. **Reject Booking**

    - `PUT /api/artists/bookings/:bookingId/reject`
    - Requires: Artist role

18. **Get Artist Reviews**
    - `GET /api/artists/reviews`
    - Requires: Artist role

### Protected Routes - Admin Only

19. **Get Pending Artists**

    - `GET /api/artists/pending`
    - Requires: Admin role

20. **Approve Artist**

    - `PUT /api/artists/:id/approve`
    - Requires: Admin role

21. **Reject Artist**
    - `PUT /api/artists/:id/reject`
    - Requires: Admin role
    - Body (optional): `{ "reason": "string" }`

---

## 👤 Customer Endpoints (`/api/customers`)

**All routes require:** `Authorization: Bearer <token>` + Customer role

22. **Get Customer Profile**

    - `GET /api/customers/profile`

23. **Update Customer Profile**

    - `PUT /api/customers/profile`
    - Body: `{ "name": "string", "address": { "street": "string", "city": "string", "state": "string", "zipCode": "string", "country": "string" }, "profileImage": "string" }`

24. **Get Customer Bookings**

    - `GET /api/customers/bookings`
    - Query params: `?status=pending&artist=id&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&page=1&limit=10`

25. **Get Customer Reviews**
    - `GET /api/customers/reviews`

---

## 📅 Booking Endpoints (`/api/bookings`)

**All routes require:** `Authorization: Bearer <token>`

26. **Create Booking**

    - `POST /api/bookings`
    - Requires: Customer role
    - Body: `{ "artist": "artistId", "bookingDate": "ISO date", "startTime": "HH:mm", "endTime": "HH:mm", "location": "string", "specialRequests": "string" }`

27. **Get Booking by ID**

    - `GET /api/bookings/:bookingId`
    - Requires: Customer, Artist, or Admin role

28. **Cancel Booking**

    - `PUT /api/bookings/:bookingId/cancel`
    - Requires: Customer role

29. **Complete Booking**
    - `PUT /api/bookings/:bookingId/complete`
    - Requires: Artist role

---

## 📂 Category Endpoints (`/api/categories`)

### Public Routes (No Authentication Required)

30. **Get All Categories**

    - `GET /api/categories`

31. **Get Category by ID**

    - `GET /api/categories/:categoryId`

32. **Get Artists by Category**
    - `GET /api/categories/:categoryId/artists`
    - Query params: `?page=1&limit=10&sortBy=rating`

### Protected Routes - Admin Only

33. **Create Category**

    - `POST /api/categories`
    - Requires: Admin role
    - Body: `{ "name": "string", "description": "string", "image": "string" }`

34. **Update Category**

    - `PUT /api/categories/:categoryId`
    - Requires: Admin role
    - Body: `{ "name": "string", "description": "string", "image": "string" }`

35. **Delete Category**
    - `DELETE /api/categories/:categoryId`
    - Requires: Admin role

---

## 💳 Payment Endpoints (`/api/payments`)

**All routes require:** `Authorization: Bearer <token>`

36. **Create Payment**

    - `POST /api/payments`
    - Requires: Customer role
    - Body: `{ "booking": "bookingId", "amount": number, "paymentMethod": "string" }`

37. **Get Payments**

    - `GET /api/payments`
    - Requires: Customer, Artist, or Admin role
    - Query params: `?status=pending&booking=id&page=1&limit=10`

38. **Get Payment by ID**

    - `GET /api/payments/:paymentId`
    - Requires: Customer, Artist, or Admin role

39. **Refund Payment**
    - `POST /api/payments/:paymentId/refund`
    - Requires: Admin role

---

## ⭐ Review Endpoints (`/api/reviews`)

### Public Routes (No Authentication Required)

40. **Get Reviews by Artist**

    - `GET /api/reviews/artist/:artistId`
    - Query params: `?page=1&limit=10&sortBy=createdAt&sortOrder=desc`

41. **Get Review by ID**
    - `GET /api/reviews/:reviewId`

### Protected Routes

42. **Create Review**

    - `POST /api/reviews`
    - Requires: Customer role
    - Body: `{ "artist": "artistId", "booking": "bookingId", "rating": number (1-5), "comment": "string" }`

43. **Update Review**

    - `PUT /api/reviews/:reviewId`
    - Requires: Customer role (own review)
    - Body: `{ "rating": number, "comment": "string" }`

44. **Delete Review**
    - `DELETE /api/reviews/:reviewId`
    - Requires: Customer role (own review) or Admin role

---

## 🔔 Notification Endpoints (`/api/notifications`)

**All routes require:** `Authorization: Bearer <token>` + Authenticated user

45. **Get Notifications**

    - `GET /api/notifications`
    - Query params: `?read=true|false&page=1&limit=10`

46. **Mark Notification as Read**

    - `PUT /api/notifications/:notificationId/read`

47. **Mark All Notifications as Read**

    - `PUT /api/notifications/read-all`

48. **Delete Notification**
    - `DELETE /api/notifications/:notificationId`

---

## 🏥 Health Check

49. **Health Check**
    - `GET /health`
    - No authentication required

---

## Summary by Entity

### Authentication (5 endpoints)

- `/api/auth/register/customer` (POST)
- `/api/auth/register/artist` (POST)
- `/api/auth/login` (POST)
- `/api/auth/me` (GET)
- `/api/auth/logout` (POST)

### Admin (5 endpoints)

- `/api/admin/users` (GET)
- `/api/admin/users/:role/:userId` (GET)
- `/api/admin/pending/artists` (GET)
- `/api/admin/bookings` (GET)
- `/api/admin/dashboard/status` (GET)

### Artists (11 endpoints)

- `/api/artists` (GET) - Public
- `/api/artists/:id` (GET) - Public
- `/api/artists/profile` (GET, PUT) - Artist only
- `/api/artists/bookings` (GET) - Artist only
- `/api/artists/bookings/:bookingId/accept` (PUT) - Artist only
- `/api/artists/bookings/:bookingId/reject` (PUT) - Artist only
- `/api/artists/reviews` (GET) - Artist only
- `/api/artists/pending` (GET) - Admin only
- `/api/artists/:id/approve` (put) - Admin only
- `/api/artists/:id/reject` (put) - Admin only

### Customers (4 endpoints)

- `/api/customers/profile` (GET, PUT)
- `/api/customers/bookings` (GET)
- `/api/customers/reviews` (GET)

### Bookings (4 endpoints)

- `/api/bookings` (POST) - Customer only
- `/api/bookings/:bookingId` (GET)
- `/api/bookings/:bookingId/cancel` (PUT) - Customer only
- `/api/bookings/:bookingId/complete` (PUT) - Artist only

### Categories (6 endpoints)

- `/api/categories` (GET) - Public
- `/api/categories/:categoryId` (GET) - Public
- `/api/categories/:categoryId/artists` (GET) - Public
- `/api/categories` (POST) - Admin only
- `/api/categories/:categoryId` (PUT) - Admin only
- `/api/categories/:categoryId` (DELETE) - Admin only

### Payments (4 endpoints)

- `/api/payments` (POST, GET)
- `/api/payments/:paymentId` (GET)
- `/api/payments/:paymentId/refund` (POST) - Admin only

### Reviews (5 endpoints)

- `/api/reviews/artist/:artistId` (GET) - Public
- `/api/reviews/:reviewId` (GET) - Public
- `/api/reviews` (POST) - Customer only
- `/api/reviews/:reviewId` (PUT) - Customer only
- `/api/reviews/:reviewId` (DELETE) - Customer/Admin

### Notifications (4 endpoints)

- `/api/notifications` (GET)
- `/api/notifications/:notificationId/read` (PUT)
- `/api/notifications/read-all` (PUT)
- `/api/notifications/:notificationId` (DELETE)

### Health Check (1 endpoint)

- `/health` (GET)

---

## Total: 49 Endpoints

**Breakdown:**

- Public endpoints: 8
- Customer endpoints: 4
- Artist endpoints: 11
- Admin endpoints: 5
- Booking endpoints: 4
- Category endpoints: 6
- Payment endpoints: 4
- Review endpoints: 5
- Notification endpoints: 4
- Health check: 1

---

## Authentication

All protected endpoints require:

```
Authorization: Bearer <JWT_TOKEN>
```

**Token obtained from:**

- `POST /api/auth/login`
- `POST /api/auth/register/customer` (returns token immediately)
- `POST /api/auth/register/artist` (no token until approved by admin)

---

## Example Usage

### Register Customer

```bash
curl -X POST http://localhost:3000/api/auth/register/customer \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "password": "password123"
  }'
```

### Get Profile (Authenticated)

```bash
curl -X GET http://localhost:3000/api/customers/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
