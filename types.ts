
export type DecisionStatus = 'active' | 'completed';

export type InputType = 'note' | 'concern' | 'evidence' | 'assumption' | 'question' | 'link';

export interface InputItem {
  id: string;
  type: InputType;
  content: string;
  author: string;
  timestamp: number;
  source_reference?: string; // e.g. "Page 4", "Slide 2"
  confidence?: 'high' | 'medium' | 'low';
}

export interface FileItem {
  id: string;
  file_name: string;
  file_type: string;
  file_text: string;
  timestamp: number;
}

export interface Tension {
  nameX: string;
  nameY: string;
  reasonX: string;
  reasonY: string;
  gainIfX: string;
  gainIfY: string;
  lossIfX: string;
  lossIfY: string;
}

export interface StrategicOption {
  name: string;
  description: string;
  tradeoffs: string;
  commitmentDo: string[];
  commitmentDont: string[];
  futureImpact: string;
}

export interface ExtractedItem {
  type: 'Evidence' | 'Assumption' | 'Concern' | 'Note' | 'Question';
  statement: string;
  source_citation: string;
  confidence: 'High' | 'Medium' | 'Low';
}

export interface AIAnalysis {
  situationSummary: string;
  whyHard: string;
  forces: string[];
  constraints: string[];
  hiddenAssumptions: string[];
  unknowns: string[];
  tensions: Tension[];
  options: StrategicOption[];
  fileExtractions: ExtractedItem[];
}

export interface Decision {
  id: string;
  title: string;
  context: string;
  owner: string;
  deadline: string;
  status: DecisionStatus;
  createdAt: number;
  inputs: InputItem[];
  files: FileItem[];
  aiAnalysis?: AIAnalysis;
  lastAnalysisUpdate?: number;
}
