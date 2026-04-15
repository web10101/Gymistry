import { useState } from 'react';
import Home from './components/Home';
import IntakeFlow from './components/IntakeFlow';
import FormCheck from './components/FormCheck';
import LiveTrainer from './components/LiveTrainer';
import ExerciseBrowser from './components/ExerciseBrowser';
import ExerciseDetail from './components/ExerciseDetail';

export default function App() {
  const [view, setView] = useState('home');
  const [selectedExercise, setSelectedExercise] = useState(null);

  if (view === 'intake')      return <IntakeFlow   onBack={() => setView('home')} />;
  if (view === 'formcheck')   return <FormCheck    onBack={() => setView('home')} />;
  if (view === 'livetrainer') return <LiveTrainer  onBack={() => setView('home')} />;
  if (view === 'library')     return <ExerciseBrowser
                                       onSelectExercise={(ex) => { setSelectedExercise(ex); setView('exercise'); }}
                                       onBack={() => setView('home')} />;
  if (view === 'exercise')    return <ExerciseDetail
                                       exercise={selectedExercise}
                                       onBack={() => setView('library')} />;
  return <Home onNavigate={setView} />;
}
