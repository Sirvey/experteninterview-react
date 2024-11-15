import React, { useState } from 'react';
import AudioRecorder from './AudioRecorder';

interface QuestionItemProps {
  question: string;
  id: string;
  onAnswerChange: (id: string, textAnswer: string, audioAnswers: Blob[]) => void;
}

export default function QuestionItem({ question, id, onAnswerChange }: QuestionItemProps) {
  const [textAnswer, setTextAnswer] = useState('');
  const [audioEntries, setAudioEntries] = useState<{ url: string; blob: Blob }[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState<{ show: boolean; index: number | null }>({
    show: false,
    index: null
  });

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setTextAnswer(newText);
    onAnswerChange(id, newText, audioEntries.map(entry => entry.blob));
  };

  const handleAudioComplete = (newAudioBlob: Blob) => {
    const newAudioUrl = URL.createObjectURL(newAudioBlob);
    setAudioEntries(prev => [...prev, { url: newAudioUrl, blob: newAudioBlob }]);
    onAnswerChange(
      id,
      textAnswer,
      [...audioEntries.map(entry => entry.blob), newAudioBlob]
    );
  };

  const handleAudioDelete = (index: number) => {
    setShowDeleteModal({ show: true, index });
  };

  const confirmAudioDelete = () => {
    if (showDeleteModal.index !== null) {
      const updatedAudioEntries = audioEntries.filter((_, i) => i !== showDeleteModal.index);
      setAudioEntries(updatedAudioEntries);
      onAnswerChange(id, textAnswer, updatedAudioEntries.map(entry => entry.blob));
      setShowDeleteModal({ show: false, index: null });
    }
  };

  return (
    <div className="mb-8 p-6 bg-white rounded-xl shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{question}</h3>
      <div className="space-y-4">
        {/* Audio Answer Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Audio Antworten
          </label>
          <AudioRecorder onRecordingComplete={handleAudioComplete} questionId={id} />
          <div className="mt-4 space-y-2">
            {audioEntries.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Antwort {index + 1}:</span>
                <audio controls className="max-w-[200px]" src={entry.url}>
                  Ihr Browser unterstützt keine Audioaufnahme.
                </audio>
                <button
                  onClick={() => handleAudioDelete(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  ❌
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Text Answer Section */}
        <div>
          <label htmlFor={`text-${id}`} className="block text-sm font-medium text-gray-700 mb-2">
            Schriftliche Antwort / Notizen (optional)
          </label>
          <textarea
            id={`text-${id}`}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors min-h-[80px]"
            placeholder="Hier können Sie optional Notizen hinzufügen..."
            value={textAnswer}
            onChange={handleTextChange}
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal.show && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" style={{ zIndex: 1000 }}>
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <p className="text-red-600 font-medium mb-4">
              Möchten Sie diese Aufnahme wirklich löschen?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmAudioDelete}
                className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Ja
              </button>
              <button
                onClick={() => setShowDeleteModal({ show: false, index: null })}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
