import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Switch,
  TouchableOpacity,
} from 'react-native';
import {useTheme} from '../context/ThemeContext';

const SettingsScreen = () => {
  const {theme, toggleTheme} = useTheme();
  const isDarkMode = theme === 'dark';

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <Text style={[styles.headerTitle, isDarkMode && styles.darkHeaderTitle]}>
          Settings
        </Text>
      </View>
      <View style={[styles.settingItem, isDarkMode && styles.darkSettingItem]}>
        <Text style={[styles.settingText, isDarkMode && styles.darkSettingText]}>
          Dark Mode
        </Text>
        <Switch
          value={isDarkMode}
          onValueChange={toggleTheme}
          trackColor={{false: '#767577', true: '#81b0ff'}}
          thumbColor={isDarkMode ? '#f5dd4b' : '#f4f3f4'}
        />
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
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  darkHeader: {
    backgroundColor: '#1e1e1e',
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  darkHeaderTitle: {
    color: '#fff',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  darkSettingItem: {
    backgroundColor: '#1e1e1e',
    borderBottomColor: '#333',
  },
  settingText: {
    fontSize: 18,
    color: '#333',
  },
  darkSettingText: {
    color: '#fff',
  },
});

export default SettingsScreen;