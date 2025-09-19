import auth from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';
import firebaseConfig from '../config/firebase';

// Initialize Firebase if not already initialized
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    return {user: userCredential.user, error: null};
  } catch (error) {
    return {user: null, error};
  }
};

// Sign up with email and password
export const signUpWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    return {user: userCredential.user, error: null};
  } catch (error) {
    return {user: null, error};
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    // Implementation for Google sign-in would go here
    // This typically requires additional setup with Google Sign-In SDK
    console.log('Google sign-in not yet implemented');
    return {user: null, error: new Error('Google sign-in not implemented')};
  } catch (error) {
    return {user: null, error};
  }
};

// Sign out
export const signOut = async () => {
  try {
    await auth().signOut();
    return {success: true, error: null};
  } catch (error) {
    return {success: false, error};
  }
};

// Get current user
export const getCurrentUser = () => {
  return auth().currentUser;
};

// Listen for authentication state changes
export const onAuthStateChanged = (callback: (user: any) => void) => {
  return auth().onAuthStateChanged(callback);
};