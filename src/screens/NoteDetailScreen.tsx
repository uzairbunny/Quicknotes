import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import {RichEditor, RichToolbar, actions} from 'react-native-pell-rich-editor';
import {getNoteById, updateNote, deleteNote} from '../services/notesService';
import {Note} from '../services/notesService';
import {useTheme} from '../context/ThemeContext';
import {exportToPDF, exportToMarkdown} from '../services/exportService';
import {scheduleReminder, cancelReminder} from '../services/remindersService';
import {shareNote} from '../services/sharingService';

const NoteDetailScreen = ({route, navigation}: any) => {
  const {theme} = useTheme();
  const isDarkMode = theme === 'dark';
  const {noteId} = route.params;
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const richText = useRef<any>(null);

  const formatDate = (date: any): string => {
    if (date && date.seconds) {
      return new Date(date.seconds * 1000).toLocaleString();
    }
    return 'Unknown date';
  };

  const fetchNote = async () => {
    setLoading(true);
    const {note: fetchedNote, error} = await getNoteById(noteId);
    setLoading(false);

    if (error) {
      Alert.alert('Error', 'Failed to fetch note');
      navigation.goBack();
    } else if (fetchedNote) {
      setNote(fetchedNote);
      setTitle(fetchedNote.title);
      setContent(fetchedNote.content);
      // Set the HTML content in the rich editor
      richText.current?.setContentHTML(fetchedNote.content);
      setTags(fetchedNote.tags.join(', '));
      // Set reminder date if it exists
      if (fetchedNote.reminderDate) {
        setReminderDate(new Date(fetchedNote.reminderDate.seconds * 1000).toISOString().slice(0, 16));
      }
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    setSaving(true);
    const tagArray = tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    // Get the HTML content from the rich editor
    const htmlContent = await new Promise<string>(resolve => {
      richText.current?.getContentHtml((html: string) => {
        resolve(html);
      });
    });

    // Handle reminder scheduling
    let reminderDateValue: string | undefined | null = reminderDate || undefined;
    if (reminderDate && new Date(reminderDate) <= new Date()) {
      // If reminder date is in the past, clear it
      reminderDateValue = null;
    }

    // Handle reminder scheduling
    if (reminderDateValue) {
      const reminderDateTime = new Date(reminderDateValue);
      if (reminderDateTime > new Date()) {
        await scheduleReminder(noteId, title, content, reminderDateTime);
      }
    } else if (note?.reminderDate) {
      // Cancel existing reminder if date is cleared
      await cancelReminder(noteId);
    }

    const {note: updatedNote, error} = await updateNote(
      noteId,
      title,
      htmlContent,
      tagArray,
      reminderDateValue !== undefined ? reminderDateValue : null,
    );
    setSaving(false);

    if (error) {
      Alert.alert('Error', 'Failed to save note');
    } else if (updatedNote) {
      setNote(updatedNote);
      Alert.alert('Success', 'Note saved successfully');
    }
  };

  const handleShare = () => {
    Alert.prompt(
      'Share Note',
      'Enter the email address of the user you want to share this note with:',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Share',
          onPress: async email => {
            if (!email) {
              Alert.alert('Error', 'Please enter an email address');
              return;
            }
            
            const {success, error} = await shareNote(noteId, email);
            if (error) {
              Alert.alert('Error', error);
            } else {
              Alert.alert('Success', 'Note shared successfully');
            }
          },
        },
      ],
      'plain-text',
    );
  };

  const handleExport = () => {
    const options = ['Export as PDF', 'Export as Markdown', 'Cancel'];
    const cancelButtonIndex = 2;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
        },
        async buttonIndex => {
          if (buttonIndex === 0) {
            handleExportPDF();
          } else if (buttonIndex === 1) {
            handleExportMarkdown();
          }
        },
      );
    } else {
      // For Android, we would use a different approach
      Alert.alert(
        'Export Note',
        'Choose export format',
        [
          {text: 'Export as PDF', onPress: handleExportPDF},
          {text: 'Export as Markdown', onPress: handleExportMarkdown},
          {text: 'Cancel', style: 'cancel'},
        ],
      );
    }
  };

  const handleExportPDF = async () => {
    if (!note) return;

    const tagArray = tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const {success, error} = await exportToPDF(note.title, note.content, tagArray);

    if (success) {
      Alert.alert('Success', 'Note exported as PDF successfully');
    } else {
      Alert.alert('Error', error || 'Failed to export note as PDF');
    }
  };

  const handleExportMarkdown = async () => {
    if (!note) return;

    const tagArray = tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const {success, error} = await exportToMarkdown(note.title, note.content, tagArray);

    if (success) {
      Alert.alert('Success', 'Note exported as Markdown successfully');
    } else {
      Alert.alert('Error', error || 'Failed to export note as Markdown');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // Cancel reminder if it exists
            if (note?.reminderDate) {
              await cancelReminder(noteId);
            }
            
            const {success, error} = await deleteNote(noteId);
            if (error) {
              Alert.alert('Error', 'Failed to delete note');
            } else {
              navigation.goBack();
            }
          },
        },
      ],
    );
  };

  useEffect(() => {
    fetchNote();
  }, [noteId]);

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, isDarkMode && styles.darkContainer]}>
        <Text style={[styles.loadingText, isDarkMode && styles.darkLoadingText]}>
          Loading note...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.headerButton, isDarkMode && styles.darkHeaderButton]}>
            Cancel
          </Text>
        </TouchableOpacity>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            onPress={handleShare}
            style={[styles.shareButton, isDarkMode && styles.darkShareButton]}>
            <Text style={[styles.headerButton, isDarkMode && styles.darkHeaderButton]}>
              Share
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleExport}
            style={[styles.exportButton, isDarkMode && styles.darkExportButton]}>
            <Text style={[styles.headerButton, isDarkMode && styles.darkHeaderButton]}>
              Export
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            style={[styles.saveButton, isDarkMode && styles.darkSaveButton]}>
            <Text style={[styles.headerButton, styles.saveButtonText, isDarkMode && styles.darkSaveButtonText]}>
              {saving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView style={styles.content}>
        <TextInput
          style={[styles.titleInput, isDarkMode && styles.darkTitleInput]}
          value={title}
          onChangeText={setTitle}
          placeholder="Note title"
          placeholderTextColor={isDarkMode ? '#aaa' : '#999'}
        />
        <View style={styles.editorContainer}>
          <RichEditor
            ref={richText}
            style={[styles.editor, isDarkMode && styles.darkEditor]}
            placeholder="Note content"
            onChange={setContent}
            initialContentHTML={content}
          />
        </View>
        <RichToolbar
          editor={richText}
          actions={[
            actions.setBold,
            actions.setItalic,
            actions.setUnderline,
            actions.heading1,
            actions.heading2,
            actions.insertBulletsList,
            actions.insertOrderedList,
            actions.insertLink,
          ]}
          iconMap={{
            [actions.heading1]: ({tintColor}: any) => (
              <Text style={[styles.toolbarIcon, {color: tintColor}]}>H1</Text>
            ),
            [actions.heading2]: ({tintColor}: any) => (
              <Text style={[styles.toolbarIcon, {color: tintColor}]}>H2</Text>
            ),
          }}
        />
        <TextInput
          style={[styles.tagsInput, isDarkMode && styles.darkTagsInput]}
          value={tags}
          onChangeText={setTags}
          placeholder="Tags (comma separated)"
          placeholderTextColor={isDarkMode ? '#aaa' : '#999'}
        />
        <View style={[styles.reminderContainer, isDarkMode && styles.darkReminderContainer]}>
          <Text style={[styles.reminderLabel, isDarkMode && styles.darkReminderLabel]}>
            Reminder Date:
          </Text>
          <TextInput
            style={[styles.reminderInput, isDarkMode && styles.darkReminderInput]}
            value={reminderDate}
            onChangeText={setReminderDate}
            placeholder="YYYY-MM-DD HH:MM"
            placeholderTextColor={isDarkMode ? '#aaa' : '#999'}
            keyboardType="default"
          />
        </View>
        {note && (
          <View style={[styles.metadata, isDarkMode && styles.darkMetadata]}>
            <Text style={[styles.metadataText, isDarkMode && styles.darkMetadataText]}>
              Created: {formatDate(note.createdAt)}
            </Text>
            <Text style={[styles.metadataText, isDarkMode && styles.darkMetadataText]}>
              Updated: {formatDate(note.updatedAt)}
            </Text>
            {note.reminderDate && (
              <Text style={[styles.metadataText, isDarkMode && styles.darkMetadataText]}>
                Reminder: {formatDate(note.reminderDate)}
              </Text>
            )}
          </View>
        )}
        <TouchableOpacity
          style={[styles.deleteButton, isDarkMode && styles.darkDeleteButton]}
          onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Delete Note</Text>
        </TouchableOpacity>
      </ScrollView>
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
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  darkHeader: {
    backgroundColor: '#1e1e1e',
    borderBottomColor: '#333',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    fontSize: 16,
    color: '#007AFF',
    paddingHorizontal: 10,
  },
  darkHeaderButton: {
    color: '#4da6ff',
  },
  shareButton: {
    marginRight: 10,
  },
  darkShareButton: {
    // No specific dark mode styling needed for the button itself
  },
  exportButton: {
    marginRight: 10,
  },
  darkExportButton: {
    // No specific dark mode styling needed for the button itself
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  darkSaveButton: {
    backgroundColor: '#4da6ff',
  },
  saveButtonText: {
    fontWeight: '600',
  },
  darkSaveButtonText: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  darkTitleInput: {
    color: '#fff',
    backgroundColor: '#1e1e1e',
    borderBottomColor: '#333',
  },
  editorContainer: {
    flex: 1,
    minHeight: 200,
  },
  editor: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
  },
  darkEditor: {
    backgroundColor: '#1e1e1e',
    color: '#fff',
  },
  toolbarIcon: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  tagsInput: {
    fontSize: 14,
    color: '#666',
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  darkTagsInput: {
    color: '#fff',
    backgroundColor: '#1e1e1e',
    borderTopColor: '#333',
  },
  reminderContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  darkReminderContainer: {
    backgroundColor: '#1e1e1e',
    borderTopColor: '#333',
  },
  reminderLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  darkReminderLabel: {
    color: '#fff',
  },
  reminderInput: {
    fontSize: 14,
    color: '#666',
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  darkReminderInput: {
    color: '#fff',
    backgroundColor: '#2e2e2e',
    borderColor: '#333',
  },
  metadata: {
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  darkMetadata: {
    backgroundColor: '#1e1e1e',
    borderTopColor: '#333',
  },
  metadataText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  darkMetadataText: {
    color: '#aaa',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    margin: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  darkDeleteButton: {
    backgroundColor: '#cc3028',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NoteDetailScreen;