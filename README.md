# QuickNotes - Voice-to-Text Notes App with Cloud Sync

QuickNotes is a productivity app that lets users quickly create, organize, and access their notes. Instead of typing, users can speak, and the app converts speech into text instantly. All notes are securely synced to the cloud so they're available across multiple devices.

## Features

### Voice-to-Text Notes
- Use device microphone to record speech
- AI/ML model (Google Speech-to-Text API / Whisper API) converts speech into text
- Supports multiple languages

### Text Notes + Editing
- Option to manually type/edit notes
- Rich text formatting (bold, bullet points, headings)

### Cloud Sync
- Firebase backend for real-time sync
- Notes accessible on multiple devices with the same account
- Offline mode → syncs automatically when back online

### Organization & Search
- Tags & categories for grouping notes
- Full-text search with highlighting

### User Authentication
- Email/Google login with Firebase Auth
- Each user's notes stored securely in their account

### Extras (Wow Factor)
- Dark/Light mode toggle
- Export notes as PDF/Markdown
- Reminders & notifications for important notes
- Option to share notes with friends (collaboration mode)

## Tech Stack

- **Frontend (Mobile)**: React Native + TypeScript
- **Voice Processing**: Google Speech-to-Text API / OpenAI Whisper API for transcription
- **Backend & Database**: Firebase (Auth + Firestore + Storage)
- **Cloud Sync**: Real-time sync with Firestore listeners
- **UI/UX**: React Native Paper for Material Design

## Sample Workflow

1. User logs in → navigates to dashboard
2. Taps "🎤 Record Note" → speaks → note automatically appears as text
3. User can edit the note, add tags (e.g., "Work", "Study")
4. Notes are instantly synced to Firestore → available on all devices
5. User can search for past notes or export a note as PDF

## Installation

1. Clone the repository
2. Run `npm install` to install dependencies
3. Configure Firebase:
   - Create a Firebase project at https://firebase.google.com/
   - Add your Firebase configuration to `src/config/firebase.ts`
4. Run `npx react-native run-android` or `npx react-native run-ios` to start the app

## Folder Structure

```
src/
├── App.tsx              # Main app component with navigation
├── config/
│   └── firebase.ts     # Firebase configuration
├── context/
│   └── ThemeContext.tsx # Theme context for dark/light mode
├── screens/
│   ├── LoginScreen.tsx
│   ├── SignUpScreen.tsx
│   ├── NotesListScreen.tsx
│   ├── CreateNoteScreen.tsx
│   ├── NoteDetailScreen.tsx
│   ├── VoiceRecordScreen.tsx
│   ├── TagsScreen.tsx
│   ├── NotesByTagScreen.tsx
│   └── SharedNotesScreen.tsx
└── services/
    ├── authService.ts
    ├── notesService.ts
    ├── voiceService.ts
    ├── exportService.ts
    ├── remindersService.ts
    └── sharingService.ts
```

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## License

This project is licensed under the MIT License.