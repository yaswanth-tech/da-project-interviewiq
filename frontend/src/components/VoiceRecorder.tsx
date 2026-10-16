import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';

interface VoiceRecorderProps {
  onTranscriptChange: (text: string) => void;
  currentText: string;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onTranscriptChange,
  currentText,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Web Speech API is not supported in this browser. Please use Chrome/Edge or type your answer.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        }
      }
      if (finalTranscript) {
        onTranscriptChange(currentText ? `${currentText} ${finalTranscript.trim()}` : finalTranscript.trim());
      }
    };

    recognition.onerror = (evt: any) => {
      console.error('Speech recognition error:', evt.error);
      if (evt.error === 'not-allowed') {
        setError('Microphone permission was denied. Please allow mic access or type your answer.');
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [currentText, onTranscriptChange]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setError(null);
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={toggleListening}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-sm ${
            isListening
              ? 'bg-rose-600 text-white animate-pulse hover:bg-rose-700'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="w-4 h-4" />
              Stop Recording Voice
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" />
              Answer via Voice (Speech-to-Text)
            </>
          )}
        </button>

        {isListening && (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-rose-500 dark:text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            Live Recording Active...
          </span>
        )}
      </div>

      {error && (
        <div className="p-3 text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
