import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {getSharedNotes, stopSharingNote} from '../services/sharingService';
import {Note} from '../services/notesService';
import {useTheme} from '../context/ThemeContext';

const SharedNotesScreen = ({navigation}: any) => {
  const {theme} = useTheme();
  const isDarkMode = theme === 'dark';
  const [sharedNotes, setSharedNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSharedNotes = async () => {
    setLoading(true);
    const {notes, error} = await getSharedNotes();
    setLoading(false);

    if (error) {
      Alert.alert('Error', error);
    } else {
      setSharedNotes(notes);
    }
  };

  const handleNotePress = (note: Note) => {
    navigation.navigate('NoteDetail', {noteId: note.id});
  };

  const handleStopSharing = (noteId: string) => {
    Alert.alert(
      'Stop Sharing',
      'Are you sure you want to stop sharing this note?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Stop Sharing',
          style: 'destructive',
          onPress: async () => {
            const {success, error} = await stopSharingNote(noteId);
            if (error) {
              Alert.alert('Error', error);
            } else {
              // Refresh the list
              fetchSharedNotes();
            }
          },
        },
      ],
    );
  };

  useEffect(() => {
    fetchSharedNotes();
  }, []);

  const renderNote = ({item}: {item: Note}) => (
    <TouchableOpacity
      style={[styles.noteItem, isDarkMode && styles.darkNoteItem]}
      onPress={() => handleNotePress(item)}>
      <View style={styles.noteHeader}>
        <Text style={[styles.noteTitle, isDarkMode && styles.darkNoteTitle]}>
          {item.title}
        </Text>
        <TouchableOpacity onPress={() => handleStopSharing(item.id)}>
          <Text style={[styles.stopSharingText, isDarkMode && styles.darkStopSharingText]}>
            Stop Sharing
          </Text>
        </TouchableOpacity>
      </View>
      <Text
        style={[styles.noteContent, isDarkMode && styles.darkNoteContent]}
        numberOfLines={2}>
        {item.content.replace(/<[^>]*>/g, '')}
      </Text>
      <View style={styles.noteFooter}>
        <Text style={[styles.noteTags, isDarkMode && styles.darkNoteTags]}>
          {item.tags.join(', ')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, isDarkMode && styles.darkContainer]}>
        <Text style={[styles.loadingText, isDarkMode && styles.darkLoadingText]}>
          Loading shared notes...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <Text style={[styles.headerTitle, isDarkMode && styles.darkHeaderTitle]}>
          Shared Notes
        </Text>
      </View>
      <FlatList
        data={sharedNotes}
        renderItem={renderNote}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.notesList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, isDarkMode && styles.darkEmptyText]}>
              No shared notes found
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
  },
  darkHeaderTitle: {
    color: '#fff',
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
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
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
  stopSharingText: {
    color: '#FF3B30',
    fontSize: 14,
  },
  darkStopSharingText: {
    color: '#ff6b6b',
  },
});

export default SharedNotesScreen;