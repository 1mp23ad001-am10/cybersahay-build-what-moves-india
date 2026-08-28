import express from 'express';
import Database from 'better-sqlite3';
import OpenAI from 'openai';
import { toFile } from 'openai/uploads';
import { randomUUID, createHash } from 'crypto';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const app = express(); app.use(express.json({ limit: '2mb' }));
const storageRoot = process.env.DATA_DIR || process.cwd();
mkdirSync(storageRoot, { recursive: true });
const db = new Database(path.join(storageRoot, 'cybersahay.db'));
const localAsrUrl = process.env.LOCAL_ASR_URL || 'http://127.0.0.1:8000/transcribe';
const asrLocale = new Set(['en-IN', 'hi-IN', 'kn-IN', 'as-IN', 'bn-IN', 'brx-IN', 'doi-IN', 'gu-IN', 'kok-IN', 'ks-IN', 'mai-IN', 'ml-IN', 'mni-IN', 'mr-IN', 'ne-IN', 'od-IN', 'pa-IN', 'sa-IN', 'sat-IN', 'sd-IN', 'ta-IN', 'te-IN', 'ur-IN']);
const transcriptMatchesLanguage = (text, language) => {
  const value = String(text || '');
  if (language === 'hi') return (value.match(/[\u0900-\u097F]/g) || []).length >= 2;
  if (language === 'kn') return (value.match(/[\u0C80-\u0CFF]/g) || []).length >= 2;
  if (language === 'en') return /[a-z]/i.test(value);
  return Boolean(value.trim());
};

async function ensureLocalAsr() {
  try {
    const response = await fetch(localAsrUrl.replace(/\/transcribe$/, '/docs'), { signal: AbortSignal.timeout(800) });
    if (response.ok) return;
  } catch {
    // Start the bundled free ASR service below when it is not already running.
  }
  const pythonCommand = process.platform === 'win32' ? 'py' : (process.env.PYTHON_BIN || 'python3');
  const pythonArgs = process.platform === 'win32'
    ? ['-3.13', '-m', 'uvicorn']
    : ['-m', 'uvicorn'];
  const child = spawn(pythonCommand, [...pythonArgs, 'voice_service.main:app', '--host', '127.0.0.1', '--port', '8000'], {
    cwd: process.cwd(),
    windowsHide: true,
    stdio: 'ignore',
  });
  child.unref();
  for (let attempt = 0; attempt < 45; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    try {
      const response = await fetch(localAsrUrl.replace(/\/transcribe$/, '/docs'), { signal: AbortSignal.timeout(800) });
      if (response.ok) return;
    } catch {}
  }
  console.warn('[local-asr] did not become ready; typing remains available.');
}
db.exec('CREATE TABLE IF NOT EXISTS drafts (id TEXT PRIMARY KEY, data TEXT NOT NULL, step INTEGER DEFAULT 0, status TEXT DEFAULT "draft", updated_at TEXT NOT NULL)');
db.exec('CREATE TABLE IF NOT EXISTS ui_translations (language TEXT PRIMARY KEY, copy TEXT NOT NULL, updated_at TEXT NOT NULL)');
const upsert = db.prepare('INSERT INTO drafts (id,data,step,updated_at) VALUES (@id,@data,@step,@updated_at) ON CONFLICT(id) DO UPDATE SET data=@data,step=@step,updated_at=@updated_at');
app.get('/api/draft/:id', (req,res) => { const row = db.prepare('SELECT * FROM drafts WHERE id=?').get(req.params.id); row ? res.json({...row,data:JSON.parse(row.data)}) : res.status(404).end(); });
app.post('/api/ui-translate', async (req, res) => {
  const language = String(req.body?.language || 'en-IN');
  const strings = req.body?.strings;
  if (!asrLocale.has(language) || !strings || typeof strings !== 'object') return res.status(400).json({ error: 'Unsupported UI language.' });
  if (language === 'en-IN') return res.json({ copy: strings });
  const cached = db.prepare('SELECT copy FROM ui_translations WHERE language=?').get(language);
  const cachedCopy = cached ? JSON.parse(cached.copy) : {};
  const entries = Object.entries(strings).filter(([key, value]) => typeof key === 'string' && typeof value === 'string' && value.length <= 600).slice(0, 100);
  const missingEntries = entries.filter(([name]) => !cachedCopy[name]);
  if (cached && !missingEntries.length) return res.json({ copy: cachedCopy, cached: true });
  const key = process.env.SARVAM_API_KEY;
  if (!key) return res.status(503).json({ error: 'UI translation is unavailable.' });
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  async function translateText(input, attempt = 0) {
    const response = await fetch('https://api.sarvam.ai/translate', {
      method: 'POST',
      headers: { 'api-subscription-key': key, 'content-type': 'application/json' },
      body: JSON.stringify({ input, source_language_code: 'en-IN', target_language_code: language, model: 'sarvam-translate:v1' }),
      signal: AbortSignal.timeout(30000),
    });
    const data = await response.json();
    if (response.status === 429 && attempt < 3) {
      await wait(1500 * (attempt + 1));
      return translateText(input, attempt + 1);
    }
    if (!response.ok || !data.translated_text) throw new Error(data?.error?.message || 'Translation failed');
    return data.translated_text;
  }
  try {
    const translated = { ...cachedCopy };
    for (let index = 0; index < missingEntries.length; index += 8) {
      const group = missingEntries.slice(index, index + 8);
      const packed = group.map(([name, value]) => `__${name}__: ${value}`).join('\n');
      const packedTranslation = await translateText(packed);
      for (const line of packedTranslation.split(/\r?\n/)) {
        const match = line.match(/^__([A-Za-z0-9_]+)__:\s*(.+)$/);
        if (match) translated[match[1]] = match[2].trim();
      }
      for (const [name, value] of group) {
        if (!translated[name]) {
          await wait(350);
          translated[name] = await translateText(value);
        }
      }
    }
    db.prepare('INSERT INTO ui_translations (language,copy,updated_at) VALUES (?,?,?) ON CONFLICT(language) DO UPDATE SET copy=excluded.copy,updated_at=excluded.updated_at').run(language, JSON.stringify(translated), new Date().toISOString());
    return res.json({ copy: translated });
  } catch (error) {
    console.error('[ui-translate]', error.message || 'unknown error');
    return res.status(502).json({ error: 'UI translation could not be loaded.' });
  }
});
app.post('/api/transcribe', express.raw({type:['audio/webm','audio/ogg','audio/wav','audio/mp4','audio/*'],limit:'15mb'}), async (req,res) => {
  if (!req.body?.length) return res.status(400).json({error:'No audio recorded'});
  const locale = String(req.query.lang || 'unknown');
  const language = locale.split('-')[0];
  if (locale !== 'unknown' && !asrLocale.has(locale)) return res.status(400).json({ error: 'Selected speech language is not supported.' });
  const sarvamKey = process.env.SARVAM_API_KEY;
  if (sarvamKey) {
    try {
      const form = new FormData();
      // MediaRecorder includes codec parameters (for example
      // "audio/webm;codecs=opus"). Sarvam accepts the container MIME only.
      const contentType = (req.headers['content-type'] || 'audio/webm').split(';')[0];
      form.append('file', new Blob([req.body], { type: contentType }), 'voice.webm');
      form.append('model', 'saaras:v3');
      form.append('mode', 'transcribe');
      form.append('language_code', locale);
      const response = await fetch('https://api.sarvam.ai/speech-to-text', {
        method: 'POST',
        headers: { 'api-subscription-key': sarvamKey },
        body: form,
        signal: AbortSignal.timeout(45000),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error?.message || `Sarvam transcription failed (${response.status})`);
      if (!transcriptMatchesLanguage(data.transcript, language)) throw new Error('Sarvam returned a transcript in the wrong script');
      return res.json({ text: data.transcript || '', language: data.language_code || null, provider: 'sarvam' });
    } catch (error) {
      console.error('[sarvam-asr]', error.message || 'unknown error');
      // Continue to local ASR when it is available; typing remains the final fallback.
    }
  }
  if (locale !== 'unknown' && ['en', 'hi', 'kn'].includes(language)) { try { const form=new FormData(); form.append('file',new Blob([req.body],{type:req.headers['content-type']||'audio/webm'}),'voice.webm'); const r=await fetch(`${localAsrUrl}?lang=${encodeURIComponent(language)}`,{method:'POST',body:form,signal:AbortSignal.timeout(45000)}); const j=await r.json(); if(!r.ok) throw Error(j.detail||'Local ASR failed'); if(!transcriptMatchesLanguage(j.text, language)) throw Error('Local ASR returned a transcript in the wrong script'); return res.json(j); } catch(e) { console.error('[local-asr]',e.message); } }
  return res.status(502).json({error:'Sarvam transcription is unavailable. Please retry in a moment or type your report.'});
});
app.post('/api/speak', async (req,res) => { const key=process.env.OPENROUTER_API_KEY; if (!key) return res.status(503).end(); try { const client=new OpenAI({apiKey:key,baseURL:'https://openrouter.ai/api/v1',defaultHeaders:{'HTTP-Referer':'http://localhost:5174','X-Title':'CyberSahay'}}); const audio=await client.audio.speech.create({model:process.env.OPENROUTER_TTS_MODEL||'fish-audio/s2.1-pro-free:free',voice:process.env.OPENROUTER_TTS_VOICE||'default',input:String(req.body.text||'').slice(0,4096),response_format:'mp3'}); res.set('content-type','audio/mpeg').send(Buffer.from(await audio.arrayBuffer())); } catch { res.status(502).end(); } });
app.patch('/api/draft/:id', (req,res) => { const now = new Date().toISOString(); upsert.run({id:req.params.id,data:JSON.stringify(req.body.data || {}),step:req.body.step || 0,updated_at:now}); res.json({savedAt:now}); });
app.post('/api/evidence/:id', express.raw({ type: '*/*', limit: '10mb' }), (req,res) => {
  if (!req.body?.length) return res.status(400).json({ error: 'The evidence file was empty.' });
  if (req.body.length > 10 * 1024 * 1024) return res.status(413).json({ error: 'Each evidence file must be 10 MB or smaller.' });
  const safeId = String(req.params.id).replace(/[^a-zA-Z0-9-]/g, '');
  let originalName = 'evidence-file';
  try { originalName = decodeURIComponent(String(req.headers['x-file-name'] || originalName)); } catch {}
  originalName = path.basename(originalName).replace(/[^a-zA-Z0-9._ -]/g, '_').slice(0, 120) || 'evidence-file';
  const folder = path.join(storageRoot, 'uploads', safeId);
  mkdirSync(folder, { recursive: true });
  const storageName = `${randomUUID()}-${originalName}`;
  writeFileSync(path.join(folder, storageName), req.body);
  const sha256 = createHash('sha256').update(req.body).digest('hex');
  res.status(201).json({ name: originalName, storageName, size: req.body.length, type: req.headers['content-type'] || 'application/octet-stream', sha256 });
});
app.post('/api/submit/:id', (req,res) => { const reference = `DEMO-CYBER-${new Date().getFullYear()}-${Math.random().toString(36).slice(2,8).toUpperCase()}`; const now=new Date().toISOString(); db.prepare("INSERT INTO drafts (id,data,step,status,updated_at) VALUES (?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET status='submitted',data=excluded.data,step=excluded.step,updated_at=excluded.updated_at").run(req.params.id,JSON.stringify({...req.body.data,reference}),99,'submitted',now); res.json({reference}); });
app.get('/api/track/:reference', (req,res) => res.json({reference:req.params.reference,status:'Received',message:'Your complaint has been securely received for review.'}));
app.post('/api/assist', async (req,res) => { const question = String(req.body.question || '').slice(0,1200); if (!question) return res.status(400).json({error:'Question required'}); const key=process.env.OPENROUTER_API_KEY||process.env.OPENAI_API_KEY; if (key) { try { const client=new OpenAI({apiKey:key,baseURL:process.env.OPENROUTER_API_KEY?'https://openrouter.ai/api/v1':undefined}); const r=await client.chat.completions.create({model:process.env.OPENROUTER_TEXT_MODEL||'openai/gpt-4o-mini',messages:[{role:'system',content:'You are CyberSahay, a calm cybercrime reporting guide for India. Be concise and safe. Never request OTPs, passwords, bank details, or Aadhaar.'},{role:'user',content:question}]}); return res.json({answer:r.choices[0].message.content}); } catch {} } res.json({answer:'For immediate financial fraud, call 1930 and contact your bank. Never share OTPs, passwords, or full card/bank credentials here.'}); });
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'CyberSahay API' }));
app.get('/api/voice-health', async (_req, res) => {
  try {
    const response = await fetch(localAsrUrl.replace(/\/transcribe$/, '/docs'), { signal: AbortSignal.timeout(1500) });
    if (!response.ok) throw new Error('Speech service unavailable');
    res.json({ status: 'ok', provider: 'local-whisper', languages: ['English', 'Hindi', 'Kannada'] });
  } catch {
    res.status(503).json({ status: 'unavailable', provider: 'local-whisper', languages: ['English', 'Hindi', 'Kannada'] });
  }
});
const staticDir = path.join(process.cwd(), 'dist');
if (existsSync(staticDir)) {
  app.use(express.static(staticDir));
  app.get('{*splat}', (_req, res) => res.sendFile(path.join(staticDir, 'index.html')));
}
const port = Number(process.env.PORT || 8787);
app.listen(port, '0.0.0.0', () => console.log(`CyberSahay API on http://0.0.0.0:${port}`));
if (process.env.LOCAL_ASR_ENABLED !== 'false') ensureLocalAsr();
