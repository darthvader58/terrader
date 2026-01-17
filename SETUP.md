# Terrader Setup Guide

## Prerequisites

- Node.js 16+ and npm/yarn
- Firebase account
- OpenAI API key

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Email/Password provider
   - Enable Google provider
   - Add your domain to authorized domains
4. Enable Firestore Database:
   - Go to Firestore Database
   - Create database in production mode
   - Set up security rules (see below)
5. Get your Firebase configuration:
   - Go to Project Settings > General
   - Scroll to "Your apps" section
   - Copy the firebaseConfig object

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /games/{gameId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        request.resource.data.players[request.auth.uid] != null;
    }
    
    match /leaderboards/{leaderboardId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in your credentials in `.env.local`:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# JWT Secret (generate a random string)
NEXT_PUBLIC_TOKEN_SECRET=your_jwt_secret_here
```

## Installation

1. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

2. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Building for Production

```bash
npm run build
npm start
# or
yarn build
yarn start
```

## Features

- Google OAuth and Email/Password authentication
- Real-time multiplayer crypto trading game
- AI-generated news using OpenAI GPT
- Carbon footprint tracking
- Leaderboard system
- Power-ups store
- User profiles with stats

## Game Structure

- **Duration**: 15 minutes per game
- **Starting Balance**: $500 virtual currency
- **Cryptocurrencies**: TerraCoin, Gaiacoin, Envirocoin, DharaCoin
- **Scoring**: Based on carbon score (sustainable trading practices)
- **Leaderboard**: Updates every 2 minutes

## Troubleshooting

### Firebase Authentication Issues
- Make sure you've enabled the authentication providers in Firebase Console
- Check that your domain is added to authorized domains
- Verify environment variables are correctly set

### OpenAI API Issues
- Ensure your API key is valid and has credits
- Check API rate limits
- Verify the API endpoint is accessible

### Build Errors
- Clear `.next` folder: `rm -rf .next`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version compatibility

## Support

For issues or questions, please check the main README.md or create an issue in the repository.
