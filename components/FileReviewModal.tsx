
import React, { useState } from 'react';
import { InputItem, InputType } from '../types';

interface FileReviewModalProps {
  fileName: string;
  extractedText: string;
  suggestedInputs: Partial<InputItem>[];
  documentSummary: string;
  onCancel: () => void;
  onConfirm: (finalInputs: Partial<InputItem>[]) => void;
}

const FileReviewModal: React.FC<FileReviewModalProps> = ({ fileName, extractedText, suggestedInputs, documentSummary, onCancel, onConfirm }) => {
  const [inputs, setInputs] = useState<Partial<InputItem>[]>(suggestedInputs);
  const [showRawText, setShowRawText] = useState(false);

  const handleUpdateInput = (index: number, content: string) => {
    const next = [...inputs];
    next[index] = { ...next[index], content };
    setInputs(next);
  };

  const handleUpdateType = (index: number, type: InputType) => {
    const next = [...inputs];
    next[index] = { ...next[index], type };
    setInputs(next);
  };

  const handleDeleteInput = (index: number) => {
    setInputs(inputs.filter((_, i) => i !== index));
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'note': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'concern': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'evidence': return 'bg-green-50 text-green-600 border-green-100';
      case 'assumption': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'question': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'link': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      default: return 'bg-slate-50 text-slate-400 border-slate-100';
    }
  };

  const getConfidenceColor = (conf?: string) => {
    switch(conf) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-amber-600';
      case 'low': return 'text-slate-400';
      default: return 'text-slate-300';
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md">
      <div className="bg-white w-full max-w-6xl h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        <header className="px-8 py-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Review Extracted Insights</h2>
            <p className="text-sm text-slate-500 font-medium">From: {fileName}</p>
          </div>
          <div className="flex gap-4">
            <button onClick={onCancel} className="px-6 py-2.5 rounded-xl font-bold text-slate-400 hover:text-slate-600 transition-all">Cancel</button>
            <button 
              onClick={() => onConfirm(inputs)} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all"
            >
              Confirm & Add {inputs.length} Inputs
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel: Raw Context & Summary */}
          <div className={`border-r border-slate-100 transition-all duration-500 overflow-hidden flex flex-col ${showRawText ? 'w-1/2' : 'w-72'}`}>
            <div className="p-4 bg-indigo-50 border-b border-indigo-100">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-2">Executive Summary</span>
              <p className="text-xs text-indigo-900 leading-relaxed font-medium italic">{documentSummary}</p>
            </div>
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Extracted Text</span>
              <button 
                onClick={() => setShowRawText(!showRawText)} 
                className="text-[10px] font-bold text-indigo-600 uppercase hover:underline"
              >
                {showRawText ? 'Collapse' : 'Expand View'}
              </button>
            </div>
            <div className="flex-1 p-6 overflow-y-auto font-mono text-[11px] text-slate-400 leading-relaxed whitespace-pre-wrap">
              {extractedText || "No readable text found."}
            </div>
          </div>

          {/* Right Panel: Suggested Inputs */}
          <div className="flex-1 bg-slate-50/50 p-8 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between mb-2">
               <h3 className="text-sm font-bold text-slate-800">Atomic Decision Inputs</h3>
               <p className="text-xs text-slate-500 italic">240 char limit per input. Verify accuracy before saving.</p>
            </div>
            
            {inputs.map((input, idx) => (
              <div key={idx} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm group relative animate-in slide-in-from-right-4 duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex gap-1.5 flex-wrap">
                    {(['evidence', 'assumption', 'concern', 'question', 'link', 'note'] as InputType[]).map(t => (
                      <button
                        key={t}
                        onClick={() => handleUpdateType(idx, t)}
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded border transition-all ${
                          input.type === t ? getTypeStyle(t) : 'bg-white text-slate-300 border-slate-100 hover:border-slate-300'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[9px] font-bold uppercase ${getConfidenceColor(input.confidence)}`}>
                      {input.confidence} Conf.
                    </span>
                    <button 
                      onClick={() => handleDeleteInput(idx)}
                      className="text-slate-300 hover:text-rose-500 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <textarea
                    maxLength={240}
                    value={input.content}
                    onChange={(e) => handleUpdateInput(idx, e.target.value)}
                    className="w-full h-16 p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-700 resize-none focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                  <div className="absolute bottom-2 right-2 text-[9px] text-slate-300 font-mono">
                    {input.content?.length || 0}/240
                  </div>
                </div>
                {input.source_reference && (
                   <div className="mt-2 text-[10px] font-mono text-slate-400 italic">
                      Ref: {input.source_reference}
                   </div>
                )}
              </div>
            ))}

            {inputs.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <p className="font-medium italic">No inputs selected from this file.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileReviewModal;
