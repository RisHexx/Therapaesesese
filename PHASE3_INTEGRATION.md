# Therapease Phase 3 - Personal Journals & Therapist System

Phase 3 adds personal journaling and therapist connection features to the existing Phases 1 & 2 (authentication and posts system).

## New Features Added

### Backend Features
- **Personal Journals**: Private daily journal entries with mood tracking
- **Therapist System**: Verified therapist profiles with contact functionality
- **Admin Verification**: Admin approval workflow for therapist applications
- **Journal Analytics**: Mood distribution and journaling statistics
- **Contact Requests**: Direct communication system between users and therapists

### Frontend Features
- **Journals Page**: Complete CRUD for personal journal entries
- **Therapist Directory**: Browse and filter verified therapists
- **Contact System**: Modal-based therapist contact form
- **Admin Dashboard**: Therapist verification interface for admins
- **Statistics**: Personal journaling insights and mood tracking

## Database Schemas

### Journal Model (`backend/models/Journal.js`)
```javascript
{
  userId: ObjectId (ref: User, required),
  date: Date (required, default: now),
  title: String (max 100 chars, auto-generated if empty),
  content: String (required, max 5000 chars),
  mood: String (enum: very-bad/bad/neutral/good/very-good),
  tags: [String] (lowercase),
  isPrivate: Boolean (default: true),
  timestamps: true
}
```

### Therapist Model (`backend/models/Therapist.js`)
```javascript
{
  userId: ObjectId (ref: User, unique, required),
  verified: Boolean (default: false),
  verificationStatus: String (enum: pending/approved/rejected),
  verifiedBy: ObjectId (ref: User),
  verifiedAt: Date,
  rejectionReason: String,
  
  // Professional Info
  specialization: [String] (required),
  licenseNumber: String (required, unique),
  experience: Number (0-50 years),
  education: { degree, institution, year },
  certifications: [{ name, issuer, year }],
  
  // Contact Info
  contactInfo: {
    email: String (required),
    phone: String (required),
    address: { street, city, state, zipCode, country },
    website: String,
    socialMedia: { linkedin, twitter }
  },
  
  // Practice Info
  practiceInfo: {
    name: String,
    type: String (enum: private/clinic/hospital/online),
    acceptsInsurance: Boolean,
    sessionTypes: [String] (individual/group/family/couples),
    languages: [String],
    availability: {
      days: [String] (monday-sunday),
      hours: { start, end }
    }
  },
  
  // Contact Requests
  contactRequests: [{
    userId: ObjectId (ref: User),
    message: String (max 1000 chars),
    contactInfo: { email, phone, preferredMethod },
    status: String (enum: pending/acknowledged/responded),
    createdAt: Date
  }],
  
  // Profile
  bio: String (max 2000 chars),
  profileImage: String (URL),
  rating: { average: Number (0-5), count: Number },
  isActive: Boolean (default: true),
  timestamps: true
}
```

## API Endpoints

### Journals Routes (`/api/journals/`)
All routes require authentication and are user-private.

- `POST /create` - Create new journal entry
- `GET /` - Get user's journals (with pagination & filters)
- `GET /stats` - Get user's journaling statistics
- `GET /:id` - Get specific journal entry
- `PUT /:id` - Update journal entry
- `DELETE /:id` - Delete journal entry

### Therapists Routes (`/api/therapists/`)
All routes require authentication.

- `GET /` - Get verified therapists (with filters & pagination)
- `GET /:id` - Get therapist details
- `POST /apply` - Apply to become a therapist
- `POST /contact/:therapistId` - Contact a therapist
- `GET /pending` - Get pending verifications (admin only)
- `PUT /verify/:therapistId` - Verify therapist application (admin only)
- `GET /my-requests` - Get contact requests (therapist only)

### Request/Response Examples

**Create Journal Entry:**
```javascript
POST /api/journals/create
{
  "title": "Great day today",
  "content": "Had a wonderful day with family...",
  "mood": "very-good",
  "tags": ["family", "happiness"],
  "date": "2024-01-15"
}
```

**Apply as Therapist:**
```javascript
POST /api/therapists/apply
{
  "specialization": ["Anxiety", "Depression"],
  "licenseNumber": "PSY123456",
  "experience": 5,
  "contactInfo": {
    "email": "therapist@example.com",
    "phone": "555-0123"
  },
  "bio": "Experienced therapist specializing in..."
}
```

**Contact Therapist:**
```javascript
POST /api/therapists/contact/64f123...
{
  "message": "I'm looking for help with anxiety...",
  "contactInfo": {
    "email": "user@example.com",
    "phone": "555-0456",
    "preferredMethod": "email"
  }
}
```

## Frontend Components

### New Pages
- `frontend/src/pages/Journals.jsx` - Personal journal management
- `frontend/src/pages/Therapists.jsx` - Therapist directory

### New Components
- `frontend/src/components/CreateJournal.jsx` - Journal entry form
- `frontend/src/components/JournalEntry.jsx` - Individual journal display/edit
- `frontend/src/components/JournalStats.jsx` - Personal statistics dashboard
- `frontend/src/components/TherapistCard.jsx` - Therapist profile card
- `frontend/src/components/ContactTherapist.jsx` - Contact form modal
- `frontend/src/components/TherapistVerification.jsx` - Admin verification interface

### Updated Components
- `frontend/src/App.jsx` - Added `/journals` and `/therapists` routes
- `frontend/src/components/Navbar.jsx` - Added navigation links
- `frontend/src/pages/DashboardAdmin.jsx` - Integrated therapist verification
- `frontend/src/styles.css` - Added comprehensive styling for Phase 3

## Integration with Previous Phases

### Phase 1 (Authentication) Integration
- All journal and therapist routes use existing JWT middleware
- User roles determine access (admin verification, therapist features)
- Seamless integration with existing user management

### Phase 2 (Posts) Integration
- Maintains existing navigation and UI consistency
- Uses same styling patterns and component structure
- No conflicts with posts functionality

### Database Integration
- Journals and Therapists reference existing User model
- Uses existing MongoDB connection and error handling
- Consistent with existing data patterns

## Privacy & Security Features

### Journal Privacy
- All journals are private by default (`isPrivate: true`)
- Users can only access their own journal entries
- Complete isolation between users' journal data
- Secure CRUD operations with ownership validation

### Therapist Verification
- Admin-only verification workflow
- Secure license number validation (unique constraint)
- Contact requests preserve user privacy
- Professional information validation

### Data Protection
- Sensitive therapist info hidden in public listings
- Contact requests are private between user and therapist
- Admin verification logs for audit trail

## Key Features

### Journal System
- **Mood Tracking**: 5-level mood system with visual indicators
- **Statistics**: Personal insights with mood distribution charts
- **Search & Filter**: Find entries by mood, content, or tags
- **CRUD Operations**: Full create, read, update, delete functionality
- **Responsive Design**: Mobile-friendly interface

### Therapist System
- **Verification Workflow**: Admin approval process for quality control
- **Advanced Filtering**: Search by specialization, location, etc.
- **Contact System**: Direct communication between users and therapists
- **Professional Profiles**: Comprehensive therapist information
- **Rating System**: Future-ready rating and review structure

### Admin Features
- **Therapist Verification**: Review and approve/reject applications
- **Application Details**: Complete professional information review
- **Bulk Management**: Efficient verification workflow

## Running Phase 3

### Backend
No additional setup required. The existing backend automatically includes Phase 3 features.

### Frontend
The existing frontend now includes:
- "Journal" and "Therapists" links in navigation
- Access to `/journals` and `/therapists` pages
- All Phase 3 functionality integrated

### Testing the Integration
1. **Journals**: Login → Click "Journal" → Create entries, track moods, view stats
2. **Therapists**: Click "Therapists" → Browse directory, contact therapists
3. **Admin**: Login as admin → Dashboard shows therapist verification section
4. **Apply as Therapist**: Any user can apply via therapist application

## Security Considerations

### Input Validation
- Content length limits (5000 chars for journals, 1000 for contact messages)
- Professional credential validation
- XSS prevention through proper escaping

### Access Control
- Journal entries are strictly user-private
- Role-based access for admin verification
- Therapist contact requests are secure and private

### Data Integrity
- Unique license numbers for therapists
- Referential integrity with User model
- Soft delete options for data preservation

## Future Enhancements (Phase 4+)
- **Real-time Messaging**: Direct chat between users and therapists
- **Appointment Scheduling**: Integrated booking system
- **Payment Integration**: Session payment processing
- **Advanced Analytics**: Mood trends, journal insights
- **Mobile App**: React Native implementation
- **AI Insights**: Mood pattern analysis and recommendations
- **Group Therapy**: Multi-user session management
- **Insurance Integration**: Insurance verification and billing

## Performance Optimizations
- **Pagination**: Efficient loading for large datasets
- **Indexing**: Optimized database queries
- **Caching**: Future-ready caching strategies
- **Lazy Loading**: Component-based loading

Phase 3 successfully extends Therapease into a comprehensive mental health platform with private journaling and professional therapist connections, while maintaining the community features from Phase 2 and robust authentication from Phase 1.
