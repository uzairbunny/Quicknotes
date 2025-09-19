import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
} from 'react-native';
import {signInWithEmail, signInWithGoogle} from '../services/authService';
import {useTheme} from '../context/ThemeContext';

const LoginScreen = ({navigation}: any) => {
  const {theme} = useTheme();
  const isDarkMode = theme === 'dark';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    const {user, error} = await signInWithEmail(email, password);
    setLoading(false);

    if (error) {
      // Handle different types of errors
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      } else if (typeof error === 'string') {
        Alert.alert('Error', error);
      } else {
        Alert.alert('Error', 'An unknown error occurred');
      }
    } else if (user) {
      // Navigate to dashboard on successful login
      navigation.navigate('NotesList');
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const {user, error} = await signInWithGoogle();
    setLoading(false);

    if (error) {
      // Handle different types of errors
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      } else if (typeof error === 'string') {
        Alert.alert('Error', error);
      } else {
        Alert.alert('Error', 'An unknown error occurred');
      }
    } else if (user) {
      // Navigate to dashboard on successful login
      navigation.navigate('NotesList');
    }
  };

  const handleSignUpNavigation = () => {
    navigation.navigate('SignUp');
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={styles.formContainer}>
        <Text style={[styles.title, isDarkMode && styles.darkTitle]}>QuickNotes</Text>
        <Text style={[styles.subtitle, isDarkMode && styles.darkSubtitle]}>
          Login to your account
        </Text>

        <TextInput
          style={[styles.input, isDarkMode && styles.darkInput]}
          placeholder="Email"
          placeholderTextColor={isDarkMode ? '#aaa' : '#999'}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={[styles.input, isDarkMode && styles.darkInput]}
          placeholder="Password"
          placeholderTextColor={isDarkMode ? '#aaa' : '#999'}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, styles.loginButton, isDarkMode && styles.darkLoginButton]}
          onPress={handleLogin}
          disabled={loading}>
          <Text style={[styles.buttonText, isDarkMode && styles.darkButtonText]}>
            {loading ? 'Logging in...' : 'Login'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.googleButton, isDarkMode && styles.darkGoogleButton]}
          onPress={handleGoogleLogin}
          disabled={loading}>
          <Text style={[styles.buttonText, isDarkMode && styles.darkButtonText]}>
            Sign in with Google
          </Text>
        </TouchableOpacity>

        <View style={styles.signUpContainer}>
          <Text style={[styles.signUpText, isDarkMode && styles.darkSignUpText]}>
            Don't have an account?
          </Text>
          <TouchableOpacity onPress={handleSignUpNavigation}>
            <Text style={[styles.signUpLink, isDarkMode && styles.darkSignUpLink]}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  darkTitle: {
    color: '#fff',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  darkSubtitle: {
    color: '#aaa',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  darkInput: {
    borderColor: '#333',
    backgroundColor: '#1e1e1e',
    color: '#fff',
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  loginButton: {
    backgroundColor: '#007AFF',
  },
  darkLoginButton: {
    backgroundColor: '#4da6ff',
  },
  googleButton: {
    backgroundColor: '#DB4437',
  },
  darkGoogleButton: {
    backgroundColor: '#b33a2d',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  darkButtonText: {
    color: '#000',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signUpText: {
    color: '#666',
    marginRight: 5,
  },
  darkSignUpText: {
    color: '#aaa',
  },
  signUpLink: {
    color: '#007AFF',
    fontWeight: '600',
  },
  darkSignUpLink: {
    color: '#4da6ff',
  },
});

export default LoginScreen;