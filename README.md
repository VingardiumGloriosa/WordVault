# WordVault - Project Overview

React Native + Expo dictionary app with Supabase backend. Dark "goth baddie" themed UI.

## Current Version: 1.1.0

## Architecture

### Authentication Flow
- `AuthProvider` manages Supabase session state via Context API
- Supports both sign-in and sign-up with email/password
- Sign-up triggers email confirmation flow
- `RootNavigator` conditionally renders Splash / SignIn / AppTabs based on auth state

### Theming
- Global dark theme configured in `App.tsx` via RNEUI `ThemeProvider` and React Navigation `DarkTheme`
- Palette: black (#0a0a0a), purple accents (#a855f7, #7c3aed), blood red (#dc2626), silver text (#d4d4d4)
- All screens use consistent dark styling with purple accents

### State Management
- **Auth:** Context API (`auth/AuthProvider.tsx`) with `signIn`, `signUp`, `signOut`
- **Dictionary:** Zustand store (`store/dictionaryStore.ts`)
- **Persistence:** AsyncStorage for sessions, Supabase DB for user data

### Data Flow
1. `SearchScreen` — user searches word via dictionaryapi.dev
2. Results display with phonetics, part of speech, definitions, and examples
3. User can save word → `lib/savedWords.ts` → Supabase `saved_words` table
4. `SavedScreen` fetches and displays saved words from Supabase

### Backend (Supabase)
- **Auth:** Email/password with email confirmation
- **Database:** `saved_words` table, `profiles` table
- **Storage:** `avatars` bucket for profile images

### Key Files
| File | Purpose |
|------|---------|
| `App.tsx` | Root component, theme providers, navigation |
| `auth/AuthProvider.tsx` | Auth context with signIn/signUp/signOut |
| `screens/SignInScreen.tsx` | Auth screen with sign-in/sign-up toggle |
| `screens/SearchScreen.tsx` | Word search and results display |
| `screens/SavedScreen.tsx` | Saved words list |
| `screens/ProfileScreen.tsx` | User profile wrapper |
| `components/Account.tsx` | Profile editing (username, avatar) |
| `components/Avatar.tsx` | Avatar display and upload |
| `navigation/AppTabs.tsx` | Bottom tab navigator |
| `store/dictionaryStore.ts` | Zustand store for search state |

### Key Dependencies
- `@supabase/supabase-js` — Backend
- `zustand` — State management
- `@react-navigation/*` — Navigation
- `@rneui/themed` — UI components
- `expo-image-picker` — Avatar selection
