
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Decision, InputItem, FileItem, AIAnalysis } from '../types';
import InputList from './InputList';
import AnalysisView from './AnalysisView';
import TensionsView from './TensionsView';
import OptionsView from './OptionsView';
import { analyzeDecision } from '../services/geminiService';

interface DecisionDetailProps {
  decisions: Decision[];
  onUpdateDecision: (decision: Decision) => void;
}

const DecisionDetail: React.FC<DecisionDetailProps> = ({ decisions, onUpdateDecision }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'inputs' | 'analysis' | 'tensions' | 'options'>('inputs');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAnalysisStale, setIsAnalysisStale] = useState(false);

  const decision = decisions.find(d => d.id === id);

  useEffect(() => {
    if (!decision) {
      navigate('/');
    }
  }, [decision, navigate]);

  const handleAnalyze = useCallback(async (currentDecision?: Decision) => {
    const d = currentDecision || decision;
    if (!d) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeDecision(d);
      onUpdateDecision({
        ...d,
        aiAnalysis: result,
        lastAnalysisUpdate: Date.now()
      });
      setIsAnalysisStale(false);
      setActiveTab('analysis'); 
    } catch (err: any) {
      setError(err.message || 'Failed to analyze decision');
    } finally {
      setIsAnalyzing(false);
    }
  }, [decision, onUpdateDecision]);

  const handleItemDeleted = useCallback((timestamp: number) => {
    if (decision?.lastAnalysisUpdate && timestamp < decision.lastAnalysisUpdate) {
      setIsAnalysisStale(true);
    }
  }, [decision?.lastAnalysisUpdate]);

  if (!decision) return null;

  const tabs = [
    { id: 'inputs', label: 'Inputs', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
    { id: 'analysis', label: 'Analysis & Traceability', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { id: 'tensions', label: 'Tensions', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
    { id: 'options', label: 'Options', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Link to="/" className="text-slate-400 hover:text-slate-600 flex items-center gap-1 mb-8 font-medium transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Dashboard
      </Link>

      <div className="mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <h1 className="text-3xl font-bold text-slate-900 leading-tight">{decision.title}</h1>
          <div className="flex items-center gap-2">
             <button
              onClick={() => handleAnalyze()}
              disabled={isAnalyzing}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all border ${
                isAnalyzing 
                  ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100'
              }`}
            >
              <svg className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {isAnalyzing ? 'Sensemaking...' : (decision.aiAnalysis ? 'Refresh Analysis' : 'Run Signal Analysis')}
            </button>
            <button 
               onClick={() => onUpdateDecision({ ...decision, status: decision.status === 'active' ? 'completed' : 'active' })}
               className="bg-white text-slate-600 border border-slate-200 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 transition-all"
            >
              {decision.status === 'active' ? 'Close Log' : 'Re-open'}
            </button>
          </div>
        </div>
        <p className="text-slate-500 text-lg max-w-3xl border-l-4 border-slate-100 pl-4 py-1 italic">
          {decision.context || "No context provided."}
        </p>
      </div>

      {isAnalysisStale && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl mb-6 flex items-center justify-between animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-sm font-medium">Inputs changed. Signal's analysis might be out of date.</span>
          </div>
          <button 
            onClick={() => handleAnalyze()}
            className="text-xs font-bold uppercase tracking-widest text-amber-700 hover:text-amber-900 underline"
          >
            Update Now
          </button>
        </div>
      )}

      <div className="flex border-b border-slate-200 mb-8 overflow-x-auto scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-4 border-b-2 font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
            </svg>
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-xl mb-8 flex items-center gap-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <div className="min-h-[400px]">
        {activeTab === 'inputs' && (
          <InputList 
            inputs={decision.inputs} 
            files={decision.files || []}
            onAddInput={(item) => onUpdateDecision({ ...decision, inputs: [...decision.inputs, item] })}
            onAddFile={(file) => onUpdateDecision({ ...decision, files: [...(decision.files || []), file] })}
            onAddBatchInputs={(items) => {
              const updated = { ...decision, inputs: [...decision.inputs, ...items] };
              onUpdateDecision(updated);
              handleAnalyze(updated);
            }}
            onDeleteInput={(id) => {
              const item = decision.inputs.find(i => i.id === id);
              if (item) handleItemDeleted(item.timestamp);
              onUpdateDecision({ ...decision, inputs: decision.inputs.filter(i => i.id !== id) });
            }}
            onDeleteFile={(id) => {
              const file = (decision.files || []).find(f => f.id === id);
              if (file) handleItemDeleted(file.timestamp);
              onUpdateDecision({ ...decision, files: (decision.files || []).filter(f => f.id !== id) });
            }}
          />
        )}
        {activeTab === 'analysis' && <AnalysisView analysis={decision.aiAnalysis} isLoading={isAnalyzing} />}
        {activeTab === 'tensions' && <TensionsView tensions={decision.aiAnalysis?.tensions} isLoading={isAnalyzing} />}
        {activeTab === 'options' && <OptionsView options={decision.aiAnalysis?.options} isLoading={isAnalyzing} />}
      </div>
    </div>
  );
};

export default DecisionDetail;
