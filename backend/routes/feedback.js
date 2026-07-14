const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MODEL_NAMES = [
  'gemini-2.5-flash',
  'gemini-3.5-flash',
  'models/gemini-2.5-flash',
  'models/gemini-3.5-flash',
];

async function callGemini(prompt) {
  let lastError;
  for (const modelName of MODEL_NAMES) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { temperature: 0.4, maxOutputTokens: 3048 },
      });
      const result = await model.generateContent(prompt);
      console.log(`✅ Success with model: ${modelName}`);
      return result.response.text().trim();
    } catch (err) {
      console.log(`❌ ${modelName}: ${err.message?.slice(0, 60)}`);
      lastError = err;
      if (err.status !== 404 && !err.message?.includes('404')) throw err;
    }
  }
  throw lastError;
}

// Try to extract valid JSON even from a truncated response
function extractJSON(raw) {
  // Strip markdown fences
  let text = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  // If it parses cleanly, great
  try { return JSON.parse(text); } catch {}

  // It got cut off — find the last complete field and close the object
  // Strategy: find the last comma+newline before the cut, remove the incomplete field
  const lastComma = text.lastIndexOf(',');
  if (lastComma !== -1) {
    text = text.slice(0, lastComma) + '\n}';
    try { return JSON.parse(text); } catch {}
  }

  return null;
}

router.post('/', async (req, res) => {
  const { question, answer, category, difficulty } = req.body;

  if (!question || !answer) {
    return res.status(400).json({ error: 'question and answer are required' });
  }
  if (answer.trim().length < 20) {
    return res.status(400).json({ error: 'Answer is too short to evaluate.' });
  }


  const prompt = `You are an interview coach. Evaluate this answer and reply with ONLY raw JSON, no markdown, no backticks.

JSON schema (keep all string values SHORT — max 20 words each):
{
  "overallScore": <1-100>,
  "scores": { "clarity": <1-10>, "relevance": <1-10>, "depth": <1-10>, "structure": <1-10>, "impact": <1-10> },
  "summary": "<2 sentences max>",
  "strengths": ["<10 words max>", "<10 words max>", "<10 words max>"],
  "improvements": ["<10 words max>", "<10 words max>", "<10 words max>"],
  "keyTakeaway": "<one sentence>",
  "interviewerThoughts": "<one sentence>",
  "improvedAnswer": "Concise rewritten answer in first person, max 150 words, demonstrating best practices."
}
Question (${category || 'general'}, ${difficulty || 'medium'}): "${question}"
Answer: "${answer}"`;

  try {
    const rawText = await callGemini(prompt);
    const feedback = extractJSON(rawText);

    if (!feedback) {
      console.error('Could not extract JSON from:\n', rawText);
      return res.status(500).json({ error: 'AI returned unexpected format. Please try again.' });
    }

    res.json({ feedback, questionId: req.body.questionId || null });

  } catch (err) {
    console.error('Gemini error:', err.message);
    if (err.message?.includes('API key not valid')) {
      return res.status(401).json({ error: 'Invalid Gemini API key. Check GEMINI_API_KEY in .env' });
    }
    if (err.status === 429 || err.message?.includes('quota')) {
      return res.status(429).json({ error: 'Rate limit hit. Wait a moment and try again.' });
    }
    res.status(500).json({ error: err.message || 'Failed to generate feedback. Please try again.' });
  }
});

module.exports = router;