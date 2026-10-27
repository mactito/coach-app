import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'it.coachraphi.app',
  appName: 'Coach Raphi',
  webDir: 'www',
  server: { url: 'https://coach-app-next.vercel.app/', cleartext: false },
  ios: { contentInset: 'always' },
  android: { allowMixedContent: false },
  plugins: {
    SplashScreen: { launchShowDuration: 1200, backgroundColor: '#3B4CCA', showSpinner: false },
  },
}
export default config