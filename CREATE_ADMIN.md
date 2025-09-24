# Creating an Admin User for Testing

## Method 1: Through Registration + Manual Role Update

1. **Register a new user** through the frontend or API:
```javascript
POST /api/auth/register
{
  "name": "Admin User",
  "email": "admin@therapease.com",
  "password": "admin123456"
}
```

2. **Update the user role in MongoDB**:
```javascript
// In MongoDB shell or MongoDB Compass
db.users.updateOne(
  { email: "admin@therapease.com" },
  { $set: { role: "admin" } }
)
```

## Method 2: Direct Database Insert

```javascript
// In MongoDB shell
db.users.insertOne({
  name: "Admin User",
  email: "admin@therapease.com",
  password: "$2a$12$hash_your_password_here", // Use bcrypt to hash "admin123456"
  role: "admin",
  isActive: true,
  isVerified: true,
  isBanned: false,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

## Method 3: Using Node.js Script

Create a file `createAdmin.js` in the backend folder:

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@therapease.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('admin123456', salt);
    
    // Create admin user
    const admin = new User({
      name: 'Admin User',
      email: 'admin@therapease.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      isVerified: true,
      isBanned: false
    });
    
    await admin.save();
    console.log('Admin user created successfully');
    console.log('Email: admin@therapease.com');
    console.log('Password: admin123456');
    
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    mongoose.disconnect();
  }
};

createAdmin();
```

Run with: `node createAdmin.js`

## Testing Admin Access

1. **Login as admin**:
```javascript
POST /api/auth/login
{
  "email": "admin@therapease.com",
  "password": "admin123456"
}
```

2. **Test admin endpoints**:
```javascript
GET /api/admin/analytics
Headers: { Authorization: "Bearer YOUR_JWT_TOKEN" }
```

3. **Access admin dashboard**:
- Login to the frontend
- Click the "Admin" button in the navigation
- You should see the admin dashboard with analytics, users, and flagged posts tabs

## Troubleshooting

If you get "Access denied. No token provided":
1. Check that the token is being sent in the Authorization header
2. Verify the token format: "Bearer YOUR_JWT_TOKEN"
3. Check browser localStorage for the token
4. Ensure the user role is set to "admin" in the database
