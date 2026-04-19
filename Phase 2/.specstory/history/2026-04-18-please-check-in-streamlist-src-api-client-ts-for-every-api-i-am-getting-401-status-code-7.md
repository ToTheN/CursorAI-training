---
title: "API key validation error"
composer_id: 4ca0cb2c-1e42-445d-90ec-5d09668b9d16
source_jsonl: /Users/tusharsaini/.cursor/projects/Users-tusharsaini-CursorAI-training-Phase-2/agent-transcripts/4ca0cb2c-1e42-445d-90ec-5d09668b9d16/4ca0cb2c-1e42-445d-90ec-5d09668b9d16.jsonl
created_at: 2026-04-18T10:17:04Z
last_updated_at: 2026-04-18T10:19:23Z
unified_mode: agent
subtitle: "Edited .env.example, env.js, env.d.ts, client.ts"
---
# API key validation error

### User

<user_query>
please check in @streamlist/src/api/client.ts, for every api i am getting 401 
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

Tracing how the API client loads and sends the API key to find why requests return 401 (invalid API key).

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

**Tool:** `Read`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/babel.config.js"
}
```

---

### Assistant

Checking env typings and how the app references TMDB credentials:

[REDACTED]
**Tool:** `Grep`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist",
  "pattern": "TMDB_ACCESS_TOKEN|@env"
}
```

**Tool:** `Glob`

```json
{
  "target_directory": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist",
  "glob_pattern": "**/env.d.ts"
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

**Tool:** `Read`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/types/env.d.ts"
}
```

---

### Assistant

Identifying the issue: TMDB returns status_code 7 and "Invalid API key" when the credential doesn't match the auth method. The client only sends `Authorization: Bearer ${TMDB_ACCESS_TOKEN}` — that requires TMDB's API Read Access Token (JWT), not the shorter v3 API Key. Adding support for the v3 `api_key` query parameter and trimming env values to prevent whitespace-related failures.

[REDACTED]
**Tool:** `Read`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/__mocks__/env.js"
}
```

---

### Assistant

[REDACTED]
**Tool:** `Grep`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist",
  "pattern": "api/client|client\\.ts",
  "glob": "*.test.*"
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

Implementing dual authentication: TMDB accepts either a Bearer JWT (API Read Access Token) or the v3 `api_key` query parameter — using the v3 key as Bearer causes this exact error.

[REDACTED]
**Tool:** `StrReplace`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/api/client.ts",
  "old_string": "import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';\nimport { TMDB_ACCESS_TOKEN, TMDB_API_BASE_URL } from '@env';",
  "new_string": "import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';\nimport { TMDB_ACCESS_TOKEN, TMDB_API_BASE_URL, TMDB_API_KEY } from '@env';\n\n/** TMDB strips surrounding whitespace in env; stray newlines break Bearer/JWT validation. */\nfunction readTrimmedEnv(value: string | undefined): string {\n  return typeof value === 'string' ? value.trim() : '';\n}"
}
```

**Tool:** `StrReplace`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/src/api/client.ts",
  "old_string": "const hasAccessToken: boolean =\n  typeof TMDB_ACCESS_TOKEN === 'string' && TMDB_ACCESS_TOKEN.length > 0;\n\nexport const apiClient = axios.create({\n  baseURL: resolvedBaseUrl,\n  timeout: 20000,\n\n});\n\nif (hasAccessToken) {\n  apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {\n    config.headers.Authorization = `Bearer ${TMDB_ACCESS_TOKEN}`;\n    return config;\n  });\n}",
  "new_string": "const resolvedAccessToken: string = readTrimmedEnv(TMDB_ACCESS_TOKEN);\nconst resolvedApiKey: string = readTrimmedEnv(TMDB_API_KEY);\nconst hasAccessToken: boolean = resolvedAccessToken.length > 0;\nconst hasApiKey: boolean = resolvedApiKey.length > 0;\n\nexport const apiClient = axios.create({\n  baseURL: resolvedBaseUrl,\n  timeout: 20000,\n\n});\n\nif (hasAccessToken) {\n  apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {\n    config.headers.Authorization = `Bearer ${resolvedAccessToken}`;\n    return config;\n  });\n} else if (hasApiKey) {\n  apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {\n    const priorParams: Record<string, unknown> =\n      config.params !== undefined && typeof config.params === 'object' && config.params !== null\n        ? (config.params as Record<string, unknown>)\n        : {};\n    config.params = { ...priorParams, api_key: resolvedApiKey };\n    return config;\n  });\n}"
}
```

**Tool:** `StrReplace`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/types/env.d.ts",
  "old_string": "declare module '@env' {\n  export const TMDB_ACCESS_TOKEN: string;\n  export const TMDB_API_BASE_URL: string;\n  export const TMDB_IMAGE_BASE_URL: string;\n}",
  "new_string": "declare module '@env' {\n  /** TMDB \"API Read Access Token\" (JWT) for `Authorization: Bearer`. Preferred over v3 API key. */\n  export const TMDB_ACCESS_TOKEN: string;\n  /** TMDB v3 API key (short string); sent as `api_key` query param if no Bearer token is set. */\n  export const TMDB_API_KEY: string;\n  export const TMDB_API_BASE_URL: string;\n  export const TMDB_IMAGE_BASE_URL: string;\n}"
}
```

**Tool:** `StrReplace`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/__mocks__/env.js",
  "old_string": "module.exports = {\n  TMDB_ACCESS_TOKEN: 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3YzhhMjc5ZjVhMGU3ODc4ZGFmNmNiNDI3NzNiMjg1MSIsIm5iZiI6MTc3NTcyNjc3My42NjYsInN1YiI6IjY5ZDc3MGI1YmQwNWU0Yjk1YWQ3NzNmZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.RwdBfRWcfQoEStOqO_PyUVwD51nIIRnMH2Ex_NoTN0w',\n  TMDB_API_BASE_URL: 'https://api.themoviedb.org/3',\n  TMDB_IMAGE_BASE_URL: 'https://image.tmdb.org/t/p/',\n};",
  "new_string": "module.exports = {\n  TMDB_ACCESS_TOKEN: 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3YzhhMjc5ZjVhMGU3ODc4ZGFmNmNiNDI3NzNiMjg1MSIsIm5iZiI6MTc3NTcyNjc3My42NjYsInN1YiI6IjY5ZDc3MGI1YmQwNWU0Yjk1YWQ3NzNmZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.RwdBfRWcfQoEStOqO_PyUVwD51nIIRnMH2Ex_NoTN0w',\n  TMDB_API_KEY: '',\n  TMDB_API_BASE_URL: 'https://api.themoviedb.org/3',\n  TMDB_IMAGE_BASE_URL: 'https://image.tmdb.org/t/p/',\n};"
}
```

**Tool:** `StrReplace`

```json
{
  "path": "/Users/tusharsaini/CursorAI-training/Phase 2/streamlist/.env.example",
  "old_string": "# Copy to `.env` locally. Never commit `.env`.\n# TMDB Settings > API: use the \"API Read Access Token\" (Bearer), not the API key string.\nTMDB_ACCESS_TOKEN=eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3YzhhMjc5ZjVhMGU3ODc4ZGFmNmNiNDI3NzNiMjg1MSIsIm5iZiI6MTc3NTcyNjc3My42NjYsInN1YiI6IjY5ZDc3MGI1YmQwNWU0Yjk1YWQ3NzNmZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.RwdBfRWcfQoEStOqO_PyUVwD51nIIRnMH2Ex_NoTN0w",
  "new_string": "# Copy to `.env` locally. Never commit `.env`.\n# TMDB Settings > API: use EITHER (1) \"API Read Access Token\" (long JWT) as TMDB_ACCESS_TOKEN\n# for Bearer auth, OR (2) the v3 \"API Key\" as TMDB_API_KEY — not both. Do not paste the v3\n# API key into TMDB_ACCESS_TOKEN; TMDB will return 401 / status_code 7 \"Invalid API key\".\nTMDB_ACCESS_TOKEN=\n# If you use the v3 API key instead of a JWT, set it here and leave TMDB_ACCESS_TOKEN empty:\nTMDB_API_KEY="
}
```

