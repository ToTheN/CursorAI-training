---
title: "Authorization token implementation in API calls"
composer_id: 8e48a8a9-7bc3-4097-9612-89fdcfbf630c
source_jsonl: /Users/tusharsaini/.cursor/projects/Users-tusharsaini-CursorAI-training-Phase-2/agent-transcripts/8e48a8a9-7bc3-4097-9612-89fdcfbf630c/8e48a8a9-7bc3-4097-9612-89fdcfbf630c.jsonl
created_at: 2026-04-18T08:36:08Z
last_updated_at: 2026-04-19T14:26:35Z
unified_mode: chat
subtitle: "Edited streamlist.mdc, client.ts"
---
# Authorization token implementation in API calls

### User

<user_query>
in existing project, please check

All requests must include Authorization: Bearer {TMDB_ACCESS_TOKEN} set by the central Axios interceptor — not manually on individual calls.

add this in @streamlist/.cursor/rules/streamlist.mdc and check in all files if api is being set to call without authorization or not ?
</user_query>

---

### Assistant

Adding the rule to `streamlist.mdc` and auditing the codebase for API authorization patterns.

[REDACTED]
**Tool:** `Read`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/.cursor/rules/streamlist.mdc"
}
```

**Tool:** `Grep`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist",
  "pattern": "axios|Authorization|TMDB|fetch\\(|create\\("
}
```

---

### Assistant

[REDACTED]
**Tool:** `Grep`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist",
  "pattern": "from ['\\\"]axios['\\\"]|apiClient|Authorization|interceptors",
  "glob": "*.{ts,tsx}"
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
**Tool:** `Grep`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist",
  "pattern": "fetch\\(|XMLHttpRequest|api\\.themoviedb",
  "glob": "*.{ts,tsx}"
}
```

**Tool:** `Grep`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src",
  "pattern": "headers|apiClient|from ['\\\"]\\.\\/client",
  "glob": "*.{ts,tsx}"
}
```

---

### Assistant

[REDACTED]
**Tool:** `Grep`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src",
  "pattern": "apiClient|getMovies|movies\\.ts",
  "glob": "*.{ts,tsx}"
}
```

---

### Assistant

[REDACTED]
**Tool:** `Grep`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src",
  "pattern": "from ['\\\"]@/api|from ['\\\"]\\\\.\\\\./api|from ['\\\"]\\\\./api",
  "glob": "*.{ts,tsx}"
}
```

---

### Assistant

[REDACTED]
**Tool:** `Grep`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src",
  "pattern": "from ['\\\"].*api/",
  "glob": "*.{ts,tsx}"
}
```

---

### Assistant

Confirming: all TMDB HTTP calls go through `apiClient` in `movies.ts`; auth is applied in `client.ts` via default `axios.create` headers (not per-call). Adding the rule and switching to a request interceptor so the implementation matches the rule.

[REDACTED]
**Tool:** `StrReplace`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/.cursor/rules/streamlist.mdc",
  "old_string": "- All API calls go through src/api/client.ts. No direct Axios imports in hooks or components.",
  "new_string": "- All API calls go through src/api/client.ts. No direct Axios imports in hooks or components.\n- **Authorization:** Every TMDB request must send `Authorization: Bearer {TMDB_ACCESS_TOKEN}`. Set this only in the central Axios client (`src/api/client.ts`) via the **request interceptor** (or equivalent single place on the shared instance). Do **not** pass `Authorization` manually on individual `apiClient` calls, and do not duplicate token logic in hooks or components."
}
```

**Tool:** `StrReplace`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/api/client.ts",
  "old_string": "const hasAccessToken: boolean =\n  typeof TMDB_ACCESS_TOKEN === 'string' && TMDB_ACCESS_TOKEN.length > 0;\n\n/** Default instance headers carry Bearer auth; hooks do not set Authorization per call. */\nexport const apiClient = axios.create({\n  baseURL: resolvedBaseUrl,\n  timeout: 20000,\n  ...(hasAccessToken\n    ? { headers: { Authorization: `Bearer ${TMDB_ACCESS_TOKEN}` } }\n    : {}),\n});\n\napiClient.interceptors.response.use(",
  "new_string": "const hasAccessToken: boolean =\n  typeof TMDB_ACCESS_TOKEN === 'string' && TMDB_ACCESS_TOKEN.length > 0;\n\nexport const apiClient = axios.create({\n  baseURL: resolvedBaseUrl,\n  timeout: 20000,\n});\n\nif (hasAccessToken) {\n  apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {\n    config.headers.Authorization = `Bearer ${TMDB_ACCESS_TOKEN}`;\n    return config;\n  });\n}\n\napiClient.interceptors.response.use("
}
```

---

### Assistant

[REDACTED]
**Tool:** `StrReplace`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/.cursor/rules/streamlist.mdc",
  "old_string": "- **Authorization:** Every TMDB request must send `Authorization: Bearer {TMDB_ACCESS_TOKEN}`. Set this only in the central Axios client (`src/api/client.ts`) via the **request interceptor** (or equivalent single place on the shared instance). Do **not** pass `Authorization` manually on individual `apiClient` calls, and do not duplicate token logic in hooks or components.",
  "new_string": "- **Authorization:** Every TMDB request must include `Authorization: Bearer {TMDB_ACCESS_TOKEN}`. Configure this only in `src/api/client.ts` on the shared Axios instance using the **central request interceptor**. Do **not** set `Authorization` on individual `apiClient.get`/`post`/etc. calls, and do not add token logic in hooks or components."
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

**Tool:** `Shell`

```json
{
  "command": "cd \"/Users/tusharsaini/CursorAI-training/Phase 2/streamlist\" && npm test -- --passWithNoTests 2>&1",
  "description": "Run Jest tests in streamlist project"
}
```

---

### Assistant

[REDACTED]
**Tool:** `Shell`

```json
{
  "command": "cd \"/Users/tusharsaini/CursorAI-training/Phase 2/streamlist\" && CI=true npm test -- --passWithNoTests 2>&1",
  "description": "Run Jest with CI=true to avoid watchman",
  "required_permissions": [
    "all"
  ]
}
```

---

### Assistant

Here’s what was done and what the audit found.

### Rule added — `streamlist/.cursor/rules/streamlist.mdc`

Under **## Data and API**, a bullet was added stating that:

- TMDB calls must send `Authorization: Bearer {TMDB_ACCESS_TOKEN}`.
- That must be configured only in `src/api/client.ts` on the shared Axios instance via the **central request interceptor**.
- Call sites must not set `Authorization` per request, and hooks/components must not implement token logic.

### Audit: authorization usage

| Area | Result |
|------|--------|
| **`src/api/movies.ts`** | Only `apiClient` from `./client`; no `headers` / `Authorization`. |
| **Hooks / screens / utils** | Imports from `../api/movies` or `../api/client` for errors only — no manual Bearer. |
| **Raw `fetch` / TMDB URLs** | No `fetch()` to the API; only `apiClient`. Image URLs use `TMDB_IMAGE_BASE_URL` (CDN; no Bearer). |
| **Direct `axios` imports** | Only in `src/api/client.ts` (matches your “central client” rule). |

So nothing was calling TMDB without going through the shared client, and nothing was adding `Authorization` per call.

### Code change — `src/api/client.ts`

Bearer was previously applied with **default headers on `axios.create()`**. It’s now applied in a **`request` interceptor** when `TMDB_ACCESS_TOKEN` is present, which matches the new rule wording and keeps behavior the same. If the token is missing, the client still does not attach `Authorization` (same as before).

**Files touched**

- `streamlist/.cursor/rules/streamlist.mdc` — new Authorization / interceptor rule.
- `streamlist/src/api/client.ts` — Bearer via request interceptor instead of `create()` default headers.

**Tests:** All 41 tests passed (`CI=true npm test`).

If you want, we can add a short note in `client.test.ts` that the request interceptor sets `Authorization` when the token is mocked — optional and not required for correctness.

[REDACTED]

---

### User

<user_query>
check in apiClient, if Authorization is being passing in all api calls or not ? becuase in runtime in am not seeing Authorization
</user_query>

---

### Assistant

Inspecting how `apiClient` sets `Authorization` and when it might be omitted.

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

---

### Assistant

Here’s what the code is doing and why you might not see `Authorization` at runtime.

## When `Authorization` is added

In `client.ts`, the Bearer header is **not** applied to every build unconditionally. It only runs if a **request interceptor** is registered, and that only happens when `hasAccessToken` is true:

```75:88:/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/api/client.ts
const hasAccessToken: boolean =
  typeof TMDB_ACCESS_TOKEN === 'string' && TMDB_ACCESS_TOKEN.length > 0;

export const apiClient = axios.create({
  baseURL: resolvedBaseUrl,
  timeout: 20000,

});

if (hasAccessToken) {
  apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    config.headers.Authorization = `Bearer ${TMDB_ACCESS_TOKEN}`;
    return config;
  });
}
```

So:

- If `TMDB_ACCESS_TOKEN` is **missing, empty, or not a non-empty string** when the bundle is built, `hasAccessToken` is **false**, the interceptor is **never attached**, and **no** `Authorization` header is sent on **any** `apiClient` call.

That matches “at runtime I’m not seeing Authorization” if the token isn’t actually present in the env that Metro/babel inlines.

## Why the token might be missing at “runtime”

`react-native-dotenv` (see `babel.config.js`) reads `.env` at **bundle time** and inlines values into the JS bundle. So:

1. **No `.env`** (or wrong path) → token is empty/undefined → no header.
2. **`.env` changed** but the app wasn’t rebuilt → old or empty values until you clear cache / rebuild.
3. **Variable name typo** in `.env` vs `TMDB_ACCESS_TOKEN` → same as missing.

So the fix is usually: ensure `.env` exists next to `babel.config.js`, contains a non-empty `TMDB_ACCESS_TOKEN`, then **restart Metro with cache clear** and rebuild the app (e.g. `npx react-native start --reset-cache` and reinstall/run).

## What you’re inspecting in the network tab

- Requests to **`https://api.themoviedb.org/3/...`** from `apiClient` **should** show `Authorization: Bearer ...` **only if** the interceptor was registered (`hasAccessToken === true`).
- Requests to **`image.tmdb.org`** (posters/backdrops) go through **`TMDB_IMAGE_BASE_URL`** in `image.ts`, **not** `apiClient`, so they **won’t** have that header (and TMDB doesn’t require it for images).

## Quick mental check

If API calls **succeed** with 200 but you see **no** `Authorization`, either:

- the inspector is not showing that header (some tools redact or collapse headers), or  
- you’re looking at **image** requests, not **API** requests.

If API calls **fail** with 401, the header is almost certainly absent → treat it as **token not loaded** / interceptor not registered until you confirm `TMDB_ACCESS_TOKEN` is non-empty in the bundled app.

I’m in **Ask mode**, so I can’t add logging or change the code. If you want, switch to **Agent mode** and we can add a dev-only log or assert when `hasAccessToken` is false so this is obvious during development.

[REDACTED]

---

### User

<user_query>
(failed)net::ERR_FAILED i am getting this in every api call
</user_query>

---

### Assistant

Checking the network setup — `net::ERR_FAILED` is a generic failure; we'll identify common causes in this project.

[REDACTED]
**Tool:** `Read`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/api/client.ts",
  "limit": 95
}
```

**Tool:** `Glob`

```json
{
  "target_directory": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/android",
  "glob_pattern": "**/AndroidManifest.xml"
}
```

**Tool:** `Read`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/android/app/src/main/AndroidManifest.xml"
}
```

---

### Assistant

[REDACTED]
**Tool:** `Read`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/package.json"
}
```

**Tool:** `Grep`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist",
  "pattern": "web|metro|origin",
  "glob": "*.{json,js,ts}",
  "head_limit": 40
}
```

---

### Assistant

`net::ERR_FAILED` is a **low-level network / transport** error in Chromium’s network stack. It usually means the request **never completed a normal HTTP exchange** (no response status line), so it is **different** from TMDB returning **401 Unauthorized** (that would still show a response with status 401).

Your app uses plain React Native (Android/iOS), `axios` to `https://api.themoviedb.org/3`, and `INTERNET` is declared in the manifest, so the code path is normal. The failure is likely **environment / tooling / connectivity**, not “missing `Authorization`” by itself.

### 1. Chrome DevTools can lie (very common with React Native)

If you see `net::ERR_FAILED` in **Chrome → Network** while **Remote JS Debugging** or using some inspector bridges, that view often does **not** reflect the native HTTP stack accurately. Failures can appear even when the native request behaves differently.

**What to do:** rely on **native logs** (Android Studio Logcat, Xcode console), **Flipper** network plugin, or log `error.message` / `error.code` from Axios in JS. Don’t treat Chrome’s Network tab as the source of truth for RN.

### 2. Real connectivity / TLS issues

“Every” call failing with transport errors often means:

- Emulator/simulator **has no working internet** (try opening a URL in the device browser).
- **VPN, firewall, or corporate proxy** blocking `api.themoviedb.org`.
- **DNS** problems on that network.

Quick check: on the same machine/emulator, open  
`https://api.themoviedb.org/3/configuration`  
in the **device browser**. If that fails, the app will fail too.

### 3. Bad base URL from `.env` (still transport-level)

If `TMDB_API_BASE_URL` is wrong (typo, accidental space, broken line break, or garbage pasted into `.env`), Axios may build an invalid URL and you get failures before a sensible HTTP response.

Your `client.ts` falls back to `https://api.themoviedb.org/3` only when `TMDB_API_BASE_URL` is empty; if it’s **non-empty but wrong**, the bad value is used.

After any `.env` change you must **restart Metro with a clean cache** and **rebuild** the app so `react-native-dotenv` can inline the new values.

### 4. Why this is probably not “Authorization”

Missing or wrong Bearer token typically yields **HTTP 401** with a body from TMDB, not a generic `net::ERR_FAILED`. So focus on **reachability / URL / debugger display** first.

---

**Practical next step:** In your Axios `catch`, log `error.code`, `error.message`, and whether `error.response` exists. If `response` is **undefined** and codes look like `ERR_NETWORK` / similar, it’s connectivity or URL; if `response?.status === 401`, then look at the token.

I’m in **Ask mode** and can’t edit the project or run commands that change your machine. If you want, switch to **Agent mode** and we can add a small, safe debug log or double-check `.env` shape (without pasting secrets into chat).

[REDACTED]

---

### User

<user_query>
i am getting this  - {"status_code":7,"status_message":"Invalid API key: You must be granted a valid key.","success":false}

when opening https://api.themoviedb.org/3/configuration
in the device browser
</user_query>

---

### Assistant

That response is **expected** if you open the URL the way the browser does it.

## Why the browser shows “Invalid API key”

TMDB’s v3 API does **not** treat a bare visit to:

`https://api.themoviedb.org/3/configuration`

as authenticated. The browser sends a **normal GET** with **no** `Authorization` header and **no** `api_key` query parameter, so TMDB responds with something like `status_code` 7 and *“Invalid API key…”*.

So this check does **not** prove that your app’s token is wrong, and it does **not** match how your app calls the API (Axios + `Authorization: Bearer …`).

## How to test the same way the app does

Use a client that can send a header, for example on your computer (replace with your real read access token; don’t paste it in chat):

```bash
curl -sS "https://api.themoviedb.org/3/configuration" \
  -H "Authorization: Bearer YOUR_TMDB_READ_ACCESS_TOKEN"
```

You should get JSON with `images` / configuration data, not `status_code: 7`.

Alternatively, in Postman/Insomnia: GET that URL and add header  
`Authorization: Bearer <your read access token>`.

## Optional: test in browser with v3 API key only

If you use TMDB’s **v3 API key** (the one meant for `?api_key=`), you can try:

`https://api.themoviedb.org/3/configuration?api_key=YOUR_V3_API_KEY`

That matches “browser-only” testing. Your app is built around the **Bearer read access token**, which the browser’s address bar cannot send.

**Summary:** Seeing `status_code: 7` on a plain browser open is normal. Validate with `curl`/Postman using the **Bearer** header like the app, or with `?api_key=` if you use the v3 key.

[REDACTED]

