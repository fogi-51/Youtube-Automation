import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Google Gemini AI SDK on the server with recommended User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Real-time server health endpoint
app.get('/api/system/health', (_req, res) => {
  res.json({
    status: 'operational',
    service: 'YouTube Automation Factory Production Engine',
    uptime: Math.floor(process.uptime()),
    nodeVersion: process.version,
    memoryMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Test connection to AI provider
app.post('/api/ai/test-connection', async (req, res) => {
  const start = Date.now();
  const modelToTest = req.body?.model || 'gemini-3.1-flash-lite';

  if (!process.env.GEMINI_API_KEY) {
    return res.status(400).json({
      success: false,
      error: 'GEMINI_API_KEY environment variable is not configured.',
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: modelToTest,
      contents: 'Respond with the single word: READY',
      config: {
        temperature: 0.1,
      },
    });

    const latencyMs = Date.now() - start;
    return res.json({
      success: true,
      latencyMs,
      model: modelToTest,
      reply: response.text?.trim() || 'READY',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('AI Connection Test Error:', err);
    return res.status(500).json({
      success: false,
      latencyMs: Date.now() - start,
      error: err?.message || 'Failed to connect to Gemini API',
    });
  }
});

// General Text / JSON Generation Endpoint
app.post('/api/gemini/generate', async (req, res) => {
  const {
    prompt,
    systemInstruction,
    model = 'gemini-3.8-flash',
    jsonOutput = false,
    temperature = 0.7,
  } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt in request body.' });
  }

  try {
    const config: any = {
      temperature,
    };

    if (systemInstruction) {
      config.systemInstruction = systemInstruction;
    }

    if (jsonOutput) {
      config.responseMimeType = 'application/json';
    }

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config,
    });

    const rawText = response.text || '';
    let parsedJson = null;

    if (jsonOutput) {
      try {
        parsedJson = JSON.parse(rawText);
      } catch (parseErr) {
        // Fallback: search for markdown JSON block
        const match = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (match) {
          try {
            parsedJson = JSON.parse(match[1]);
          } catch {
            parsedJson = null;
          }
        }
      }
    }

    return res.json({
      success: true,
      text: rawText,
      json: parsedJson,
      model,
      usage: {
        estimatedTokens: Math.ceil((prompt.length + rawText.length) / 4),
      },
    });
  } catch (err: any) {
    console.error('Gemini Generate Error:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Gemini text generation failed',
    });
  }
});

// Multi-turn Gemini Chatbot Endpoint (YouTube Copilot)
app.post('/api/gemini/chat', async (req, res) => {
  const { messages, channelContext } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  try {
    const systemPrompt = `You are the Lead Producer & YouTube Algorithm Strategist at "YouTube Automation Factory".
Your mission is to help creators produce high-retention faceless and branded YouTube videos.
Give actionable, punchy advice on:
- High-CTR hooks & working titles
- Pacing, narrative retention & pattern interrupts
- Voiceover cadence and scene descriptions
- YouTube SEO, click-through tags and chapter structures
- Thumbnail visual composition
${channelContext ? `Current Channel Context: ${JSON.stringify(channelContext)}` : ''}
Be concise, inspiring, and direct.`;

    // Format chat contents
    const contents = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.8,
      },
    });

    return res.json({
      success: true,
      reply: response.text || '',
    });
  } catch (err: any) {
    console.error('Gemini Chat Error:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Chat generation error',
    });
  }
});

// Multimodal Image Analysis (Thumbnails / Storyboards)
app.post('/api/gemini/analyze-image', async (req, res) => {
  const { imageBase64, mimeType = 'image/png', prompt } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: 'imageBase64 is required.' });
  }

  try {
    // Strip header prefix if included
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType,
            },
          },
          {
            text:
              prompt ||
              `Analyze this YouTube thumbnail/graphic as an expert YouTube packaging consultant.
Evaluate:
1. Visual Hierarchy & Contrast (Does it pop on mobile?)
2. Curiosity Gap & Emotion (Why would someone click?)
3. Text Readability (Under 4 words, bold, easy to read at 100px width?)
4. Estimated CTR Grade (A+, A, B, C, F)
5. 3 Specific Actionable Recommendations to improve clicks.`,
          },
        ],
      },
      config: {
        temperature: 0.5,
      },
    });

    return res.json({
      success: true,
      analysis: response.text || '',
    });
  } catch (err: any) {
    console.error('Gemini Image Analysis Error:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Failed to analyze image with Gemini',
    });
  }
});

// Text-to-Speech Generation using gemini-3.8-flash-lite-tts
app.post('/api/gemini/tts', async (req, res) => {
  const { text, voice = 'Kore', style = 'Engaging YouTube narrator' } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Missing text to synthesize.' });
  }

  try {
    // Prebuilt voice options: 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
    const allowedVoices = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'];
    const chosenVoice = allowedVoices.includes(voice) ? voice : 'Kore';

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.slice(0, 800), // optimal single scene duration
              speechMetadata: {
                style,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: chosenVoice },
          },
        },
      },
    });

    const base64Audio =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      throw new Error('No audio returned by speech model');
    }

    return res.json({
      success: true,
      audioUrl: `data:audio/wav;base64,${base64Audio}`,
      voice: chosenVoice,
    });
  } catch (err: any) {
    console.warn('Gemini TTS Warning (falling back to synth metadata):', err?.message);
    return res.status(500).json({
      success: false,
      error: err?.message || 'TTS generation unavailable for this prompt',
    });
  }
});

// Video Assembly Render Engine Simulation / Background Worker Trigger
app.post('/api/render/start', async (req, res) => {
  const { projectId, scenesCount = 5, resolution = '1080p', fps = 30, aspectRatio = '16:9' } = req.body;

  const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

  res.json({
    success: true,
    jobId,
    projectId,
    status: 'queued',
    estimatedSeconds: Math.max(10, scenesCount * 4),
    aspectRatio,
    resolution,
    fps,
    message: 'Media assembly job dispatched to render queue worker.',
  });
});

// Configure Vite middleware or production build serving
async function setupApp() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[YouTube Automation Factory] Server online at http://0.0.0.0:${PORT}`);
  });
}

setupApp().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
