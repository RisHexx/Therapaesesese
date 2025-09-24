# Test Admin Access - Step by Step

## Step 1: Verify Admin User Exists

First, let's make sure you have an admin user:

```bash
# In the backend folder
cd backend
node createAdmin.js
```

Expected output:
```
✅ Admin user created successfully!
Email: admin@therapease.com
Password: admin123456
```

## Step 2: Test Login

1. **Open the frontend** (http://localhost:3000)
2. **Login with**:
   - Email: `admin@therapease.com`
   - Password: `admin123456`
3. **Check if "Admin" button appears** in the navigation

## Step 3: Test API Access

Open browser developer tools (F12) and run these tests in the console:

### Test 1: Check if you're logged in as admin
```javascript
// Check localStorage for token
console.log('Token:', localStorage.getItem('token'));

// Check current user
fetch('/api/auth/me', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
})
.then(res => res.json())
.then(data => console.log('Current user:', data));
```

### Test 2: Test debug endpoint
```javascript
// Test debug endpoint
fetch('/api/therapists/debug/all', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
})
.then(res => res.json())
.then(data => console.log('Debug response:', data))
.catch(err => console.error('Debug error:', err));
```

### Test 3: Test pending therapists endpoint
```javascript
// Test pending therapists
fetch('/api/therapists/pending', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
})
.then(res => res.json())
.then(data => console.log('Pending therapists:', data))
.catch(err => console.error('Pending error:', err));
```

### Test 4: Create test therapist
```javascript
// Create test therapist
fetch('/api/therapists/debug/create-test', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
})
.then(res => res.json())
.then(data => console.log('Test therapist created:', data))
.catch(err => console.error('Create error:', err));
```

## Step 4: Check Admin Dashboard

1. **Go to Admin Dashboard**: Click "Admin" in navigation
2. **Go to Therapist Verification tab**
3. **Click "🔍 Debug Info"** - This should show you how many therapists exist
4. **Click "🧪 Create Test"** - This should create a test therapist
5. **Check console logs** for any error messages

## Expected Results

### If Everything Works:
- Debug Info shows: "Total therapists: X, Verified: Y, Pending: Z"
- Create Test shows: "Test therapist created successfully!"
- Therapist appears in verification list

### Common Issues and Solutions:

#### Issue 1: "Access denied. No token provided"
**Solution**: 
- Logout and login again
- Check if localStorage has a token
- Make sure you're logged in as admin

#### Issue 2: "Access denied. Admin privileges required"
**Solution**:
- Check user role in database: `db.users.findOne({email: "admin@therapease.com"})`
- Update role if needed: `db.users.updateOne({email: "admin@therapease.com"}, {$set: {role: "admin"}})`

#### Issue 3: "Failed to fetch"
**Solution**:
- Check if backend server is running on port 5000
- Check if frontend is running on port 3000
- Check network tab in dev tools for actual error

#### Issue 4: No therapists show up
**Solution**:
- Use "Create Test" button to create a test therapist
- Check MongoDB to see if therapists collection exists
- Check console logs for API errors

## Manual Database Check

If nothing works, check the database directly:

```javascript
// In MongoDB shell or MongoDB Compass

// Check if admin user exists
db.users.findOne({email: "admin@therapease.com"})

// Check all therapists
db.therapists.find({}).pretty()

// Count therapists by status
db.therapists.aggregate([
  {$group: {_id: "$verificationStatus", count: {$sum: 1}}}
])
```

## Quick Fix Commands

### Create admin user:
```bash
cd backend && node createAdmin.js
```

### Create test therapist directly in database:
```javascript
// In MongoDB shell
use therapease  // or your database name

// First create a test user
db.users.insertOne({
  name: "Test Therapist",
  email: "test@therapist.com",
  password: "$2a$12$hash_here", // You can use any hash for testing
  role: "therapist",
  isActive: true,
  createdAt: new Date()
})

// Get the user ID
var userId = db.users.findOne({email: "test@therapist.com"})._id

// Create therapist profile
db.therapists.insertOne({
  userId: userId,
  specialization: ["Anxiety", "Depression"],
  licenseNumber: "TEST123",
  experience: 5,
  contactInfo: {
    email: "test@therapist.com",
    phone: "555-0123",
    address: { state: "California" }
  },
  verified: false,
  verificationStatus: "pending",
  isActive: true,
  createdAt: new Date()
})
```

Follow these steps in order, and let me know what error messages you see in the console!
