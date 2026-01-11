# log Out and Login 

# Errors and Fixes — Summary (Hinglish)
# Errors and Fixes — Summary (Hinglish)

## Short overview
Yeh document un sab changes ka summary hai jo workspace me maine kiye (aur jo aapko khud dekhna chahiye) — kya change hua, kyon kiya, kaun sa code purana tha (old), kaun sa naya (new), aur production me kya follow karna chahiye. Sab kuch Hinglish me likha hai taaki easily samajh aaye.

---

## 1) `loginUser` handler parameter order (bug)

- Old code (bug):

```js
// login user
const loginUser = asyncHandler(async(res, req) => { ... })
```

- Problem / Kyon galat tha:
  - Express handlers ka order fixed hota hai: first argument `req`, second `res`. Agar aap `(res, req)` likhoge to `req` undefined ho jayega ya galat object hoga -> `req.body` undefined error milega.

- Fix / New code:

```js
const loginUser = asyncHandler(async (req, res) => { ... })
```

- Kab aur kyu use karna hai:
  - Hamesha `req` pehle, `res` dusre — variable names kuch bhi rakh sakte ho lekin position fix hai.

---

## 2) Refresh token field name mismatch

- Old code (bug):

```js
// saved to wrong field
user.refreshToken = refreshToken
```

- Problem:
  - Mongoose schema me field ka naam `refreshTokens` tha. Agar aap `refreshToken` set karoge to DB me koi expected field update nahi hogi, refresh token kahin store nahi hoga.

- Fix / New code:

```js
user.refreshTokens = refreshToken
await user.save({ validateBeforeSave: false })
```

- Kab use karna hai:
  - Jab bhi aap schema me koi field use karte ho, exact same field name use karo. Mismatches se tokens/read nahi honge.

---

## 3) Cookie name typo and cookie options

- Old code (bugs seen):
  - Cookie name typo: `.cookie("accesToken", ...)` (single 's')
  - Cookie options hard-coded: `secure: true` (this blocks cookies on HTTP/local dev)

- Problems:
  - Typos mean client and server disagree on cookie name -> middleware won't find token.
  - `secure: true` requires HTTPS; local dev on HTTP won't send cookie -> token missing.

- Fix / New code:

```js
const options = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production'
}

res.cookie('accessToken', accessToken, options)
```

- Deployment notes:
  - Local dev: `NODE_ENV !== 'production'` → `secure` false, cookie will be sent over HTTP.
  - Production: `NODE_ENV === 'production'` → `secure: true` (requires HTTPS).
  - For cross-site cookies use `sameSite: 'none'` + `secure: true` and set `credentials: true` in CORS and client requests.

---

## 4) `verifyJWT` middleware token lookup mismatch

- Current middleware reads:

```js
const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
const user = await User.findById(decodedToken?._id)
```

- Problem:
  - `generateAccessToken()` signs payload with `userId: this._id` (see `src/models/user.model.js`). Middleware is looking for `_id` field in decoded token which doesn't exist, so `User.findById(undefined)` returns null → 401 unauthorized.

- Recommended small fix:

```js
const user = await User.findById(decodedToken?.userId)
```

- Alternative: change token payload to include `_id` too. But changing middleware is smallest safe change.

---

## 5) Body parsing and multer (file uploads)

- What to check:
  - `src/app.js` already has `app.use(express.json())` and `app.use(express.urlencoded(...))` — so `req.body` parsing is enabled.
  - For `/register` you use `multer` (`upload.fields([...])`) so uploaded files appear in `req.files` (not `req.body`). Avatar/cover images should be read from `req.files`.

- Note:
  - If `req.body` is undefined, first check handler signature (see 1). If handler correct and body-parser present, ensure client sends proper Content-Type (`application/json` or form-data for files).

---

## 6) `asyncHandler` wrapper

- Current wrapper is fine: it wraps async handlers and forwards errors to next(). Keep it.

---

## Tests & debugging steps (quick)

1) Check cookie set on login: Open browser DevTools → Application → Cookies and confirm `accessToken` exists.
2) If cookie missing: ensure server set-cookie used `accessToken` name and `secure` false in dev.
3) Ensure client sends credentials for cross-origin calls:

```js
fetch(url, { credentials: 'include' })
// or axios: axios.post(url, data, { withCredentials: true })
```

4) Test Authorization header fallback:

```bash
curl -i -H "Authorization: Bearer <TOKEN>" http://localhost:8000/api/v1/users/logout
```

5) If token still not found, add a short debug log in middleware (temporary):

```js
console.log('cookie token=', req.cookies?.accessToken, 'auth header=', req.header('Authorization'))
```

---

## Production checklist (real world)

- Use `NODE_ENV=production` and `secure: true` (HTTPS required).
- Configure CORS to allow credentials and set `origin` to frontend domain.
- Use `sameSite: 'none'` for cross-site cookies (with secure). Example cookie options for prod:

```js
{ httpOnly: true, secure: true, sameSite: 'none' }
```

- Standardize contract with frontend: either cookie-based auth (web) or header-based (API/mobile). Document it.

---

## Final summary (1-line)

- Root cause(s): handler param order bug; cookie name typo; cookie `secure` misconfigured for dev; token payload vs lookup mismatch.
- Fixes applied / recommended: correct handler params, use `refreshTokens` field, fix cookie name to `accessToken`, make `secure` env-dependent, update `verifyJWT` to use `decodedToken.userId`.

---

*File path:* [errors_new.md](errors_new.md)
