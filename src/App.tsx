import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {SafeAreaView, StyleSheet, Text} from 'react-native';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import NotesListScreen from './screens/NotesListScreen';
import CreateNoteScreen from './screens/CreateNoteScreen';
import NoteDetailScreen from './screens/NoteDetailScreen';
import VoiceRecordScreen from './screens/VoiceRecordScreen';
import TagsScreen from './screens/TagsScreen';
import NotesByTagScreen from './screens/NotesByTagScreen';
import SettingsScreen from './screens/SettingsScreen';
import SharedNotesScreen from './screens/SharedNotesScreen';
import {getCurrentUser, onAuthStateChanged} from './services/authService';
import {ThemeProvider} from './context/ThemeContext';
import {initPushNotifications} from './services/remindersService';

// Create navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Main Tabs Navigator
const MainTabs = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Notes" component={NotesListScreen} />
      <Tab.Screen name="Record" component={VoiceRecordScreen} />
      <Tab.Screen name="Tags" component={TagsScreen} />
      <Tab.Screen name="Shared" component={SharedNotesScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

// App Navigator for authenticated users
const AppNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MainTabs" 
        component={MainTabs} 
        options={{headerShown: false}} 
      />
      <Stack.Screen 
        name="NoteDetail" 
        component={NoteDetailScreen} 
        options={{title: 'Note Details'}} 
      />
      <Stack.Screen 
        name="CreateNote" 
        component={CreateNoteScreen} 
        options={{title: 'Create Note'}} 
      />
      <Stack.Screen 
        name="VoiceRecord" 
        component={VoiceRecordScreen} 
        options={{title: 'Voice Record'}} 
      />
      <Stack.Screen 
        name="Tags" 
        component={TagsScreen} 
        options={{title: 'Tags'}} 
      />
      <Stack.Screen 
        name="NotesByTag" 
        component={NotesByTagScreen} 
        options={{title: 'Notes by Tag'}} 
      />
    </Stack.Navigator>
  );
};

// Auth Navigator for unauthenticated users
const AuthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
};

// Main App component
const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize push notifications
    initPushNotifications();
    
    const unsubscribe = onAuthStateChanged(user => {
      setIsLoggedIn(!!user);
      setLoading(false);
    });

    // Check initial auth state
    const user = getCurrentUser();
    if (user) {
      setIsLoggedIn(true);
    }
    setLoading(false);

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <ThemeProvider>
      <NavigationContainer>
        {isLoggedIn ? <AppNavigator /> : <AuthNavigator />}
      </NavigationContainer>
    </ThemeProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;