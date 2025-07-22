import { useState, useEffect, useRef, useCallback } from 'react';

interface VoiceControlOptions {
  wakeWord: string;
  onWakeWord: () => void;
  onCommand: (command: string) => void;
  onSleep: () => void;
}

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export const useVoiceControl = ({ wakeWord, onWakeWord, onCommand, onSleep }: VoiceControlOptions) => {
  const [isListening, setIsListening] = useState(false);
  const [isAwake, setIsAwake] = useState(false);
  const [isSupported, setIsSupported] = useState(!!SpeechRecognition);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const awakeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError("Voice control is not supported by your browser.");
      return;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        // Already started
      }
    }
  }, [isSupported]);
  
  useEffect(() => {
    if (!isSupported) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onend = () => {
      setIsListening(false);
      setIsAwake(false);
      // Automatically restart listening unless explicitly stopped
      if (isListening) {
        setTimeout(() => startListening(), 500);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech' || event.error === 'audio-capture') {
        // Ignore these common errors
      } else if (event.error === 'not-allowed') {
        setError("Microphone access denied. Please enable it in your browser settings.");
        setIsSupported(false);
      } else {
        setError(`Voice recognition error: ${event.error}`);
      }
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('')
        .toLowerCase();

      if (isAwake) {
        if (event.results[event.results.length - 1].isFinal) {
          const command = transcript.split(wakeWord).pop()?.trim();
          if (command) {
            onCommand(command);
          }
          setIsAwake(false);
          onSleep();
        }
      } else if (transcript.includes(wakeWord)) {
        setIsAwake(true);
        onWakeWord();
        if (awakeTimeoutRef.current) clearTimeout(awakeTimeoutRef.current);
        awakeTimeoutRef.current = setTimeout(() => {
          setIsAwake(false);
          onSleep();
        }, 7000); // Stay awake for 7 seconds
      }
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (awakeTimeoutRef.current) {
        clearTimeout(awakeTimeoutRef.current);
      }
    };
  }, [isSupported, wakeWord, onWakeWord, onCommand, onSleep, isListening, startListening]);

  return { isListening, isAwake, startListening, stopListening, isSupported, error };
};
