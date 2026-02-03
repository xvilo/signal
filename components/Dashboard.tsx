
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Decision } from '../types';
import CreateDecisionModal from './CreateDecisionModal';

interface DashboardProps {
  decisions: Decision[];
  onAddDecision: (decision: Decision) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ decisions, onAddDecision }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeDecisions = decisions.filter(d => d.status === 'active');
  const completedDecisions = decisions.filter(d => d.status === 'completed');

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Decisions</h1>
          <p className="text-slate-500 text-lg">Surface clarity, reduce decision debt.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Decision
        </button>
      </div>

      <div className="grid gap-12">
        <section>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-bold text-slate-800">Active</h2>
            <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-sm font-bold">{activeDecisions.length}</span>
          </div>
          {activeDecisions.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
              <p className="text-slate-400 mb-4 italic">No active decisions. Time to frame a new question?</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeDecisions.map(d => (
                <DecisionCard key={d.id} decision={d} />
              ))}
            </div>
          )}
        </section>

        {completedDecisions.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-xl font-bold text-slate-800">History</h2>
              <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-sm font-bold">{completedDecisions.length}</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-75">
              {completedDecisions.map(d => (
                <DecisionCard key={d.id} decision={d} />
              ))}
            </div>
          </section>
        )}
      </div>

      {isModalOpen && (
        <CreateDecisionModal 
          onClose={() => setIsModalOpen(false)} 
          onSave={(d) => {
            onAddDecision(d);
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

const DecisionCard: React.FC<{ decision: Decision }> = ({ decision }) => {
  return (
    <Link 
      to={`/decision/${decision.id}`}
      className="bg-white border border-slate-200 p-6 rounded-2xl hover:border-indigo-300 hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col group"
    >
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Due {new Date(decision.deadline).toLocaleDateString()}
        </span>
        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
      </div>
      <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 mb-2 line-clamp-2">
        {decision.title}
      </h3>
      <div className="mt-auto pt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 border border-slate-200">
            {decision.owner.charAt(0)}
          </div>
          <span className="text-xs text-slate-500 font-medium">{decision.owner}</span>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          {decision.inputs.length} inputs
        </div>
      </div>
    </Link>
  );
};

export default Dashboard;
