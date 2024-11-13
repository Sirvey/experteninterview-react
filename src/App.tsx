import React, { useState } from 'react';
import { ChevronUp } from 'lucide-react';
import { saveInterview } from './services/firebase';
import QuestionItem from './components/QuestionItem';
import ProgressBar from './components/ProgressBar';
import SubmitButton from './components/SubmitButton';

interface Answer {
  textAnswer: string;
  audioAnswer: Blob | null;
}

interface Answers {
  [key: string]: Answer;
}

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

function App() {
  const [answers, setAnswers] = useState<Answers>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitProgress, setSubmitProgress] = useState(0);
  const [isPrivacyChecked, setIsPrivacyChecked] = useState(false); // Checkbox state

  const handleScroll = () => {
    setShowScrollTop(window.scrollY > 400);
  };

  React.useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnswerChange = (id: string, textAnswer: string, audioAnswer: Blob | null) => {
    setAnswers(prev => ({
      ...prev,
      [id]: { textAnswer, audioAnswer }
    }));
    setSubmitError(null);
  };

  const calculateProgress = () => {
    const totalQuestions = questions.length;
    const answeredQuestions = Object.values(answers).filter(
      answer => answer.textAnswer.trim() !== '' || answer.audioAnswer !== null
    ).length;
    return (answeredQuestions / totalQuestions) * 100;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitProgress(0);

    // Ensure all questions have either text or audio answer
    const allQuestionsAnswered = questions.every((_, index) => {
      const answer = answers[`q${index}`];
      return answer && (answer.textAnswer.trim() !== '' || answer.audioAnswer !== null);
    });

    if (!allQuestionsAnswered) {
      setSubmitError('Bitte beantworten Sie jede Frage entweder per Text oder Audio.');
      return;
    }

    // Ensure the privacy policy checkbox is checked
    if (!isPrivacyChecked) {
      setSubmitError('Bitte stimmen Sie den Datenschutzbestimmungen zu, um fortzufahren.');
      return;
    }

    setIsSubmitting(true);

    try {
      const totalAudioFiles = Object.values(answers).filter(a => a.audioAnswer).length;
      let uploadedFiles = 0;

      const progressCallback = () => {
        uploadedFiles++;
        const progress = totalAudioFiles > 0 
          ? (uploadedFiles / totalAudioFiles) * 100 
          : 100;
        setSubmitProgress(progress);
      };

      if (totalAudioFiles === 0) {
        setSubmitProgress(50);
      }

      await saveInterview(answers, questions, progressCallback);

      setSubmitProgress(100);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting interview:', error);
      setSubmitError(
        error instanceof Error 
          ? error.message 
          : 'Beim Absenden des Formulars ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.'
      );
      setSubmitProgress(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Vielen Dank!</h2>
            <p className="text-gray-600">
              Ihre Antworten auf das Experteninterview wurden erfolgreich übermittelt und gespeichert. Wir wissen Ihre Zeit und Ihre Erkenntnisse sehr zu schätzen.
            </p>
          </div>
        </div>
      </div>
    );
  }

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
          {questions.map((question, index) => (
            <QuestionItem
              key={index}
              id={`q${index}`}
              question={question}
              onAnswerChange={handleAnswerChange}
            />
          ))}

          <div className="flex flex-col items-center mt-4">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <input
                type="checkbox"
                id="privacyCheck"
                checked={isPrivacyChecked}
                onChange={() => setIsPrivacyChecked(!isPrivacyChecked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="privacyCheck" className="text-sm text-gray-600">
                Ich stimme den{' '}
                <a
                  href="https://magic-pick-c90.notion.site/Datenschutzerkl-rung-13d59a25da4680a19b3cdbb8e1cc850b?pvs=4"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Datenschutzbestimmungen
                </a>{' '}
                zu.
              </label>
            </div>

            <SubmitButton 
              isSubmitting={isSubmitting}
              progress={submitProgress}
            />

            {submitError && (
              <div className="absolute bottom-full mb-2 p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm w-full text-center shadow-md">
                {submitError}
              </div>
            )}
          </div>
        </form>

        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
            aria-label="Scroll to top"
          >
            <ChevronUp className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
}

export default App;




