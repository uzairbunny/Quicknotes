import Voice, {
  SpeechRecognizedEvent,
  SpeechResultEvent,
  SpeechErrorEvent,
} from '@react-native-voice/voice';

export class VoiceService {
  private static instance: VoiceService;
  private isListening: boolean = false;
  private onResultCallback: ((text: string) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;

  private constructor() {
    // Initialize voice recognition events
    Voice.onSpeechStart = this.onSpeechStart;
    Voice.onSpeechRecognized = this.onSpeechRecognized;
    Voice.onSpeechResults = this.onSpeechResults;
    Voice.onSpeechError = this.onSpeechError;
  }

  public static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService();
    }
    return VoiceService.instance;
  }

  private onSpeechStart = (e: any) => {
    console.log('Speech start detected', e);
  };

  private onSpeechRecognized = (e: SpeechRecognizedEvent) => {
    console.log('Speech recognized', e);
  };

  private onSpeechResults = (e: SpeechResultEvent) => {
    console.log('Speech results', e);
    if (this.onResultCallback && e.value && e.value.length > 0) {
      // Use the best result (first one)
      this.onResultCallback(e.value[0]);
    }
  };

  private onSpeechError = (e: SpeechErrorEvent) => {
    console.log('Speech error', e);
    if (this.onErrorCallback) {
      this.onErrorCallback(e.error?.message || 'Unknown error occurred');
    }
  };

  public startListening(onResult: (text: string) => void, onError: (error: string) => void): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (this.isListening) {
        reject(new Error('Already listening'));
        return;
      }

      this.onResultCallback = onResult;
      this.onErrorCallback = onError;

      try {
        // Set the locale to English (you can change this as needed)
        await Voice.setLocale('en-US');
        
        // Start listening
        await Voice.start('en-US');
        this.isListening = true;
        resolve();
      } catch (error) {
        this.isListening = false;
        reject(error);
      }
    });
  }

  public stopListening(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (!this.isListening) {
        resolve();
        return;
      }

      try {
        await Voice.stop();
        this.isListening = false;
        this.onResultCallback = null;
        this.onErrorCallback = null;
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  public destroy(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        await Voice.destroy();
        this.isListening = false;
        this.onResultCallback = null;
        this.onErrorCallback = null;
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  public isCurrentlyListening(): boolean {
    return this.isListening;
  }
}

// Export a singleton instance
export default VoiceService.getInstance();