export function sanitizeResponseText(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
}
