import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import {RichEditor, RichToolbar, actions} from 'react-native-pell-rich-editor';
import {createNote} from '../services/notesService';
import {useTheme} from '../context/ThemeContext';

const CreateNoteScreen = ({navigation}: any) => {
  const {theme} = useTheme();
  const isDarkMode = theme === 'dark';
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [saving, setSaving] = useState(false);
  const richText = useRef<any>(null);

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

    const {note, error} = await createNote(title, htmlContent, tagArray);
    setSaving(false);

    if (error) {
      Alert.alert('Error', 'Failed to create note');
    } else if (note) {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.headerButton, isDarkMode && styles.darkHeaderButton]}>
            Cancel
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
  headerButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  darkHeaderButton: {
    color: '#4da6ff',
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
});

export default CreateNoteScreen;