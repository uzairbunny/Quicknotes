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
import HTMLView from 'react-native-htmlview';
import {listenForNotes} from '../services/notesService';
import {Note} from '../services/notesService';
import {useTheme} from '../context/ThemeContext';

const NotesByTagScreen = ({route, navigation}: any) => {
  const {theme} = useTheme();
  const isDarkMode = theme === 'dark';
  const {tag} = route.params;
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const formatDate = (date: any): string => {
    if (date && date.seconds) {
      return new Date(date.seconds * 1000).toLocaleDateString();
    }
    return 'Unknown date';
  };

  useEffect(() => {
    // Listen for real-time updates to notes and filter by tag
    const unsubscribe = listenForNotes(
      fetchedNotes => {
        const filteredNotes = fetchedNotes.filter(note => 
          note.tags.includes(tag)
        );
        setNotes(filteredNotes);
        setLoading(false);
      },
      error => {
        Alert.alert('Error', 'Failed to fetch notes');
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [tag]);

  const handleNotePress = (note: Note) => {
    navigation.navigate('NoteDetail', {noteId: note.id});
  };

  const renderNoteItem = ({item}: {item: Note}) => (
    <TouchableOpacity
      style={[styles.noteItem, isDarkMode && styles.darkNoteItem]}
      onPress={() => handleNotePress(item)}>
      <Text style={[styles.noteTitle, isDarkMode && styles.darkNoteTitle]}>
        {item.title}
      </Text>
      <View style={styles.noteContent}>
        <HTMLView
          value={item.content}
          stylesheet={htmlStyles}
          numberOfLines={2}
        />
      </View>
      <View style={styles.noteFooter}>
        <Text style={[styles.noteDate, isDarkMode && styles.darkNoteDate]}>
          {formatDate(item.createdAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, isDarkMode && styles.darkContainer]}>
        <Text style={[styles.loadingText, isDarkMode && styles.darkLoadingText]}>
          Loading notes...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <Text style={[styles.headerTitle, isDarkMode && styles.darkHeaderTitle]}>
          Notes tagged with "{tag}"
        </Text>
      </View>
      {notes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, isDarkMode && styles.darkEmptyText]}>
            No notes with this tag
          </Text>
        </View>
      ) : (
        <FlatList
          data={notes}
          renderItem={renderNoteItem}
          keyExtractor={item => item.id}
        />
      )}
    </SafeAreaView>
  );
};

const htmlStyles = StyleSheet.create({
  p: {
    fontSize: 14,
    color: '#666',
    marginBottom: 0,
  },
  a: {
    color: '#007AFF',
  },
  h1: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  h2: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  li: {
    fontSize: 14,
    color: '#666',
  },
});

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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  darkHeaderTitle: {
    color: '#fff',
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
  noteItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  darkNoteItem: {
    backgroundColor: '#1e1e1e',
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  darkNoteTitle: {
    color: '#fff',
  },
  noteContent: {
    marginBottom: 10,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  noteDate: {
    fontSize: 12,
    color: '#999',
  },
  darkNoteDate: {
    color: '#aaa',
  },
});

export default NotesByTagScreen;