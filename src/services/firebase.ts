import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';

async function uploadAudio(
  blob: Blob,
  path: string,
  onProgress?: () => void
): Promise<string> {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob, {
    contentType: 'audio/webm',
    customMetadata: {
      timeCreated: new Date().toISOString(),
    },
  });
  onProgress?.();
  return getDownloadURL(storageRef);
}

export async function saveInterview(
  answers: Record<string, { textAnswer: string; audioAnswer: Blob | null }>,
  questions: string[],
  onProgress?: () => void
) {
  try {
    const timestamp = new Date().toISOString();
    const audioUrls: Record<string, string> = {};

    // Upload audio files first
    const audioAnswers = Object.entries(answers).filter(([, answer]) => answer.audioAnswer);
    
    for (const [questionId, answer] of audioAnswers) {
      try {
        const url = await uploadAudio(
          answer.audioAnswer!,
          `interviews/${timestamp}/${questionId}.webm`,
          onProgress
        );
        audioUrls[questionId] = url;
      } catch (error) {
        console.error(`Failed to upload audio for question ${questionId}:`, error);
        throw new Error(`Failed to upload audio for question ${questionId}`);
      }
    }

    // Prepare interview data
    const interviewData = {
      timestamp,
      submittedAt: new Date(),
      answers: Object.entries(answers).map(([questionId, answer], index) => ({
        questionId,
        questionText: questions[index],
        textAnswer: answer.textAnswer.trim(),
        audioUrl: audioUrls[questionId] || null,
        hasAudio: !!audioUrls[questionId],
      })),
      metadata: {
        totalQuestions: questions.length,
        answeredQuestions: Object.values(answers).filter(
          answer => answer.textAnswer.trim() !== '' || answer.audioAnswer !== null
        ).length,
        questionsWithAudio: Object.keys(audioUrls).length,
      }
    };

    // Save to Firestore
    const docRef = await addDoc(collection(db, 'interviews'), interviewData);
    console.log('Interview saved successfully with ID:', docRef.id);
    return docRef;

  } catch (error) {
    console.error('Error saving interview:', error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Failed to save interview. Please try again.'
    );
  }
}