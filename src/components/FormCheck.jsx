import { useState, useRef, useCallback } from 'react';
import { ArrowLeft, Upload, X, Play, Dumbbell, ChevronRight } from 'lucide-react';
import { analyzePoseFromVideo } from '../hooks/usePoseAnalysis';
import { analyzeForm } from '../api/formAnalysis';
import FormFeedback from './FormFeedback';
import ExerciseSelector from './ExerciseSelector';

const STAGES = {
  UPLOAD: 'upload',
  POSE:   'pose',
  CLAUDE: 'claude',
  DONE:   'done',
};

// ─── Upload Zone ──────────────────────────────────────────────────────────────

function UploadZone({ onFile }) {
  const inputRef          = useRef(null);
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
      className="relative flex flex-col items-center justify-center gap-5 cursor-pointer transition-all duration-200 rounded-2xl"
      style={{
        border:     `2px dashed ${dragging ? '#00ff87' : '#333333'}`,
        background: dragging ? 'rgba(0,255,135,0.03)' : '#0f0f0f',
        minHeight:  220,
        padding:    40,
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />

      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: 'rgba(0,255,135,0.08)', border: '1px solid rgba(0,255,135,0.2)' }}
      >
        <Upload size={24} style={{ color: '#00ff87' }} />
      </div>

      <div className="text-center">
        <p className="text-white font-semibold text-base mb-1">
          {dragging ? 'Drop to upload' : 'Drag your video here'}
        </p>
        <p className="text-xs" style={{ color: '#555555' }}>
          or click to browse · MP4, MOV, WebM
        </p>
      </div>

      <div
        className="text-xs font-semibold px-5 py-2.5 rounded-xl"
        style={{ background: 'rgba(0,255,135,0.08)', color: '#00ff87', border: '1px solid rgba(0,255,135,0.2)' }}
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
    <div className="relative rounded-2xl overflow-hidden" style={{ border: '1px solid #222222' }}>
      <video
        src={url}
        controls
        className="w-full max-h-64 object-contain"
        style={{ background: '#000000' }}
      />
      <button
        onClick={onClear}
        className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all"
        style={{ background: 'rgba(10,10,10,0.9)', border: '1px solid #333333', color: '#888888' }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = '#888888'; }}
      >
        <X size={14} />
      </button>
      <div
        className="px-4 py-2.5 flex items-center gap-2"
        style={{ background: '#0f0f0f', borderTop: '1px solid #222222' }}
      >
        <Play size={12} style={{ color: '#555555' }} />
        <span className="text-xs truncate flex-1" style={{ color: '#888888' }}>{file.name}</span>
        <span className="text-xs flex-shrink-0" style={{ color: '#444444' }}>
          {(file.size / 1024 / 1024).toFixed(1)} MB
        </span>
      </div>
    </div>
  );
}


// ─── Processing Screen ────────────────────────────────────────────────────────

function ProcessingScreen({ stage, progress }) {
  const isPose   = stage === STAGES.POSE;
  const isClaude = stage === STAGES.CLAUDE;

  return (
    <div className="flex flex-col items-center justify-center min-h-[55vh] text-center px-5">
      {/* Animated icon */}
      <div className="relative mb-8">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center pulse-glow"
          style={{ background: '#111111', border: '1px solid #222222' }}
        >
          <Dumbbell size={32} style={{ color: '#00ff87' }} />
        </div>
        <div
          className="absolute inset-0 rounded-2xl border-2 border-transparent"
          style={{ borderTopColor: '#00ff87', animation: 'spin 1.2s linear infinite' }}
        />
      </div>

      <h2 className="text-xl font-bold text-white mb-2">
        {isPose ? 'Analyzing your movement' : 'Your trainer is reviewing'}
      </h2>
      <p className="text-sm mb-8 max-w-[260px] leading-relaxed" style={{ color: '#888888' }}>
        {isPose
          ? progress.message || 'Running pose estimation across video frames…'
          : 'Generating detailed coaching feedback…'}
      </p>

      {/* Progress bar (pose stage only) */}
      {isPose && (
        <div className="w-full max-w-[280px]">
          <div className="flex justify-between text-xs mb-2" style={{ color: '#555555' }}>
            <span>Pose estimation</span>
            <span className="tabular-nums">{progress.pct ?? 0}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1a1a1a' }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progress.pct ?? 0}%`, background: '#00ff87' }}
            />
          </div>
        </div>
      )}

      {isClaude && (
        <div className="flex gap-2 mt-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ background: '#00ff87', animation: `bounceDot 1.2s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main FormCheck Component ─────────────────────────────────────────────────

export default function FormCheck({ onBack }) {
  const [stage,     setStage]    = useState(STAGES.UPLOAD);
  const [videoFile, setVideoFile] = useState(null);
  const [exercise,  setExercise]  = useState(null);
  const [progress,  setProgress]  = useState({ pct: 0, message: '' });
  const [feedback,  setFeedback]  = useState('');
  const [poseData,  setPoseData]  = useState(null);
  const [error,     setError]     = useState(null);

  const canAnalyze = videoFile && exercise && exercise.trim().length > 0;

  const handleAnalyze = useCallback(async () => {
    if (!canAnalyze) return;
    setError(null);
    setFeedback('');

    try {
      setStage(STAGES.POSE);
      const data = await analyzePoseFromVideo(videoFile, (prog) => setProgress(prog));
      setPoseData(data);

      setStage(STAGES.CLAUDE);
      await analyzeForm(data, exercise, (partial) => setFeedback(partial));

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
      <header
        className="flex items-center justify-between px-5 py-4 sticky top-0 z-10"
        style={{ background: 'rgba(10,10,10,0.97)', borderBottom: '1px solid #222222', backdropFilter: 'blur(12px)' }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 transition-colors"
            style={{ color: '#555555' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#555555'; }}
          >
            <ArrowLeft size={18} strokeWidth={2} />
          </button>
          <div className="w-px h-4" style={{ background: '#333333' }} />
          <span className="font-semibold text-white text-sm">Form Check</span>
        </div>
        {(stage === STAGES.DONE || feedback) && (
          <button
            onClick={handleReset}
            className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
            style={{ background: 'rgba(0,255,135,0.08)', color: '#00ff87', border: '1px solid rgba(0,255,135,0.2)' }}
          >
            New Analysis
          </button>
        )}
      </header>

      {/* Processing */}
      {(stage === STAGES.POSE || stage === STAGES.CLAUDE) && !feedback && (
        <ProcessingScreen stage={stage} progress={progress} />
      )}

      {/* Feedback view */}
      {feedback && (
        <div className="flex-1 px-5 py-8 max-w-[680px] mx-auto w-full">
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
        <main className="flex-1 px-5 py-8 mx-auto w-full" style={{ maxWidth: 480 }}>
          <div className="mb-7">
            <h1 className="text-2xl font-extrabold text-white mb-2 tracking-tight">Form Check</h1>
            <p className="text-sm leading-relaxed" style={{ color: '#888888' }}>
              Upload a video of your set. AI analyzes joint angles and gives you professional coaching feedback.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              className="mb-5 px-4 py-3 rounded-xl text-sm"
              style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.25)', color: '#ff8888' }}
            >
              <strong style={{ color: '#ff4444' }}>Error:</strong> {error}
            </div>
          )}

          {/* Upload / Preview */}
          <div className="mb-6">
            {videoFile
              ? <VideoPreview file={videoFile} onClear={() => setVideoFile(null)} />
              : <UploadZone onFile={setVideoFile} />
            }
          </div>

          {/* Exercise picker */}
          <div className="mb-8">
            <ExerciseSelector mode="formcheck" value={exercise} onChange={setExercise} />
          </div>

          {/* Tips */}
          <div
            className="mb-8 p-4 rounded-2xl"
            style={{ background: '#0f0f0f', border: '1px solid #1e1e1e' }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#444444' }}>
              Tips for best results
            </p>
            <ul className="space-y-2">
              {[
                'Film from the side so joints are clearly visible',
                'Keep your full body in frame — head to feet',
                '5–30 seconds is ideal (1–3 reps)',
                'Good lighting improves accuracy',
              ].map((tip) => (
                <li key={tip} className="flex gap-2.5 text-xs" style={{ color: '#666666' }}>
                  <ChevronRight size={12} className="flex-shrink-0 mt-0.5" style={{ color: '#00ff87' }} />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Analyze button */}
          <button
            onClick={handleAnalyze}
            disabled={!canAnalyze}
            className="btn-primary"
          >
            Analyze My Form
            <ChevronRight size={18} />
          </button>
        </main>
      )}
    </div>
  );
}
