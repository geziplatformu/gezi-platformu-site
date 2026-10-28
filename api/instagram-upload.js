import { put } from '@vercel/blob';
import { timingSafeEqual, randomUUID } from 'node:crypto';

export const config = { maxDuration: 30, api: { bodyParser: false } };

function authorized(req) {
  const expected = process.env.INSTAGRAM_UPLOAD_SECRET;
  const actual = (req.headers.authorization || '').replace(/^Bearer /i, '');
  if (!expected || !actual) return false;
  const a = Buffer.from(actual);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!authorized(req)) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const type = (req.headers['content-type'] || '').split(';')[0];
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(type)) {
      return res.status(415).json({ error: 'Only JPEG, PNG or WebP allowed' });
    }
    const chunks = [];
    let size = 0;
    for await (const chunk of req) {
      size += chunk.length;
      if (size > 4_000_000) return res.status(413).json({ error: 'Maximum 4 MB' });
      chunks.push(chunk);
    }
    if (!size) return res.status(400).json({ error: 'Empty image' });
    const data = Buffer.concat(chunks);
    const signature = data.subarray(0, 12);
    const jpeg = signature[0] === 0xff && signature[1] === 0xd8;
    const png = signature.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'));
    const webp = signature.toString('ascii', 0, 4) === 'RIFF' && signature.toString('ascii', 8, 12) === 'WEBP';
    if (!(type === 'image/jpeg' && jpeg || type === 'image/png' && png || type === 'image/webp' && webp)) {
      return res.status(400).json({ error: 'Invalid image data' });
    }
    const extension = type === 'image/jpeg' ? 'jpg' : type === 'image/png' ? 'png' : 'webp';
    const filename = 'instagram/' + Date.now() + '-' + randomUUID() + '.' + extension;
    const blob = await put(filename, data, {
      access: 'public',
      contentType: type,
      token: process.env.INSTAGRAM_READ_WRITE_TOKEN,
      addRandomSuffix: false
    });
    return res.status(200).json({ url: blob.url });
  } catch (err) {
    console.error('Instagram upload failed', err);
    return res.status(500).json({ error: 'Upload failed' });
  }
}
