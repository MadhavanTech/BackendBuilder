import { sanitizeResponseText } from './responseSanitizer';

const WORKER_URL = import.meta.env.VITE_MADDY_CHATBOAT_WORKER_URL?.trim() || 'https://white-limit-4511.madhavanmunusamy09.workers.dev/';

let cooldownUntil = 0;

function isRateLimited(error) {
  const message = error?.message || '';
  return (
    error?.status === 429 ||
    message.includes('429') ||
    message.toLowerCase().includes('quota') ||
    message.toLowerCase().includes('rate limit') ||
    message.includes('RESOURCE_EXHAUSTED')
  );
}

export async function askchatboat(question) {
  if (!question || typeof question !== 'string' || !question.trim()) {
    throw new Error('A non-empty question string is required.');
  }

  if (Date.now() < cooldownUntil) {
    const secondsLeft = Math.ceil((cooldownUntil - Date.now()) / 1000);
    throw new Error(`maddy_Chatboat is temporarily rate-limited. Please wait ${secondsLeft}s and try again.`);
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    let response;

    try {
      response = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
        credentials: 'omit',
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const bodyText = await response.text();
      let parsedBody = null;

      try {
        parsedBody = JSON.parse(bodyText);
      } catch {
        parsedBody = null;
      }

      const replyText = parsedBody?.reply || parsedBody?.error || bodyText || 'The worker returned an error.';
      const error = new Error(sanitizeResponseText(replyText));
      error.status = response.status;
      throw error;
    }

    const responseText = await response.text();
    let data;

    try {
      data = JSON.parse(responseText);
    } catch {
      data = { text: responseText };
    }

    if (data?.success === false) {
      const workerError = data.error || data.message || 'The worker could not answer the question.';
      const debugReason = data.debug_reason ? ` ${data.debug_reason}` : '';
      const error = new Error(sanitizeResponseText(`${workerError}${debugReason}`));
      error.status = data?.status || 503;
      throw error;
    }

    const candidateText = data?.candidates?.[0]?.content?.parts
      ?.map((part) => part?.text)
      .filter(Boolean)
      .join('\n');
    const text =
      candidateText ||
      data?.text ||
      data?.response?.text ||
      data?.message?.content ||
      data?.reply ||
      (typeof data?.message === 'string' ? data.message : '');

    const normalizedText = typeof text === 'string' ? text.trim() : '';

    if (!normalizedText) {
      throw new Error(sanitizeResponseText('Empty response from maddy_Chatboat worker.'));
    }

    return normalizedText;
  } catch (error) {
    if (isRateLimited(error)) {
      cooldownUntil = Date.now() + 60000;
      throw new Error(sanitizeResponseText('maddy_Chatboat is temporarily rate-limited. Please wait a moment and try again.'));
    }

    const detail = error?.name === 'AbortError'
      ? 'The chatbot worker took too long to respond.'
      : error?.status === 503
        ? 'The chatbot worker is temporarily unavailable.'
        : error?.message || 'The chatbot worker did not respond.';
    throw new Error(sanitizeResponseText(`maddy_Chatboat is unavailable right now. ${detail}`));
  }
}
