import React, { useState } from 'react';
import AudioRecorder from './AudioRecorder';

interface QuestionItemProps {
  question: string;
  id: string;
  onAnswerChange: (id: string, textAnswer: string, audioAnswer: Blob | null) => void;
}

export default function QuestionItem({ question, id, onAnswerChange }: QuestionItemProps) {
  const [textAnswer, setTextAnswer] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setTextAnswer(newText);
    onAnswerChange(id, newText, audioBlob);
  };

  const handleAudioComplete = (newAudioBlob: Blob) => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    const url = URL.createObjectURL(newAudioBlob);
    setAudioUrl(url);
    setAudioBlob(newAudioBlob);
    onAnswerChange(id, textAnswer, newAudioBlob);
  };

  return (
    <div className="mb-8 p-6 bg-white rounded-xl shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{question}</h3>
      
      <div className="space-y-4">
        <div>
          <label htmlFor={`text-${id}`} className="block text-sm font-medium text-gray-700 mb-2">
            Schriftliche Antwort
          </label>
          <textarea
            id={`text-${id}`}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors min-h-[120px]"
            placeholder="Geben Sie Ihre Antwort hier ein oder per Audio..."
            value={textAnswer}
            onChange={handleTextChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Audio Antwort
          </label>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <AudioRecorder onRecordingComplete={handleAudioComplete} questionId={id} />
            {audioUrl && (
              <div className="flex items-center gap-2">
                <audio controls className="max-w-[200px]" src={audioUrl}>
                  Ihr Browser unterstützt keine Audio Aufnahme.
                </audio>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}