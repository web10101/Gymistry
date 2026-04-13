import { useState } from 'react';
import Home from './components/Home';
import IntakeFlow from './components/IntakeFlow';
import FormCheck from './components/FormCheck';

export default function App() {
  const [view, setView] = useState('home');

  if (view === 'intake') return <IntakeFlow onBack={() => setView('home')} />;
  if (view === 'formcheck') return <FormCheck onBack={() => setView('home')} />;
  return <Home onNavigate={setView} />;
}
