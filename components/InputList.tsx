
import React, { useState, useRef, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { InputItem, FileItem, InputType } from '../types';
import FileReviewModal from './FileReviewModal';
import { extractAtomicInputs, ExtractionResult } from '../services/geminiService';

interface InputListProps {
  inputs: InputItem[];
  files?: FileItem[];
  onAddInput: (item: InputItem) => void;
  onAddFile: (item: FileItem) => void;
  onAddBatchInputs: (items: InputItem[]) => void;
  onDeleteInput: (id: string) => void;
  onDeleteFile: (id: string) => void;
}

const UNDO_WINDOW = 10000;

const InputList: React.FC<InputListProps> = ({ inputs, files = [], onAddInput, onAddFile, onAddBatchInputs, onDeleteInput, onDeleteFile }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [activeMode, setActiveMode] = useState<'typed' | 'file'>('typed');
  const [content, setContent] = useState('');
  const [type, setType] = useState<InputType>('note');
  const [author, setAuthor] = useState('Product Lead');
  
  // File Extraction State
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionStatus, setExtractionStatus] = useState('');
  const [pendingReview, setPendingReview] = useState<{ fileName: string; text: string; result: ExtractionResult } | null>(null);

  // Deletion States
  const [pendingDeletions, setPendingDeletions] = useState<Set<string>>(new Set());
  const [confirmingDeletion, setConfirmingDeletion] = useState<string | null>(null);
  const deletionTimers = useRef<Record<string, any>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      Object.values(deletionTimers.current).forEach(clearTimeout);
    };
  }, []);

  const handleSubmitTyped = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onAddInput({
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: content.trim(),
      author,
      timestamp: Date.now()
    });
    setContent('');
  };

  const processFile = async (file: File) => {
    setIsExtracting(true);
    setExtractionStatus('Extracting readable text...');
    
    let extractedText = '';
    const fileExt = file.name.split('.').pop()?.toLowerCase();

    try {
      if (fileExt === 'pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await (window as any).pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item: any) => item.str).join(' ') + '\n';
        }
        extractedText = text;
      } else if (fileExt === 'docx') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await (window as any).mammoth.extractRawText({ arrayBuffer });
        extractedText = result.value;
      } else {
        extractedText = await file.text();
      }

      if (!extractedText.trim()) throw new Error("Empty document");

      setExtractionStatus('Generating atomic inputs...');
      const extractionResult = await extractAtomicInputs(file.name, extractedText, getAccessTokenSilently);

      setPendingReview({
        fileName: file.name,
        text: extractedText,
        result: extractionResult
      });
      
    } catch (err) {
      alert(`Could not extract text from this ${fileExt} file. Please ensure it has a readable text layer.`);
    } finally {
      setIsExtracting(false);
      setExtractionStatus('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleConfirmReview = (finalItems: Partial<InputItem>[]) => {
    if (!pendingReview) return;

    // 1. Add the file record
    const fileId = Math.random().toString(36).substr(2, 9);
    onAddFile({
      id: fileId,
      file_name: pendingReview.fileName,
      file_type: pendingReview.fileName.split('.').pop() || 'unknown',
      file_text: pendingReview.text,
      timestamp: Date.now()
    });

    // 2. Add summary as a note
    const summaryInput: InputItem = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'note',
      content: `[Summary] ${pendingReview.result.document_summary}`,
      author: `File: ${pendingReview.fileName}`,
      timestamp: Date.now(),
      source_reference: 'Document Summary'
    };

    // 3. Convert items
    const newInputs: InputItem[] = finalItems.map(item => ({
      id: Math.random().toString(36).substr(2, 9),
      type: item.type || 'note',
      content: item.content || '',
      author: `File: ${pendingReview.fileName}`,
      timestamp: Date.now(),
      source_reference: item.source_reference,
      confidence: item.confidence
    }));

    onAddBatchInputs([summaryInput, ...newInputs]);
    setPendingReview(null);
  };

  const startSoftDelete = (id: string, isFile: boolean) => {
    setConfirmingDeletion(null);
    setPendingDeletions(prev => new Set(prev).add(id));
    deletionTimers.current[id] = setTimeout(() => {
      if (isFile) onDeleteFile(id);
      else onDeleteInput(id);
      setPendingDeletions(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, UNDO_WINDOW);
  };

  const undoDelete = (id: string) => {
    if (deletionTimers.current[id]) {
      clearTimeout(deletionTimers.current[id]);
      delete deletionTimers.current[id];
    }
    setPendingDeletions(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'note': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'concern': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'evidence': return 'bg-green-50 text-green-600 border-green-100';
      case 'assumption': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'question': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'link': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'file': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-50 text-slate-400 border-slate-100';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div className="flex gap-4 mb-6 border-b border-slate-100 pb-4">
          <button 
            onClick={() => setActiveMode('typed')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeMode === 'typed' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Manual Input
          </button>
          <button 
            onClick={() => setActiveMode('file')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeMode === 'file' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Smart File Upload
          </button>
        </div>

        {activeMode === 'typed' ? (
          <form onSubmit={handleSubmitTyped}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Record a thought, data point, or risk..."
              className="w-full h-24 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none mb-4 text-slate-700"
            />
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-2">
                {(['note', 'concern', 'evidence', 'assumption', 'question', 'link'] as InputType[]).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all border ${
                      type === t ? getTypeStyle(t) : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <button type="submit" className="bg-slate-900 text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-slate-800">
                Post Input
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 group hover:border-indigo-400 transition-colors">
            {isExtracting ? (
              <div className="flex flex-col items-center text-center animate-pulse">
                 <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                 <p className="text-sm font-bold text-slate-900">{extractionStatus}</p>
                 <p className="text-xs text-slate-400 mt-1 italic">Signal is reading your document...</p>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Upload Decision Artifact</h3>
                <p className="text-xs text-slate-500 mb-6 text-center max-w-[240px]">We'll automatically convert PDFs, Docs, and text files into atomic decision inputs.</p>
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept=".pdf,.docx,.txt,.md,.json" />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-md transition-all"
                >
                  Select File
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {pendingReview && (
        <FileReviewModal 
          fileName={pendingReview.fileName}
          extractedText={pendingReview.text}
          documentSummary={pendingReview.result.document_summary}
          suggestedInputs={pendingReview.result.inputs.map(i => ({
            type: i.type,
            content: i.text,
            source_reference: i.source_ref,
            confidence: i.confidence
          }))}
          onCancel={() => setPendingReview(null)}
          onConfirm={handleConfirmReview}
        />
      )}

      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Decision Input Stream</h3>
        
        {[...inputs, ...files].sort((a, b) => b.timestamp - a.timestamp).map(item => {
          const isFile = 'file_name' in item;
          const id = item.id;
          const isPending = pendingDeletions.has(id);
          const isConfirming = confirmingDeletion === id;

          if (isPending) {
            return (
              <div key={id} className="bg-slate-50 border border-slate-200 border-dashed p-4 rounded-xl flex items-center justify-between animate-pulse">
                <span className="text-xs text-slate-400 italic">Input removed.</span>
                <button onClick={() => undoDelete(id)} className="text-indigo-600 text-xs font-bold hover:underline px-3 py-1">Undo</button>
              </div>
            );
          }

          return (
            <div key={id} className={`group flex gap-4 border p-4 rounded-xl relative transition-all ${isFile ? 'bg-slate-100 border-slate-200 opacity-60' : 'bg-white border-slate-100 hover:shadow-sm'} ${isConfirming ? 'border-rose-300 bg-rose-50 shadow-md ring-2 ring-rose-100' : ''}`}>
              <div className="flex-shrink-0 pt-1">
                 <span className={`text-[10px] font-bold uppercase tracking-tighter px-2 py-0.5 rounded border ${isFile ? getTypeStyle('file') : getTypeStyle((item as InputItem).type)}`}>
                    {isFile ? 'FILE' : (item as InputItem).type}
                  </span>
              </div>
              <div className="flex-1 overflow-hidden">
                 <div className="flex items-baseline justify-between mb-1">
                    <span className="text-sm font-bold text-slate-900 truncate mr-2">
                      {isFile ? (item as FileItem).file_name : (item as InputItem).author}
                    </span>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">{new Date(item.timestamp).toLocaleTimeString()}</span>
                 </div>
                 <p className="text-slate-600 text-sm leading-relaxed">
                   {isFile ? `Source document processed.` : (item as InputItem).content}
                 </p>
                 {!(isFile) && (item as InputItem).source_reference && (
                   <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.826L10.242 9.172a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.103 1.103" /></svg>
                      { (item as InputItem).source_reference }
                      { (item as InputItem).confidence && <span className="ml-auto opacity-60">{(item as InputItem).confidence} confidence</span>}
                   </div>
                 )}
              </div>

              {isConfirming ? (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center gap-4 rounded-xl animate-in fade-in duration-200 z-10">
                   <p className="text-xs font-bold text-slate-900">Delete this entry?</p>
                   <button onClick={() => setConfirmingDeletion(null)} className="text-xs font-bold text-slate-400 hover:text-slate-600">Cancel</button>
                   <button onClick={() => startSoftDelete(id, isFile)} className="bg-rose-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-rose-700">Delete</button>
                </div>
              ) : (
                <button onClick={() => setConfirmingDeletion(id)} className="absolute top-4 right-4 text-slate-300 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InputList;
