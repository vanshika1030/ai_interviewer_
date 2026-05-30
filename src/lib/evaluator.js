const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export async function evaluateResponse(question, transcript) {
  if (!transcript || transcript.trim().length === 0) {
    return {
      score: 0,
      communication: 0,
      relevance: 0,
      depth: 0,
      confidence: 0,
      feedback: 'No response was provided for this question.',
    };
  }

  if (GEMINI_API_KEY) {
    return evaluateWithGemini(question, transcript);
  }

  return getMockEvaluation(question, transcript);
}

async function evaluateWithGemini(question, transcript) {
  try {
    const prompt = `You are an expert interview evaluator. Analyze the following interview response and provide a structured evaluation.

Question asked: "${question}"

Candidate's response: "${transcript}"

Evaluate the response on these criteria (each scored 0-10):
1. Communication: Clarity, articulation, grammar, and structure of the response
2. Relevance: How well the response addresses the specific question asked
3. Depth: Level of detail, examples, and thoroughness in the answer
4. Confidence: Assertiveness, conviction, and professional tone

Also provide:
- An overall score (0-100) that weighs all criteria
- A brief constructive feedback paragraph (2-3 sentences)

Respond ONLY in valid JSON format:
{
  "score": <number 0-100>,
  "communication": <number 0-10>,
  "relevance": <number 0-10>,
  "depth": <number 0-10>,
  "confidence": <number 0-10>,
  "feedback": "<string>"
}`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          topP: 0.8,
          maxOutputTokens: 512,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errorBody}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('No content returned from Gemini API');
    }

    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const evaluation = JSON.parse(cleaned);

    return {
      score: clamp(evaluation.score, 0, 100),
      communication: clamp(evaluation.communication, 0, 10),
      relevance: clamp(evaluation.relevance, 0, 10),
      depth: clamp(evaluation.depth, 0, 10),
      confidence: clamp(evaluation.confidence, 0, 10),
      feedback: evaluation.feedback || 'Evaluation completed successfully.',
    };
  } catch (error) {
    console.error('Gemini evaluation error:', error.message);
    return getMockEvaluation(question, transcript);
  }
}

function getMockEvaluation(question, transcript) {
  // When no Gemini API key is configured, provide realistic scoring
  // based on transcript length. No inflation for empty/short responses.
  console.warn('[Evaluator] No GEMINI_API_KEY configured. Using length-based fallback scoring. Set GEMINI_API_KEY in .env.local for AI evaluation.');

  if (!transcript || transcript.trim().length === 0) {
    return {
      score: 0,
      communication: 0,
      relevance: 0,
      depth: 0,
      confidence: 0,
      feedback: 'No response was detected. The candidate did not provide an answer to this question.',
    };
  }

  const wordCount = transcript.trim().split(/\s+/).length;

  // Very short responses (< 10 words) - likely noise or incomplete
  if (wordCount < 10) {
    return {
      score: Math.round(5 + Math.random() * 10),
      communication: clamp(Math.round(1 + Math.random() * 2), 0, 10),
      relevance: clamp(Math.round(1 + Math.random() * 2), 0, 10),
      depth: clamp(Math.round(0 + Math.random() * 2), 0, 10),
      confidence: clamp(Math.round(1 + Math.random() * 2), 0, 10),
      feedback: 'The response was too brief to evaluate meaningfully. A more detailed answer with examples would be needed.',
    };
  }

  // Short responses (10-30 words) - minimal effort
  if (wordCount < 30) {
    return {
      score: Math.round(20 + Math.random() * 20),
      communication: clamp(Math.round(3 + Math.random() * 2), 0, 10),
      relevance: clamp(Math.round(2 + Math.random() * 3), 0, 10),
      depth: clamp(Math.round(2 + Math.random() * 2), 0, 10),
      confidence: clamp(Math.round(3 + Math.random() * 2), 0, 10),
      feedback: 'The response lacked sufficient detail. Expanding on examples and providing more structured reasoning would significantly improve the score.',
    };
  }

  // Medium responses (30-80 words)
  if (wordCount < 80) {
    return {
      score: Math.round(40 + Math.random() * 25),
      communication: clamp(Math.round(4 + Math.random() * 3), 0, 10),
      relevance: clamp(Math.round(4 + Math.random() * 3), 0, 10),
      depth: clamp(Math.round(3 + Math.random() * 3), 0, 10),
      confidence: clamp(Math.round(4 + Math.random() * 3), 0, 10),
      feedback: 'A reasonable response that addresses the question. Adding specific examples, metrics, or deeper technical details would strengthen it further.',
    };
  }

  // Longer responses (80+ words) - decent effort
  const score = Math.round(55 + Math.random() * 25);
  return {
    score,
    communication: clamp(Math.round(5 + Math.random() * 3), 0, 10),
    relevance: clamp(Math.round(5 + Math.random() * 3), 0, 10),
    depth: clamp(Math.round(5 + Math.random() * 3), 0, 10),
    confidence: clamp(Math.round(5 + Math.random() * 3), 0, 10),
    feedback: 'A substantive response demonstrating engagement with the topic. For the most accurate evaluation, configure the Gemini API key for AI-powered assessment.',
  };
}

export function evaluateInterview(responses) {
  if (!responses || responses.length === 0) {
    return {
      overallScore: 0,
      communicationAvg: 0,
      relevanceAvg: 0,
      depthAvg: 0,
      confidenceAvg: 0,
      aiSummary: 'No responses were evaluated.',
      strengths: [],
      improvements: [],
      evaluatedAt: new Date(),
    };
  }

  const evaluated = responses.filter((r) => r.evaluation && r.evaluation.score > 0);

  if (evaluated.length === 0) {
    return {
      overallScore: 0,
      communicationAvg: 0,
      relevanceAvg: 0,
      depthAvg: 0,
      confidenceAvg: 0,
      aiSummary: 'No responses contained valid evaluations.',
      strengths: [],
      improvements: [],
      evaluatedAt: new Date(),
    };
  }

  const count = evaluated.length;
  const sum = (arr, key) => arr.reduce((acc, r) => acc + (r.evaluation[key] || 0), 0);

  const overallScore = Math.round(sum(evaluated, 'score') / count);
  const communicationAvg = parseFloat((sum(evaluated, 'communication') / count).toFixed(1));
  const relevanceAvg = parseFloat((sum(evaluated, 'relevance') / count).toFixed(1));
  const depthAvg = parseFloat((sum(evaluated, 'depth') / count).toFixed(1));
  const confidenceAvg = parseFloat((sum(evaluated, 'confidence') / count).toFixed(1));

  const strengths = [];
  const improvements = [];

  if (communicationAvg >= 7) strengths.push('Strong communication and articulation skills');
  else if (communicationAvg < 5) improvements.push('Work on clarity and structure in verbal communication');

  if (relevanceAvg >= 7) strengths.push('Excellent ability to address questions directly');
  else if (relevanceAvg < 5) improvements.push('Focus on answering the specific question asked');

  if (depthAvg >= 7) strengths.push('Demonstrates thorough knowledge with detailed examples');
  else if (depthAvg < 5) improvements.push('Provide more detailed examples and concrete evidence');

  if (confidenceAvg >= 7) strengths.push('Displays strong confidence and professional demeanor');
  else if (confidenceAvg < 5) improvements.push('Practice to build more confidence in delivery');

  if (overallScore >= 80) strengths.push('Consistently high performance across all questions');
  if (overallScore < 50) improvements.push('Overall preparation needs significant improvement');

  if (strengths.length === 0) strengths.push('Shows potential with room for growth');
  if (improvements.length === 0) improvements.push('Continue refining responses with more specific examples');

  const performanceLevel = overallScore >= 85 ? 'exceptional' :
    overallScore >= 70 ? 'strong' :
    overallScore >= 55 ? 'satisfactory' : 'needs improvement';

  const aiSummary = `The candidate demonstrated ${performanceLevel} performance across ${count} question${count > 1 ? 's' : ''} with an overall score of ${overallScore}/100. Communication averaged ${communicationAvg}/10, relevance ${relevanceAvg}/10, depth ${depthAvg}/10, and confidence ${confidenceAvg}/10. ${strengths.length > 0 ? `Key strengths include: ${strengths.slice(0, 2).join('; ').toLowerCase()}.` : ''} ${improvements.length > 0 ? `Areas for improvement: ${improvements.slice(0, 2).join('; ').toLowerCase()}.` : ''}`;

  return {
    overallScore,
    communicationAvg,
    relevanceAvg,
    depthAvg,
    confidenceAvg,
    aiSummary: aiSummary.trim(),
    strengths,
    improvements,
    evaluatedAt: new Date(),
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
