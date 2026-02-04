import { Decision, AIAnalysis, InputType } from "../types";

const API_BASE_URL = '/api';

export interface ExtractionResult {
  document_summary: string;
  inputs: Array<{
    type: InputType;
    text: string;
    source_ref: string;
    confidence: 'high' | 'medium' | 'low';
  }>;
}

/**
 * Converts raw extracted text from a file into atomic Signal inputs using specific constraints.
 */
export const extractAtomicInputs = async (
  fileName: string, 
  rawText: string
): Promise<ExtractionResult> => {
  try {
    const response = await fetch(`${API_BASE_URL}/extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileName, rawText }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (e) {
    console.error("Extraction Error:", e);
    return { document_summary: "Error parsing summary", inputs: [] };
  }
};

/**
 * Main Analysis Logic
 */
export const analyzeDecision = async (decision: Decision): Promise<AIAnalysis> => {
  try {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ decision }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (e) {
    console.error("Parse Error:", e);
    throw new Error("Signal failed to generate a valid analysis.");
  }
};
