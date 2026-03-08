# Word Vault

**A compendium of language.**

[Live Demo](https://word-vault-nu.vercel.app/)

---

## Features

### Search
- Look up any English word with definitions, phonetics, and parts of speech
- Audio pronunciation playback
- Clean, readable results powered by the [Free Dictionary API](https://dictionaryapi.dev/)

### Collection
- Save words to your personal vault
- Tag and organize saved words
- Browse your collection with search and filtering

### Learning
- **Flashcards** — Review saved words with flip-card interactions
- **Quiz** — Test your knowledge with multiple-choice quizzes
- **Match Game** — Pair words with their definitions
- Spaced repetition tracking to optimize review sessions

### Profile
- Custom avatar uploads
- Username personalization
- Email/password authentication

---

## Tech Stack

| Technology | Purpose |
|---|---|
| **React Native + Expo** | Cross-platform mobile & web framework |
| **TypeScript** | Type-safe development |
| **Supabase** | Auth, PostgreSQL database, file storage |
| **Zustand** | Lightweight state management |
| **React Navigation** | Stack and bottom tab navigation |
| **RNEUI** | Themed UI component library |

---

## Project Structure

```
├── App.tsx                  # Root component, providers & navigation
├── auth/                    # Auth context & hooks
├── components/              # Reusable UI components
├── lib/                     # Supabase client, saved words, learning logic
├── navigation/              # Tab & stack navigators
├── screens/                 # App screens
│   ├── SearchScreen.tsx
│   ├── SavedScreen.tsx
│   ├── ProfileScreen.tsx
│   └── learn/               # Flashcards, quiz, match game
├── store/                   # Zustand stores (dictionary, learn)
└── theme.ts                 # Dark color palette
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

### Setup

```bash
git clone https://github.com/your-username/word-vault.git
cd word-vault
npm install
```

Create a `.env` file with your Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Run

```bash
npm start          # Start Expo dev server
npm run web        # Run web version
npm run android    # Run on Android
npm run ios        # Run on iOS
```

---

## Architecture

**Auth** — `AuthProvider` wraps the app and manages Supabase session state. Unauthenticated users see the sign-in screen; authenticated users get the full tab experience.

**State** — Zustand stores handle dictionary search results and learning progress. AsyncStorage persists sessions locally; Supabase stores user data server-side.

**Data flow** — Search queries hit the Free Dictionary API, results render in-app, and users can save words to Supabase's `saved_words` table for later review through the learning modules.

---

## License

MIT
