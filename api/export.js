const { Redis } = require('@upstash/redis');

const redis = Redis.fromEnv();
const VALID_LISTS = ['waitlist', 'newsletter'];

// Private export endpoint so you can pull your signups without a database
// GUI or a third-party email tool. Protect it with a secret of your own
// choosing (set ADMIN_SECRET in Vercel's project environment variables).
//
// Usage once deployed:
//   https://your-site.vercel.app/api/export?secret=YOUR_SECRET
//   https://your-site.vercel.app/api/export?secret=YOUR_SECRET&list=waitlist
//   https://your-site.vercel.app/api/export?secret=YOUR_SECRET&format=csv
module.exports = async (req, res) => {
  const { secret, list, format } = req.query;

  if (!process.env.ADMIN_SECRET || secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const targets = list && VALID_LISTS.includes(list) ? [list] : VALID_LISTS;

  const out = {};
  for (const l of targets) {
    const data = (await redis.hgetall(`signups:${l}`)) || {};
    out[l] = Object.entries(data)
      .map(([email, signedUpAt]) => ({ email, signedUpAt }))
      .sort((a, b) => (a.signedUpAt < b.signedUpAt ? 1 : -1));
  }

  if (format === 'csv') {
    const rows = ['list,email,signed_up_at'];
    for (const l of targets) {
      for (const row of out[l]) {
        rows.push(`${l},${row.email},${row.signedUpAt}`);
      }
    }
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="moonroot-signups.csv"');
    return res.status(200).send(rows.join('\n'));
  }

  return res.status(200).json(out);
};
