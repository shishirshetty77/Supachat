# Chatty Setup Notes

## Email Verification Issue

### Problem
When creating a new account, you get "email not verified" error.

### Solution Options

#### Option 1: Verify Email (Recommended for production)
1. Check your email inbox (including spam folder)
2. Look for Supabase verification email
3. Click the verification link
4. Return to app and sign in

#### Option 2: Disable Email Verification (Good for development)
1. Go to Supabase Dashboard
2. Authentication → Settings
3. Scroll to "Email Auth" section
4. Turn OFF "Enable email confirmations"
5. Click Save

### After fixing:
- Try creating a new account or signing in with existing account
- The app should work without email verification

## Next Steps After Successful Login:
1. Test creating messages
2. Test file uploads (if storage bucket is set up)
3. Test with multiple users for real-time features

## Common Development Settings in Supabase:
- Disable email confirmations (for faster development)
- Enable social OAuth providers if needed
- Set up redirect URLs for OAuth: `http://localhost:3000/auth/callback`
