import type { CapacitorConfig } from '@capacitor/cli';

// IMPORTANT: replace this with your real Railway (or Render) URL once deployed.
// Pointing the app at the live server means the APK always shows the current
// version without needing a rebuild every time you push a change.
const DEPLOYED_URL = 'https://YOUR-APP-NAME.up.railway.app';

const config: CapacitorConfig = {
  appId: 'com.kuagifts.app',
  appName: 'KuaGifts',
  webDir: 'dist',
  server: {
    url: DEPLOYED_URL,
    cleartext: false
  }
};

export default config;
