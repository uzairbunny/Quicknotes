import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import {getNotes, listenForNotes, searchNotes} from '../services/notesService';
import {Note} from '../services/notesService';
import {useTheme} from '../context/ThemeContext';

const NotesListScreen = ({navigation}: any) => {
  const {theme} = useTheme();
  const isDarkMode = theme === 'dark';
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNotes = async () => {
    setLoading(true);
    const {notes: fetchedNotes, error} = await getNotes();
    setLoading(false);

    if (error) {
      Alert.alert('Error', 'Failed to fetch notes');
    } else {
      setNotes(fetchedNotes);
      setFilteredNotes(fetchedNotes);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredNotes(notes);
      return;
    }

    const {notes: searchResults, error} = await searchNotes(query);
    if (error) {
      Alert.alert('Error', 'Failed to search notes');
    } else {
      setFilteredNotes(searchResults);
    }
  };

  const handleNotePress = (note: Note) => {
    navigation.navigate('NoteDetail', {noteId: note.id});
  };

  const handleCreateNote = () => {
    navigation.navigate('CreateNote');
  };

  const handleVoiceRecord = () => {
    navigation.navigate('VoiceRecord');
  };

  const handleTagsPress = () => {
    navigation.navigate('Tags');
  };

  const handleSharedNotesPress = () => {
    navigation.navigate('Shared');
  };

  useEffect(() => {
    fetchNotes();
    
    // Listen for real-time updates
    const unsubscribe = listenForNotes(
      updatedNotes => {
        setNotes(updatedNotes);
        if (!searchQuery.trim()) {
          setFilteredNotes(updatedNotes);
        }
      },
      error => {
        Alert.alert('Error', 'Failed to listen for notes');
      },
    );

    return () => unsubscribe();
  }, []);

  const renderNote = ({item}: {item: Note}) => (
    <TouchableOpacity
      style={[styles.noteItem, isDarkMode && styles.darkNoteItem]}
      onPress={() => handleNotePress(item)}>
      <Text style={[styles.noteTitle, isDarkMode && styles.darkNoteTitle]}>
        {item.title}
      </Text>
      <Text
        style={[styles.noteContent, isDarkMode && styles.darkNoteContent]}
        numberOfLines={2}>
        {item.content.replace(/<[^>]*>/g, '')}
      </Text>
      <View style={styles.noteFooter}>
        <Text style={[styles.noteTags, isDarkMode && styles.darkNoteTags]}>
          {item.tags.join(', ')}
        </Text>
        <Text style={[styles.noteDate, isDarkMode && styles.darkNoteDate]}>
          {item.createdAt?.toDate?.().toLocaleDateString() || 'Unknown date'}
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
          QuickNotes
        </Text>
      </View>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.searchInput, isDarkMode && styles.darkSearchInput]}
          placeholder="Search notes..."
          placeholderTextColor={isDarkMode ? '#aaa' : '#999'}
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>
      
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, isDarkMode && styles.darkActionButton]}
          onPress={handleCreateNote}>
          <Text style={[styles.actionButtonText, isDarkMode && styles.darkActionButtonText]}>
            + Create Note
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, isDarkMode && styles.darkActionButton]}
          onPress={handleVoiceRecord}>
          <Text style={[styles.actionButtonText, isDarkMode && styles.darkActionButtonText]}>
            🎤 Voice Record
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.secondaryButtonsContainer}>
        <TouchableOpacity
          style={[styles.secondaryButton, isDarkMode && styles.darkSecondaryButton]}
          onPress={handleTagsPress}>
          <Text style={[styles.secondaryButtonText, isDarkMode && styles.darkSecondaryButtonText]}>
            Tags
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.secondaryButton, isDarkMode && styles.darkSecondaryButton]}
          onPress={handleSharedNotesPress}>
          <Text style={[styles.secondaryButtonText, isDarkMode && styles.darkSecondaryButtonText]}>
            Shared Notes
          </Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={filteredNotes}
        renderItem={renderNote}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.notesList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, isDarkMode && styles.darkEmptyText]}>
              No notes found
            </Text>
          </View>
        }
      />
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
    padding: 15,
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
    textAlign: 'center',
  },
  darkHeaderTitle: {
    color: '#fff',
  },
  searchContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  darkSearchContainer: {
    backgroundColor: '#1e1e1e',
    borderBottomColor: '#333',
  },
  searchInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#f9f9f9',
  },
  darkSearchInput: {
    backgroundColor: '#2e2e2e',
    borderColor: '#333',
    color: '#fff',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  secondaryButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  darkActionButton: {
    backgroundColor: '#4da6ff',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  darkActionButtonText: {
    color: '#fff',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  darkSecondaryButton: {
    backgroundColor: '#333',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  darkSecondaryButtonText: {
    color: '#ddd',
  },
  notesList: {
    padding: 15,
  },
  noteItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
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
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  darkNoteContent: {
    color: '#ddd',
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteTags: {
    fontSize: 12,
    color: '#999',
  },
  darkNoteTags: {
    color: '#aaa',
  },
  noteDate: {
    fontSize: 12,
    color: '#999',
  },
  darkNoteDate: {
    color: '#aaa',
  },
  loadingText: {
    color: '#333',
    textAlign: 'center',
    marginTop: 50,
  },
  darkLoadingText: {
    color: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
  },
  darkEmptyText: {
    color: '#aaa',
  },
});

export default NotesListScreen;