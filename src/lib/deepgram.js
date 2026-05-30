import fs from 'fs';

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;
const DEEPGRAM_API_URL = 'https://api.deepgram.com/v1/listen';

export async function transcribeAudio(filePath) {
  if (DEEPGRAM_API_KEY) {
    return transcribeWithDeepgram(filePath);
  }
  return getMockTranscript();
}

async function transcribeWithDeepgram(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Audio file not found: ${filePath}`);
    }

    const audioBuffer = fs.readFileSync(filePath);

    const response = await fetch(`${DEEPGRAM_API_URL}?model=nova-2&smart_format=true&punctuate=true&diarize=false`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${DEEPGRAM_API_KEY}`,
        'Content-Type': 'audio/webm',
      },
      body: audioBuffer,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Deepgram API error (${response.status}): ${errorBody}`);
    }

    const data = await response.json();

    const channel = data.results?.channels?.[0];
    const alternative = channel?.alternatives?.[0];

    if (!alternative) {
      throw new Error('No transcription results returned from Deepgram');
    }

    return {
      transcript: alternative.transcript || '',
      confidence: alternative.confidence || 0,
      duration: data.metadata?.duration || 0,
    };
  } catch (error) {
    console.error('Deepgram transcription error:', error.message);

    if (error.message.includes('Audio file not found')) {
      throw error;
    }

    return {
      transcript: '',
      confidence: 0,
      duration: 0,
      error: error.message,
    };
  }
}

function getMockTranscript() {
  // When no Deepgram API key is configured, return empty transcript
  // instead of fake data. This ensures the evaluator scores accurately.
  console.warn('[Deepgram] No API key configured. Returning empty transcript. Set DEEPGRAM_API_KEY in .env.local for real speech-to-text.');
  return {
    transcript: '',
    confidence: 0,
    duration: 0,
  };
}
