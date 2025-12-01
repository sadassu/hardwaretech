# Railway SIGTERM Fix Guide

If you're getting `npm error signal SIGTERM` on Railway, follow these steps:

## Quick Fixes

### 1. Ensure Package is Installed

Make sure `@getbrevo/brevo` is in your `package.json` dependencies (it should be):

```json
{
  "dependencies": {
    "@getbrevo/brevo": "^3.0.1",
    ...
  }
}
```

### 2. Check Railway Build Logs

1. Go to **Railway Dashboard** → Your backend service
2. Click **Deployments** → Latest deployment
3. Check **Build Logs** for errors like:
   - `npm ERR!` messages
   - Missing package errors
   - Import errors

### 3. Force Rebuild

1. In Railway, go to your backend service
2. Click **Settings** → **Deploy**
3. Click **Clear Build Cache**
4. Click **Redeploy**

### 4. Verify Environment Variables

Make sure these are set in Railway → Variables:

```env
BREVO_API_KEY=your_brevo_api_key_here
BREVO_FROM_EMAIL=no-reply@yourdomain.com
BREVO_FROM_NAME=Hardware Tech
```

### 5. Check Start Command (Optional)

Railway should use `npm start` by default, but you can verify:

1. Go to **Settings** → **Deploy**
2. **Start Command** should be: `npm start`
3. Or change it to: `node src/server.js` (direct Node execution)

### 6. Check Node Version

Make sure Railway is using Node 20:

1. Check `nixpacks.toml` (should have `nodejs-20_x`)
2. Or set in Railway → Variables:
   ```env
   NODE_VERSION=20
   ```

## Common Causes

### Cause 1: Package Not Installed
**Solution:** Make sure `@getbrevo/brevo` is in `package.json` and Railway runs `npm ci` or `npm install`

### Cause 2: Import Error
**Solution:** The import should work if package is installed. Check build logs for import errors.

### Cause 3: Missing Environment Variables
**Solution:** Set `BREVO_API_KEY` in Railway variables (server will start but emails will fail)

### Cause 4: Server Crashes on Startup
**Solution:** Check Railway logs for the actual error message (not just SIGTERM)

## Debugging Steps

1. **Check Railway Logs:**
   - Go to **Railway Dashboard** → Your service → **Logs**
   - Look for error messages before SIGTERM
   - Common errors:
     - `Cannot find module '@getbrevo/brevo'`
     - `BREVO_API_KEY is missing`
     - Import syntax errors

2. **Test Locally First:**
   ```bash
   cd backend
   npm install
   npm start
   ```
   If it works locally but fails on Railway, it's a deployment issue.

3. **Check Package Installation:**
   - Railway should run `npm ci` (from nixpacks.toml)
   - Check build logs to confirm packages are installed

## If Still Failing

1. **Check Railway Build Logs** for the actual error (not just SIGTERM)
2. **Verify package.json** has `@getbrevo/brevo` in dependencies
3. **Clear Railway build cache** and redeploy
4. **Check Railway logs** for startup errors

The SIGTERM is usually Railway killing a process that crashed. The real error is usually in the logs before SIGTERM.

