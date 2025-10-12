# Password Reset & Secret Token Implementation

## Overview
This update adds a comprehensive password reset system using secret tokens, and improves the login page UI by reorganizing the status information display.

## Changes Made

### Backend Changes (`backend/app/`)

#### 1. Database Schema (`db.py`)
- Added `secret_token TEXT UNIQUE NOT NULL` column to users table
- Secret tokens are unique 32-character hexadecimal strings

#### 2. API Endpoints (`app.py`)

**New Request Models:**
- `PasswordResetRequest`: For resetting password with username + secret token
- `VerifySecretTokenRequest`: For verifying username and secret token match

**Modified Endpoints:**
- `POST /auth/login`: Now generates and returns secret token for new users
  - Returns `secret_token` and `is_new_user: true` only for registrations
  - Token is a 32-character hex string generated via `secrets.token_hex(16)`

**New Endpoints:**
- `POST /auth/verify-secret-token`: Verify username and secret token match
- `POST /auth/reset-password`: Reset password using username + secret token
- `GET /auth/get-secret-token`: Retrieve secret token (requires password confirmation)

### Frontend Changes

#### 1. Login Page (`frontend/my-app/src/LoginPage/`)

**Login.jsx:**
- Moved status information (username/password validation) below the input footer
- Added "Forgot password?" clickable text on the left side of the eye icon
- Implemented forgot password modal with two-step process:
  1. Enter username + secret token → Verify
  2. Enter new password + confirm → Reset
- Added secret token display modal for new registrations:
  - Shows secret token immediately after registration
  - User cannot close for 5 seconds (forced viewing)
  - Clear warning message about saving the token

**Login.css:**
- Updated `.input-footer` to use flexbox with space-between
- Added `.forgot-password-link` styling (green, underline on hover)
- Added `.form-status-below` for status messages below inputs
- Added comprehensive modal styles:
  - `.modal-overlay`: Full-screen darkened backdrop
  - `.modal-content`: Centered modal box with dark theme
  - `.modal-form-group`: Form field styling
  - `.secret-token-display`: Special styling for displaying token
  - `.modal-timer`: Timer message for forced viewing

#### 2. Account Information (`frontend/my-app/src/SettingsComponents/`)

**AccountInformation.jsx:**
- Added "View Secret Token" button in settings
- Implemented password-protected secret token viewing
- Modal requires password confirmation before revealing token
- Two-step modal process:
  1. Enter password → Verify
  2. Display secret token

**SettingsPanel.css:**
- Added all modal styles (same as Login.css) for consistency
- Higher z-index (3000) to appear above settings panel

## User Flow

### New User Registration
1. User enters username and password → clicks "Access"
2. Backend creates account and generates secret token
3. Modal appears displaying the secret token
4. User cannot close modal for 5 seconds
5. User saves token somewhere safe
6. User can now access the app

### Password Reset
1. User clicks "Forgot password?" on login page
2. Modal opens requesting username and secret token
3. After verification, new modal shows password reset fields
4. User enters new password twice
5. Password is reset successfully
6. User can now login with new password

### View Secret Token (Existing Users)
1. User navigates to Settings → Account Information
2. Clicks "View Secret Token" button
3. Modal requests password confirmation
4. After password verified, secret token is displayed
5. User can copy/save the token

## Security Considerations

- Secret tokens are unique per user and stored in database
- Password required to view secret token in settings
- Tokens are 32-character hex strings (high entropy)
- Database uses UNIQUE constraint on secret_token column
- Password reset requires both username AND secret token

## Migration Notes

**IMPORTANT:** Existing users in the database will need migration because the new schema requires `secret_token NOT NULL`:

### Option 1: Fresh Start (Development)
Uncomment `clear_db()` in `db.py` to reset the database.

### Option 2: Manual Migration (Production)
Run SQL migration to add secret tokens to existing users:

```sql
-- Add column as nullable first
ALTER TABLE users ADD COLUMN secret_token TEXT;

-- Generate tokens for existing users (example using Python)
-- Run a script to update each user with a unique token

-- Then make it NOT NULL and UNIQUE
ALTER TABLE users ALTER COLUMN secret_token SET NOT NULL;
CREATE UNIQUE INDEX idx_users_secret_token ON users(secret_token);
```

## Testing Checklist

- [ ] Register new user → secret token modal appears
- [ ] Cannot close secret token modal for 5 seconds
- [ ] Secret token is saved in database
- [ ] Forgot password flow with correct credentials works
- [ ] Forgot password flow with wrong credentials fails
- [ ] View secret token in settings with correct password works
- [ ] View secret token in settings with wrong password fails
- [ ] Status messages moved below input footer correctly
- [ ] "Forgot password?" link appears and works
- [ ] UI is responsive and modals are centered

## Future Improvements

- Email-based password reset option
- Ability to regenerate secret token (with old password)
- Secret token in encrypted format in database
- 2FA integration
- Password reset rate limiting
