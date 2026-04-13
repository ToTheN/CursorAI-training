# Architectural Decisions (StreamList)

## React Native CLI and layout

- The app is a React Native CLI project (not Expo managed). All application code lives under `src/` as described in this document and project rules.

## Navigation

- **React Navigation v6** is the only navigation library. The root is a **native stack** with a **bottom tab** screen (`MainTabs`) plus a shared **Detail** screen for deep links and stack pushes from tabs.

## Data and API

- **Axios** is configured once in `src/api/client.ts` with interceptors. Hooks and screens do not import Axios directly.
- **Custom hooks** (`useHome`, `useSearch`, `useMovieDetail`) own loading and error state; screens do not call `fetch` or `useEffect` for data loading in this scaffold.
- **TMDB**-shaped types live in `src/api/types.ts` and will be validated when endpoints are implemented.

## State

- **Zustand** with **AsyncStorage** persistence is used only for the watchlist (`src/store/watchlistStore.ts`), per project rules.

## Styling

- **StyleSheet.create** only; no NativeWind, styled-components, or pre-built component libraries.
- Colors and spacing come from `src/theme/colors.ts` and `src/theme/spacing.ts`. No raw hex in feature components.

## Fonts

- **Manrope** and **Inter** are bundled from `@expo-google-fonts/manrope` and `@expo-google-fonts/inter` by copying `.ttf` files into `assets/fonts/` and linking with `react-native-asset` / `react-native.config.js`.
- **Expo modules** were not used for font loading: `install-expo-modules` did not report a compatible Expo SDK for React Native 0.85 at project creation time, so `expo-font` + `useFonts` from those packages was not adopted.

## Environment

- Local secrets and base URLs are supplied via `.env` (not committed), transformed at build time with **babel-plugin** `react-native-dotenv` (`@env` module). Use `.env.example` as the template.
