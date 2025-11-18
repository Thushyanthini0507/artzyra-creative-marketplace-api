# Artzyra API

A comprehensive RESTful API for an artist booking platform that connects customers with professional artists for various services including photography, live music, event planning, and more.

## 🚀 Features

- **User Management**
  - Customer registration and login (auto-approved)
  - Artist registration (requires admin approval)
  - Admin account management
  - Role-based access control (Customer, Artist, Admin)

- **Artist Services**
  - Browse approved artists
  - Search artists by name, bio, skills
  - Filter by category
  - View artist profiles, ratings, and reviews
  - Artist availability management

- **Booking System**
  - Create bookings with date/time selection
  - Automatic conflict detection
  - Booking status management (pending, accepted, rejected, completed, cancelled)
  - Amount calculation based on hourly rates

- **Payment Processing**
  - Payment creation and tracking
  - Payment status management
  - Refund processing (admin only)

- **Reviews & Ratings**
  - Leave reviews for completed bookings
  - Rating system (1-5 stars)
  - Automatic artist rating calculation

- **Categories**
  - Service category management
  - Category-based artist filtering

- **Notifications**
  - Real-time notifications for bookings, payments, reviews
  - Notification management

- **Advanced Features**
  - Pagination and filtering on all list endpoints
  - Search functionality
  - Date range filtering
  - Amount range filtering
  - Sorting capabilities
  - Rate limiting
  - JWT authentication
  - Error handling middleware

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js 5.1.0
- **Database:** MongoDB with Mongoose 8.19.1
- **Authentication:** JWT (jsonwebtoken)
- **Security:** bcryptjs for password hashing
- **Validation:** express-validator
- **Rate Limiting:** express-rate-limit
- **CORS:** Enabled for cross-origin requests

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance like MongoDB Atlas)
- npm or yarn

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd artzyra-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   Edit `.env` file with your configuration:
   ```env
   PORT=8000
   MONGO_URI=mongodb://localhost:27017/artzyra
   JWT_SECRET=your-secret-key-here
   JWT_EXPIRE=30d
   NODE_ENV=development
   ```

5. **Seed the database (optional)**
   ```bash
   npm run seed
   ```
   This will create:
   - Default admin account (email: `admin12@gmail.com`, password: `admin123`)
   - Sample categories
   - Sample customers and artists

6. **Start the server**
   ```bash
   # Development mode (with nodemon)
   npm run dev

   # Production mode
   npm start
   ```

The server will start on `http://localhost:8000` (or the port specified in your `.env` file).

## 📚 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/users/register` | Register new user | No |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/logout` | Logout user | Yes |

### Artists (Public)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/artists` | Get all approved artists | No |
| GET | `/api/artists/:id` | Get artist by ID | No |

### Bookings

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/api/bookings` | Create booking | Yes | Customer |
| GET | `/api/bookings/:id` | Get booking by ID | Yes | Customer/Artist/Admin |
| PUT | `/api/bookings/:id/cancel` | Cancel booking | Yes | Customer |
| PUT | `/api/bookings/:id/complete` | Complete booking | Yes | Artist |

### Customer

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/customer/profile` | Get customer profile | Yes |
| PUT | `/api/customer/profile` | Update customer profile | Yes |
| GET | `/api/customer/bookings` | Get customer bookings | Yes |
| GET | `/api/customer/reviews` | Get customer reviews | Yes |

### Artist (Authenticated)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/artist/profile` | Get artist profile | Yes |
| PUT | `/api/artist/profile` | Update artist profile | Yes |
| GET | `/api/artist/bookings` | Get artist bookings | Yes |
| PUT | `/api/artist/bookings/:id/accept` | Accept booking | Yes |
| PUT | `/api/artist/bookings/:id/reject` | Reject booking | Yes |
| GET | `/api/artist/reviews` | Get artist reviews | Yes |
| GET | `/api/artist/availability` | Check availability | Yes |

### Admin

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| PUT | `/api/admin/users/approve` | Approve/reject user | Yes |
| GET | `/api/admin/users` | Get users by role | Yes |
| GET | `/api/admin/users/:role/:userId` | Get user by ID | Yes |
| GET | `/api/admin/bookings` | Get all bookings | Yes |
| GET | `/api/admin/dashboard/stats` | Get dashboard statistics | Yes |

### Categories

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/categories` | Get all categories | No |
| GET | `/api/categories/:id` | Get category by ID | No |
| POST | `/api/categories` | Create category | Yes (Admin) |
| PUT | `/api/categories/:id` | Update category | Yes (Admin) |
| DELETE | `/api/categories/:id` | Delete category | Yes (Admin) |

### Payments

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/payments` | Create payment | Yes |
| GET | `/api/payments` | Get payments | Yes |
| GET | `/api/payments/:id` | Get payment by ID | Yes |
| POST | `/api/payments/:id/refund` | Refund payment | Yes (Admin) |

### Reviews

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/reviews` | Create review | Yes |
| GET | `/api/reviews/artist/:artistId` | Get reviews by artist | No |
| GET | `/api/reviews/:id` | Get review by ID | No |
| PUT | `/api/reviews/:id` | Update review | Yes |
| DELETE | `/api/reviews/:id` | Delete review | Yes |

### Notifications

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/notifications` | Get notifications | Yes |
| PUT | `/api/notifications/:id/read` | Mark as read | Yes |
| PUT | `/api/notifications/read-all` | Mark all as read | Yes |
| DELETE | `/api/notifications/:id` | Delete notification | Yes |

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Default Admin Credentials

After running the seed script:
- **Email:** `admin12@gmail.com`
- **Password:** `admin123`

## 📝 Usage Examples

### Register a Customer

```bash
POST http://localhost:8000/api/users/register
Content-Type: application/json

{
  "role": "customer",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  }
}
```

### Login

```bash
POST http://localhost:8000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123",
  "role": "customer"
}
```

### Create a Booking

```bash
POST http://localhost:8000/api/bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "artistId": "691aa51d3e6a1cca987f9223",
  "categoryId": "69159852bcea8d9de167502f",
  "bookingDate": "2024-12-25",
  "startTime": "10:00",
  "endTime": "14:00",
  "location": "123 Event Venue",
  "specialRequests": "Outdoor ceremony"
}
```

### Search Artists

```bash
GET http://localhost:8000/api/artists?search=photography&category=69159852bcea8d9de167502f&page=1&limit=10
```

### Filter Bookings

```bash
GET http://localhost:8000/api/customer/bookings?status=pending&startDate=2024-01-01&endDate=2024-12-31&page=1&limit=10
```

## 🔍 Filtering & Search

Most list endpoints support filtering, search, and pagination:

### Common Query Parameters

- `search` - Text search (case-insensitive)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `sortBy` - Field to sort by
- `sortOrder` - `asc` or `desc` (default: `desc`)
- `startDate` - Filter from date (ISO format)
- `endDate` - Filter to date (ISO format)
- `minAmount` - Minimum amount filter
- `maxAmount` - Maximum amount filter

### Example: Advanced Filtering

```bash
GET /api/admin/users?role=artist&search=photography&isApproved=true&minRating=4&category=69159852bcea8d9de167502f&page=1&limit=20&sortBy=rating&sortOrder=desc
```

## 📁 Project Structure

```
artzyra-api/
├── src/
│   ├── app.js                 # Main application file
│   ├── config/
│   │   ├── db.js             # Database connection
│   │   └── jwt.js            # JWT configuration
│   ├── controllers/          # Route controllers
│   │   ├── adminController.js
│   │   ├── artistController.js
│   │   ├── authController.js
│   │   ├── bookingController.js
│   │   ├── categoryController.js
│   │   ├── customerController.js
│   │   ├── paymentController.js
│   │   ├── reviewController.js
│   │   └── userController.js
│   ├── middleware/          # Custom middleware
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   ├── rateLimiter.js
│   │   └── roleMiddleware.js
│   ├── models/              # Mongoose models
│   │   ├── Admin.js
│   │   ├── Artist.js
│   │   ├── Booking.js
│   │   ├── Category.js
│   │   ├── Customer.js
│   │   ├── Notification.js
│   │   ├── Payment.js
│   │   └── Review.js
│   ├── routes/              # Route definitions
│   │   ├── adminRoutes.js
│   │   ├── artistRoutes.js
│   │   ├── authRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── customerRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── reviewRoutes.js
│   │   └── userRoutes.js
│   ├── seeds/               # Database seeds
│   │   └── adminSeed.js
│   └── utils/               # Utility functions
│       ├── errors.js
│       ├── helpers.js
│       ├── paginate.js
│       ├── emailService.js
│       └── paymentService.js
├── .env                     # Environment variables
├── package.json
└── README.md
```

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Rate limiting on API endpoints
- Input validation
- CORS configuration
- Error handling middleware

## 🧪 Testing

### Health Check

```bash
GET http://localhost:8000/health
```

### Test with cURL

```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin12@gmail.com","password":"admin123","role":"admin"}'

# Get artists
curl http://localhost:8000/api/artists

# Create booking (with token)
curl -X POST http://localhost:8000/api/bookings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"artistId":"...","categoryId":"...","bookingDate":"2024-12-25","startTime":"10:00","endTime":"14:00"}'
```

## 🚦 Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message here"
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [...],
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

## 📋 Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=8000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/artzyra
# Or for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/artzyra

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=30d

# Email Configuration (if using email service)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## 🎯 Key Features Explained

### Customer Auto-Approval
- Customers are automatically approved upon registration
- No admin approval required for customer accounts
- Customers can immediately access the platform

### Artist Approval
- Artists require admin approval before they can be booked
- Admin can approve/reject artist accounts via `/api/admin/users/approve`

### Booking System
- Automatic conflict detection
- Amount calculation based on hourly rate and duration
- Status workflow: pending → accepted/rejected → completed/cancelled

### Search & Filtering
- Case-insensitive search across multiple fields
- Date range filtering
- Amount range filtering
- Pagination on all list endpoints
- Sorting capabilities

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check `MONGO_URI` in `.env` file
- Verify network connectivity

### Authentication Errors
- Verify JWT token is included in Authorization header
- Check token expiration
- Ensure user role matches endpoint requirements

### Port Already in Use
- Change `PORT` in `.env` file
- Or kill the process using the port:
  ```bash
  # Linux/Mac
  lsof -ti:8000 | xargs kill
  
  # Windows
  netstat -ano | findstr :8000
  taskkill /PID <PID> /F
  ```

## 📝 Scripts

```bash
# Start development server (with nodemon)
npm run dev

# Start production server
npm start

# Seed database
npm run seed
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Express.js community
- MongoDB documentation
- All contributors

## 📞 Support

For support, email your-email@example.com or open an issue in the repository.

---

**Made with ❤️ for connecting artists and customers**


