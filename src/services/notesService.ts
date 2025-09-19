import firestore from '@react-native-firebase/firestore';
import {getCurrentUser} from './authService';

// Note interface
export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: any;
  updatedAt: any;
  tags: string[];
  userId: string;
  reminderDate?: any; // Optional reminder date
}

// Create a new note
export const createNote = async (
  title: string,
  content: string,
  tags: string[] = [],
): Promise<{note: Note | null; error: any}> => {
  try {
    const user = getCurrentUser();
    if (!user) {
      return {note: null, error: new Error('User not authenticated')};
    }

    const noteData = {
      title,
      content,
      tags,
      userId: user.uid,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await firestore().collection('notes').add(noteData);
    const doc = await docRef.get();
    const note = {id: doc.id, ...doc.data()} as Note;
    
    return {note, error: null};
  } catch (error) {
    return {note: null, error};
  }
};

// Get all notes for the current user
export const getNotes = async (): Promise<{notes: Note[]; error: any}> => {
  try {
    const user = getCurrentUser();
    if (!user) {
      return {notes: [], error: new Error('User not authenticated')};
    }

    const querySnapshot = await firestore()
      .collection('notes')
      .where('userId', '==', user.uid)
      .orderBy('createdAt', 'desc')
      .get();

    const notes: Note[] = [];
    querySnapshot.forEach(doc => {
      notes.push({id: doc.id, ...doc.data()} as Note);
    });

    return {notes, error: null};
  } catch (error) {
    return {notes: [], error};
  }
};

// Get a specific note by ID
export const getNoteById = async (
  noteId: string,
): Promise<{note: Note | null; error: any}> => {
  try {
    const user = getCurrentUser();
    if (!user) {
      return {note: null, error: new Error('User not authenticated')};
    }

    const doc = await firestore().collection('notes').doc(noteId).get();
    
    if (!doc.exists) {
      return {note: null, error: new Error('Note not found')};
    }

    const note = {id: doc.id, ...doc.data()} as Note;
    return {note, error: null};
  } catch (error) {
    return {note: null, error};
  }
};

// Update a note
export const updateNote = async (
  noteId: string,
  title: string,
  content: string,
  tags: string[] = [],
  reminderDate?: string | null,
): Promise<{note: Note | null; error: any}> => {
  try {
    const user = getCurrentUser();
    if (!user) {
      return {note: null, error: new Error('User not authenticated')};
    }

    const noteRef = firestore().collection('notes').doc(noteId);
    
    // Check if note exists and belongs to user
    const doc = await noteRef.get();
    if (!doc.exists) {
      return {note: null, error: new Error('Note not found')};
    }

    const noteData = doc.data();
    if (noteData?.userId !== user.uid) {
      return {note: null, error: new Error('Unauthorized')};
    }

    // Prepare update data
    const updateData: any = {
      title,
      content,
      tags,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    };

    // Add reminder date if provided
    if (reminderDate) {
      updateData.reminderDate = firestore.Timestamp.fromDate(new Date(reminderDate));
    } else if (reminderDate === null) {
      // Explicitly set to null if cleared
      updateData.reminderDate = firestore.FieldValue.delete();
    }

    // Update the note
    await noteRef.update(updateData);

    const updatedDoc = await noteRef.get();
    const note = {id: updatedDoc.id, ...updatedDoc.data()} as Note;
    
    return {note, error: null};
  } catch (error) {
    return {note: null, error};
  }
};

// Delete a note
export const deleteNote = async (
  noteId: string,
): Promise<{success: boolean; error: any}> => {
  try {
    const user = getCurrentUser();
    if (!user) {
      return {success: false, error: new Error('User not authenticated')};
    }

    const noteRef = firestore().collection('notes').doc(noteId);
    
    // Check if note exists and belongs to user
    const doc = await noteRef.get();
    if (!doc.exists) {
      return {success: false, error: new Error('Note not found')};
    }

    const noteData = doc.data();
    if (noteData?.userId !== user.uid) {
      return {success: false, error: new Error('Unauthorized')};
    }

    // Delete the note
    await noteRef.delete();
    
    return {success: true, error: null};
  } catch (error) {
    return {success: false, error};
  }
};

// Search notes by title or content
export const searchNotes = async (
  query: string,
): Promise<{notes: Note[]; error: any}> => {
  try {
    const user = getCurrentUser();
    if (!user) {
      return {notes: [], error: new Error('User not authenticated')};
    }

    // This is a simple search implementation
    // For better search functionality, consider using Firestore's full-text search capabilities
    const titleSnapshot = await firestore()
      .collection('notes')
      .where('userId', '==', user.uid)
      .orderBy('title')
      .startAt(query)
      .endAt(query + '\uf8ff')
      .get();

    const contentSnapshot = await firestore()
      .collection('notes')
      .where('userId', '==', user.uid)
      .orderBy('content')
      .startAt(query)
      .endAt(query + '\uf8ff')
      .get();

    const notes: Note[] = [];
    const noteIds = new Set<string>();

    // Add notes from title search
    titleSnapshot.forEach(doc => {
      if (!noteIds.has(doc.id)) {
        noteIds.add(doc.id);
        notes.push({id: doc.id, ...doc.data()} as Note);
      }
    });

    // Add notes from content search
    contentSnapshot.forEach(doc => {
      if (!noteIds.has(doc.id)) {
        noteIds.add(doc.id);
        notes.push({id: doc.id, ...doc.data()} as Note);
      }
    });

    return {notes, error: null};
  } catch (error) {
    return {notes: [], error};
  }
};

// Listen for real-time updates to notes
export const listenForNotes = (
  callback: (notes: Note[]) => void,
  onError: (error: any) => void,
) => {
  const user = getCurrentUser();
  if (!user) {
    onError(new Error('User not authenticated'));
    return () => {};
  }

  const unsubscribe = firestore()
    .collection('notes')
    .where('userId', '==', user.uid)
    .orderBy('createdAt', 'desc')
    .onSnapshot(
      querySnapshot => {
        const notes: Note[] = [];
        querySnapshot.forEach(doc => {
          notes.push({id: doc.id, ...doc.data()} as Note);
        });
        callback(notes);
      },
      error => {
        onError(error);
      },
    );

  return unsubscribe;
};