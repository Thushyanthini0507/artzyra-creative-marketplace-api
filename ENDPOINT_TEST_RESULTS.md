# Endpoint Test Results

## Server Configuration

- **Port:** 3000 (from .env file)
- **Base URL:** `http://localhost:3000`
- **API Base:** `http://localhost:3000/api`

## Port Configuration

The server uses:
- `PORT` from `.env` file (currently: 3000)
- Falls back to `3000` if not set
- Default in code: `process.env.PORT || 3000`

**Note:** If you want to use port 8000, update your `.env` file:
```env
PORT=8000
```

---

## All Available Endpoints

### 🔐 Authentication (`/api/auth`)

| Method | Endpoint | Status | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register/customer` | ✅ | Register customer |
| POST | `/api/auth/register/artist` | ✅ | Register artist |
| POST | `/api/auth/login` | ✅ | Login user |
| GET | `/api/auth/me` | ✅ | Get current user (auth required) |
| POST | `/api/auth/logout` | ✅ | Logout (auth required) |

### 📁 Categories (`/api/categories`)

| Method | Endpoint | Status | Description |
|--------|----------|--------|-------------|
| GET | `/api/categories` | ✅ | Get all categories |
| GET | `/api/categories/:categoryId` | ✅ | Get category by ID |
| GET | `/api/categories/:categoryId/artists` | ✅ | Get artists by category |
| POST | `/api/categories` | ✅ | Create category (admin) |
| PUT | `/api/categories/:categoryId` | ✅ | Update category (admin) |
| DELETE | `/api/categories/:categoryId` | ✅ | Delete category (admin) |

### 🎨 Artists (`/api/artists`)

| Method | Endpoint | Status | Description |
|--------|----------|--------|-------------|
| GET | `/api/artists` | ✅ | Get all approved artists (public) |
| GET | `/api/artists/:id` | ✅ | Get artist by ID (public) |
| GET | `/api/artists/pending` | ✅ | Get pending artists (admin) |
| PATCH | `/api/artists/:id/approve` | ✅ | Approve artist (admin) |
| PATCH | `/api/artists/:id/reject` | ✅ | Reject artist (admin) |
| GET | `/api/artists/profile` | ✅ | Get artist profile (artist) |
| PUT | `/api/artists/profile` | ✅ | Update artist profile (artist) |
| GET | `/api/artists/bookings` | ✅ | Get artist bookings (artist) |
| PUT | `/api/artists/bookings/:bookingId/accept` | ✅ | Accept booking (artist) |
| PUT | `/api/artists/bookings/:bookingId/reject` | ✅ | Reject booking (artist) |
| GET | `/api/artists/reviews` | ✅ | Get artist reviews (artist) |

### 👥 Customers (`/api/customers`)

| Method | Endpoint | Status | Description |
|--------|----------|--------|-------------|
| GET | `/api/customers/profile` | ✅ | Get customer profile (customer) |
| PUT | `/api/customers/profile` | ✅ | Update customer profile (customer) |
| GET | `/api/customers/bookings` | ✅ | Get customer bookings (customer) |
| GET | `/api/customers/reviews` | ✅ | Get customer reviews (customer) |

### 📅 Bookings (`/api/bookings`)

| Method | Endpoint | Status | Description |
|--------|----------|--------|-------------|
| POST | `/api/bookings` | ✅ | Create booking (customer) |
| GET | `/api/bookings/:bookingId` | ✅ | Get booking by ID |
| PUT | `/api/bookings/:bookingId/cancel` | ✅ | Cancel booking (customer) |
| PUT | `/api/bookings/:bookingId/complete` | ✅ | Complete booking (artist) |

### 💳 Payments (`/api/payments`)

| Method | Endpoint | Status | Description |
|--------|----------|--------|-------------|
| POST | `/api/payments` | ✅ | Create payment (customer) |
| GET | `/api/payments` | ✅ | Get payments |
| GET | `/api/payments/:paymentId` | ✅ | Get payment by ID |
| POST | `/api/payments/:paymentId/refund` | ✅ | Refund payment (admin) |

### ⭐ Reviews (`/api/reviews`)

| Method | Endpoint | Status | Description |
|--------|----------|--------|-------------|
| GET | `/api/reviews/artist/:artistId` | ✅ | Get reviews by artist (public) |
| GET | `/api/reviews/:reviewId` | ✅ | Get review by ID (public) |
| POST | `/api/reviews` | ✅ | Create review (customer) |
| PUT | `/api/reviews/:reviewId` | ✅ | Update review (customer) |
| DELETE | `/api/reviews/:reviewId` | ✅ | Delete review (customer/admin) |

### 🔔 Notifications (`/api/notifications`)

| Method | Endpoint | Status | Description |
|--------|----------|--------|-------------|
| GET | `/api/notifications` | ✅ | Get notifications |
| PUT | `/api/notifications/:notificationId/read` | ✅ | Mark as read |
| PUT | `/api/notifications/read-all` | ✅ | Mark all as read |
| DELETE | `/api/notifications/:notificationId` | ✅ | Delete notification |

### 👨‍💼 Admin (`/api/admin`)

| Method | Endpoint | Status | Description |
|--------|----------|--------|-------------|
| GET | `/api/admin/users` | ✅ | Get users by role |
| GET | `/api/admin/users/:role/:userId` | ✅ | Get user by ID |
| GET | `/api/admin/bookings` | ✅ | Get all bookings |
| GET | `/api/admin/dashboard/status` | ✅ | Get dashboard stats |

### 🏥 Health Check

| Method | Endpoint | Status | Description |
|--------|----------|--------|-------------|
| GET | `/health` | ✅ | Server health check |

---

## Quick Test Commands

### Test Health
```bash
curl http://localhost:3000/health
```

### Test Categories (Public)
```bash
curl http://localhost:3000/api/categories
```

### Test Artists (Public)
```bash
curl http://localhost:3000/api/artists
```

### Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer1@example.com","password":"customer123"}'
```

### Test with Authentication
```bash
# First login to get token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer1@example.com","password":"customer123"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['token'])")

# Use token for authenticated requests
curl http://localhost:3000/api/customers/profile \
  -H "Authorization: Bearer $TOKEN"
```

---

## Port Configuration

**Current Setup:**
- `.env` file has: `PORT=3000`
- Server runs on: `http://localhost:3000`
- API base: `http://localhost:3000/api`

**To Change Port:**
1. Update `.env` file: `PORT=8000`
2. Restart server
3. Access at: `http://localhost:8000`

---

## Code Status

✅ **All routes properly configured**
✅ **All controllers updated for new architecture**
✅ **All models using correct field names**
✅ **No linter errors**
✅ **Server running successfully**

