
import React from 'react';
import { Tension } from '../types';
import { LoadingPlaceholder, EmptyState } from './AnalysisView';

interface TensionsViewProps {
  tensions?: Tension[];
  isLoading: boolean;
}

const TensionsView: React.FC<TensionsViewProps> = ({ tensions, isLoading }) => {
  if (isLoading) return <LoadingPlaceholder label="Identifying structural trade-offs..." />;
  if (!tensions || tensions.length === 0) return <EmptyState label="No tensions surfaced yet." />;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-3xl">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Fundamental Tensions</h2>
        <p className="text-slate-500">Tensions are conflicts between valid priorities. They cannot be solved by "doing both"—they must be navigated.</p>
      </div>

      <div className="grid gap-8">
        {tensions.map((tension, idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
            <div className="bg-slate-50 border-b border-slate-200 px-8 py-4 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tension #{idx+1}</span>
              <div className="flex items-center gap-4">
                 <span className="text-sm font-bold text-indigo-600">{tension.nameX}</span>
                 <span className="text-xs font-bold text-slate-300 italic">vs</span>
                 <span className="text-sm font-bold text-rose-600">{tension.nameY}</span>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2">
              <div className="p-8 border-r border-slate-100">
                <h4 className="text-sm font-bold text-slate-900 mb-4">If we prioritize <span className="text-indigo-600">{tension.nameX}</span>:</h4>
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Rational Case</span>
                    <p className="text-slate-600 text-sm leading-relaxed">{tension.reasonX}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                       <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider block mb-1">Gained</span>
                       <p className="text-green-800 text-xs font-medium">{tension.gainIfX}</p>
                    </div>
                    <div className="bg-rose-50 p-3 rounded-xl border border-rose-100">
                       <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block mb-1">Lost</span>
                       <p className="text-rose-800 text-xs font-medium">{tension.lossIfX}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <h4 className="text-sm font-bold text-slate-900 mb-4">If we prioritize <span className="text-rose-600">{tension.nameY}</span>:</h4>
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Rational Case</span>
                    <p className="text-slate-600 text-sm leading-relaxed">{tension.reasonY}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                       <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider block mb-1">Gained</span>
                       <p className="text-green-800 text-xs font-medium">{tension.gainIfY}</p>
                    </div>
                    <div className="bg-rose-50 p-3 rounded-xl border border-rose-100">
                       <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block mb-1">Lost</span>
                       <p className="text-rose-800 text-xs font-medium">{tension.lossIfY}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TensionsView;
