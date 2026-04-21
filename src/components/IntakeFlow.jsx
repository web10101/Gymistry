import { useState, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { QUESTIONS, TOTAL_QUESTIONS } from '../data/questions';
import { generateWorkoutPlan } from '../api/claude';
import QuestionCard from './QuestionCard';
import ProgressBar from './ProgressBar';
import LoadingState from './LoadingState';
import WorkoutPlan from './WorkoutPlan';

const PHASES = {
  INTAKE:     'intake',
  GENERATING: 'generating',
  PLAN:       'plan',
};

export default function IntakeFlow({ onBack }) {
  const [phase, setPhase]               = useState(PHASES.INTAKE);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers]           = useState({});
  const [plan, setPlan]                 = useState('');
  const [isStreaming, setIsStreaming]   = useState(false);
  const [error, setError]               = useState(null);
  const [animating, setAnimating]       = useState(false);

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
          setPhase(PHASES.INTAKE);
        }
      }
    },
    [answers, currentIndex, animating]
  );

  const handleBack = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  const handleRestart = () => {
    setPhase(PHASES.INTAKE);
    setCurrentIndex(0);
    setAnswers({});
    setPlan('');
    setError(null);
    setIsStreaming(false);
  };

  /* ── Plan view ── */
  if (phase === PHASES.PLAN || (phase === PHASES.GENERATING && plan)) {
    return (
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-[680px] mx-auto">
          <WorkoutPlan plan={plan} isStreaming={isStreaming} onRestart={handleRestart} />
        </div>
      </div>
    );
  }

  /* ── Generating (no content yet) ── */
  if (phase === PHASES.GENERATING) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <LoadingState name={answers.name} />
      </div>
    );
  }

  /* ── Intake ── */
  return (
    <div className="min-h-screen flex flex-col mx-auto" style={{ maxWidth: 480 }}>
      {/* Progress bar — full width at top */}
      <div className="pt-0">
        <ProgressBar current={currentIndex + 1} total={TOTAL_QUESTIONS} />
      </div>

      {/* Top bar */}
      <header className="flex items-center justify-between px-5 py-4">
        <button
          onClick={currentIndex > 0 ? handleBack : onBack}
          className="flex items-center gap-1.5 transition-colors"
          style={{ color: '#555555' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#555555'; }}
        >
          <ArrowLeft size={18} strokeWidth={2} />
          <span className="text-sm font-medium">Back</span>
        </button>

        <span className="text-xs font-medium tabular-nums" style={{ color: '#555555' }}>
          {currentIndex + 1} / {TOTAL_QUESTIONS}
        </span>
      </header>

      {/* Error banner */}
      {error && (
        <div
          className="mx-5 mb-4 px-4 py-3 rounded-xl text-sm flex items-center justify-between"
          style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.25)', color: '#ff8888' }}
        >
          <span><strong style={{ color: '#ff4444' }}>Error:</strong> {error}</span>
          <button
            onClick={() => setError(null)}
            className="text-xs underline ml-3 flex-shrink-0"
            style={{ color: '#ff6666' }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Question area — centered vertically */}
      <main className="flex-1 flex items-start justify-center px-5 pt-8 pb-16">
        <div className="w-full" key={currentIndex}>
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
