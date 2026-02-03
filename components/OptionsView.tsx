
import React from 'react';
import { StrategicOption } from '../types';
import { LoadingPlaceholder, EmptyState } from './AnalysisView';

interface OptionsViewProps {
  options?: StrategicOption[];
  isLoading: boolean;
}

const OptionsView: React.FC<OptionsViewProps> = ({ options, isLoading }) => {
  if (isLoading) return <LoadingPlaceholder label="Formulating strategic stances and future impacts..." />;
  if (!options || options.length === 0) return <EmptyState label="No stances generated yet." />;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="max-w-3xl">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Strategic Stances</h2>
        <p className="text-slate-500 italic">Signal presents these stances to clarify the cost of commitment. None of these are neutral.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {options.map((option, idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-3xl flex flex-col hover:border-indigo-500 transition-all shadow-sm hover:shadow-xl group">
            <div className="p-8 pb-0">
               <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">{option.name}</h3>
               <p className="text-slate-600 text-sm leading-relaxed mb-6">{option.description}</p>
            </div>
            
            <div className="p-8 pt-0 mt-auto">
              <div className="border-t border-slate-100 pt-6 space-y-6">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Trade-off</span>
                  <p className="text-slate-800 text-sm font-medium leading-relaxed">{option.tradeoffs}</p>
                </div>
                
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Commitment Required</span>
                  <div className="space-y-3">
                    <ul className="space-y-2">
                      {option.commitmentDo.map((item, i) => (
                        <li key={i} className="flex gap-2 text-[11px] text-slate-700 font-medium">
                          <svg className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                          {item}
                        </li>
                      ))}
                      {option.commitmentDont.map((item, i) => (
                        <li key={i} className="flex gap-2 text-[11px] text-slate-400">
                          <svg className="w-3 h-3 text-rose-300 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span className="line-through">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-indigo-50 -mx-8 -mb-8 p-6 mt-6 rounded-b-3xl border-t border-indigo-100">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-2">Likely Future</span>
                  <p className="text-indigo-900 text-sm font-semibold">{option.futureImpact}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OptionsView;
