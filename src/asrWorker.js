import { env, pipeline } from '@huggingface/transformers';

env.allowLocalModels = false;
env.useBrowserCache = true;

let transcriber;
const languageName = { en: 'english', hi: 'hindi', kn: 'kannada' };

self.addEventListener('message', async (event) => {
  const { id, samples, language } = event.data || {};
  if (!id || !samples) return;
  try {
    self.postMessage({ id, type: 'status', message: 'Downloading the free offline speech model (first use only)…' });
    transcriber ||= await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny', {
      progress_callback: (progress) => {
        if (progress.status === 'progress' && Number.isFinite(progress.progress)) self.postMessage({ id, type: 'status', message: `Preparing offline speech recognition… ${Math.round(progress.progress)}%` });
      },
    });
    self.postMessage({ id, type: 'status', message: 'Transcribing on this device…' });
    const result = await transcriber(new Float32Array(samples), {
      language: languageName[language] || 'english', task: 'transcribe', chunk_length_s: 30, stride_length_s: 5,
    });
    self.postMessage({ id, type: 'result', text: String(result?.text || '').trim() });
  } catch (error) {
    self.postMessage({ id, type: 'error', message: error?.message || 'Offline speech recognition could not start.' });
  }
});
