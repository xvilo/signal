
import React, { useState } from 'react';
import { Decision } from '../types';

interface CreateDecisionModalProps {
  onClose: () => void;
  onSave: (decision: Decision) => void;
}

const CreateDecisionModal: React.FC<CreateDecisionModalProps> = ({ onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [context, setContext] = useState('');
  const [owner, setOwner] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !owner.trim() || !deadline) return;

    // Fix: Added missing 'files' property required by the Decision interface
    const newDecision: Decision = {
      id: Math.random().toString(36).substr(2, 9),
      title: title.trim(),
      context: context.trim(),
      owner: owner.trim(),
      deadline,
      status: 'active',
      createdAt: Date.now(),
      inputs: [],
      files: []
    };

    onSave(newDecision);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Frame the Decision</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">The Central Question</label>
            <textarea
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Should we deprecate the legacy API in Q3 despite enterprise user friction?"
              className="w-full h-24 p-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-800 text-lg font-medium resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Background Context (Optional)</label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Why is this surfacing now? What's the immediate pressure?"
              className="w-full h-20 p-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-700 text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Owner</label>
              <input
                required
                type="text"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="Name"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-700 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Deadline</label>
              <input
                required
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-700 text-sm"
              />
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-100 transition-all text-lg"
            >
              Initialize Decision Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDecisionModal;
