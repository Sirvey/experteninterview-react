import React, { useState, useRef } from 'react';
import { Mic, Square, Loader2, CheckCircle2 } from 'lucide-react';

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  questionId: string;
}

export default function AudioRecorder({ onRecordingComplete, questionId }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
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

        // Clean up the media stream
        if (stream && stream.getTracks) {
          stream.getTracks().forEach((track) => track.stop());
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsPreparing(false);
    } catch (err) {
      console.error('Fehler beim Zugriff auf das Mikrofon:', err);
      setIsPreparing(false);
      alert('Der Zugriff auf das Mikrofon war nicht möglich. Bitte stellen Sie sicher, dass Sie die Erlaubnis erteilt haben.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
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
    </div>
  );
}
