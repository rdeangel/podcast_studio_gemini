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

const defaultApiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';

function getGenAIClient(customKey?: string, timeoutMs: number = 30000): GoogleGenAI {
  const keyToUse = (typeof customKey === 'string' && customKey.trim().length > 0)
    ? customKey.trim()
    : defaultApiKey;

  return new GoogleGenAI({
    apiKey: keyToUse,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
      timeout: timeoutMs,
    },
  });
}

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
    const raw = typeof message === 'string' ? message : JSON.stringify(message);
    const startIdx = raw.indexOf('{');
    const endIdx = raw.lastIndexOf('}');
    if (startIdx !== -1 && endIdx > startIdx) {
      const parsed = JSON.parse(raw.slice(startIdx, endIdx + 1));
      if (parsed.error?.message) {
        message = parsed.error.message;
      }
      if (typeof parsed.error?.code === 'number') {
        status = parsed.error.code;
      }
    }
  } catch (_) {}

  // Check for client-side timeout / abort
  if (message.includes('aborted') || err?.name === 'AbortError') {
    status = 504;
    message = 'Audio synthesis timed out while processing. Multi-speaker generation on long dialogues requires significant compute time. You can increase the "Request Timeout" setting (e.g. to 180s or 240s) or switch to "Line-by-Line" mode for chunk-by-chunk generation.';
  }

  // Detect status keywords if status code defaulted to 500
  if (status === 500) {
    if (message.includes('503') || message.toLowerCase().includes('high demand') || message.toLowerCase().includes('unavailable')) {
      status = 503;
    } else if (message.includes('504') || message.toLowerCase().includes('deadline expired') || message.toLowerCase().includes('deadline_exceeded')) {
      status = 504;
    } else if (message.includes('429') || message.toLowerCase().includes('quota') || message.toLowerCase().includes('resource_exhausted')) {
      status = 429;
    } else if (message.includes('404') || message.toLowerCase().includes('not found') || message.toLowerCase().includes('no longer available')) {
      status = 404;
    }
  }

  // Contextual tips for common API limits
  if (status === 503) {
    message = `${message} — Tip: This model is currently under high demand on the free tier. Try selecting Gemini 3.5 Flash or enter your own paid Gemini API key above to bypass shared queue limits.`;
  } else if (status === 504 && !message.includes('Line-by-Line')) {
    message = `Model generation timed out under heavy load — Tip: Select Gemini 3.5 Flash (faster response) or enter your own paid Gemini API key above.`;
  } else if (status === 429) {
    message = `${message} — Tip: Daily or minute quota reached on the free tier. Select Gemini 3.5 Flash or enter your own paid Gemini API key above to use your own quota.`;
  } else if (status === 404 && (message.includes('2.5') || message.includes('models/'))) {
    message = `${message} — Tip: Legacy Gemini 2.5 models are deprecated. Please select Gemini 3.5 Flash, Gemini 3.8 Flash, or Gemini 3.1 Pro.`;
  }

  return { message, status };
}

function resolveTextModel(model?: string): string {
  if (!model) return 'gemini-3.5-flash';
  if (model === 'gemini-2.5-flash' || model.includes('2.0') || model.includes('1.5') || model === 'gemini-pro') {
    return 'gemini-3.5-flash';
  }
  if (model === 'gemini-2.5-pro') {
    return 'gemini-3.1-pro-preview';
  }
  return model;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '20mb' }));

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', hasApiKey: !!defaultApiKey });
  });

  // Text generation endpoint (standard & streaming SSE)
  app.post('/api/gemini/generate', async (req: Request, res: Response) => {
    const { prompt, model, stream, apiKey: bodyApiKey, timeoutSeconds } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid prompt string.' });
    }

    const customKey = (req.headers['x-gemini-api-key'] as string) || bodyApiKey || '';
    const envTimeoutSec = Number(process.env.GEMINI_TIMEOUT_SECONDS) || 0;
    const clientTimeoutSec = Number(req.headers['x-timeout-seconds']) || Number(timeoutSeconds) || 0;
    const timeoutSec = clientTimeoutSec > 0 ? clientTimeoutSec : (envTimeoutSec > 0 ? envTimeoutSec : 60);
    const resolvedTimeoutMs = Math.min(Math.max(timeoutSec, 10), 600) * 1000;
    const ai = getGenAIClient(customKey, resolvedTimeoutMs);
    const selectedModel = resolveTextModel(model);

    try {
      if (stream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const streamConfig: any = {};
        if (selectedModel === 'gemini-3.8-flash') {
          streamConfig.thinkingConfig = { thinkingLevel: 'LOW' };
        }

        const streamResponse = await ai.models.generateContentStream({
          model: selectedModel,
          contents: prompt,
          config: Object.keys(streamConfig).length > 0 ? streamConfig : undefined,
        });

        for await (const chunk of streamResponse) {
          const textChunk = chunk.text || '';
          res.write(`data: ${JSON.stringify({ text: textChunk })}\n\n`);
        }
        res.write('data: [DONE]\n\n');
        return res.end();
      }

      const genConfig: any = {};
      if (selectedModel === 'gemini-3.8-flash') {
        genConfig.thinkingConfig = { thinkingLevel: 'LOW' };
      }

      let response;
      try {
        response = await ai.models.generateContent({
          model: selectedModel,
          contents: prompt,
          config: Object.keys(genConfig).length > 0 ? genConfig : undefined,
        });
      } catch (primaryErr: any) {
        const errStr = primaryErr?.toString() || '';
        const isFreeTier = !customKey;
        const isHighDemandOrTimeout = errStr.includes('503') || errStr.includes('504') || errStr.includes('high demand') || errStr.includes('Deadline expired') || errStr.includes('UNAVAILABLE') || errStr.includes('DEADLINE_EXCEEDED');

        // If gemini-3.8-flash fails under free-tier queue pressure, automatically fallback to gemini-3.5-flash
        if (isFreeTier && isHighDemandOrTimeout && selectedModel !== 'gemini-3.5-flash') {
          console.log(`[Model fallback] ${selectedModel} busy on free tier, using gemini-3.5-flash`);
          response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: prompt,
          });
        } else {
          throw primaryErr;
        }
      }

      return res.json({
        text: response.text || '',
        candidates: response.candidates,
      });
    } catch (err: any) {
      console.log('Gemini generate caught error:', err?.message || err);
      const { message, status } = extractErrorInfo(err);
      return res.status(400).json({
        error: message,
        originalStatus: status,
        details: err.toString(),
      });
    }
  });

  // TTS audio generation endpoint (Single-speaker & Multi-speaker)
  app.post('/api/gemini/tts', async (req: Request, res: Response) => {
    const { mode, text, voice, model, scriptText, speakerVoicePairs, apiKey: bodyApiKey, timeoutSeconds } = req.body;

    const customKey = (req.headers['x-gemini-api-key'] as string) || bodyApiKey || '';
    const envTimeoutSec = Number(process.env.GEMINI_TIMEOUT_SECONDS) || 0;
    const clientTimeoutSec = Number(req.headers['x-timeout-seconds']) || Number(timeoutSeconds) || 0;
    const defaultSec = mode === 'multi' ? 120 : 45;
    const timeoutSec = clientTimeoutSec > 0 ? clientTimeoutSec : (envTimeoutSec > 0 ? envTimeoutSec : defaultSec);
    const resolvedTimeoutMs = Math.min(Math.max(timeoutSec, 10), 600) * 1000;
    const ai = getGenAIClient(customKey, resolvedTimeoutMs);
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
          return res.status(400).json({
            error: 'No valid dialogue found in script for multi-speaker synthesis. Ensure lines start with "Speaker #: ...".',
            originalStatus: 400,
          });
        }

        const speakerVoiceConfigs = (speakerVoicePairs || []).map((pair: any) => ({
          speaker: pair.speaker,
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: pair.voice },
          },
        }));

        if (speakerVoiceConfigs.length !== 2) {
          return res.status(400).json({
            error: `Gemini Multi-Speaker TTS strictly requires exactly 2 speakers (found ${speakerVoiceConfigs.length}). For 1 speaker or 3+ speakers, please switch to 'Line-by-Line' mode.`,
            originalStatus: 400,
          });
        }

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
      console.log('Gemini TTS caught error:', err?.message || err);
      const { message, status } = extractErrorInfo(err);
      return res.status(400).json({
        error: message,
        originalStatus: status,
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

  wss.on('connection', async (clientWs, request) => {
    try {
      const parsedUrl = new URL(request.url || '', `http://${request.headers.host}`);
      const liveKey = parsedUrl.searchParams.get('apiKey') || '';
      const ai = getGenAIClient(liveKey);

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
          console.log('Live client message error:', e);
        }
      });

      clientWs.on('close', () => {
        try { session.close(); } catch (_) {}
      });
    } catch (err: any) {
      console.log('Live connect error:', err?.message || err);
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
