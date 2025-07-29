# Chatty Setup Guide

## Quick Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Set up Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully initialized
3. Go to Project Settings > API and copy your keys

### 3. Database Setup

1. In your Supabase dashboard, go to the SQL Editor
2. Copy the entire content from `supabase/schema.sql`
3. Paste it in the SQL Editor and run it
4. This will create all necessary tables, functions, and RLS policies

### 4. Authentication Setup

1. Go to Authentication > Settings in your Supabase dashboard
2. Configure OAuth providers:
   - **Google**: Add your Google OAuth client ID and secret
   - **GitHub**: Add your GitHub OAuth app ID and secret
3. Add your domain to the redirect URLs:
   - For development: `http://localhost:3000/auth/callback`
   - For production: `https://yourdomain.com/auth/callback`

### 5. Storage Setup

1. Go to Storage in your Supabase dashboard
2. Create a new bucket named `chat-files`
3. Set the bucket to public
4. Configure RLS policies for the bucket (optional, but recommended)

### 6. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 7. Run the Application

```bash
npm run dev
```

## Verification Steps

1. **Authentication**: Try signing up with email/password
2. **OAuth**: Test Google/GitHub login
3. **Real-time**: Open two browser windows and send messages
4. **File Upload**: Try uploading an image or document
5. **Theme**: Toggle between light and dark mode

## Common Issues

### Database Connection
- Make sure your Supabase URL and keys are correct
- Verify the database schema was applied correctly

### Authentication Issues
- Check OAuth app settings and redirect URLs
- Ensure email confirmation is handled properly

### Real-time Not Working
- Verify RLS policies are set up correctly
- Check browser console for WebSocket errors

### File Upload Issues
- Ensure the `chat-files` bucket exists and is configured
- Check file size limits and supported formats

## Development Tips

- Use the Supabase dashboard to monitor real-time connections
- Check the logs for authentication and database errors
- Use browser dev tools to debug WebSocket connections
- Test with multiple users to verify real-time functionality

## Production Deployment

1. Build the application: `npm run build`
2. Set up environment variables on your hosting platform
3. Configure custom domain and SSL
4. Update Supabase settings with production URLs
5. Test all functionality in production environment
