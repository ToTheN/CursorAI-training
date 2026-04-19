---
title: "HomeScreen image loading bug"
composer_id: 99143058-987f-4d84-8650-9096211d9dc0
source_jsonl: /Users/tusharsaini/.cursor/projects/Users-tusharsaini-CursorAI-training-Phase-2/agent-transcripts/99143058-987f-4d84-8650-9096211d9dc0/99143058-987f-4d84-8650-9096211d9dc0.jsonl
created_at: 2026-04-19T10:32:54Z
last_updated_at: 2026-04-19T11:11:48Z
unified_mode: chat
subtitle: "Edited useHome.ts, WatchlistScreen.tsx, SearchScreen.tsx, HomeScreen.tsx, App.tsx"
---
# HomeScreen image loading bug

### User

<user_query>
found a bug in existing @streamlist/src/screens/HomeScreen.tsx , images of content cards are loading every time, whenever i am coming back to home page. one bug was there in @streamlist/src/screens/DetailScreen.tsx , its fixed so dont do any changes , affects the other pages. First check what is the issue and then fix it
</user_query>

---

### Assistant

Investigating HomeScreen and ContentCard to determine why images reload when returning to the home screen.

[REDACTED]
**Tool:** `Read`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/screens/HomeScreen.tsx"
}
```

**Tool:** `Read`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/components/ContentCard.tsx"
}
```

**Tool:** `Read`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/utils/image.ts"
}
```

---

### Assistant

[REDACTED]
**Tool:** `Read`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/hooks/useHome.ts"
}
```

**Tool:** `Read`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/App.tsx"
}
```

**Tool:** `Grep`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist",
  "pattern": "unmountOnBlur|freezeOnBlur|detachInactiveScreens"
}
```

---

### Assistant

[REDACTED]
**Tool:** `Read`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/navigation/RootNavigator.tsx"
}
```

**Tool:** `Grep`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/screens/DetailScreen.tsx",
  "pattern": "loading|useFocus|useEffect|setLoading"
}
```

---

### Assistant

[REDACTED]
**Tool:** `Read`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/screens/DetailScreen.tsx",
  "limit": 200
}
```

**Tool:** `Grep`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist",
  "pattern": "detachInactiveScreens|freezeOnBlur"
}
```

---

### Assistant

[REDACTED]
**Tool:** `Grep`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist",
  "pattern": "useFocusEffect|useIsFocused"
}
```

**Tool:** `Read`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/hooks/useMovieDetail.ts",
  "limit": 120
}
```

---

### Assistant

[REDACTED]
**Tool:** `Read`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/screens/HomeScreen.tsx",
  "limit": 60
}
```

---

### Assistant

[REDACTED]
**Tool:** `Read`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/components/ScreenErrorBoundary.tsx"
}
```

**Tool:** `Read`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/hooks/useMovieDetail.ts",
  "offset": 110
}
```

---

### Assistant

[REDACTED]
**Tool:** `Grep`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist",
  "pattern": "HomeScreen"
}
```

---

### Assistant

[REDACTED]
**Tool:** `Read`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/hooks/useMovieDetail.ts"
}
```

---

### Assistant

[REDACTED]
**Tool:** `Read`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/.cursor/rules/streamlist.mdc"
}
```

---

### Assistant

[REDACTED]
**Tool:** `Glob`

```json
{
  "target_directory": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist",
  "glob_pattern": "**/*useHome*"
}
```

---

### Assistant

Identifying the issue: `useHome` always calls `setLoading(true)` at the start of `load()`, and initial state is `loading: true` and `data: null`. If `HomeScreen` remounts when returning from the stack (or when the tab is recreated), the effect re-runs `load()`, causing a full skeleton and remounted `Image` components so posters reload. Fixing by persisting the last successful home feed in module scope (same pattern as keeping warm cache) and only showing the full-screen loader when there's nothing to show for the current genre.

[REDACTED]
**Tool:** `StrReplace`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/hooks/useHome.ts",
  "old_string": "function emptyGenres(): GenreListResponse {\n  return { genres: [] };\n}\n\nfunction hasSuccessfulMovieData(",
  "new_string": "function emptyGenres(): GenreListResponse {\n  return { genres: [] };\n}\n\n/**\n * Keeps the last successful Home response so a remount (e.g. after closing a stack screen)\n * can restore data immediately and avoid `setLoading(true)` flashing the skeleton and\n * reloading every poster `Image`.\n */\nlet persistedHomeFeed: { genreKey: HomeGenreSelection; data: HomeScreenData } | null = null;\n\nfunction readPersistedHomeFeed(genreKey: HomeGenreSelection): HomeScreenData | null {\n  if (persistedHomeFeed !== null && persistedHomeFeed.genreKey === genreKey) {\n    return persistedHomeFeed.data;\n  }\n  return null;\n}\n\nfunction writePersistedHomeFeed(genreKey: HomeGenreSelection, next: HomeScreenData): void {\n  persistedHomeFeed = { genreKey, data: next };\n}\n\nfunction hasSuccessfulMovieData("
}
```

**Tool:** `StrReplace`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/hooks/useHome.ts",
  "old_string": "export function useHome(selectedGenreKey: HomeGenreSelection): UseHomeResult {\n  const [data, setData] = useState<HomeScreenData | null>(null);\n  const [loading, setLoading] = useState<boolean>(true);",
  "new_string": "export function useHome(selectedGenreKey: HomeGenreSelection): UseHomeResult {\n  const [data, setData] = useState<HomeScreenData | null>(() =>\n    readPersistedHomeFeed(selectedGenreKey),\n  );\n  const [loading, setLoading] = useState<boolean>(\n    (): boolean => readPersistedHomeFeed(selectedGenreKey) === null,\n  );"
}
```

**Tool:** `StrReplace`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/hooks/useHome.ts",
  "old_string": "  const topRatedLoadInFlightRef = useRef<boolean>(false);\n  const load = useCallback(async (): Promise<void> => {\n    setLoading(true);\n    setError(null);",
  "new_string": "  const topRatedLoadInFlightRef = useRef<boolean>(false);\n  const prevGenreKeyRef = useRef<HomeGenreSelection>(selectedGenreKey);\n  const load = useCallback(async (): Promise<void> => {\n    const hasWarmCacheForGenre: boolean = readPersistedHomeFeed(selectedGenreKey) !== null;\n    if (!hasWarmCacheForGenre) {\n      setLoading(true);\n    }\n    setError(null);"
}
```

**Tool:** `StrReplace`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/hooks/useHome.ts",
  "old_string": "  }, [selectedGenreKey]);\n  useEffect(() => {\n    load().catch(() => undefined);\n  }, [load]);",
  "new_string": "  }, [selectedGenreKey]);\n  useEffect(() => {\n    if (prevGenreKeyRef.current !== selectedGenreKey) {\n      prevGenreKeyRef.current = selectedGenreKey;\n      const cached: HomeScreenData | null = readPersistedHomeFeed(selectedGenreKey);\n      setData(cached);\n      setLoading(cached === null);\n    }\n  }, [selectedGenreKey]);\n  useEffect(() => {\n    if (data !== null) {\n      writePersistedHomeFeed(selectedGenreKey, data);\n    }\n  }, [data, selectedGenreKey]);\n  useEffect(() => {\n    load().catch(() => undefined);\n  }, [load]);"
}
```

---

### Assistant

[REDACTED]
**Tool:** `ReadLints`

```json
{
  "paths": [
    "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/hooks/useHome.ts"
  ]
}
```

**Tool:** `Read`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/package.json",
  "limit": 40
}
```

---

### Assistant

[REDACTED]
**Tool:** `Shell`

```json
{
  "command": "cd \"/Users/tusharsaini/CursorAI-training/Phase 2/streamlist\" && npm test -- --passWithNoTests 2>&1",
  "description": "Run Jest tests in streamlist"
}
```

---

### Assistant

[REDACTED]
**Tool:** `Shell`

```json
{
  "command": "cd \"/Users/tusharsaini/CursorAI-training/Phase 2/streamlist\" && CI=true npm test -- --watchman=false --passWithNoTests 2>&1",
  "description": "Run Jest with watchman disabled",
  "required_permissions": [
    "all"
  ]
}
```

---

### Assistant

[REDACTED]
**Tool:** `Shell`

```json
{
  "command": "cd \"/Users/tusharsaini/CursorAI-training/Phase 2/streamlist\" && npx eslint \"src/hooks/useHome.ts\" 2>&1",
  "description": "ESLint useHome.ts",
  "required_permissions": [
    "all"
  ]
}
```

---

### Assistant

## What was wrong

The behavior came from **`useHome`**, not from `HomeScreen` layout or `ContentCard` itself.

1. **`load()` always called `setLoading(true)`** at the start. Any time that ran again (for example after **`HomeScreen` remounted** when coming back from the stack), the UI hit `loading || data === null` and swapped the whole feed for **`HomeScreenSkeleton`**. That **unmounts every `ContentCard` and `Image`**, so posters look like they load again.

2. **Initial state was always** `loading: true` and `data: null`. After a remount, React state was reset even though the feed had already been fetched once.

So the “reload on every return” was really **a full loading/skeleton pass + list remount**, not a separate image bug in `HomeScreen.tsx`.

## What we changed

**File: `streamlist/src/hooks/useHome.ts`**

- **Module-level cache** of the last successful `HomeScreenData` for the current genre selection (`'all'` or a genre id).
- **Seed state from cache** on mount so `loading` starts `false` when we already have data.
- **When the selected genre changes**, restore that genre’s cached data immediately when available.
- **`useEffect` keeps the cache in sync** whenever `data` updates (including “load more” pagination).
- **`setLoading(true)` only if there is no warm cache** for the active genre, so background refreshes do not flash the skeleton.

No edits to `DetailScreen.tsx` or `HomeScreen.tsx`.

**Tests:** `CI=true npm test -- --watchman=false` — all 11 suites passed.

If you want a follow-up, we could add a small unit test around `useHome`’s loading/cache behavior (there was no existing `useHome` test file).

[REDACTED]

---

### User

[Image]
<image_files>
The following images were provdied by the user and saved to the workspace for future use:
1. /Users/tusharsaini/.cursor/projects/Users-tusharsaini-CursorAI-training-Phase-2/assets/Screenshot_2026-04-19_at_4.35.26_PM-58e54b2b-584f-46c2-9634-d3517460e0a1.png

These images can be copied for use in other locations.
</image_files>
<user_query>
check the screenshot attached. this is what is doing, earlier on home page, all rendered images were not again doing rendering coming back from any page but now, all images are loading every time whenever coming back to home page. 

And also more thing, global app bar when coming back to home page from detail screen , is loading/ rendering very weird. global app bar should always will visible on home page search page and watchlist page only. so instead of doing visible unvisible of globar app bar.
</user_query>

---

### Assistant

Investigating the image regression from our `useHome` changes and fixing global app bar visibility so it stays stable on Home, Search, and Watchlist.

[REDACTED]
**Tool:** `Read`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/hooks/useHome.ts",
  "limit": 230
}
```

**Tool:** `Read`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/App.tsx"
}
```

---

### Assistant

Tracing the issue: the persist `useEffect` likely writes stale home data under a new genre key when `selectedGenreKey` changes (corrupting cache). Verifying navigation state for the app bar and inspecting screen layouts.

[REDACTED]
**Tool:** `Read`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/screens/HomeScreen.tsx",
  "limit": 50
}
```

**Tool:** `Read`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/screens/SearchScreen.tsx",
  "limit": 80
}
```

**Tool:** `Read`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/screens/WatchlistScreen.tsx",
  "limit": 80
}
```

---

### Assistant

[REDACTED]
**Tool:** `Read`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/screens/HomeScreen.tsx",
  "offset": 380
}
```

**Tool:** `Grep`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/screens/SearchScreen.tsx",
  "pattern": "SafeAreaView"
}
```

**Tool:** `Grep`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/screens/WatchlistScreen.tsx",
  "pattern": "SafeAreaView"
}
```

---

### Assistant

[REDACTED]
**Tool:** `Read`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/screens/SearchScreen.tsx",
  "offset": 520,
  "limit": 120
}
```

**Tool:** `Read`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/screens/WatchlistScreen.tsx",
  "offset": 160,
  "limit": 100
}
```

---

### Assistant

[REDACTED]
**Tool:** `Read`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/__tests__/App.test.tsx"
}
```

---

### Assistant

Fixing a cache corruption bug: the persist effect ran when `selectedGenreKey` changed while `data` still referred to the previous genre, writing stale data under the wrong key (breaking poster paths / rails). Moving the app bar into Home, Search, and Watchlist to remove App-level show/hide toggling.

[REDACTED]
**Tool:** `Write`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/components/GlobalAppBar.tsx",
  "contents": "/**\n * @format\n */\n\nimport React from 'react';\nimport { Pressable, StyleSheet, View } from 'react-native';\nimport Ionicons from 'react-native-vector-icons/Ionicons';\nimport { SafeAreaView } from 'react-native-safe-area-context';\nimport { StreamListLogo } from './StreamListLogo';\nimport { colors } from '../theme/colors';\nimport { spacing } from '../theme/spacing';\n\nconst notificationIconSize: number = spacing.lg;\n\nexport function GlobalAppBar(): React.ReactElement {\n  return (\n    <SafeAreaView edges={['top']} style={styles.safeAreaTop}>\n      <View style={styles.appBar} accessibilityRole=\"header\">\n        <View style={styles.appBarLeading}>\n          <StreamListLogo />\n        </View>\n        <Pressable\n          accessibilityLabel=\"Notifications\"\n          accessibilityRole=\"button\"\n          hitSlop={spacing.xs}\n        >\n          <Ionicons\n            name=\"notifications\"\n            size={notificationIconSize}\n            color={colors.on_surface_variant}\n          />\n        </Pressable>\n      </View>\n    </SafeAreaView>\n  );\n}\n\nconst styles = StyleSheet.create({\n  safeAreaTop: {\n    backgroundColor: colors.surface,\n  },\n  appBar: {\n    flexDirection: 'row',\n    alignItems: 'center',\n    justifyContent: 'space-between',\n    paddingHorizontal: spacing.lg,\n    paddingVertical: spacing.xs,\n    backgroundColor: colors.surface,\n  },\n  appBarLeading: {\n    flexDirection: 'row',\n    alignItems: 'center',\n    flexShrink: 1,\n  },\n});\n"
}
```

**Tool:** `StrReplace`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/hooks/useHome.ts",
  "old_string": "  useEffect(() => {\n    if (data !== null) {\n      writePersistedHomeFeed(selectedGenreKey, data);\n    }\n  }, [data, selectedGenreKey]);",
  "new_string": "  useEffect(() => {\n    if (data !== null) {\n      writePersistedHomeFeed(selectedGenreKey, data);\n    }\n    // Only `data` in deps: when `selectedGenreKey` changes before `load()` finishes, the\n    // previous `data` must not be written under the new key (corrupts cache / poster URLs).\n  }, [data, selectedGenreKey]);"
}
```

---

### Assistant

[REDACTED]
**Tool:** `StrReplace`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/hooks/useHome.ts",
  "old_string": "  useEffect(() => {\n    if (data !== null) {\n      writePersistedHomeFeed(selectedGenreKey, data);\n    }\n    // Only `data` in deps: when `selectedGenreKey` changes before `load()` finishes, the\n    // previous `data` must not be written under the new key (corrupts cache / poster URLs).\n  }, [data, selectedGenreKey]);",
  "new_string": "  useEffect(() => {\n    if (data !== null) {\n      writePersistedHomeFeed(selectedGenreKey, data);\n    }\n    // Only re-run when `data` changes. If `selectedGenreKey` were a dependency, this effect\n    // would run when the user picks a new genre while `data` still reflects the previous\n    // selection — and would persist that stale payload under the wrong key (breaks posters).\n    // eslint-disable-next-line react-hooks/exhaustive-deps -- selectedGenreKey is read from the render that produced this `data`\n  }, [data]);"
}
```

---

### Assistant

[REDACTED]
**Tool:** `Write`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/App.tsx",
  "contents": "/**\n * @format\n */\n\nimport { createNavigationContainerRef } from '@react-navigation/native';\nimport React from 'react';\nimport { StatusBar, StyleSheet, View } from 'react-native';\nimport { SafeAreaProvider } from 'react-native-safe-area-context';\nimport { RootNavigator } from './src/navigation/RootNavigator';\nimport type { RootStackParamList } from './src/navigation/types';\nimport { colors } from './src/theme/colors';\n\nconst rootNavigationRef = createNavigationContainerRef<RootStackParamList>();\n\nfunction App() {\n  return (\n    <SafeAreaProvider>\n      <StatusBar barStyle=\"light-content\" />\n      <View style={styles.mainContent}>\n        <RootNavigator navigationRef={rootNavigationRef} />\n      </View>\n    </SafeAreaProvider>\n  );\n}\n\nconst styles = StyleSheet.create({\n  mainContent: {\n    flex: 1,\n    backgroundColor: colors.surface,\n  },\n});\n\nexport default App;\n"
}
```

**Tool:** `StrReplace`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/screens/HomeScreen.tsx",
  "old_string": "import { ContentCard } from '../components/ContentCard';",
  "new_string": "import { ContentCard } from '../components/ContentCard';\nimport { GlobalAppBar } from '../components/GlobalAppBar';"
}
```

**Tool:** `StrReplace`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/screens/HomeScreen.tsx",
  "old_string": "  return (\n    <SafeAreaView style={styles.root} edges={['left', 'right']}>\n      <ScreenErrorBoundary onRetry={home.refetch}>\n        <HomeScreenContent\n          home={home}\n          selectedGenreKey={selectedGenreKey}\n          onSelectGenre={onSelectGenre}\n        />\n      </ScreenErrorBoundary>\n    </SafeAreaView>\n  );",
  "new_string": "  return (\n    <View style={styles.screenWrap}>\n      <GlobalAppBar />\n      <SafeAreaView style={styles.root} edges={['left', 'right']}>\n        <ScreenErrorBoundary onRetry={home.refetch}>\n          <HomeScreenContent\n            home={home}\n            selectedGenreKey={selectedGenreKey}\n            onSelectGenre={onSelectGenre}\n          />\n        </ScreenErrorBoundary>\n      </SafeAreaView>\n    </View>\n  );"
}
```

**Tool:** `StrReplace`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/screens/HomeScreen.tsx",
  "old_string": "import {\n  Pressable,\n  ScrollView,\n  StyleSheet,\n  Text,\n  useWindowDimensions,\n  View,\n  type NativeScrollEvent,\n  type NativeSyntheticEvent,\n} from 'react-native';",
  "new_string": "import {\n  Pressable,\n  ScrollView,\n  StyleSheet,\n  Text,\n  useWindowDimensions,\n  View,\n  type NativeScrollEvent,\n  type NativeSyntheticEvent,\n} from 'react-native';"
}
```

---

### Assistant

[REDACTED]
**Tool:** `StrReplace`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/screens/HomeScreen.tsx",
  "old_string": "const styles = StyleSheet.create({\n  root: {\n    flex: 1,\n    backgroundColor: colors.surface,\n    padding: spacing.md,\n  },",
  "new_string": "const styles = StyleSheet.create({\n  screenWrap: {\n    flex: 1,\n    backgroundColor: colors.surface,\n  },\n  root: {\n    flex: 1,\n    backgroundColor: colors.surface,\n    padding: spacing.md,\n  },"
}
```

**Tool:** `StrReplace`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/screens/SearchScreen.tsx",
  "old_string": "import { ContentCard } from '../components/ContentCard';",
  "new_string": "import { ContentCard } from '../components/ContentCard';\nimport { GlobalAppBar } from '../components/GlobalAppBar';"
}
```

**Tool:** `StrReplace`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/screens/SearchScreen.tsx",
  "old_string": "  return (\n    <SafeAreaView style={styles.root} edges={['left', 'right']}>\n      <ScreenErrorBoundary\n        onRetry={(): void => {\n          search.refetch();\n          browse.refetch();\n        }}\n      >\n        <SearchScreenContent\n          query={query}\n          setQuery={setQuery}\n          search={search}\n          browse={browse}\n          recentSearches={recentSearches}\n          clearAllRecentSearches={clearAllRecentSearches}\n        />\n      </ScreenErrorBoundary>\n    </SafeAreaView>\n  );",
  "new_string": "  return (\n    <View style={styles.screenWrap}>\n      <GlobalAppBar />\n      <SafeAreaView style={styles.root} edges={['left', 'right']}>\n        <ScreenErrorBoundary\n          onRetry={(): void => {\n            search.refetch();\n            browse.refetch();\n          }}\n        >\n          <SearchScreenContent\n            query={query}\n            setQuery={setQuery}\n            search={search}\n            browse={browse}\n            recentSearches={recentSearches}\n            clearAllRecentSearches={clearAllRecentSearches}\n          />\n        </ScreenErrorBoundary>\n      </SafeAreaView>\n    </View>\n  );"
}
```

---

### Assistant

[REDACTED]
**Tool:** `Read`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/screens/SearchScreen.tsx",
  "limit": 20
}
```

**Tool:** `StrReplace`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/screens/SearchScreen.tsx",
  "old_string": "const styles = StyleSheet.create({\n  root: {\n    flex: 1,\n    backgroundColor: colors.surface,\n    padding: spacing.md,\n  },",
  "new_string": "const styles = StyleSheet.create({\n  screenWrap: {\n    flex: 1,\n    backgroundColor: colors.surface,\n  },\n  root: {\n    flex: 1,\n    backgroundColor: colors.surface,\n    padding: spacing.md,\n  },"
}
```

**Tool:** `StrReplace`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/screens/WatchlistScreen.tsx",
  "old_string": "import { ContentCard } from '../components/ContentCard';",
  "new_string": "import { ContentCard } from '../components/ContentCard';\nimport { GlobalAppBar } from '../components/GlobalAppBar';"
}
```

**Tool:** `StrReplace`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/screens/WatchlistScreen.tsx",
  "old_string": "  return (\n    <SafeAreaView style={styles.root} edges={['left', 'right']}>\n      <ScreenErrorBoundary onRetry={refetch}>\n        {isEmpty ? <WatchlistEmptyState popular={popular} /> : <WatchlistWithDataPlaceholder />}\n      </ScreenErrorBoundary>\n    </SafeAreaView>\n  );",
  "new_string": "  return (\n    <View style={styles.screenWrap}>\n      <GlobalAppBar />\n      <SafeAreaView style={styles.root} edges={['left', 'right']}>\n        <ScreenErrorBoundary onRetry={refetch}>\n          {isEmpty ? <WatchlistEmptyState popular={popular} /> : <WatchlistWithDataPlaceholder />}\n        </ScreenErrorBoundary>\n      </SafeAreaView>\n    </View>\n  );"
}
```

**Tool:** `StrReplace`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/screens/WatchlistScreen.tsx",
  "old_string": "const styles = StyleSheet.create({\n  root: {\n    flex: 1,\n    backgroundColor: colors.surface,\n    padding: spacing.md,\n  },",
  "new_string": "const styles = StyleSheet.create({\n  screenWrap: {\n    flex: 1,\n    backgroundColor: colors.surface,\n  },\n  root: {\n    flex: 1,\n    backgroundColor: colors.surface,\n    padding: spacing.md,\n  },"
}
```

---

### Assistant

[REDACTED]
**Tool:** `Read`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/screens/WatchlistScreen.tsx",
  "limit": 20
}
```

---

### Assistant

[REDACTED]
**Tool:** `Read`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/screens/HomeScreen.tsx",
  "limit": 20
}
```

---

### Assistant

[REDACTED]
**Tool:** `ReadLints`

```json
{
  "paths": [
    "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/hooks/useHome.ts",
    "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/App.tsx",
    "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/components/GlobalAppBar.tsx",
    "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/screens/HomeScreen.tsx",
    "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/screens/SearchScreen.tsx",
    "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/screens/WatchlistScreen.tsx"
  ]
}
```

**Tool:** `Shell`

```json
{
  "command": "cd \"/Users/tusharsaini/CursorAI-training/Phase 2/streamlist\" && CI=true npm test -- --watchman=false 2>&1 && npx eslint App.tsx src/components/GlobalAppBar.tsx src/hooks/useHome.ts src/screens/HomeScreen.tsx src/screens/SearchScreen.tsx src/screens/WatchlistScreen.tsx 2>&1",
  "description": "Run tests and ESLint on changed files",
  "required_permissions": [
    "all"
  ]
}
```

---

### Assistant

[REDACTED]
**Tool:** `Grep`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/screens/ProfileScreen.tsx",
  "pattern": "SafeAreaView"
}
```

---

### Assistant

[REDACTED]
**Tool:** `Read`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/hooks/useHome.ts",
  "offset": 208,
  "limit": 35
}
```

---

### Assistant

[REDACTED]
**Tool:** `StrReplace`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/hooks/useHome.ts",
  "old_string": "  useEffect(() => {\n    if (data !== null) {\n      writePersistedHomeFeed(selectedGenreKey, data);\n    }\n    // Only re-run when `data` changes. If `selectedGenreKey` were a dependency, this effect\n    // would run when the user picks a new genre while `data` still reflects the previous\n    // selection — and would persist that stale payload under the wrong key (breaks posters).\n    // eslint-disable-next-line react-hooks/exhaustive-deps -- selectedGenreKey is read from the render that produced this `data`\n  }, [data]);",
  "new_string": "  useEffect(() => {\n    if (data !== null) {\n      writePersistedHomeFeed(selectedGenreKey, data);\n    }\n    /* Persist only when `data` changes: if `selectedGenreKey` were a dependency, switching\n     * genres would write the previous rail under the new key (corrupts posters). */\n    // eslint-disable-next-line react-hooks/exhaustive-deps -- selectedGenreKey matches the render for this `data`\n  }, [data]);"
}
```

---

### Assistant

[REDACTED]
**Tool:** `Shell`

```json
{
  "command": "cd \"/Users/tusharsaini/CursorAI-training/Phase 2/streamlist\" && npx eslint \"src/hooks/useHome.ts\" 2>&1",
  "description": "Verify ESLint on useHome.ts",
  "required_permissions": [
    "all"
  ]
}
```

---

### Assistant

## 1. Posters stuck as grey placeholders / “reloading”

The screenshot matches `ContentCard`’s **`imageUri === null`** path (title in the grey frame), not a slow network load.

That came from a **bad interaction in `useHome`**: the persist effect depended on **`[data, selectedGenreKey]`**. When you changed genre, `selectedGenreKey` updated **before** `data` was refetched, so the effect ran once with **old `data` + new `selectedGenreKey`** and **`writePersistedHomeFeed` stored the wrong feed under the new key**. That corrupted the in-memory cache and led to wrong/empty rails and **`buildImageUrl` returning `null`** for many items.

**Change:** persist only runs when **`data` changes** (`[data]`). `selectedGenreKey` is still used from the render that produced that `data`, so keys stay aligned.

**File:** `streamlist/src/hooks/useHome.ts`

---

## 2. Global app bar flicker / weird behavior when leaving Detail

The bar was **mounted and unmounted in `App.tsx`** based on the current route (`Detail` / `SeeAll`), so the whole header (and safe area) **reappeared in one frame** when popping back to tabs.

**Change:** removed that toggle from `App.tsx` and added a shared **`GlobalAppBar`** that is rendered **only** on:

- `HomeScreen`
- `SearchScreen`
- `WatchlistScreen`

**Profile** no longer gets this bar (it only had it before because `App` showed it for every route except Detail/SeeAll). Detail / See All stay full-screen with no duplicate header.

**Files:**

- `streamlist/src/components/GlobalAppBar.tsx` (new)
- `streamlist/App.tsx` (only `StatusBar` + `RootNavigator`)
- `streamlist/src/screens/HomeScreen.tsx`
- `streamlist/src/screens/SearchScreen.tsx`
- `streamlist/src/screens/WatchlistScreen.tsx`

---

Tests: `CI=true npm test -- --watchman=false` — all 11 suites passed. ESLint clean on touched files.

After a rebuild, if you still see placeholders once, do a full reload so any **old corrupted in-memory cache** from before this fix is cleared.

[REDACTED]

