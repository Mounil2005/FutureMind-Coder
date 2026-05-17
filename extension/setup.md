# Extension Setup

After signing in to CodeTracker, you need to give the extension your API URL and auth token so it can sync sessions.

## Steps

1. Load the extension in Chrome: `chrome://extensions` → **Load unpacked** → select this `extension/` folder.
2. Open your CodeTracker dashboard and copy your Supabase anon auth token from the browser DevTools → Application → Local Storage → `sb-<project>-auth-token` → `access_token`.
3. Open the extension popup, click **Open full dashboard**, and you're done — the background worker will start syncing automatically.

## Icons

The `icons/` folder needs three PNG files: `icon16.png`, `icon48.png`, `icon128.png`.  
Generate them from the `ct` monogram or any square image. You can use [favicon.io](https://favicon.io) to generate a quick set.
