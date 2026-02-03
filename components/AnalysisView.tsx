
import React from 'react';
import { AIAnalysis } from '../types';

interface AnalysisViewProps {
  analysis?: AIAnalysis;
  isLoading: boolean;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ analysis, isLoading }) => {
  if (isLoading) return <LoadingPlaceholder label="Synthesizing forces and identifying structural trade-offs..." />;
  if (!analysis) return <EmptyState label="Run analysis to surface clarity and traceability." />;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <section className="grid md:grid-cols-2 gap-10">
        <div>
          <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-4">Situation Summary</h3>
          <p className="text-slate-700 text-lg leading-relaxed">{analysis.situationSummary}</p>
        </div>
        <div>
          <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-4">Why it's Hard</h3>
          <p className="text-slate-700 text-lg leading-relaxed font-medium italic">{analysis.whyHard}</p>
        </div>
      </section>

      <section className="bg-slate-900 text-white p-1 rounded-3xl overflow-hidden shadow-2xl">
        <div className="grid md:grid-cols-2">
          <div className="p-8 bg-slate-900 border-r border-slate-800">
             <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-6 flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
               Internal & External Forces
             </h3>
             <ul className="space-y-4">
                {analysis.forces.map((f, i) => (
                  <li key={i} className="text-slate-300 text-sm leading-relaxed flex gap-3">
                    <span className="text-slate-600 font-mono text-[10px] pt-1">0{i+1}</span>
                    {f}
                  </li>
                ))}
             </ul>
          </div>
          <div className="p-8 bg-slate-950">
             <h3 className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-6 flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-rose-400"></div>
               Constraints & Limits
             </h3>
             <ul className="space-y-4">
                {analysis.constraints.map((c, i) => (
                  <li key={i} className="text-slate-300 text-sm leading-relaxed flex gap-3">
                    <span className="text-slate-600 font-mono text-[10px] pt-1">C{i+1}</span>
                    {c}
                  </li>
                ))}
             </ul>
          </div>
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-10">
        <section>
          <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-4">Hidden Assumptions</h3>
          <ul className="space-y-3">
            {analysis.hiddenAssumptions.map((item, idx) => (
              <li key={idx} className="flex gap-3 bg-white border border-slate-100 p-4 rounded-xl text-slate-700 text-sm shadow-sm">
                <span className="text-indigo-500 font-bold font-mono">#{idx+1}</span>
                {item}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-4">Crucial Unknowns</h3>
          <ul className="space-y-3">
            {analysis.unknowns.map((item, idx) => (
              <li key={idx} className="flex gap-3 bg-amber-50 border border-amber-100 p-4 rounded-xl text-amber-900 text-sm shadow-sm">
                 <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* FILE EXTRACTIONS (Traceability) */}
      <section className="pt-12 border-t border-slate-200">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">File Extractions</h3>
            <p className="text-[10px] text-slate-400 font-medium italic">Traceability & structured data audit</p>
          </div>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded uppercase">
            {analysis.fileExtractions.length} items extracted
          </span>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden divide-y divide-slate-100 shadow-sm">
           {analysis.fileExtractions.length === 0 ? (
             <div className="p-8 text-center text-slate-400 italic text-sm">No specific data points extracted from files.</div>
           ) : (
             analysis.fileExtractions.map((item, idx) => (
               <div key={idx} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                      item.type === 'Evidence' ? 'bg-green-50 text-green-700 border-green-200' :
                      item.type === 'Assumption' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                      item.type === 'Concern' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                      'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {item.type}
                    </span>
                    <span className={`text-[9px] font-bold uppercase ${item.confidence === 'High' ? 'text-green-600' : item.confidence === 'Medium' ? 'text-amber-600' : 'text-slate-400'}`}>
                      {item.confidence} Confidence
                    </span>
                  </div>
                  <p className="text-slate-800 text-sm font-medium mb-2">{item.statement}</p>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.826L10.242 9.172a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.103 1.103" />
                    </svg>
                    {item.source_citation}
                  </div>
               </div>
             ))
           )}
        </div>
      </section>
    </div>
  );
};

export const LoadingPlaceholder: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex flex-col items-center justify-center py-24 animate-pulse">
    <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
    <p className="text-slate-400 font-medium italic text-center max-w-sm">{label}</p>
  </div>
);

export const EmptyState: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-100 rounded-3xl">
    <svg className="w-12 h-12 text-slate-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.674M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
    <p className="text-slate-400 font-medium">{label}</p>
  </div>
);

export default AnalysisView;
