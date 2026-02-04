# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.1.0] - 2026-02-04

### Added
- Sign-up flow with email/password registration via Supabase
- Email validation (regex) on sign-in/sign-up form
- Password minimum length validation (6 characters)
- Post-sign-up confirmation screen ("Check your email to confirm")
- Sign-in/sign-up toggle on the auth screen
- App branding ("WordVault") on splash and sign-in screens
- Phonetic display on search results
- Example sentences displayed under definitions
- Tab bar icons (unicode) for Search, Saved, and Profile tabs
- Dividers between saved word items
- Improved empty state on Saved screen
- SafeAreaView on Search and Saved screens to prevent status bar overlap
- Dark "goth baddie" theme across the entire app

### Changed
- Full UI overhaul: dark theme with black backgrounds (#0a0a0a), purple accents (#a855f7, #7c3aed), blood red highlights (#dc2626), and silver text (#d4d4d4)
- App.tsx now wraps app in RNEUI ThemeProvider and React Navigation DarkTheme
- SignInScreen redesigned with RNEUI Input/Button components (replaced bare RN TextInput/Button)
- SearchScreen uses ScrollView for scrollable results, search input moved to top
- Avatar component uses RNEUI Button with outline style, purple border ring
- Account component uses consistent dark styling, ScrollView wrapper
- SplashScreen displays app name with tagline
- Tab bar styled with dark background and purple active tint
- ProfileScreen wrapped with dark background

### Fixed
- `screens/SearchScreen.tsx`: `marginTop: 120` typo corrected to `marginTop: 12`
- `store/dictionaryStore.ts`: replaced `catch (err: any)` with proper `instanceof Error` typing
- `screens/SavedScreen.tsx`: replaced `any[]` with typed `SavedWord` interface
- `components/Avatar.tsx`: removed 3 debug `console.log` statements

## [1.0.0] - Initial Release

### Added
- Dictionary word search via dictionaryapi.dev
- Save/remove words to Supabase
- User authentication (email/password sign-in)
- User profiles with username and avatar upload
- Tab navigation (Search, Saved, Profile)
