---
title: "API response issue in Android emulator"
composer_id: 8743f1ea-bfd6-40aa-8cb0-ea279dd3d00c
source_jsonl: /Users/tusharsaini/.cursor/projects/Users-tusharsaini-CursorAI-training-Phase-2/agent-transcripts/8743f1ea-bfd6-40aa-8cb0-ea279dd3d00c/8743f1ea-bfd6-40aa-8cb0-ea279dd3d00c.jsonl
created_at: 2026-04-18T09:59:59Z
last_updated_at: 2026-04-18T10:09:17Z
unified_mode: chat
subtitle: "Read .env.example, client.ts"
---
# API response issue in Android emulator

### User

<user_query>
in my android emulator, api is not getting success response. 
(failed)net::ERR_FAILED, so how to check due to which reason api is not giving sucess response. In my previous linux based laptop, in emulator working was working fine. but in mac laptop. i am not getting success response.
</user_query>

---

### Assistant

Checking how the app configures the API base URL so we can give Mac/emulator-specific guidance.

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
  "pattern": "cleartext|networkSecurity|usesCleartext"
}
```

---

### Assistant

Your app calls **TMDB over HTTPS** (`https://api.themoviedb.org/3`) via Axios in `client.ts`. `net::ERR_FAILED` is a **low-level network failure** (often before a normal HTTP status), so you need to narrow down *where* it fails.

## 1. Confirm it is not “emulator has no internet”

In the **emulator’s browser**, open `https://www.google.com` and `https://api.themoviedb.org/3`.  

- If those fail too, the problem is **general connectivity/DNS** on the emulator or Mac (VPN, firewall, DNS, proxy), not your app code.

## 2. Use Android / `adb` to see the real error

From a terminal (with the emulator running):

```bash
adb shell ping -c 3 api.themoviedb.org
adb shell "curl -vI https://api.themoviedb.org/3/configuration"
```

- **Ping fails / unknown host** → DNS or routing on the emulator.
- **`curl` fails with SSL** → certificate/time/proxy issues.
- **`curl` works** but the app fails → app config (wrong base URL at runtime, Metro env not loaded, etc.).

## 3. Mac-specific checks (common when “Linux worked, Mac doesn’t”)

| Check | Why it matters |
|--------|----------------|
| **VPN** (corporate / WireGuard / etc.) | Can change routing; emulator traffic may behave differently than on Linux. |
| **Firewall** (System Settings → Network → Firewall) | Can block the emulator’s outbound traffic. |
| **Proxy** (HTTP_PROXY in shell, corporate proxy) | Linux may have been configured differently; RN/OkHttp may not use the same proxy unless set up. |
| **DNS** | Try another DNS (e.g. 8.8.8.8) or “Private Relay” / iCloud relay quirks on same machine (less common for emulator-only). |

## 4. HTTPS / time issues

- **Wrong date/time on the emulator** → TLS handshakes fail → generic network errors.  
  Settings → Date & time → use automatic time.

## 5. Your app: token and base URL

Ensure on the Mac:

- **`.env`** is present and Metro was restarted after changes (`TMDB_ACCESS_TOKEN`, `TMDB_API_BASE_URL`).
- **`TMDB_ACCESS_TOKEN`** is valid (expired tokens usually get **401**, not `ERR_FAILED`, but worth confirming in Postman/curl from the Mac host).

If `curl` from **Mac** to TMDB works but **`adb shell curl`** fails, the issue is **emulator ↔ network**, not TMDB.

## 6. Getting a clearer message in the app

Log the full Axios error in dev: `error.code`, `error.message`, and if present `error.cause` / underlying message. `ERR_FAILED` in WebView/Chrome terms often maps to **no response** (DNS, connection reset, TLS failure).

---

**Practical order:** (1) browser in emulator → (2) `adb shell ping` + `curl` → (3) toggle VPN/firewall → (4) fix emulator time → (5) verify `.env` and Metro restart.

If you paste **whether `curl` from `adb shell` works** and **whether the emulator browser can open `https://api.themoviedb.org`**, the cause is usually obvious in one step.

[REDACTED]

---

### User

[Image]
<image_files>
The following images were provdied by the user and saved to the workspace for future use:
1. /Users/tusharsaini/.cursor/projects/Users-tusharsaini-CursorAI-training-Phase-2/assets/image-2a3642af-bcf7-4b5f-8446-4b63df60567c.png

These images can be copied for use in other locations.
</image_files>
<user_query>
i have checked in emulator to search www.google.com and see the screenshot attached
</user_query>

---

### Assistant

Your screenshot is enough to pin this down: the problem is **not TMDB or your React Native code**.

## What the screenshot shows

- **`DNS_PROBE_FINISHED_BAD_CONFIG`** means Chrome could not **resolve** `www.google.com` to an IP address — DNS is broken or misconfigured inside the emulator.
- The **Wi‑Fi icon with “!”** matches “connected but no usable internet” (often DNS-related).

Until DNS works in the browser, **any HTTPS call to a hostname** (including `api.themoviedb.org`) can fail with generic errors like `net::ERR_FAILED`.

## What to try (in order)

### 1. Quick checks on the Mac (host)

- Confirm **Safari/Chrome on the Mac** can open `https://www.google.com`.
- If you use a **VPN**, try **disconnecting** or a different server; VPNs often break emulator DNS on macOS.
- Temporarily disable **iCloud Private Relay** or other system-wide DNS/privacy tools and retest.

### 2. Emulator: Private DNS (very common fix)

On the **emulator**: **Settings → Network & internet → Private DNS** → set to **Off** (or **Automatic**).  
Misconfigured Private DNS often causes exactly this.

You can also verify from a host terminal with the device connected:

```bash
adb shell settings get global private_dns_mode
adb shell settings get global private_dns_specifier
```

If `private_dns_mode` is not `off`, turning it off in Settings (or via `adb` if you use it) often fixes resolution.

### 3. Cold boot / new AVD

- **Device Manager** → emulator **▼** → **Cold Boot Now**.  
- If it persists: **Wipe Data** on that AVD, or create a **new** Pixel API image and use that.

### 4. Android Studio emulator DNS (if available)

Some setups let you pass DNS to the emulator (e.g. **8.8.8.8**). Exact UI varies by version; look under **Emulator extended controls (⋯) → Settings** or launch options / `config.ini` for `dns.server` — only if you are comfortable editing emulator config.

### 5. Firewall / security software on Mac

Ensure nothing is blocking **qemu** / **Android Emulator** outbound UDP/TCP (DNS uses UDP 53).

---

**Summary:** Your API fails because the **emulator cannot resolve hostnames**. Fix **DNS / Private DNS / VPN / broken AVD** first; once `www.google.com` loads in the emulator browser, your app’s HTTPS calls should start working again without code changes.

If you want, say whether **VPN is on** and what **Private DNS** is set to in the emulator — those two alone explain most `DNS_PROBE_FINISHED_BAD_CONFIG` cases on Mac.

[REDACTED]

