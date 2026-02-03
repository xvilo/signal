import OpenAI from "openai";
import { Decision, AIAnalysis, InputType } from "../types";

const openai = new OpenAI({
  apiKey: process.env.API_KEY,
  dangerouslyAllowBrowser: true // Only for development - move to backend in production
});

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
    You are an AI assistant inside "Signal", a decision sensemaking platform.
    Below is raw text extracted from a file named: ${fileName}.

    TASK:
    Convert the provided extracted document text into a set of short, atomic "Decision Inputs" that can be stored individually in the app. The goal is to break long documents into smaller inputs like the ones a user would manually add (Note, Evidence, Concern, Assumption, Question, Link).

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

    Return your response as a JSON object with this exact structure:
    {
      "document_summary": "string",
      "inputs": [
        {
          "type": "note|concern|evidence|assumption|question|link",
          "text": "string (max 240 chars)",
          "source_ref": "string",
          "confidence": "high|medium|low"
        }
      ]
    }
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  try {
    const content = response.choices[0].message.content;
    if (!content) throw new Error("No response from OpenAI");
    return JSON.parse(content);
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

    Return your response as a JSON object with this exact structure:
    {
      "situationSummary": "string",
      "whyHard": "string",
      "forces": ["string"],
      "constraints": ["string"],
      "hiddenAssumptions": ["string"],
      "unknowns": ["string"],
      "tensions": [
        {
          "nameX": "string",
          "nameY": "string",
          "reasonX": "string",
          "reasonY": "string",
          "gainIfX": "string",
          "gainIfY": "string",
          "lossIfX": "string",
          "lossIfY": "string"
        }
      ],
      "options": [
        {
          "name": "string",
          "description": "string",
          "tradeoffs": "string",
          "commitmentDo": ["string"],
          "commitmentDont": ["string"],
          "futureImpact": "string"
        }
      ],
      "fileExtractions": [
        {
          "type": "Evidence|Assumption|Concern|Note|Question",
          "statement": "string",
          "source_citation": "string",
          "confidence": "High|Medium|Low"
        }
      ]
    }
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  try {
    const content = response.choices[0].message.content;
    if (!content) throw new Error("No response from OpenAI");
    return JSON.parse(content);
  } catch (e) {
    console.error("Parse Error:", e);
    throw new Error("Signal failed to generate a valid analysis.");
  }
};
