// React Native Firebase configuration
// No manual initialization needed - @react-native-firebase/app handles this automatically
// The configuration comes from google-services.json (Android) and GoogleService-Info.plist (iOS)

// Import Firebase services
// import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

// Export the services for use in your app
// export { auth };
export { firestore, storage };

// Optional: You can also export the app instance if needed
import app from '@react-native-firebase/app';
export { app };

