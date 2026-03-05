import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.examedge.student',
  appName: 'Vidya Yantra Student',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true // For localhost testing during development
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#1E3A8A',
      overlaysWebView: false  // KEY FIX: Prevents system UI from overlaying content
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1E3A8A',
      showSpinner: false,
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;
