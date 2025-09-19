import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import Voice from '@react-native-voice/voice';
import {createNote} from '../services/notesService';
import {useTheme} from '../context/ThemeContext';

const VoiceRecordScreen = ({navigation}: any) => {
  const {theme} = useTheme();
  const isDarkMode = theme === 'dark';
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const onSpeechStart = (e: any) => {
    console.log('Speech started');
    setIsRecording(true);
  };

  const onSpeechEnd = (e: any) => {
    console.log('Speech ended');
    setIsRecording(false);
  };

  const onSpeechResults = (e: any) => {
    console.log('Speech results', e.value);
    setTranscript(e.value?.[0] || '');
  };

  const onSpeechError = (e: any) => {
    console.log('Speech error', e.error);
    setIsRecording(false);
    Alert.alert('Error', 'Speech recognition error occurred');
  };

  const startRecording = async () => {
    try {
      await Voice.start('en-US');
      setIsListening(true);
    } catch (error) {
      console.log('Error starting recording', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (error) {
      console.log('Error stopping recording', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const saveNote = async () => {
    if (!transcript.trim()) {
      Alert.alert('Error', 'Please record some speech first');
      return;
    }

    const {note, error} = await createNote(
      'Voice Note',
      `<p>${transcript}</p>`,
      ['voice'],
    );

    if (error) {
      Alert.alert('Error', 'Failed to save note');
    } else if (note) {
      Alert.alert('Success', 'Note saved successfully');
      setTranscript('');
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <Text style={[styles.headerTitle, isDarkMode && styles.darkHeaderTitle]}>
          Voice Recorder
        </Text>
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.transcriptContainer}>
          <Text style={[styles.transcriptLabel, isDarkMode && styles.darkTranscriptLabel]}>
            Transcript:
          </Text>
          <Text style={[styles.transcript, isDarkMode && styles.darkTranscript]}>
            {transcript || 'Your speech will appear here...'}
          </Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.recordButton,
              isRecording && styles.recordingButton,
              isDarkMode && styles.darkRecordButton,
              isRecording && isDarkMode && styles.darkRecordingButton,
            ]}
            onPress={isListening ? stopRecording : startRecording}>
            <Text style={styles.recordButtonText}>
              {isListening ? 'Stop Recording' : 'Start Recording'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveButton, isDarkMode && styles.darkSaveButton]}
            onPress={saveNote}
            disabled={!transcript.trim()}>
            <Text style={[styles.saveButtonText, !transcript.trim() && styles.disabledText]}>
              Save as Note
            </Text>
          </TouchableOpacity>
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
    textAlign: 'center',
  },
  darkHeaderTitle: {
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  transcriptContainer: {
    flex: 1,
    marginBottom: 20,
  },
  transcriptLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  darkTranscriptLabel: {
    color: '#fff',
  },
  transcript: {
    fontSize: 16,
    color: '#666',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    minHeight: 100,
  },
  darkTranscript: {
    color: '#fff',
    backgroundColor: '#1e1e1e',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recordButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  darkRecordButton: {
    backgroundColor: '#4da6ff',
  },
  recordingButton: {
    backgroundColor: '#FF3B30',
  },
  darkRecordingButton: {
    backgroundColor: '#cc3028',
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  darkSaveButton: {
    backgroundColor: '#2a9d4a',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledText: {
    color: '#999',
  },
});

export default VoiceRecordScreen;