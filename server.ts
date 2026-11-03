/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini Client
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// API endpoint: Generate or polish a stage tile question or twist
app.post('/api/gemini/generate-tile', async (req, res) => {
  const { prompt, tileId, isTwist } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  if (!ai || !process.env.GEMINI_API_KEY) {
    // Graceful offline mock if API key is not yet set
    return res.json({
      title: isTwist ? '⚡ AI Twist' : 'Stage Challenge',
      question: `Audience Challenge: ${prompt}`,
      answer: 'Correct answer verified by MC / Stage Anchor!',
      visualClue: '💡 🎯 Spotlight',
      mediaUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
      mediaType: 'image',
      points: 20,
    });
  }

  try {
    const systemInstruction = `You are a professional live event show producer and game show host (like MC Sanjay Potdar).
You design high-energy stage quiz questions, musical challenges, visual movie riddles, observation puzzles, or dramatic game twists for live stage competitions.
The user wants a tile for Tile #${tileId || 1}.
Always respond in strict JSON format with the following keys:
- title: Short catchy category or headline (e.g. "Sing This Song !!", "Guess the Movie !!", "Point Heist", "Dance Arena")
- question: Clear, high-impact stage prompt for the audience/teams
- answer: The correct answer and hints for the anchor
- visualClue: An emoji and short 2-3 word prop clue
- mediaUrl: A high quality photo URL from unsplash or empty
- mediaType: "image" or "audio" or "video"
- points: numeric point value (usually 20 or 30)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Design a stage game challenge or twist based on this request: "${prompt}". Is this a twist card? ${isTwist ? 'YES' : 'NO'}. Return JSON.`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: unknown) {
    console.error('Error generating tile with Gemini:', error);
    return res.json({
      title: isTwist ? '⚡ Mystery Twist' : 'Stage Challenge',
      question: `Audience Challenge: ${prompt}`,
      answer: 'Verified by Host',
      visualClue: '🌟 🎤 Live Stage',
      mediaUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
      mediaType: 'image',
      points: 20,
    });
  }
});

// Setup Vite middleware in dev or serve static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

startServer();
