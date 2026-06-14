// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Deploys to Cloudflare Workers. Pages stay static (prerendered);
  // only routes that opt out via `export const prerender = false`
  // (e.g. src/pages/api/contact.ts) run on the Worker.
  adapter: cloudflare({
    // Expose wrangler vars / .dev.vars to `Astro.locals.runtime.env` in `astro dev`.
    platformProxy: { enabled: true },
  }),
  vite: {
    plugins: [tailwindcss()]
  },
  site: 'https://churchify.ie',
  trailingSlash: 'always',
  integrations: [sitemap()],
});
