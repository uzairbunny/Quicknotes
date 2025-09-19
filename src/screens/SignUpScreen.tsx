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
import {signUpWithEmail} from '../services/authService';
import {useTheme} from '../context/ThemeContext';

const SignUpScreen = ({navigation}: any) => {
  const {theme} = useTheme();
  const isDarkMode = theme === 'dark';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const {user, error} = await signUpWithEmail(email, password);
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
      // Navigate to dashboard on successful signup
      navigation.navigate('NotesList');
    }
  };

  const handleLoginNavigation = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={styles.formContainer}>
        <Text style={[styles.title, isDarkMode && styles.darkTitle]}>QuickNotes</Text>
        <Text style={[styles.subtitle, isDarkMode && styles.darkSubtitle]}>
          Create an account
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

        <TextInput
          style={[styles.input, isDarkMode && styles.darkInput]}
          placeholder="Confirm Password"
          placeholderTextColor={isDarkMode ? '#aaa' : '#999'}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, styles.signUpButton, isDarkMode && styles.darkSignUpButton]}
          onPress={handleSignUp}
          disabled={loading}>
          <Text style={[styles.buttonText, isDarkMode && styles.darkButtonText]}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </Text>
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={[styles.loginText, isDarkMode && styles.darkLoginText]}>
            Already have an account?
          </Text>
          <TouchableOpacity onPress={handleLoginNavigation}>
            <Text style={[styles.loginLink, isDarkMode && styles.darkLoginLink]}>
              Login
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
  signUpButton: {
    backgroundColor: '#007AFF',
  },
  darkSignUpButton: {
    backgroundColor: '#4da6ff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  darkButtonText: {
    color: '#000',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#666',
    marginRight: 5,
  },
  darkLoginText: {
    color: '#aaa',
  },
  loginLink: {
    color: '#007AFF',
    fontWeight: '600',
  },
  darkLoginLink: {
    color: '#4da6ff',
  },
});

export default SignUpScreen;