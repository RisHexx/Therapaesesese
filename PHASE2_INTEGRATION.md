# Therapease Phase 2 - Anonymous Posts & Interaction System

Phase 2 adds anonymous posts and interaction features to the existing Phase 1 authentication system.

## New Features Added

### Backend Features
- **Anonymous Posts**: Users can create posts with optional anonymity
- **Nested Replies**: Users can reply to posts with optional anonymity
- **Flagging System**: Users can flag posts for moderation
- **Pagination**: Efficient pagination for posts feed
- **Role-based Access**: Admins can see flag counts and delete any post

### Frontend Features
- **Posts Feed**: Main page showing all community posts
- **Create Post Form**: With anonymous toggle option
- **Reply System**: Inline replies to posts
- **Flag Functionality**: One-click flagging for inappropriate content
- **Responsive Design**: Mobile-friendly interface

## Database Schema

### Post Model (`backend/models/Post.js`)
```javascript
{
  content: String (required, max 2000 chars),
  authorId: ObjectId (ref: User),
  anonymous: Boolean (default: false),
  replies: [{
    content: String (required, max 1000 chars),
    authorId: ObjectId (ref: User),
    anonymous: Boolean (default: false),
    createdAt: Date
  }],
  flags: [{
    userId: ObjectId (ref: User),
    reason: String (enum: spam/abuse/inappropriate/other),
    flaggedAt: Date
  }],
  isActive: Boolean (default: true),
  flagCount: Number (auto-calculated),
  replyCount: Number (auto-calculated),
  timestamps: true
}
```

## API Endpoints

All endpoints require JWT authentication from Phase 1.

### Posts Routes (`/api/posts/`)
- `POST /create` - Create a new post
- `GET /getAll?page=1&limit=10` - Get paginated posts
- `POST /reply/:postId` - Reply to a post
- `POST /flag/:postId` - Flag a post
- `GET /my-posts` - Get user's own posts
- `DELETE /:postId` - Delete post (admin or author only)

### Request/Response Examples

**Create Post:**
```javascript
POST /api/posts/create
{
  "content": "This is my anonymous post",
  "anonymous": true
}
```

**Reply to Post:**
```javascript
POST /api/posts/reply/64f123...
{
  "content": "Great post!",
  "anonymous": false
}
```

**Flag Post:**
```javascript
POST /api/posts/flag/64f123...
{
  "reason": "spam"
}
```

## Frontend Components

### New Pages
- `frontend/src/pages/Posts.jsx` - Main posts feed page

### New Components
- `frontend/src/components/CreatePost.jsx` - Post creation form
- `frontend/src/components/PostCard.jsx` - Individual post display
- `frontend/src/components/ReplyForm.jsx` - Reply form component

### Updated Components
- `frontend/src/App.jsx` - Added `/posts` route
- `frontend/src/components/Navbar.jsx` - Added "Posts" navigation link
- `frontend/src/styles.css` - Added posts-specific styling

## Integration with Phase 1

### Authentication Integration
- All posts routes use existing JWT middleware (`protect`)
- User context from Phase 1 is used for author identification
- Role-based permissions (admin features) use existing `authorize` middleware

### Database Integration
- Posts reference existing User model via `authorId`
- No changes needed to existing User schema
- Uses existing MongoDB connection

### Frontend Integration
- Uses existing AuthContext for user state
- Integrates with existing navigation and styling
- Maintains consistent UI/UX with Phase 1

## Privacy Features

### Anonymous Posts
- When `anonymous: true`, author name shows as "Anonymous"
- Author role is hidden for anonymous posts
- Original author ID is preserved for moderation purposes

### Data Protection
- User can only see their own posts in "My Posts"
- Flag details are only visible to admins
- Soft delete preserves data for moderation

## Moderation Features

### For Admins
- View flag counts on posts
- Delete any post or reply
- Access to flagged content for review

### For Users
- Flag inappropriate content
- Delete their own posts
- Report spam/abuse

## Running Phase 2

### Backend
No additional setup required. The existing backend from Phase 1 will automatically include Phase 2 features.

### Frontend
The existing frontend will now include:
- "Posts" link in navigation (when logged in)
- Access to `/posts` page
- All posts functionality

### Testing the Integration
1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Login with any user account
4. Click "Posts" in navigation
5. Create posts (try both anonymous and public)
6. Reply to posts
7. Test flagging functionality

## Security Considerations

### Input Validation
- Content length limits (2000 chars for posts, 1000 for replies)
- XSS prevention through proper escaping
- Rate limiting recommended for production

### Privacy Protection
- Anonymous posts hide author identity in responses
- Flag information is restricted to admins
- User can only access their own post history

### Moderation Tools
- Soft delete preserves evidence
- Flag tracking for repeat offenders
- Admin oversight of community content

## Future Enhancements (Phase 3+)
- Real-time notifications for replies
- Advanced search and filtering
- User reputation system
- Content categories/tags
- Image/file attachments
- Automated content moderation
