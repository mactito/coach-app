import type { CapacitorConfig } from '@capacitor/cli'

// The native app is a shell around your live website, so web updates reach the app without a new store release.
// 1) Change appId to a reverse-domain you own. It cannot be changed after you publish.
// 2) Set APP_URL (or replace the fallback below) to your live address.
const config: CapacitorConfig = {
  appId: 'it.coachraphi.app',
  appName: 'Coach Raphi',
  webDir: 'www',
  server: { url: process.env.APP_URL ?? 'https://YOUR-DOMAIN.vercel.app', cleartext: false },
  ios: { contentInset: 'always' },
  android: { allowMixedContent: false },
  plugins: {
    SplashScreen: { launchShowDuration: 1200, backgroundColor: '#3B4CCA', showSpinner: false },
  },
}
export default config
