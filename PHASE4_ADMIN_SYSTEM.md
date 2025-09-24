# Therapease Phase 4 - Admin & Moderation System

Phase 4 adds comprehensive admin and moderation capabilities to the Therapease platform, building on the foundation of Phases 1-3.

## New Features Added

### Backend Features
- **Admin Authentication**: Secure admin-only middleware with role-based access control
- **User Management**: Ban/unban users with reason tracking and audit trail
- **Content Moderation**: Remove flagged posts with detailed moderation logs
- **Platform Analytics**: Comprehensive statistics and monitoring dashboard
- **Audit Trail**: Complete logging of admin actions with timestamps and reasons

### Frontend Features
- **Admin Dashboard**: Tabbed interface for all admin functions
- **Analytics Overview**: Real-time platform statistics and alerts
- **User Management**: Search, filter, and moderate user accounts
- **Content Moderation**: Review and remove flagged posts
- **Therapist Verification**: Integrated therapist approval workflow (from Phase 3)

## Database Schema Updates

### User Model Updates (`backend/models/User.js`)
```javascript
// New fields added to existing User schema
{
  isBanned: Boolean (default: false),
  bannedAt: Date,
  bannedBy: ObjectId (ref: User),
  banReason: String (max 500 chars)
}
```

### Post Model Updates (`backend/models/Post.js`)
```javascript
// New fields added to existing Post schema
{
  removedBy: ObjectId (ref: User),
  removedAt: Date,
  removalReason: String (max 500 chars)
}
```

## API Endpoints

### Admin Routes (`/api/admin/`)
All routes require admin authentication via `adminAuth` middleware.

#### User Management
- `GET /users` - Get all users with pagination and filtering
  - Query params: `role`, `status`, `search`, `page`, `limit`
- `PUT /users/:id/ban` - Ban a user
  - Body: `{ reason: string }`
- `PUT /users/:id/unban` - Unban a user

#### Content Moderation
- `GET /posts/flagged` - Get flagged posts with pagination
  - Query params: `minFlags`, `page`, `limit`
- `PUT /posts/:id/remove` - Remove a post
  - Body: `{ reason: string }`
- `PUT /posts/:id/restore` - Restore a removed post

#### Analytics
- `GET /analytics` - Get platform statistics and insights

### Request/Response Examples

**Get Users with Filters:**
```javascript
GET /api/admin/users?role=user&status=active&search=john&page=1&limit=20

Response:
{
  "success": true,
  "data": {
    "users": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalUsers": 100,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

**Ban User:**
```javascript
PUT /api/admin/users/64f123.../ban
{
  "reason": "Violation of community guidelines - inappropriate content"
}

Response:
{
  "success": true,
  "message": "User banned successfully",
  "data": {
    "userId": "64f123...",
    "name": "John Doe",
    "email": "john@example.com",
    "bannedAt": "2024-01-15T10:30:00Z",
    "banReason": "Violation of community guidelines"
  }
}
```

**Get Platform Analytics:**
```javascript
GET /api/admin/analytics

Response:
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 1250,
      "activeUsers": 1180,
      "bannedUsers": 15,
      "totalPosts": 3420,
      "flaggedPosts": 23,
      "totalTherapists": 45,
      "verifiedTherapists": 38
    },
    "recentActivity": {
      "newUsersLast30Days": 89,
      "newPostsLast30Days": 234,
      "newJournalsLast30Days": 567,
      "newTherapistsLast30Days": 7
    },
    "alerts": {
      "topFlaggedPosts": [...],
      "pendingVerifications": 3,
      "bannedUsers": 15
    }
  }
}
```

## Frontend Components

### New Pages
- `frontend/src/pages/AdminDashboard.jsx` - Main admin interface with tabbed navigation

### New Components
- `frontend/src/components/admin/AnalyticsDashboard.jsx` - Platform statistics and alerts
- `frontend/src/components/admin/UsersManagement.jsx` - User search, filtering, and moderation
- `frontend/src/components/admin/FlaggedPostsManagement.jsx` - Content moderation interface

### Updated Components
- `frontend/src/App.jsx` - Added `/admin` route for admin dashboard
- `frontend/src/components/Navbar.jsx` - Added "Admin" button for admin users
- `frontend/src/styles.css` - Added comprehensive admin interface styling

## Security & Access Control

### Admin Authentication Middleware (`backend/middleware/adminAuth.js`)
- **JWT Verification**: Validates admin tokens
- **Role Checking**: Ensures only admin users can access routes
- **Ban Status**: Prevents banned admins from accessing system
- **Error Handling**: Comprehensive error responses for security

### Security Features
- **Admin-Only Access**: All admin routes protected by role-based middleware
- **Self-Protection**: Admins cannot ban themselves or other admins
- **Audit Trail**: All admin actions logged with user ID and timestamp
- **Input Validation**: Reason requirements for bans and removals
- **Soft Deletes**: Posts are deactivated, not deleted, for data integrity

## Admin Dashboard Features

### Analytics Tab
- **Platform Overview**: Total counts for users, posts, journals, therapists
- **Recent Activity**: 30-day growth metrics
- **Alert System**: Flagged content requiring attention
- **Real-time Data**: Refresh button for current statistics

### Users Management Tab
- **Advanced Filtering**: By role, status, and search terms
- **Pagination**: Efficient loading for large user bases
- **Ban/Unban Actions**: With reason tracking and confirmation
- **User Details**: Join dates, roles, and ban history
- **Responsive Table**: Mobile-friendly user management

### Flagged Posts Tab
- **Flag Threshold Filtering**: Minimum flag count selection
- **Detailed Flag Information**: Who flagged, when, and why
- **Content Preview**: Expandable post content with "show more/less"
- **Removal Actions**: With reason tracking and confirmation
- **Flag Analytics**: Visual flag reason indicators

### Therapist Verification Tab
- **Integrated Workflow**: Uses existing Phase 3 verification system
- **Application Review**: Complete professional information display
- **Approve/Reject Actions**: With reason tracking for rejections
- **Pending Alerts**: Dashboard notifications for pending applications

## Integration with Previous Phases

### Phase 1 (Authentication) Integration
- **JWT Middleware**: Extends existing authentication system
- **Role-Based Access**: Uses existing user role system
- **Admin User Creation**: Works with existing user registration

### Phase 2 (Posts) Integration
- **Flag System**: Uses existing post flagging functionality
- **Content Moderation**: Soft delete preserves post data and relationships
- **Reply Handling**: Flagged posts with replies are properly managed

### Phase 3 (Journals & Therapists) Integration
- **Therapist Verification**: Integrated into admin dashboard
- **Analytics Inclusion**: Journals and therapists included in statistics
- **Privacy Preservation**: Admin cannot access private journal content

## Admin Interface Design

### Tabbed Navigation
- **Analytics** (📊): Platform overview and alerts
- **Users** (👥): User management and moderation
- **Flagged Posts** (🚩): Content moderation
- **Therapist Verification** (🏥): Professional approval workflow

### Responsive Design
- **Desktop**: Full-featured tabbed interface
- **Tablet**: Responsive grid layouts and tables
- **Mobile**: Stacked layouts with icon-only tabs

### Color-Coded System
- **Green**: Active/approved items
- **Red**: Banned/flagged/removed items
- **Yellow**: Pending/warning items
- **Blue**: Information and navigation

## Performance Optimizations

### Backend Optimizations
- **Pagination**: Efficient data loading for large datasets
- **Database Indexing**: Optimized queries for user and post filtering
- **Aggregation Pipelines**: Efficient analytics calculations
- **Selective Population**: Only load necessary user data

### Frontend Optimizations
- **Lazy Loading**: Components load only when tabs are accessed
- **Local State Management**: Efficient filtering and pagination
- **Debounced Search**: Prevents excessive API calls
- **Responsive Images**: Optimized for different screen sizes

## Error Handling & User Experience

### Backend Error Handling
- **Validation Errors**: Clear messages for invalid input
- **Permission Errors**: Specific messages for access violations
- **Database Errors**: Graceful handling of connection issues
- **Rate Limiting**: Protection against abuse

### Frontend User Experience
- **Loading States**: Clear indicators during API calls
- **Success Messages**: Confirmation of admin actions
- **Error Recovery**: Retry buttons and clear error messages
- **Confirmation Dialogs**: Prevent accidental destructive actions

## Testing the Admin System

### Creating an Admin User
```javascript
// In MongoDB shell or through registration with manual role update
db.users.updateOne(
  { email: "admin@therapease.com" },
  { $set: { role: "admin" } }
)
```

### Testing Admin Features
1. **Login as Admin**: Use admin credentials to access the system
2. **Access Admin Dashboard**: Click "Admin" button in navigation
3. **Test Analytics**: View platform statistics and alerts
4. **Test User Management**: Search, filter, and ban/unban users
5. **Test Content Moderation**: Review and remove flagged posts
6. **Test Therapist Verification**: Approve/reject therapist applications

### Sample Test Data
```javascript
// Create test flagged post
POST /api/posts/create
{
  "content": "This is a test post that will be flagged",
  "anonymous": false
}

// Flag the post
POST /api/posts/:postId/flag
{
  "reason": "inappropriate"
}
```

## Security Considerations

### Access Control
- **Role Verification**: Multiple layers of admin role checking
- **Session Management**: Secure JWT token handling
- **CSRF Protection**: Built into React and Express setup
- **Input Sanitization**: All user input validated and sanitized

### Data Protection
- **Audit Logs**: All admin actions tracked with timestamps
- **Soft Deletes**: Data preservation for legal and recovery purposes
- **Privacy Compliance**: Admin cannot access private journal content
- **Reason Requirements**: All moderation actions require justification

### Operational Security
- **Admin Account Protection**: Cannot ban other admins or self
- **Confirmation Dialogs**: Prevent accidental destructive actions
- **Error Logging**: Comprehensive logging for security monitoring
- **Rate Limiting**: Protection against automated attacks

## Future Enhancements (Phase 5+)

### Advanced Moderation
- **AI Content Detection**: Automated flagging of inappropriate content
- **Bulk Actions**: Mass user/content management tools
- **Advanced Analytics**: Detailed reporting and trend analysis
- **Custom Moderation Rules**: Configurable content policies

### Enhanced Admin Tools
- **Role Management**: Create custom admin roles with specific permissions
- **Scheduled Actions**: Automated moderation tasks
- **Export Tools**: Data export for compliance and analysis
- **Integration APIs**: Third-party moderation tool integration

### Monitoring & Alerts
- **Real-time Notifications**: Instant alerts for critical issues
- **Dashboard Widgets**: Customizable admin interface
- **Performance Monitoring**: System health and usage metrics
- **Compliance Reporting**: Automated regulatory compliance reports

## Deployment Notes

### Environment Variables
No additional environment variables required. Uses existing JWT_SECRET and database configuration.

### Database Migrations
The new fields are added to existing schemas with default values, so no migration is required for existing data.

### Production Considerations
- **Admin Account Setup**: Ensure at least one admin account exists
- **Monitoring**: Set up logging and monitoring for admin actions
- **Backup Strategy**: Regular backups of user and content data
- **Security Audits**: Regular review of admin access and actions

Phase 4 successfully transforms Therapease into a fully-managed platform with comprehensive administrative controls, content moderation, and user management capabilities, while maintaining the security and privacy standards established in previous phases.
