const { Redis } = require('@upstash/redis');

const redis = Redis.fromEnv();
const VALID_LISTS = ['waitlist', 'newsletter'];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (err) {
      body = {};
    }
  }
  body = body || {};

  // Honeypot: a hidden field real visitors never fill in. Bots often do.
  // Pretend success without saving anything.
  if (body.company) {
    return res.status(200).json({ ok: true });
  }

  const email = (body.email || '').trim().toLowerCase();
  const list = body.list;

  if (!email || !EMAIL_PATTERN.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }
  if (!VALID_LISTS.includes(list)) {
    return res.status(400).json({ error: 'Unknown signup list.' });
  }

  try {
    // Hash keyed by email de-dupes automatically — resubmitting just
    // refreshes the timestamp instead of creating a second entry.
    await redis.hset(`signups:${list}`, { [email]: new Date().toISOString() });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('subscribe error:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again in a moment.' });
  }
};
