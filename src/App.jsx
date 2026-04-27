import { useState } from 'react';
import { Home as HomeIcon, BookOpen, Video, Zap } from 'lucide-react';
import Home from './components/Home';
import IntakeFlow from './components/IntakeFlow';
import FormCheck from './components/FormCheck';
import LiveTrainer from './components/LiveTrainer';
import ExerciseBrowser from './components/ExerciseBrowser';
import ExerciseDetail from './components/ExerciseDetail';

const NAV_ITEMS = [
  { id: 'home',        label: 'Home',       Icon: HomeIcon },
  { id: 'library',     label: 'Library',    Icon: BookOpen },
  { id: 'formcheck',   label: 'Form Check', Icon: Video    },
  { id: 'livetrainer', label: 'Live',       Icon: Zap      },
];

const VIEW_TO_NAV = {
  home:        'home',
  intake:      'home',
  formcheck:   'formcheck',
  livetrainer: 'livetrainer',
  library:     'library',
  exercise:    'library',
};

function BottomNav({ currentView, onNavigate }) {
  const active = VIEW_TO_NAV[currentView] || 'home';
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{ background: 'rgba(10,10,10,0.97)', borderTop: '1px solid #222222', backdropFilter: 'blur(12px)' }}
    >
      <div className="flex items-center justify-around py-2 px-4 max-w-[480px] mx-auto">
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className="flex flex-col items-center gap-1 px-5 py-2 rounded-xl transition-all duration-200"
              style={{ color: isActive ? '#00ff87' : '#404040' }}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span
                className="text-[10px] font-semibold tracking-wide"
                style={{ color: isActive ? '#00ff87' : '#404040' }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default function App() {
  const [view, setView] = useState('home');
  const [selectedExercise, setSelectedExercise] = useState(null);

  const navigate = (v) => setView(v);

  const renderView = () => {
    if (view === 'intake') {
      return <IntakeFlow onBack={() => setView('home')} />;
    }
    if (view === 'formcheck') {
      return <FormCheck onBack={() => setView('home')} />;
    }
    if (view === 'livetrainer') {
      return <LiveTrainer onBack={() => setView('home')} />;
    }
    if (view === 'library') {
      return (
        <ExerciseBrowser
          onSelectExercise={(ex) => { setSelectedExercise(ex); setView('exercise'); }}
          onBack={() => setView('home')}
        />
      );
    }
    if (view === 'exercise') {
      return <ExerciseDetail exercise={selectedExercise} onBack={() => setView('library')} />;
    }
    return <Home onNavigate={setView} />;
  };

  return (
    <div>
      <div
        key={view}
        className="fade-in"
        style={{ paddingBottom: view === 'livetrainer' ? 0 : 72 }}
      >
        {renderView()}
      </div>
      {view !== 'livetrainer' && (
        <BottomNav currentView={view} onNavigate={navigate} />
      )}
    </div>
  );
}
