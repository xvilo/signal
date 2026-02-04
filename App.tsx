
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import Dashboard from './components/Dashboard';
import DecisionDetail from './components/DecisionDetail';
import ProtectedRoute from './components/ProtectedRoute';
import { Decision } from './types';

const App: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth0();
  const [showUserMenu, setShowUserMenu] = useState(false);
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

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  return (
    <Router>
      <ProtectedRoute>
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

              {isAuthenticated && user && (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-slate-700 hidden md:inline">
                      {user.name || user.email}
                    </span>
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                        <div className="px-4 py-2 border-b border-slate-200">
                          <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
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
      </ProtectedRoute>
    </Router>
  );
};

export default App;
