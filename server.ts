import 'dotenv/config';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import type { Request, Response } from 'express';
import { WebSocketServer } from 'ws';
import { GoogleGenAI, Modality } from '@google/genai';
import type { LiveServerMessage } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';

const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

function resolveTtsModel(model?: string): string {
  if (!model) return 'gemini-3.8-flash-tts';
  if (model === 'gemini-3.8-flash-lite-tts') return 'gemini-3.8-flash-lite-tts';
  if (model === 'gemini-3.8-flash-tts') return 'gemini-3.8-flash-tts';
  if (model.includes('lite')) return 'gemini-3.8-flash-lite-tts';
  return 'gemini-3.8-flash-tts';
}

function extractErrorInfo(err: any): { message: string; status: number } {
  let message = err?.message || 'Error communicating with Gemini API';
  let status = typeof err?.status === 'number' ? err.status : 500;

  try {
    const parsed = JSON.parse(message);
    if (parsed.error?.message) {
      message = parsed.error.message;
    }
    if (typeof parsed.error?.code === 'number') {
      status = parsed.error.code;
    }
  } catch (_) {}

  return { message, status };
}

function resolveTextModel(model?: string): string {
  if (!model) return 'gemini-3.8-flash';
  // Prohibited legacy models safeguard
  if (model.includes('1.5') || model.includes('2.0') || model === 'gemini-pro') {
    return 'gemini-3.8-flash';
  }
  return model;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '20mb' }));

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', hasApiKey: !!apiKey });
  });

  // Text generation endpoint (standard & streaming SSE)
  app.post('/api/gemini/generate', async (req: Request, res: Response) => {
    const { prompt, model, stream } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid prompt string.' });
    }

    const selectedModel = resolveTextModel(model);

    try {
      if (stream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const streamResponse = await ai.models.generateContentStream({
          model: selectedModel,
          contents: prompt,
        });

        for await (const chunk of streamResponse) {
          const textChunk = chunk.text || '';
          res.write(`data: ${JSON.stringify({ text: textChunk })}\n\n`);
        }
        res.write('data: [DONE]\n\n');
        return res.end();
      }

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: prompt,
      });

      return res.json({
        text: response.text || '',
        candidates: response.candidates,
      });
    } catch (err: any) {
      console.error('Gemini generate error:', err);
      const { message, status } = extractErrorInfo(err);
      return res.status(status).json({
        error: message,
        details: err.toString(),
      });
    }
  });

  // TTS audio generation endpoint (Single-speaker & Multi-speaker)
  app.post('/api/gemini/tts', async (req: Request, res: Response) => {
    const { mode, text, voice, model, scriptText, speakerVoicePairs } = req.body;

    const selectedModel = resolveTtsModel(model);

    try {
      if (mode === 'multi') {
        const lines: string[] = (scriptText || '').split('\n');
        const parts: Array<{ text: string; speechMetadata: { speaker: string } }> = [];
        const speakerRegex = /^(Speaker[1-9]|Speaker10)\s*:\s*(.*)$/i;

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          const match = trimmed.match(speakerRegex);
          if (match) {
            const speakerTag = match[1];
            const textContent = match[2].trim();
            if (textContent) {
              parts.push({
                text: textContent,
                speechMetadata: { speaker: speakerTag },
              });
            }
          } else if (parts.length > 0) {
            parts[parts.length - 1].text += ' ' + trimmed;
          }
        }

        if (parts.length === 0) {
          parts.push({
            text: scriptText || 'No dialogue provided.',
            speechMetadata: { speaker: speakerVoicePairs?.[0]?.speaker || 'Speaker1' },
          });
        }

        const speakerVoiceConfigs = (speakerVoicePairs || []).map((pair: any) => ({
          speaker: pair.speaker,
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: pair.voice },
          },
        }));

        const response = await ai.models.generateContent({
          model: selectedModel,
          contents: [
            {
              role: 'user',
              parts: parts as any,
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              multiSpeakerVoiceConfig: { speakerVoiceConfigs },
            },
          },
        });

        const part = response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData?.data);
        const audioBase64 = part?.inlineData?.data || '';

        return res.json({
          audio: audioBase64,
          candidates: response.candidates,
        });
      } else {
        // Single speaker
        if (!text || !text.trim()) {
          return res.json({ audio: '', candidates: [] });
        }

        const voiceName = voice || 'Puck';

        const response = await ai.models.generateContent({
          model: selectedModel,
          contents: [
            {
              role: 'user',
              parts: [{ text: text.trim() }],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName },
              },
            },
          },
        });

        const part = response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData?.data);
        const audioBase64 = part?.inlineData?.data || '';

        return res.json({
          audio: audioBase64,
          candidates: response.candidates,
        });
      }
    } catch (err: any) {
      console.error('Gemini TTS error:', err);
      const { message, status } = extractErrorInfo(err);
      return res.status(status).json({
        error: message,
        details: err.toString(),
      });
    }
  });

  const server = http.createServer(app);

  // WebSocket Live API proxy support
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const pathname = request.url ? new URL(request.url, `http://${request.headers.host}`).pathname : '';
    if (pathname === '/live' || pathname === '/api/live') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', async (clientWs) => {
    try {
      const session = await ai.live.connect({
        model: 'gemini-3.8-live',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: 'You are a helpful assistant for podcast creation.',
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audio && clientWs.readyState === clientWs.OPEN) {
              clientWs.send(JSON.stringify({ audio }));
            }
            if (message.serverContent?.interrupted && clientWs.readyState === clientWs.OPEN) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }
          },
          onclose: () => {
            try { clientWs.close(); } catch (_) {}
          },
          onerror: (err: any) => {
            try {
              if (clientWs.readyState === clientWs.OPEN) {
                clientWs.send(JSON.stringify({ error: err.message || 'Live session error' }));
              }
            } catch (_) {}
          },
        },
      });

      clientWs.on('message', (data) => {
        try {
          const parsed = JSON.parse(data.toString());
          if (parsed.audio) {
            session.sendRealtimeInput({
              audio: { data: parsed.audio, mimeType: 'audio/pcm;rate=16000' },
            });
          }
          if (parsed.text) {
            session.sendRealtimeInput({
              text: parsed.text,
            });
          }
        } catch (e) {
          console.error('Error handling Live client message:', e);
        }
      });

      clientWs.on('close', () => {
        try { session.close(); } catch (_) {}
      });
    } catch (err: any) {
      console.error('Live connect error:', err);
      try {
        if (clientWs.readyState === clientWs.OPEN) {
          clientWs.send(JSON.stringify({ error: err.message || 'Failed to connect to Live API' }));
          clientWs.close();
        }
      } catch (_) {}
    }
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.use((_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : { server },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Podcast Studio server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
