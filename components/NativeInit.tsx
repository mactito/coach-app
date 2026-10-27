'use client'
import { useEffect } from 'react'

// Runs once inside the native app: status bar, splash screen and the Android back button.
export default function NativeInit() {
  useEffect(() => {
    let off: (() => void) | undefined
    ;(async () => {
      try {
        const { Capacitor } = await import('@capacitor/core')
        if (!Capacitor.isNativePlatform()) return
        const { SplashScreen } = await import('@capacitor/splash-screen')
        const { StatusBar, Style } = await import('@capacitor/status-bar')
        const { App } = await import('@capacitor/app')
        await SplashScreen.hide()
        if (Capacitor.getPlatform() === 'android') await StatusBar.setStyle({ style: Style.Dark })
        const h = await App.addListener('backButton', ({ canGoBack }) => { if (canGoBack) history.back(); else void App.exitApp() })
        off = () => void h.remove()
      } catch {}
    })()
    return () => off?.()
  }, [])
  return null
}
