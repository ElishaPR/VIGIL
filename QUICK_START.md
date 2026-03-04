# Vigil - Quick Start Guide

## What's Been Completed

### Backend (100% Complete)
- ✅ Database migration for email verification
- ✅ User model with verification fields
- ✅ Verification service with OTP generation
- ✅ Email templates for verification
- ✅ Consent storage and validation
- ✅ Updated signup/login endpoints
- ✅ Verification and resend endpoints

### Frontend (Core Components Complete)
- ✅ Modern gradient design system
- ✅ Geometric V logo and favicon
- ✅ Validation utilities
- ✅ Shared components (Navbar, LoadingSpinner)
- ✅ Redesigned auth components
- ✅ Verification modal
- ✅ Landing page hero section
- ✅ Features section created

### What You Need to Create
The COMPLETE_CODE_REFERENCE.md file contains all remaining code for:
1. HowItWorks.jsx
2. CTASection.jsx
3. Footer.jsx
4. LandingPage.jsx (integrates all landing components)
5. SignUpPage.jsx (complete 2-panel redesign)
6. LoginPage.jsx (modernized)
7. DashboardPage.jsx
8. Dashboard components (Layout, WelcomeSection)
9. Terms & Privacy pages
10. Updated App.jsx with all routes

## Installation Steps

### 1. Backend Setup
```bash
cd Backend

# Create virtual environment (optional but recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Make sure your .env file has all required variables:
# DATABASE_URL, JWT_SECRET_KEY, JWT_ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
# BREVO_EMAIL_API_KEY, SENDER_EMAIL, VITE_FIREBASE_PUBLIC_VAPID_KEY
```

### 2. Apply Database Migration
The migration file is at `Backend/migrations/001_add_email_verification_and_consents.sql`

Option A - Using psql:
```bash
psql $DATABASE_URL -f migrations/001_add_email_verification_and_consents.sql
```

Option B - Using pgcli:
```bash
pgcli $DATABASE_URL < migrations/001_add_email_verification_and_consents.sql
```

Option C - Manual (copy SQL from migration file and execute in your DB client)

### 3. Frontend Setup
```bash
cd Frontend

# Install dependencies
npm install

# Make sure your .env file has all Firebase config variables
```

### 4. Create Missing Frontend Files
Copy code from `COMPLETE_CODE_REFERENCE.md` for each file listed above.

File locations:
```
Frontend/src/components/Landing/
  - HowItWorks.jsx
  - CTASection.jsx
  - Footer.jsx

Frontend/src/components/Dashboard/
  - DashboardLayout.jsx
  - WelcomeSection.jsx

Frontend/src/pages/
  - LandingPage.jsx
  - SignUpPage.jsx (replace existing)
  - LoginPage.jsx (replace existing)
  - DashboardPage.jsx
  - TermsAndConditionsPage.jsx
  - PrivacyPolicyPage.jsx

Frontend/src/App.jsx (update with new routes)
```

### 5. Run the Application

Terminal 1 (Backend):
```bash
cd Backend
uvicorn app.main:app --reload
```

Terminal 2 (Frontend):
```bash
cd Frontend
npm run dev
```

### 6. Test the Flow

1. Visit http://localhost:5173
2. Should see modern landing page with gradient blue theme
3. Click "Get Started Free" → Signup page
4. Fill form (all fields + 3 consent checkboxes required)
5. Click "Create Account" → Verification modal appears
6. Check email for 6-digit OTP
7. Enter code → Redirected to login
8. Login → Redirected to dashboard

## Verification Testing

### Test Signup Validation:
- Try invalid email → Should show error
- Try short name (<1 char) → Should show error
- Try name with numbers → Should show error
- Try weak password (<8 chars) → Should show error
- Try password without digit → Should show error
- Uncheck any consent → Should show error on submit

### Test Email Verification:
- Wrong code → Error message with attempts remaining
- Expired code (>10 min) → Error message
- 5+ wrong attempts → Locked out message
- Correct code → Success message, redirect to login

### Test Login:
- Unverified email → Error: "Email not verified"
- Wrong password → Error: "Invalid credentials"
- Correct credentials → Success, redirect to dashboard

## Design Highlights

### Color Palette
- Primary: #3B82F6 (blue-500)
- Dark: #1E3A8A (blue-900)
- Gradient: linear-gradient(135deg, #3B82F6 0%, #1E3A8A 100%)

### Logo
- Geometric V shape inspired by Adidas
- Gradient fill
- Available as vigil-logo.svg (200x200) and favicon.svg (32x32)

### Typography
- Font: System UI stack (SF Pro, Roboto, Helvetica, Arial)
- Headers: Bold, 2xl-4xl
- Body: Regular, base size
- Line height: 1.6 (body), 1.2 (headers)

### Spacing
- 8px base system
- Card padding: 2rem
- Section spacing: 4rem

## Troubleshooting

### Backend Issues

**Database connection error:**
- Check DATABASE_URL in .env
- Ensure PostgreSQL is running
- Verify database exists

**Email not sending:**
- Check BREVO_EMAIL_API_KEY in .env
- Verify SENDER_EMAIL is configured in Brevo
- Check console logs for API errors

**Import errors:**
- Run `pip install -r requirements.txt` again
- Check Python version (3.8+)

### Frontend Issues

**Can't access verification modal:**
- Check browser console for errors
- Verify backend is running on :8000
- Check CORS settings in backend

**Gradient not showing:**
- Ensure gradients.css is imported in index.css
- Clear browser cache
- Check for CSS build errors

**Images not loading:**
- Verify vigil-logo.svg and favicon.svg exist in public/
- Check browser network tab for 404s

## API Endpoints Summary

### POST /users/signup
Request:
```json
{
  "email_address": "user@example.com",
  "display_name": "John Doe",
  "raw_password": "Password123",
  "is_india_resident": true,
  "terms_accepted": true,
  "privacy_accepted": true
}
```

Response:
```json
{
  "user_uuid": "...",
  "display_name": "John Doe",
  "email_address": "user@example.com",
  "message": "Verification code sent to your email..."
}
```

### POST /users/verify-email
Request:
```json
{
  "email_address": "user@example.com",
  "verification_code": "123456"
}
```

Response:
```json
{
  "message": "Email verified successfully. You can now log in."
}
```

### POST /users/resend-verification
Request:
```json
{
  "email_address": "user@example.com"
}
```

Response:
```json
{
  "message": "Verification code resent to your email."
}
```

### POST /users/login
Request:
```json
{
  "email_address": "user@example.com",
  "raw_password": "Password123"
}
```

Response:
```json
{
  "user_uuid": "...",
  "display_name": "John Doe",
  "message": "Login successful.",
  "token_type": "Bearer"
}
```
+ Sets HTTP-only cookie `access_token`

## Security Notes

1. **Passwords**: 8-64 chars, must contain ≥1 digit, bcrypt hashed
2. **Verification**: 6-digit OTP, 10-min expiry, 5 attempt limit
3. **Cookies**: HTTP-only, SameSite=lax, secure in production
4. **Consents**: All 3 required (India residency, Terms, Privacy)
5. **Database**: Row-level constraints enforce consent=TRUE

## Next Steps

1. Add your legal content to Terms & Privacy pages
2. Style AddReminderPage to match new design
3. Implement document listing on dashboard
4. Add user profile/settings page
5. Set up production environment (HTTPS, secure cookies)

## Support

Refer to:
- IMPLEMENTATION_GUIDE.md - Architecture overview
- COMPLETE_CODE_REFERENCE.md - All page code
- Backend/migrations/ - Database schema
- Frontend/src/utils/validators.js - Validation rules

Happy coding!
