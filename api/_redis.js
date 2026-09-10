const { Redis } = require('@upstash/redis');

// Vercel's Upstash marketplace integration doesn't always name the injected
// env vars UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN — depending on
// how the integration was connected, it may inject the older KV_* names
// instead (KV_REST_API_URL / KV_REST_API_TOKEN). Check both so this works
// either way, rather than relying on Redis.fromEnv()'s fixed names.
const url =
  process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token =
  process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

if (!url || !token) {
  console.error(
    'Redis env vars missing: expected UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN ' +
      'or KV_REST_API_URL/KV_REST_API_TOKEN to be set on this Vercel project.'
  );
}

const redis = new Redis({ url, token });

module.exports = redis;
