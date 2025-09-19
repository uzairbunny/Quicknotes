import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import {listenForNotes} from '../services/notesService';
import {Note} from '../services/notesService';
import {useTheme} from '../context/ThemeContext';

const TagsScreen = ({navigation}: any) => {
  const {theme} = useTheme();
  const isDarkMode = theme === 'dark';
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for real-time updates to notes and extract tags
    const unsubscribe = listenForNotes(
      fetchedNotes => {
        const allTags = new Set<string>();
        fetchedNotes.forEach(note => {
          note.tags.forEach(tag => {
            allTags.add(tag);
          });
        });
        setTags(Array.from(allTags));
        setLoading(false);
      },
      error => {
        Alert.alert('Error', 'Failed to fetch tags');
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const handleTagPress = (tag: string) => {
    navigation.navigate('NotesByTag', {tag});
  };

  const renderTagItem = ({item}: {item: string}) => (
    <TouchableOpacity
      style={[styles.tagItem, isDarkMode && styles.darkTagItem]}
      onPress={() => handleTagPress(item)}>
      <Text style={[styles.tagText, isDarkMode && styles.darkTagText]}>{item}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
        <Text style={[styles.loadingText, isDarkMode && styles.darkLoadingText]}>
          Loading tags...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <Text style={[styles.headerTitle, isDarkMode && styles.darkHeaderTitle]}>
          Tags
        </Text>
      </View>
      {tags.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, isDarkMode && styles.darkEmptyText]}>
            No tags yet
          </Text>
          <Text style={[styles.emptySubtext, isDarkMode && styles.darkEmptySubtext]}>
            Add tags to your notes to see them here
          </Text>
        </View>
      ) : (
        <FlatList
          data={tags}
          renderItem={renderTagItem}
          keyExtractor={item => item}
          numColumns={2}
          contentContainerStyle={styles.tagsContainer}
        />
      )}
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
  loadingText: {
    color: '#333',
  },
  darkLoadingText: {
    color: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  tagsContainer: {
    padding: 10,
  },
  tagItem: {
    backgroundColor: '#007AFF',
    padding: 15,
    margin: 5,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  darkTagItem: {
    backgroundColor: '#4da6ff',
  },
  tagText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  darkTagText: {
    color: '#000',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  darkEmptyText: {
    color: '#aaa',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#999',
  },
  darkEmptySubtext: {
    color: '#777',
  },
});

export default TagsScreen;