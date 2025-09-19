import firestore from '@react-native-firebase/firestore';
import {getCurrentUser} from './authService';
import {Note} from './notesService';

// Share a note with another user
export const shareNote = async (
  noteId: string,
  email: string,
): Promise<{success: boolean; error?: string}> => {
  try {
    const user = getCurrentUser();
    if (!user) {
      return {success: false, error: 'User not authenticated'};
    }

    // Get the note
    const noteDoc = await firestore().collection('notes').doc(noteId).get();
    
    if (!noteDoc.exists) {
      return {success: false, error: 'Note not found'};
    }

    const noteData = noteDoc.data();
    if (noteData?.userId !== user.uid) {
      return {success: false, error: 'Unauthorized'};
    }

    // Find the user to share with
    const userSnapshot = await firestore()
      .collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      return {success: false, error: 'User not found'};
    }

    const targetUser = userSnapshot.docs[0];
    const targetUserId = targetUser.id;

    // Create a shared note document
    await firestore().collection('sharedNotes').add({
      noteId,
      ownerId: user.uid,
      targetUserId,
      ownerEmail: user.email,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });

    return {success: true};
  } catch (error) {
    return {success: false, error: 'Failed to share note'};
  }
};

// Get notes shared with the current user
export const getSharedNotes = async (): Promise<{notes: Note[]; error?: string}> => {
  try {
    const user = getCurrentUser();
    if (!user) {
      return {notes: [], error: 'User not authenticated'};
    }

    // Get shared notes
    const sharedNotesSnapshot = await firestore()
      .collection('sharedNotes')
      .where('targetUserId', '==', user.uid)
      .get();

    const notes: Note[] = [];
    const noteIds = new Set<string>();

    // Get the actual note data for each shared note
    for (const doc of sharedNotesSnapshot.docs) {
      const sharedNote = doc.data();
      if (noteIds.has(sharedNote.noteId)) continue;
      
      noteIds.add(sharedNote.noteId);
      const noteDoc = await firestore().collection('notes').doc(sharedNote.noteId).get();
      
      // Check if note exists using a type assertion
      if ((noteDoc as any).exists) {
        notes.push({id: noteDoc.id, ...noteDoc.data()} as Note);
      }
    }

    return {notes};
  } catch (error) {
    return {notes: [], error: 'Failed to fetch shared notes'};
  }
};

// Stop sharing a note
export const stopSharingNote = async (
  sharedNoteId: string,
): Promise<{success: boolean; error?: string}> => {
  try {
    const user = getCurrentUser();
    if (!user) {
      return {success: false, error: 'User not authenticated'};
    }

    // Get the shared note
    const sharedNoteDoc = await firestore().collection('sharedNotes').doc(sharedNoteId).get();
    
    if (!(sharedNoteDoc as any).exists) {
      return {success: false, error: 'Shared note not found'};
    }

    const sharedNoteData = sharedNoteDoc.data();
    if (sharedNoteData?.targetUserId !== user.uid) {
      return {success: false, error: 'Unauthorized'};
    }

    // Delete the shared note document
    await firestore().collection('sharedNotes').doc(sharedNoteId).delete();

    return {success: true};
  } catch (error) {
    return {success: false, error: 'Failed to stop sharing note'};
  }
};