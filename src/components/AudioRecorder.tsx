import React, { useState, useRef } from 'react';
import { Mic, Square, Loader2, CheckCircle2 } from 'lucide-react';

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  questionId: string;
}

export default function AudioRecorder({ onRecordingComplete, questionId }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [showWarning, setShowWarning] = useState(false); // State to control popup visibility
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      setIsPreparing(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onRecordingComplete(audioBlob);
        setHasRecording(true);
        
        // Clean up the media stream
        if (stream && stream.getTracks) {
          stream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsPreparing(false);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setIsPreparing(false);
      alert('Could not access microphone. Please ensure you have granted permission.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleNewRecording = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (hasRecording) {
      setShowWarning(true); // Show the warning popup
    } else {
      startRecording(); // Start recording immediately if no previous recording exists
    }
  };

  const confirmNewRecording = () => {
    setShowWarning(false); // Hide the warning popup
    setHasRecording(false); // Clear previous recording state
    startRecording(); // Start new recording
  };

  return (
    <div className="flex items-center gap-2 relative">
      {isPreparing ? (
        <button 
          type="button"
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-400 rounded-lg cursor-wait"
          disabled
        >
          <Loader2 className="w-5 h-5 animate-spin" />
          Vorbereiten...
        </button>
      ) : isRecording ? (
        <button
          type="button"
          onClick={stopRecording}
          className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
          aria-label="Stop recording"
        >
          <Square className="w-5 h-5" />
          Aufnahme stoppen
        </button>
      ) : hasRecording ? (
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-green-600">
            <CheckCircle2 className="w-5 h-5" />
            Aufnahme gespeichert
          </span>
          <button
            type="button"
            onClick={handleNewRecording}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors ml-2"
            aria-label="Record new answer"
          >
            <Mic className="w-5 h-5" />
            Neue Aufnahme
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={startRecording}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
          aria-label="Start recording"
        >
          <Mic className="w-5 h-5" />
          Antwort Aufnehmen
        </button>
      )}

      {showWarning && (
        <div className="absolute bottom-full mb-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm w-full text-center shadow-md">
          <p>Die vorherige Aufnahme wird gelöscht. Möchten Sie fortfahren?</p>
          <div className="mt-2 flex justify-center gap-4">
            <button
              onClick={confirmNewRecording}
              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Ja
            </button>
            <button
              onClick={() => setShowWarning(false)}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

