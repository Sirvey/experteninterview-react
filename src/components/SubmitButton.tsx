import React from 'react';
import { Send } from 'lucide-react';

interface SubmitButtonProps {
  isSubmitting: boolean;
  progress: number;
}

export default function SubmitButton({ isSubmitting, progress }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className={`
        flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium
        ${isSubmitting 
          ? 'bg-blue-400 cursor-not-allowed' 
          : 'bg-blue-600 hover:bg-blue-700 transition-colors'}
      `}
    >
      {isSubmitting ? (
        <>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin" />
            <span>wird eingereicht ({Math.round(progress)}%)</span>
          </div>
        </>
      ) : (
        <>
          <Send className="w-5 h-5" />
          Interview einreichen
        </>
      )}
    </button>
  );
}