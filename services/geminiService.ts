
import { GoogleGenAI, Type } from "@google/genai";
import { Decision, AIAnalysis, InputItem, InputType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
  const prompt = `
    You are an AI assistant inside “Signal”, a decision sensemaking platform.
    Below is raw text extracted from a file named: ${fileName}.

    TASK:
    Convert the provided extracted document text into a set of short, atomic “Decision Inputs” that can be stored individually in the app. The goal is to break long documents into smaller inputs like the ones a user would manually add (Note, Evidence, Concern, Assumption, Question, Link).

    HARD REQUIREMENTS:
    1) Keep each input short:
       - Max 240 characters per input text (roughly 1–2 sentences).
       - One idea per input.
    2) Every input must be grounded in the document text:
       - No generic statements.
       - If something is implied but not explicitly stated, label it as an Assumption.
    3) De-duplicate:
       - Do not repeat the same point in different words.
    4) Output must be machine-readable JSON only.
    5) If the text is very long, prioritize the most decision-relevant items first.

    INPUT TYPES (choose one per item):
    - "note": neutral observation or context
    - "evidence": a claim backed by stated facts, metrics, or described findings
    - "concern": a risk, worry, or potential downside
    - "assumption": an unstated belief or inference that, if wrong, changes the decision
    - "question": a gap or missing piece of information needed for the decision
    - "link": only if a URL appears in the text

    QUALITY BAR (IMPORTANT):
    - Prefer inputs that influence: MVP scope, user needs, constraints, success metrics, trade-offs.
    - Avoid vague corporate language.
    - Make each input useful for generating tensions and options later.

    RAW TEXT:
    ${rawText.substring(0, 15000)}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          document_summary: { type: Type.STRING },
          inputs: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, enum: ['note', 'concern', 'evidence', 'assumption', 'question', 'link'] },
                text: { type: Type.STRING },
                source_ref: { type: Type.STRING },
                confidence: { type: Type.STRING, enum: ['high', 'medium', 'low'] }
              },
              required: ["type", "text", "source_ref", "confidence"]
            }
          }
        },
        required: ["document_summary", "inputs"]
      }
    }
  });

  try {
    return JSON.parse(response.text.trim());
  } catch (e) {
    console.error("Extraction Error:", e);
    return { document_summary: "Error parsing summary", inputs: [] };
  }
};

/**
 * Main Analysis Logic
 */
export const analyzeDecision = async (decision: Decision): Promise<AIAnalysis> => {
  const inputsText = decision.inputs
    .map(i => `[${i.type.toUpperCase()}] ${i.author} (Source: ${i.source_reference || 'Manual'}): ${i.content}`)
    .join('\n');

  const prompt = `
    You are Signal, an AI decision support platform for product teams.
    Analyze the following decision context and atomic inputs.

    DECISION QUESTION: ${decision.title}
    CONTEXT: ${decision.context}

    INPUT LOG (Structured from manual notes and file extractions):
    ${inputsText || "No inputs provided."}

    CRITICAL INSTRUCTIONS:
    1. CONFLICT HANDLING: Surface conflicts between evidence and assumptions.
    2. NO RECOMMENDATION: Do not choose a side. Surface tensions and strategic stances.
    3. TRACEABILITY: Reference the author/source where relevant.
    4. TONE: Direct, thoughtful, product-friendly.

    REQUIRED OUTPUT SECTIONS:
    1) SITUATION SUMMARY (3–5 sentences)
    2) WHY IT'S HARD (2–4 sentences)
    3) FORCES & CONSTRAINTS
    4) HIDDEN ASSUMPTIONS
    5) CRUCIAL UNKNOWNS
    6) FUNDAMENTAL TENSIONS
    7) STRATEGIC STANCES
    8) FILE EXTRACTIONS (Summary list of evidence found)
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          situationSummary: { type: Type.STRING },
          whyHard: { type: Type.STRING },
          forces: { type: Type.ARRAY, items: { type: Type.STRING } },
          constraints: { type: Type.ARRAY, items: { type: Type.STRING } },
          hiddenAssumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
          unknowns: { type: Type.ARRAY, items: { type: Type.STRING } },
          tensions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                nameX: { type: Type.STRING },
                nameY: { type: Type.STRING },
                reasonX: { type: Type.STRING },
                reasonY: { type: Type.STRING },
                gainIfX: { type: Type.STRING },
                gainIfY: { type: Type.STRING },
                lossIfX: { type: Type.STRING },
                lossIfY: { type: Type.STRING }
              }
            }
          },
          options: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                tradeoffs: { type: Type.STRING },
                commitmentDo: { type: Type.ARRAY, items: { type: Type.STRING } },
                commitmentDont: { type: Type.ARRAY, items: { type: Type.STRING } },
                futureImpact: { type: Type.STRING }
              }
            }
          },
          fileExtractions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, enum: ['Evidence', 'Assumption', 'Concern', 'Note', 'Question'] },
                statement: { type: Type.STRING },
                source_citation: { type: Type.STRING },
                confidence: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] }
              }
            }
          }
        },
        required: ["situationSummary", "whyHard", "forces", "constraints", "hiddenAssumptions", "unknowns", "tensions", "options", "fileExtractions"]
      }
    }
  });

  try {
    return JSON.parse(response.text.trim());
  } catch (e) {
    console.error("Parse Error:", e);
    throw new Error("Signal failed to generate a valid analysis.");
  }
};
