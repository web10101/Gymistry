import { useState, useCallback } from 'react';
import { QUESTIONS, TOTAL_QUESTIONS } from '../data/questions';
import { generateWorkoutPlan } from '../api/claude';
import QuestionCard from './QuestionCard';
import ProgressBar from './ProgressBar';
import LoadingState from './LoadingState';
import WorkoutPlan from './WorkoutPlan';

const PHASES = {
  INTAKE: 'intake',
  GENERATING: 'generating',
  PLAN: 'plan',
};

export default function IntakeFlow() {
  const [phase, setPhase] = useState(PHASES.INTAKE);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [plan, setPlan] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [animating, setAnimating] = useState(false);

  const currentQuestion = QUESTIONS[currentIndex];

  const handleAnswer = useCallback(
    async (update) => {
      if (animating) return;

      const newAnswers = { ...answers, ...update };
      setAnswers(newAnswers);

      if (currentIndex < QUESTIONS.length - 1) {
        setAnimating(true);
        setTimeout(() => {
          setCurrentIndex((i) => i + 1);
          setAnimating(false);
        }, 50);
      } else {
        // All questions answered — generate the plan
        setPhase(PHASES.GENERATING);
        setPlan('');
        setError(null);
        setIsStreaming(true);

        try {
          await generateWorkoutPlan(newAnswers, (partial) => {
            setPlan(partial);
          });
          setIsStreaming(false);
          setPhase(PHASES.PLAN);
        } catch (err) {
          setError(err.message);
          setIsStreaming(false);
          setPhase(PHASES.INTAKE); // go back so user can retry
        }
      }
    },
    [answers, currentIndex, animating]
  );

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  const handleRestart = () => {
    setPhase(PHASES.INTAKE);
    setCurrentIndex(0);
    setAnswers({});
    setPlan('');
    setError(null);
    setIsStreaming(false);
  };

  // --- PLAN VIEW ---
  if (phase === PHASES.PLAN || (phase === PHASES.GENERATING && plan)) {
    return (
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <WorkoutPlan
            plan={plan}
            isStreaming={isStreaming}
            onRestart={handleRestart}
          />
        </div>
      </div>
    );
  }

  // --- GENERATING (no content yet) ---
  if (phase === PHASES.GENERATING) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <LoadingState name={answers.name} />
      </div>
    );
  }

  // --- INTAKE ---
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-5 py-4 border-b border-zinc-900">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-black text-zinc-900"
            style={{ background: 'linear-gradient(135deg, #e8ff47, #b8f400)' }}
          >
            G
          </div>
          <span className="font-bold text-white tracking-tight text-sm">Gymistry</span>
        </div>

        {currentIndex > 0 && (
          <button
            onClick={handleBack}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1"
          >
            ← Back
          </button>
        )}
      </header>

      {/* Progress */}
      <div className="px-5 pt-5 pb-2 max-w-2xl w-full mx-auto">
        <ProgressBar current={currentIndex + 1} total={TOTAL_QUESTIONS} />
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-5 mt-3 max-w-2xl w-full mx-auto px-4 py-3 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-sm">
          <strong>Error:</strong> {error}
          <button
            onClick={() => setError(null)}
            className="ml-3 text-red-400 hover:text-red-200 underline text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main question area */}
      <main className="flex-1 flex items-start justify-center px-5 pt-10 pb-16">
        <div className="w-full max-w-2xl" key={currentIndex}>
          <QuestionCard
            question={currentQuestion}
            answers={answers}
            questionNumber={currentIndex + 1}
            onAnswer={handleAnswer}
          />
        </div>
      </main>
    </div>
  );
}
