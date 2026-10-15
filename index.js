import { enableScreens } from 'react-native-screens';
enableScreens();

import { startNetworkLogging } from 'react-native-network-logger';

startNetworkLogging();

if (__DEV__) {
  require('./ReactotronConfig');
  global.XMLHttpRequest = global.originalXMLHttpRequest || global.XMLHttpRequest;
}

import firebase from '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Register background messaging handler
try {
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('[FCM Background] Message received:', remoteMessage);
  });
} catch (e) {
  console.log('[FCM Background] Registering background handler failed:', e.message);
}

const firebaseConfig = {
  apiKey: "AIzaSyDFKezewpcYS70VDS5VK4fKIjMiJZJnb3E",
  appId: "1:732067878436:android:fc6f53d17f60ed35b4eab1",
  projectId: "freshmart-3c4a7",
  messagingSenderId: "732067878436",
  storageBucket: "freshmart-3c4a7.firebasestorage.app",
  databaseURL: "https://freshmart-3c4a7-default-rtdb.firebaseio.com"
};

try {
  if (firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
    console.log('[Firebase JS] Default app initialized successfully with credentials.');
  }
} catch (err) {
  console.log('[Firebase JS] Init error:', err.message);
}

AppRegistry.registerComponent(appName, () => App);
