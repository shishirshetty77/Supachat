# Chatty - Modern Real-time Chat Application

A sleek, modern real-time chat application that combines the minimalism of WhatsApp Web with the visual polish of Facebook Messenger. Built with Next.js 15, Supabase, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Real-time messaging** with instant delivery and read receipts
- **Beautiful UI/UX** with smooth animations using Framer Motion
- **Authentication** with email/password, Google, and GitHub OAuth
- **File sharing** with support for images and documents
- **Emoji picker** for expressive messaging
- **Online/offline presence** indicators
- **Typing indicators** to show when someone is typing
- **Dark/Light theme** support
- **Responsive design** that works on all devices
- **Message read receipts** with timestamp information
- **Profile management** with avatar and bio
- **Search functionality** to find chats quickly

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Animation**: Framer Motion
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time, Storage)
- **Icons**: Lucide React
- **Date handling**: date-fns
- **Notifications**: Sonner (react-hot-toast alternative)
- **Emoji**: emoji-picker-react

## 🏗️ Architecture

### Database Schema
- **users**: User profiles with online status and metadata
- **chats**: Chat rooms (1-on-1 or group) with last message reference
- **chat_members**: Many-to-many relationship between users and chats
- **messages**: Chat messages with support for different types (text, image, file, emoji)
- **message_reads**: Read receipts tracking
- **typing_indicators**: Real-time typing status

### Security
- Row Level Security (RLS) policies ensure users can only access their own data
- Secure authentication with JWT tokens
- File upload restrictions and validation
- XSS protection with proper sanitization

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0 or later
- npm or yarn
- Supabase account

### 1. Clone the repository
```bash
git clone <repository-url>
cd chatty
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API to get your keys
3. Copy the database schema from `supabase/schema.sql` and run it in the Supabase SQL editor
4. Set up authentication providers (Google, GitHub) in Authentication > Settings
5. Create a storage bucket named `chat-files` for file uploads

### 4. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Optional for advanced features
```

### 5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📱 Usage

### Authentication
1. **Sign Up**: Create a new account with email/password or use OAuth (Google/GitHub)
2. **Sign In**: Log in to your existing account
3. **Profile**: Update your username, avatar, and bio

### Messaging
1. **Start Chatting**: Click on a user from the sidebar to start a conversation
2. **Send Messages**: Type in the message box at the bottom and press Enter or click Send
3. **File Sharing**: Click the paperclip icon to upload images or documents
4. **Emojis**: Click the smile icon to open the emoji picker
5. **Read Receipts**: See when your messages have been read (blue checkmarks)

### Features
- **Online Status**: See when other users are online (green dot)
- **Typing Indicators**: See when someone is typing
- **Message Types**: Send text, images, files, or emojis
- **Theme Toggle**: Switch between light and dark themes
- **Search**: Find specific chats quickly using the search bar

## 🔧 Configuration

### Customizing the Theme
The app uses Tailwind CSS with shadcn/ui components. You can customize the theme by modifying:
- `tailwind.config.ts` for Tailwind configuration
- `src/app/globals.css` for CSS variables
- `components.json` for shadcn/ui component configuration

### Real-time Configuration
Real-time features are powered by Supabase Realtime. The following tables have real-time subscriptions:
- `messages` - for instant message delivery
- `typing_indicators` - for typing status
- `users` - for online/offline status

### File Upload Settings
- Maximum file size: 10MB (configurable in `MessageInput.tsx`)
- Supported formats: Images, PDFs, Word documents, text files
- Files are stored in Supabase Storage with public URLs

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Links

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion)

## 🐛 Troubleshooting

### Common Issues

1. **Authentication not working**: Check your Supabase URL and keys in `.env.local`
2. **Real-time not updating**: Ensure your RLS policies are correctly set up
3. **File uploads failing**: Check your Supabase storage bucket permissions
4. **Styling issues**: Make sure Tailwind CSS is properly configured

### Getting Help
- Check the Issues section for common problems
- Review the Supabase documentation
- Join community discussions

---

Built with ❤️ using Next.js and Supabase
