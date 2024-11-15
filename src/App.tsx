import React, { useState } from 'react';
import QuestionItem from './components/QuestionItem';
import SubmitButton from './components/SubmitButton';
import ProgressBar from './components/ProgressBar';
import { db, storage } from './lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const questions = [
  "Hier steht Frage 1?",
  "Hier steht Frage 2?",
  "Hier steht Frage 3?",
  "Hier steht Frage 4?",
  "Hier steht Frage 5?",
  "Hier steht Frage 6?",
  "Hier steht Frage 7?",
  "Hier steht Frage 8?",
  "Hier steht Frage 9?",
  "Hier steht Frage 10?",
];

interface Answer {
  textAnswer: string;
  audioAnswers: Blob[];
}

function App() {
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    company: '',
    position: ''
  });

  const handleAnswerChange = (id: string, textAnswer: string, audioAnswers: Blob[]) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [id]: { textAnswer, audioAnswers }
    }));
  };

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPersonalInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const calculateProgress = () => {
    const totalQuestions = questions.length;
    const answeredQuestions = Object.values(answers).filter(
      answer => answer.textAnswer.trim() !== '' || answer.audioAnswers.length > 0
    ).length;
    return (answeredQuestions / totalQuestions) * 100;
  };

  const uploadAudio = async (blob: Blob, path: string) => {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, blob, {
      contentType: 'audio/webm',
      customMetadata: {
        timeCreated: new Date().toISOString(),
      },
    });
    return getDownloadURL(storageRef);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitProgress(0);

    try {
      const timestamp = new Date().toISOString();
      const audioUrls: Record<string, string[]> = {};

      for (const [questionId, answer] of Object.entries(answers)) {
        if (answer.audioAnswers.length > 0) {
          const urls = await Promise.all(
            answer.audioAnswers.map((audioBlob, i) =>
              uploadAudio(audioBlob, `interviews/${timestamp}/${questionId}_audio${i + 1}.webm`)
            )
          );
          audioUrls[questionId] = urls;
        }
      }

      const interviewData = {
        personalInfo,
        timestamp,
        submittedAt: new Date(),
        answers: Object.entries(answers).map(([questionId, answer], index) => ({
          questionId,
          questionText: questions[index],
          textAnswer: answer.textAnswer.trim(),
          audioUrls: audioUrls[questionId] || [],
          hasAudio: (audioUrls[questionId] || []).length > 0,
        })),
        metadata: {
          totalQuestions: questions.length,
          answeredQuestions: Object.values(answers).filter(
            answer => answer.textAnswer.trim() !== '' || answer.audioAnswers.length > 0
          ).length,
          questionsWithAudio: Object.keys(audioUrls).length,
        },
      };

      await addDoc(collection(db, 'interviews'), interviewData);
      setIsSubmitting(false);
      setSubmitProgress(100);
    } catch (error) {
      console.error('Error saving interview:', error);
      setIsSubmitting(false);
    }
  };

  // Überprüfen, ob alle Fragen beantwortet wurden
  const allQuestionsAnswered = questions.every((_, index) => {
    const answer = answers[`q${index}`];
    return answer && (answer.textAnswer.trim() !== '' || answer.audioAnswers.length > 0);
  });

  // Überprüfen, ob alle persönlichen Informationen ausgefüllt sind
  const personalInfoComplete = Object.values(personalInfo).every(value => value.trim() !== '');

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Experteninterview - Social Entrepreneurship
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Willkommen beim Interview!
          </p>
          <ProgressBar progress={calculateProgress()} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium text-gray-900">Persönliche Informationen</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700">Vor- und Nachname</label>
              <input
                type="text"
                name="name"
                value={personalInfo.name}
                onChange={handlePersonalInfoChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Unternehmen</label>
              <input
                type="text"
                name="company"
                value={personalInfo.company}
                onChange={handlePersonalInfoChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Position</label>
              <input
                type="text"
                name="position"
                value={personalInfo.position}
                onChange={handlePersonalInfoChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {questions.map((question, index) => (
            <QuestionItem
              key={index}
              id={`q${index}`}
              question={question}
              onAnswerChange={handleAnswerChange}
            />
          ))}

          <div className="flex flex-col items-center mt-4">
            <p className="text-sm text-gray-600 mb-4">
              Mit dem Einreichen stimmen Sie den{' '}
              <a
                href="https://magic-pick-c90.notion.site/Datenschutzerkl-rung-13d59a25da4680a19b3cdbb8e1cc850b?pvs=4"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Datenschutzbestimmungen
              </a>{' '}
              zu.
            </p>
            <SubmitButton
              isSubmitting={isSubmitting}
              progress={submitProgress}
              disabled={!allQuestionsAnswered || !personalInfoComplete}
            />
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
