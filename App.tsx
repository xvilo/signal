
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import DecisionDetail from './components/DecisionDetail';
import { Decision } from './types';

const App: React.FC = () => {
  const [decisions, setDecisions] = useState<Decision[]>(() => {
    const saved = localStorage.getItem('signal_decisions');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('signal_decisions', JSON.stringify(decisions));
  }, [decisions]);

  const addDecision = (newDecision: Decision) => {
    setDecisions(prev => [newDecision, ...prev]);
  };

  const updateDecision = (updated: Decision) => {
    setDecisions(prev => prev.map(d => d.id === updated.id ? updated : d));
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 sticky top-0 z-50">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">Signal</span>
          </Link>
          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm text-slate-500 font-medium hidden sm:inline">Decision Support Platform</span>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <Routes>
            <Route 
              path="/" 
              element={<Dashboard decisions={decisions} onAddDecision={addDecision} />} 
            />
            <Route 
              path="/decision/:id" 
              element={<DecisionDetail decisions={decisions} onUpdateDecision={updateDecision} />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
