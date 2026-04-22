import { useState, useRef, useCallback } from 'react';
import { analyzePoseFromVideo } from '../hooks/usePoseAnalysis';
import { analyzeForm } from '../api/formAnalysis';
import FormFeedback from './FormFeedback';
import ExerciseSelector from './ExerciseSelector';

const STAGES = {
  UPLOAD: 'upload',
  POSE: 'pose',
  CLAUDE: 'claude',
  DONE: 'done',
};

// ─── Upload Zone ────────────────────────────────────────────────────────────

function UploadZone({ onFile }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('video/')) return;
    onFile(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className="relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-4 p-10 text-center"
      style={{
        borderColor: dragging ? '#e8ff47' : 'rgba(255,255,255,0.12)',
        background: dragging ? 'rgba(232,255,71,0.04)' : 'rgba(255,255,255,0.02)',
        minHeight: 200,
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />
      <div className="text-4xl">{dragging ? '📂' : '🎬'}</div>
      <div>
        <p className="text-white font-semibold text-sm mb-1">
          {dragging ? 'Drop it here' : 'Drag & drop your video'}
        </p>
        <p className="text-zinc-500 text-xs">or click to browse · MP4, MOV, WebM</p>
      </div>
      <div
        className="text-xs font-semibold px-4 py-2 rounded-lg"
        style={{ background: 'rgba(232,255,71,0.1)', color: '#e8ff47', border: '1px solid rgba(232,255,71,0.2)' }}
      >
        Choose File
      </div>
    </div>
  );
}

// ─── Video Preview ────────────────────────────────────────────────────────────

function VideoPreview({ file, onClear }) {
  const url = URL.createObjectURL(file);
  return (
    <div className="relative rounded-2xl overflow-hidden border border-zinc-800">
      <video
        src={url}
        controls
        className="w-full max-h-64 object-contain bg-black"
        onLoadStart={() => {}}
      />
      <button
        onClick={onClear}
        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-zinc-900/90 border border-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center text-xs transition-colors"
      >
        ✕
      </button>
      <div className="px-4 py-2.5 bg-zinc-900/80 flex items-center gap-2">
        <span className="text-xs text-zinc-400 truncate">{file.name}</span>
        <span className="text-xs text-zinc-600 ml-auto flex-shrink-0">
          {(file.size / 1024 / 1024).toFixed(1)} MB
        </span>
      </div>
    </div>
  );
}

// ─── Processing Screen ─────────────────────────────────────────────────────

function ProcessingScreen({ stage, progress }) {
  const isPose = stage === STAGES.POSE;
  const isClaude = stage === STAGES.CLAUDE;

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      {/* Spinner */}
      <div className="relative mb-8">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-2xl pulse-glow"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {isPose ? '📐' : '🧠'}
        </div>
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent"
          style={{ borderTopColor: '#e8ff47', animation: 'spin 1s linear infinite' }}
        />
      </div>

      <h2 className="text-xl font-bold text-white mb-2">
        {isPose ? 'Analyzing your movement' : 'Your trainer is reviewing'}
      </h2>
      <p className="text-zinc-500 text-sm mb-8 max-w-xs">
        {isPose
          ? progress.message || 'Running pose estimation across video frames…'
          : 'Generating detailed coaching feedback…'}
      </p>

      {/* Progress bar (pose stage only) */}
      {isPose && (
        <div className="w-full max-w-xs">
          <div className="flex justify-between text-xs text-zinc-600 mb-2">
            <span>Pose estimation</span>
            <span>{progress.pct ?? 0}%</span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progress.pct ?? 0}%`,
                background: 'linear-gradient(90deg, #b8f400, #e8ff47)',
              }}
            />
          </div>
        </div>
      )}

      {/* Claude streaming dots */}
      {isClaude && (
        <div className="flex gap-2 mt-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                background: '#e8ff47',
                animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ─── Main FormCheck Component ─────────────────────────────────────────────

export default function FormCheck({ onBack }) {
  const [stage, setStage] = useState(STAGES.UPLOAD);
  const [videoFile, setVideoFile] = useState(null);
  const [exercise, setExercise] = useState(null);
  const [progress, setProgress] = useState({ pct: 0, message: '' });
  const [feedback, setFeedback] = useState('');
  const [poseData, setPoseData] = useState(null);
  const [error, setError] = useState(null);

  const canAnalyze = videoFile && exercise && exercise.trim().length > 0;

  const handleAnalyze = useCallback(async () => {
    if (!canAnalyze) return;
    setError(null);
    setFeedback('');

    try {
      // Stage 1: MediaPipe pose analysis
      setStage(STAGES.POSE);
      const data = await analyzePoseFromVideo(videoFile, (prog) => {
        setProgress(prog);
      });
      setPoseData(data);

      // Stage 2: Claude form analysis
      setStage(STAGES.CLAUDE);
      await analyzeForm(data, exercise, (partial) => {
        setFeedback(partial);
      });

      setStage(STAGES.DONE);
    } catch (err) {
      setError(err.message);
      setStage(STAGES.UPLOAD);
    }
  }, [videoFile, exercise, canAnalyze]);

  const handleReset = () => {
    setStage(STAGES.UPLOAD);
    setVideoFile(null);
    setExercise(null);
    setFeedback('');
    setPoseData(null);
    setError(null);
    setProgress({ pct: 0, message: '' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 border-b border-zinc-900">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-zinc-500 hover:text-zinc-300 transition-colors text-sm flex items-center gap-1.5"
          >
            ← Back
          </button>
          <div className="w-px h-4 bg-zinc-800" />
          <div className="flex items-center gap-2">
            <span className="text-base">🎥</span>
            <span className="font-semibold text-white text-sm">Form Check</span>
          </div>
        </div>
        {(stage === STAGES.DONE || feedback) && (
          <button
            onClick={handleReset}
            className="text-xs font-bold px-4 py-2 rounded-lg transition-all"
            style={{ background: 'rgba(232,255,71,0.1)', color: '#e8ff47', border: '1px solid rgba(232,255,71,0.2)' }}
          >
            New Analysis
          </button>
        )}
      </header>

      {/* Processing screens */}
      {(stage === STAGES.POSE || stage === STAGES.CLAUDE) && !feedback && (
        <ProcessingScreen stage={stage} progress={progress} />
      )}

      {/* Done / feedback — show as soon as streaming starts */}
      {feedback && (
        <div className="flex-1 px-5 py-8 max-w-3xl mx-auto w-full">
          <FormFeedback
            feedback={feedback}
            isStreaming={stage !== STAGES.DONE}
            exercise={exercise}
            poseData={poseData}
            onReset={handleReset}
          />
        </div>
      )}

      {/* Upload stage */}
      {stage === STAGES.UPLOAD && (
        <main className="flex-1 px-5 py-8 max-w-2xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Form Check</h1>
            <p className="text-zinc-400 text-sm">
              Upload a video of your set. AI analyzes your joint angles and gives
              you professional coaching feedback.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-sm">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Upload / preview */}
          <div className="mb-6">
            {videoFile ? (
              <VideoPreview file={videoFile} onClear={() => setVideoFile(null)} />
            ) : (
              <UploadZone onFile={setVideoFile} />
            )}
          </div>

          {/* Exercise picker */}
          <div className="mb-8">
            {exercise ? (
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium mb-3">Exercise</p>
                <div
                  className="flex items-center justify-between rounded-xl px-4 py-3"
                  style={{ background: 'rgba(232,255,71,0.06)', border: '1px solid rgba(232,255,71,0.15)' }}
                >
                  <span className="text-sm font-semibold text-white">{exercise}</span>
                  <button
                    onClick={() => setExercise(null)}
                    className="text-xs font-medium text-zinc-400 hover:text-white transition-colors"
                  >
                    Change
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium mb-3">Which exercise?</p>
                <ExerciseSelector mode="formcheck" onSelect={(name) => setExercise(name)} />
              </div>
            )}
          </div>

          {/* Tips */}
          <div
            className="mb-8 p-4 rounded-xl text-sm"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p className="text-zinc-400 font-medium mb-2 text-xs uppercase tracking-widest">
              Tips for best results
            </p>
            <ul className="space-y-1.5 text-zinc-500 text-xs">
              <li className="flex gap-2"><span className="text-lime-400">→</span> Film from the side or slight angle so joints are visible</li>
              <li className="flex gap-2"><span className="text-lime-400">→</span> Full body in frame — head to feet</li>
              <li className="flex gap-2"><span className="text-lime-400">→</span> 5–30 seconds is ideal (1–3 reps)</li>
              <li className="flex gap-2"><span className="text-lime-400">→</span> Good lighting helps accuracy</li>
            </ul>
          </div>

          {/* Analyze button */}
          <button
            onClick={handleAnalyze}
            disabled={!canAnalyze}
            className="btn-primary w-full py-4 rounded-xl text-sm font-bold tracking-wide disabled:opacity-30 disabled:pointer-events-none"
          >
            Analyze My Form →
          </button>
        </main>
      )}
    </div>
  );
}
