# Customer Instant Access - Complete Backend Documentation

## Overview

This system implements **instant access for Customers** while requiring **admin approval for all other roles** (Artists, Category Users, etc.). Customers can register and immediately log in without waiting for approval, while Artists and other service providers must wait for admin approval before gaining access.

---

## Database Structure

### 1. Users Collection (Central)
**Purpose:** Central repository for all authenticated users

```javascript
{
  _id: ObjectId,
  name: String (required, min: 2),
  email: String (required, unique, lowercase),
  phone: String,
  password: String (required, min: 6, hashed),
  role: String (required, enum: ["customer", "artist", "admin", "category"]),
  category: ObjectId (ref: Category, for artists/category users),
  profileRef: ObjectId (ref to role-specific profile),
  profileType: String (enum: ["Customer", "Artist", "Admin", "CategoryUser"]),
  isApproved: Boolean (default: false),
    // Customers: auto-set to true
    // Others: requires admin approval
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Customer Collection (Profile)
**Purpose:** Customer-specific profile data

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required, unique),
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  profileImage: String (default: ""),
  isApproved: Boolean (default: true),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### 3. PendingArtist Collection
**Purpose:** Stores artist registrations awaiting approval

```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique, lowercase),
  phone: String,
  password: String (required, hashed),
  bio: String,
  profileImage: String,
  category: ObjectId (ref: Category, required),
  skills: [String],
  hourlyRate: Number (default: 0),
  availability: Map,
  status: String (enum: ["pending", "approved", "rejected"], default: "pending"),
  createdAt: Date,
  updatedAt: Date
}
```

### 4. Artist Collection (Profile)
**Purpose:** Artist-specific profile data (created after approval)

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required, unique),
  bio: String,
  profileImage: String,
  category: ObjectId (ref: Category),
  skills: [String],
  hourlyRate: Number,
  availability: Map,
  rating: Number (default: 0, min: 0, max: 5),
  totalReviews: Number (default: 0),
  isApproved: Boolean (default: false),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Flow & Endpoints

### 1. Customer Registration (Instant Access)

**Endpoint:** `POST /api/users/register`

**Request Body:**
```json
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
  },
  "profileImage": "https://example.com/image.jpg"
}
```

**Validation:**
- ✅ Email format validation
- ✅ Password minimum 6 characters
- ✅ Name minimum 2 characters
- ✅ Email uniqueness check

**Flow:**
1. Validate input data
2. Check if email exists in Users collection
3. Create User in Users collection with `isApproved: true`
4. Create Customer profile
5. Link User to Customer profile
6. Generate JWT token
7. Return token for immediate access

**Success Response (201):**
```json
{
  "success": true,
  "message": "Customer registered successfully. You can now log in.",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer",
      "isApproved": true,
      "profileId": "customer_profile_id"
    },
    "token": "jwt_token_here",
    "redirectPath": "/customer/dashboard"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid input, validation failed
- `409 Conflict`: Email already exists

---

### 2. Customer Login (Instant Access)

**Endpoint:** `POST /api/users/login` or `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123",
  "role": "customer" // Optional, validates if provided
}
```

**Validation:**
- ✅ Email format validation
- ✅ Password required
- ✅ User exists in Users collection
- ✅ Password matches
- ✅ User is active

**Flow:**
1. Validate email format
2. Find user in Users collection
3. Compare password
4. Check if user is active
5. Fetch customer profile
6. Generate JWT token
7. Return user data with token

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "role": "customer",
      "isApproved": true,
      "isActive": true,
      "category": null
    },
    "profile": {
      "address": {...},
      "profileImage": "..."
    },
    "token": "jwt_token_here",
    "redirectPath": "/customer/dashboard"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid email format or missing fields
- `401 Unauthorized`: Invalid email or password
- `401 Unauthorized`: Account deactivated

---

### 3. Artist Registration (Requires Approval)

**Endpoint:** `POST /api/users/register`

**Request Body:**
```json
{
  "role": "artist",
  "name": "Jane Artist",
  "email": "jane@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "bio": "Professional photographer",
  "category": "category_id_or_name",
  "skills": ["Photography", "Photo Editing"],
  "hourlyRate": 150,
  "availability": {},
  "profileImage": "https://example.com/image.jpg"
}
```

**Flow:**
1. Validate input data
2. Validate category exists
3. Check if email exists in Users or PendingArtist
4. Create entry in PendingArtist table
5. Return pending status

**Success Response (201):**
```json
{
  "success": true,
  "message": "Artist registration submitted successfully. Please wait for admin approval.",
  "data": {
    "pendingId": "pending_artist_id",
    "name": "Jane Artist",
    "email": "jane@example.com",
    "status": "pending"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid input or category not found
- `409 Conflict`: Email already exists or pending

---

### 4. Artist Login (After Approval)

**Endpoint:** `POST /api/users/login` or `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "jane@example.com",
  "password": "password123",
  "role": "artist"
}
```

**Flow:**
1. Check Users collection
2. If not found, check PendingArtist (returns pending message)
3. If found in Users, validate password
4. Check `isApproved` status
5. Return user data with token

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {...},
    "profile": {...},
    "token": "jwt_token_here",
    "redirectPath": "/artist/dashboard"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Account pending approval
- `401 Unauthorized`: Invalid email or password

---

### 5. Admin Approval (Artists Only)

**Endpoint:** `PUT /api/admin/users/approve`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "pendingId": "pending_artist_id",
  "role": "artist",
  "isApproved": true
}
```

**Flow:**
1. Validate pendingId and role
2. Find pending artist
3. If approved:
   - Create User in Users collection
   - Create Artist profile
   - Link User to Artist profile
   - Delete from PendingArtist
   - Send approval email
   - Create notification
4. If rejected:
   - Update status to "rejected"
   - Send rejection email

**Success Response (200):**
```json
{
  "success": true,
  "message": "Artist approved successfully",
  "data": {
    "user": {
      "id": "user_id",
      "name": "Jane Artist",
      "email": "jane@example.com",
      "isApproved": true,
      "profileId": "artist_profile_id"
    }
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid role (customers don't need approval)
- `404 Not Found`: Pending artist not found
- `409 Conflict`: User already exists

---

### 6. Get Pending Artists

**Endpoint:** `GET /api/admin/pending/artists`

**Query Parameters:**
- `search`: Search by name, email, bio, skills
- `status`: Filter by status (pending, approved, rejected)
- `category`: Filter by category ID
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `sortBy`: Sort field (default: "createdAt")
- `sortOrder`: Sort order (asc/desc, default: "desc")

**Response:**
```json
{
  "success": true,
  "data": [...],
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

## Authentication Flow

### Customer Flow (Instant Access)

```
Registration → Users Table → Customer Profile → JWT Token → Immediate Access
     ↓              ↓              ↓              ↓              ↓
  Validate    Create User    Create Profile  Generate    Login Ready
  Input       (isApproved:   (isApproved:    Token
              true)          true)
```

### Artist Flow (Approval Required)

```
Registration → PendingArtist Table → Admin Approval → Users Table → Artist Profile → JWT Token → Access
     ↓              ↓                    ↓              ↓              ↓              ↓          ↓
  Validate    Create Pending    Admin Reviews    Create User    Create Profile  Generate    Login Ready
  Input       Entry             & Approves       (isApproved:   (isApproved:    Token
                                    ↓            true)          true)
                              Email Sent
```

---

## Security Features

### 1. Password Hashing
- All passwords are hashed using `bcryptjs` with salt rounds of 10
- Pre-save hooks automatically hash passwords before saving
- Passwords are never returned in API responses

### 2. Email Validation
- Email format validation using regex
- Email normalization (lowercase, trimmed)
- Unique email constraint in database

### 3. JWT Token Security
- Tokens include user ID and role
- Tokens are stateless and verified on each request
- Token expiration handled by JWT configuration

### 4. Role-Based Access Control
- Middleware verifies user role before allowing access
- Customers can only access customer routes
- Artists can only access artist routes
- Admins have full access

### 5. Input Validation
- Email format validation
- Password strength (minimum 6 characters)
- Name length validation (minimum 2 characters)
- Required field validation

---

## Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "message": "Error message here"
}
```

### Common Error Codes
- `400 Bad Request`: Invalid input, validation failed
- `401 Unauthorized`: Invalid credentials, account pending, or account deactivated
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Email already exists or duplicate entry

---

## Role-Based Redirection

After successful login/registration, the API returns a `redirectPath`:

- **Customer**: `/customer/dashboard`
- **Artist**: `/artist/dashboard`
- **Admin**: `/admin/dashboard`
- **Category User**: `/category/dashboard`

Frontend should use this path to redirect users to their appropriate dashboard.

---

## Key Differences: Customer vs Artist

| Feature | Customer | Artist |
|---------|----------|--------|
| **Registration** | Direct to Users table | Goes to PendingArtist table |
| **Approval** | Instant (auto-approved) | Requires admin approval |
| **Login** | Immediate after registration | Only after admin approval |
| **Token** | Generated on registration | Generated after approval |
| **Pending Table** | Not used | Used for approval queue |

---

## Testing Examples

### Test Customer Registration
```bash
curl -X POST http://localhost:8000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "role": "customer",
    "name": "Test Customer",
    "email": "test@example.com",
    "password": "password123",
    "phone": "+1234567890"
  }'
```

### Test Customer Login
```bash
curl -X POST http://localhost:8000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "role": "customer"
  }'
```

### Test Artist Registration
```bash
curl -X POST http://localhost:8000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "role": "artist",
    "name": "Test Artist",
    "email": "artist@example.com",
    "password": "password123",
    "category": "category_id_here",
    "bio": "Professional artist"
  }'
```

---

## Summary

✅ **Customers**: Instant registration → Immediate login access  
✅ **Artists**: Registration → Pending approval → Admin approval → Login access  
✅ **Secure**: Password hashing, email validation, JWT tokens  
✅ **Role-based**: Different access levels and redirect paths  
✅ **Validated**: Comprehensive input validation and error handling

This system ensures customers can start using the platform immediately while maintaining quality control for service providers through the approval process.

