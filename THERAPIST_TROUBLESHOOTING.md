# Therapist Not Showing - Troubleshooting Guide

## Issue: Registered therapists are not showing up on "Find a Therapist" page

### Root Cause
The "Find a Therapist" page only shows **VERIFIED** therapists. When a user registers as a therapist, they are in "pending" status and need admin approval.

## Step-by-Step Solution

### Step 1: Check Therapist Registration Status

**Debug Endpoint (Admin only):**
```
GET /api/therapists/debug/all
Headers: { Authorization: "Bearer YOUR_ADMIN_JWT_TOKEN" }
```

This will show you:
- Total therapists in the system
- How many are verified vs pending vs rejected
- Details of each therapist including verification status

### Step 2: Verify Admin User Exists

1. **Create/Verify Admin User:**
```bash
# In backend folder
node createAdmin.js
```

2. **Login as Admin:**
- Email: `admin@therapease.com`
- Password: `admin123456`

### Step 3: Verify Therapists Through Admin Dashboard

1. **Login as Admin**
2. **Click "Admin" button** in navigation
3. **Go to "Therapist Verification" tab**
4. **Approve pending therapist applications**

### Step 4: Alternative - Manual Database Verification

If you need to quickly verify a therapist directly in the database:

```javascript
// In MongoDB shell or MongoDB Compass
db.therapists.updateMany(
  { verificationStatus: "pending" },
  { 
    $set: { 
      verified: true, 
      verificationStatus: "approved",
      verifiedAt: new Date()
    } 
  }
)
```

### Step 5: Debug Therapist Visibility

**Test with all therapists (including unverified):**
```
GET /api/therapists/?showAll=true
```

This debug parameter will show ALL therapists regardless of verification status.

## Verification Workflow

### How Therapist Registration Works:
1. **User registers** as therapist → Status: `pending`, `verified: false`
2. **Admin reviews** application in Admin Dashboard
3. **Admin approves** → Status: `approved`, `verified: true`
4. **Therapist appears** in "Find a Therapist" page

### Therapist Registration Process:
1. User fills out therapist application form
2. Application is saved with `verificationStatus: "pending"`
3. Admin receives notification in dashboard
4. Admin reviews credentials and approves/rejects
5. Only approved therapists show in public listing

## Quick Fix Options

### Option 1: Auto-Approve (Development Only)
Temporarily modify the therapist model to auto-approve:

```javascript
// In backend/models/Therapist.js - NOT recommended for production
verified: {
  type: Boolean,
  default: true  // Change from false to true
}
```

### Option 2: Bulk Approve Existing Therapists
```javascript
// In MongoDB shell
db.therapists.updateMany(
  {},
  { 
    $set: { 
      verified: true, 
      verificationStatus: "approved",
      verifiedAt: new Date()
    } 
  }
)
```

### Option 3: Use Admin Dashboard (Recommended)
1. Login as admin
2. Navigate to Admin → Therapist Verification
3. Review and approve each application individually

## Testing the Fix

### 1. Check Therapist Status:
```bash
# As admin, call debug endpoint
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     http://localhost:5000/api/therapists/debug/all
```

### 2. Verify Therapist Appears:
```bash
# Check public therapist listing
curl -H "Authorization: Bearer ANY_USER_TOKEN" \
     http://localhost:5000/api/therapists/
```

### 3. Frontend Test:
1. Login to the app
2. Click "Therapists" in navigation
3. Verified therapists should now appear

## Common Issues

### Issue 1: No Admin User
**Solution:** Run `node createAdmin.js` in backend folder

### Issue 2: Therapist Application Not Submitted
**Solution:** Check if therapist actually completed the application form

### Issue 3: Database Connection Issues
**Solution:** Verify MongoDB is running and connected

### Issue 4: Token Issues
**Solution:** Ensure you're logged in and have valid JWT token

## Production Considerations

### Security:
- Never auto-approve therapists in production
- Always verify credentials manually
- Implement proper license verification

### Workflow:
- Set up email notifications for new applications
- Create approval/rejection email templates
- Implement audit trail for verification decisions

## API Endpoints Summary

```
GET /api/therapists/                    # Public verified therapists
GET /api/therapists/debug/all          # Admin: All therapists debug info
GET /api/therapists/pending            # Admin: Pending verifications
PUT /api/therapists/verify/:id         # Admin: Approve/reject therapist
POST /api/therapists/apply             # User: Apply as therapist
```

## Next Steps

1. **Immediate:** Use admin dashboard to approve pending therapists
2. **Short-term:** Set up email notifications for new applications
3. **Long-term:** Implement automated license verification system

The key point is that **therapists must be verified by an admin before they appear in the public listing**. This is a security feature to ensure only qualified therapists are shown to users.
