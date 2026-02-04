import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize OpenAI with API key from environment
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running' });
});

// Extract atomic inputs from document
app.post('/api/extract', async (req, res) => {
  try {
    const { fileName, rawText } = req.body;

    if (!fileName || !rawText) {
      return res.status(400).json({ error: 'fileName and rawText are required' });
    }

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

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const result = JSON.parse(content);
    res.json(result);
  } catch (error) {
    console.error('Extract error:', error);
    res.status(500).json({
      error: 'Failed to extract inputs',
      message: error.message
    });
  }
});

// Analyze decision
app.post('/api/analyze', async (req, res) => {
  try {
    const { decision } = req.body;

    if (!decision) {
      return res.status(400).json({ error: 'decision is required' });
    }

    const inputsText = decision.inputs
      .map(i => `[${i.type.toUpperCase()}] ${i.author} (Source: ${i.source_reference || 'Manual'}): ${i.content}`)
      .join('\n');

    const prompt = `
You are an AI assistant inside "Signal", a decision sensemaking platform.

CONTEXT:
A user is facing this decision: "${decision.title}"
${decision.description ? `Description: ${decision.description}` : ''}

They have collected the following decision inputs:
${inputsText}

YOUR TASK:
1) Extract all underlying tensions (conflicts, trade-offs, or competing priorities).
2) Generate 3–5 possible decision options that resolve or navigate those tensions.
3) Return a JSON object with:
   - tensions: array of { title, description }
   - options: array of { title, description, pros, cons }

Requirements:
- Each tension should be a distinct conflict or trade-off.
- Each option should be actionable and specific.
- Pros and cons should be brief (1-2 sentences each).
- Output ONLY valid JSON, no markdown formatting.

Return format:
{
  "tensions": [
    {
      "title": "string",
      "description": "string"
    }
  ],
  "options": [
    {
      "title": "string",
      "description": "string",
      "pros": ["string"],
      "cons": ["string"]
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

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const result = JSON.parse(content);
    res.json(result);
  } catch (error) {
    console.error('Analyze error:', error);
    res.status(500).json({
      error: 'Failed to analyze decision',
      message: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
});
