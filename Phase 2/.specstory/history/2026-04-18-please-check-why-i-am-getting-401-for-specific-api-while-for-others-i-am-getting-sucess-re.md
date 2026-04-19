---
title: "API key validation issue"
composer_id: a584e76a-8166-4dd1-9464-18789b19c7f9
source_jsonl: /Users/tusharsaini/.cursor/projects/Users-tusharsaini-CursorAI-training-Phase-2/agent-transcripts/a584e76a-8166-4dd1-9464-18789b19c7f9/a584e76a-8166-4dd1-9464-18789b19c7f9.jsonl
created_at: 2026-04-18T10:22:52Z
last_updated_at: 2026-04-18T10:31:30Z
unified_mode: agent
subtitle: "Edited client.ts"
---
# API key validation issue

### User

<user_query>
please check why i am getting 401 for specific api . while for others i am getting sucess response.

api url. - https://api.themoviedb.org/3/trending/movie/week?page=1

{status_code: 7, status_message: "Invalid API key: You must be granted a valid key.", success: false}
status_code
: 
7
status_message
: 
"Invalid API key: You must be granted a valid key."
success
: 
false
</user_query>

---

### Assistant

Tracing how the app configures and sends the TMDB API key and comparing it with calls that succeed.

[REDACTED]
**Tool:** `Read`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/api/client.ts"
}
```

**Tool:** `Read`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/.env.example"
}
```

**Tool:** `Grep`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist",
  "pattern": "trending|api_key|TMDB|themoviedb"
}
```

---

### Assistant

[REDACTED]
**Tool:** `Read`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/api/movies.ts"
}
```

**Tool:** `Grep`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist",
  "pattern": "api_key|Authorization|apiClient"
}
```

---

### Assistant

[REDACTED]
**Tool:** `Read`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/api/client.ts",
  "offset": 70
}
```

---

### Assistant

Here’s what’s going on.

## What that response means

TMDB’s **`status_code: 7`** with **`"Invalid API key: You must be granted a valid key."`** means the server did **not** accept any valid credential on that request. It is **not** specific to “trending” — the same auth rules apply to `/trending/movie/week` as to `/movie/top_rated`, `/discover/movie`, etc.

## Most likely cause: calling the URL with no auth

If you open this in a browser or call it without headers:

`https://api.themoviedb.org/3/trending/movie/week?page=1`

there is **no** `api_key` query parameter and **no** `Authorization` header, so TMDB returns exactly this error. “Other” calls may look like they work because:

- They’re sent from your app (with a token), while this URL was tested **naked** in the address bar or in a tool where only some requests had auth, or  
- They use **`?api_key=...`** in the URL and you didn’t add it for this one.

So the fix for a **manual** test is either:

- Append your **v3 API key**:  
  `.../trending/movie/week?page=1&api_key=YOUR_V3_API_KEY`  
  or  
- Send a header:  
  `Authorization: Bearer YOUR_API_READ_ACCESS_TOKEN`  
  (TMDB’s dashboard “API Read Access Token” JWT works as Bearer on v3.)

## How your app is supposed to authenticate

Your shared client only adds auth when `TMDB_ACCESS_TOKEN` is set and uses **Bearer**, not `api_key` in the query string:

```75:84:/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/api/client.ts
const hasAccessToken: boolean =
  typeof TMDB_ACCESS_TOKEN === 'string' && TMDB_ACCESS_TOKEN.length > 0;

export const apiClient = axios.create({
  baseURL: resolvedBaseUrl,
  timeout: 20000,
  ...(hasAccessToken
    ? { headers: { Authorization: `Bearer ${TMDB_ACCESS_TOKEN}` } }
    : {}),
});
```

Trending uses the same client as the other movie calls:

```13:18:/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/api/movies.ts
export async function fetchTrendingMoviesWeek(
  page: number = DEFAULT_PAGE,
): Promise<PaginatedResponse<MovieListItem>> {
  const response = await apiClient.get<PaginatedResponse<MovieListItem>>('/trending/movie/week', {
    params: { page },
  });
```

So if **only** trending failed **inside the app** while other TMDB calls succeeded with the same build, that would be unusual (same axios instance, same default headers). In that case you’d verify:

1. **`TMDB_ACCESS_TOKEN`** is present in `.env`, Metro picked it up (restart/clear cache if needed), and the value is the **API Read Access Token** from [TMDB Settings → API](https://www.themoviedb.org/settings/api), not a mistyped or truncated string.  
2. The failing request is actually going through **`apiClient`** (not a raw `fetch` / different base URL / proxy stripping `Authorization`).

## Summary

- **401 + status_code 7** = missing or invalid TMDB credentials on **that** request.  
- **Trending is not special** — the usual issue is testing the URL **without** `api_key` or **without** the `Authorization: Bearer ...` header.  
- Align manual tests with how your app sends the **Bearer** token (or add `api_key` to the URL for quick browser checks).

**Security note:** Your `.env.example` contains a value that looks like a real JWT. Example files should use placeholders only; if that token is real, rotate it in the TMDB dashboard and avoid committing it.

[REDACTED]

---

### User

<user_query>
the error i am getting for 

https://api.themoviedb.org/3/search/movie?query=Adventure&page=1

while top related and discover movies api are giving 200 with data
</user_query>

---

### Assistant

Tracing how search requests are made versus top-rated/discover in the codebase.

[REDACTED]
**Tool:** `Grep`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist",
  "pattern": "search/movie|searchMovies"
}
```

**Tool:** `Read`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/api/client.ts"
}
```

---

### Assistant

[REDACTED]
**Tool:** `Read`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/hooks/useSearch.ts",
  "limit": 100
}
```

---

### Assistant

In your project, **search is not implemented differently** from top-rated or discover: everything goes through the same `apiClient` and the same `Authorization: Bearer …` header when `TMDB_ACCESS_TOKEN` is set.

```61:70:/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/api/movies.ts
export async function searchMovies(
  query: string,
  page: number = DEFAULT_PAGE,
  signal?: AbortSignal,
): Promise<PaginatedResponse<MovieListItem>> {
  const response = await apiClient.get<PaginatedResponse<MovieListItem>>('/search/movie', {
    params: { query, page },
    ...(signal !== undefined ? { signal } : {}),
  });
  return response.data;
}
```

TMDB also treats **`/search/movie` the same as `/discover/movie` and `/movie/top_rated`** for authentication: you need a valid **v3 `api_key` query param** or a valid **`Authorization: Bearer <API Read Access Token>`** header. There is no special “search doesn’t need a key” rule.

So if **search** returns **401 / invalid API key** while **discover and top_rated** return **200**, that almost always means the **failing request is not sending the same credentials** as the working ones—not that the search route is broken.

Typical cases:

1. **Pasting URLs in the browser**  
   `https://api.themoviedb.org/3/search/movie?query=Adventure&page=1` has **no** `api_key` and **no** Bearer header, so TMDB returns invalid key. If you tried discover/top_rated **with** `&api_key=...` in the URL (or from a client that adds auth), those would 200 while search would not.

2. **API client / Postman**  
   One request might inherit **folder or environment** auth (Bearer or `api_key`) and another might not (e.g. a one-off URL without the saved auth).

3. **Same app, different behavior**  
   That would be unexpected here because the code path is the same. The useful check is to compare **request headers** (especially `Authorization`) for a working call vs `/search/movie` in your network inspector—they should match.

**What to do:** Call search the same way you call the endpoints that work:

- **curl example (Bearer):**  
  `curl -H "Authorization: Bearer YOUR_READ_ACCESS_TOKEN" "https://api.themoviedb.org/3/search/movie?query=Adventure&page=1"`

- Or add **`&api_key=YOUR_V3_API_KEY`** to the URL if you test in the browser.

If both discover and search are tested **with identical** Bearer (or identical `api_key`), they should both succeed or both fail with the same credential error—not only search.

[REDACTED]

---

### User

<user_query>
please check in existing @streamlist/src/api/client.ts and other api related files and check how top/related and discover api is giving 200 with data while search api and trending api is giving 401. 
Because the same you have mentioned, for all api's same things are being used.
</user_query>

---

### Assistant

Tracing API usage across the codebase for differences that could cause 401 on search/trending but not on discover/top_rated.

[REDACTED]
**Tool:** `Read`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/api/client.ts"
}
```

**Tool:** `Read`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/babel.config.js"
}
```

**Tool:** `Grep`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src",
  "pattern": "apiClient|fetchTrending|searchMovies|fetchDiscover|top_rated|trending"
}
```

---

### Assistant

[REDACTED]
**Tool:** `Read`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/api/client.ts"
}
```

**Tool:** `Grep`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist",
  "pattern": "axios|apiClient|mock",
  "glob": "**/jest*"
}
```

**Tool:** `Read`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/package.json"
}
```

---

### Assistant

[REDACTED]
**Tool:** `Grep`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src",
  "pattern": "mock|MOCK|sampleMovies|fake|fixture",
  "-i": true
}
```

**Tool:** `Read`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/hooks/useHome.ts",
  "limit": 120
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
  "glob_pattern": "**/client*.ts"
}
```

**Tool:** `Read`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/types/env.d.ts"
}
```

---

### Assistant

[REDACTED]
**Tool:** `Read`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/__tests__/client.test.ts"
}
```

---

### Assistant

Checking axios header handling and whether the response interceptor's retry drops the Authorization header.

[REDACTED]
**Tool:** `Read`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/__mocks__/env.js"
}
```

**Tool:** `WebSearch`

```json
{
  "search_term": "axios 1.x default headers Authorization lost GET request params",
  "explanation": "Check if axios has known issues with default Authorization headers on certain requests."
}
```

---

### Assistant

Implementing a central request interceptor (per project rules) so every request gets `Authorization`, fixing cases where default instance headers aren't merged. Verifying TypeScript compatibility with `AxiosHeaders`.

[REDACTED]
**Tool:** `Shell`

```json
{
  "command": "cd \"/Users/tusharsaini/CursorAI-training/Phase 2/streamlist\" && npm test 2>&1",
  "description": "Run Jest test suite"
}
```

---

### Assistant

[REDACTED]
**Tool:** `Shell`

```json
{
  "command": "cd \"/Users/tusharsaini/CursorAI-training/Phase 2/streamlist\" && CI=true npm test -- --watchAll=false 2>&1",
  "description": "Run Jest with CI mode to avoid watchman",
  "required_permissions": [
    "all"
  ]
}
```

---

### Assistant

Implementing the request interceptor and updating `client.ts`.

[REDACTED]
**Tool:** `StrReplace`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/api/client.ts",
  "old_string": "const hasAccessToken: boolean =\n  typeof TMDB_ACCESS_TOKEN === 'string' && TMDB_ACCESS_TOKEN.length > 0;\n\nexport const apiClient = axios.create({\n  baseURL: resolvedBaseUrl,\n  timeout: 20000,\n  ...(hasAccessToken\n    ? { headers: { Authorization: `Bearer ${TMDB_ACCESS_TOKEN}` } }\n    : {}),\n});\n\napiClient.interceptors.response.use(",
  "new_string": "const hasAccessToken: boolean =\n  typeof TMDB_ACCESS_TOKEN === 'string' && TMDB_ACCESS_TOKEN.length > 0;\n\nexport const apiClient = axios.create({\n  baseURL: resolvedBaseUrl,\n  timeout: 20000,\n});\n\n/**\n * TMDB auth must be applied on every outgoing request. Relying only on `axios.create({ headers })`\n * can miss merges in some Axios 1.x code paths; a request interceptor matches project rules and\n * keeps Authorization consistent (including for retries).\n */\napiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {\n  if (hasAccessToken && config.headers !== undefined) {\n    config.headers.set('Authorization', `Bearer ${TMDB_ACCESS_TOKEN}`);\n  }\n  return config;\n});\n\napiClient.interceptors.response.use("
}
```

---

### Assistant

[REDACTED]
**Tool:** `Shell`

```json
{
  "command": "cd \"/Users/tusharsaini/CursorAI-training/Phase 2/streamlist\" && npx tsc --noEmit 2>&1",
  "description": "Run TypeScript compiler check"
}
```

**Tool:** `ReadLints`

```json
{
  "paths": [
    "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/api/client.ts"
  ]
}
```

---

### Assistant

[REDACTED]
**Tool:** `Shell`

```json
{
  "command": "cd \"/Users/tusharsaini/CursorAI-training/Phase 2/streamlist\" && CI=true npm test -- --watchAll=false 2>&1",
  "description": "Run Jest after client.ts change",
  "required_permissions": [
    "all"
  ]
}
```

---

### Assistant

[REDACTED]
**Tool:** `Read`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/api/client.ts"
}
```

---

### Assistant

[REDACTED]
**Tool:** `Shell`

```json
{
  "command": "cd \"/Users/tusharsaini/CursorAI-training/Phase 2/streamlist\" && npx eslint src/api/client.ts 2>&1",
  "description": "ESLint client.ts",
  "required_permissions": [
    "all"
  ]
}
```

---

### Assistant

## What we found

1. **Same client everywhere** – `fetchTrendingMoviesWeek`, `searchMovies`, `fetchDiscoverMovies`, and `fetchTopRatedMovies` all use the same `apiClient` in `src/api/movies.ts`. There is no separate path for search/trending.

2. **Why Home can look “fine” while trending fails** – In `useHome`, the first load uses `Promise.allSettled` for trending, top rated, and genres. If **trending** rejects (e.g. 401) but **top rated** or **genres** succeed, `anyInitialSuccess` stays true and the screen still loads; trending is replaced with an empty page object and `hasTrendingRail` is false. So a bad trending call is easy to miss next to working rails.

```92:120:/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/hooks/useHome.ts
      const initialSettled: [
        PromiseSettledResult<PaginatedResponse<MovieListItem>>,
        PromiseSettledResult<PaginatedResponse<MovieListItem>>,
        PromiseSettledResult<GenreListResponse>,
      ] = await Promise.allSettled([
        fetchTrendingMoviesWeek(1),
        fetchTopRatedMovies(1),
        fetchMovieGenres(),
      ]);
      const trending: PaginatedResponse<MovieListItem> =
        initialSettled[0].status === 'fulfilled' ? initialSettled[0].value : emptyPaginatedMovies();
      const topRated: PaginatedResponse<MovieListItem> =
        initialSettled[1].status === 'fulfilled' ? initialSettled[1].value : emptyPaginatedMovies();
      // ...
      const anyInitialSuccess: boolean = initialSettled.some(
        (r: PromiseSettledResult<unknown>): boolean => r.status === 'fulfilled',
      );
      if (!anyInitialSuccess) {
```

Search does **not** swallow errors the same way, so a 401 there is obvious.

3. **Project rule** – `.cursor/rules/streamlist.mdc` asks for auth on the shared instance via a **request interceptor**, not only default headers on `axios.create()`.

## What we changed

**File: `streamlist/src/api/client.ts`**

- Removed default `Authorization` from `axios.create({ headers })`.
- Added a **request interceptor** that calls `config.headers.set('Authorization', \`Bearer ${TMDB_ACCESS_TOKEN}\`)` on **every** request when `TMDB_ACCESS_TOKEN` is set.

That aligns with your rules and makes sure the Bearer token is attached consistently (including for the response interceptor’s `apiClient.request(config)` retries).

**Tests:** `CI=true npm test -- --watchAll=false` — all 41 tests passed.

**Note:** `npx tsc --noEmit` still reports an existing error in `useSearch.ts` (return type); it was not introduced by this change.

---

After pulling this in, do a **full Metro restart** (`--reset-cache`) so `TMDB_ACCESS_TOKEN` from `.env` is picked up. If 401s continue, confirm the value is TMDB’s **API Read Access Token** (JWT) from the dashboard, not the short **API Key** string used for `?api_key=` URLs.

[REDACTED]

