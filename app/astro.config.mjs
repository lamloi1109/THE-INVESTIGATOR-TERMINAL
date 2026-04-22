// @ts-check
import { defineConfig } from 'astro/config';

import preact from '@astrojs/preact';

import vercel from '@astrojs/vercel';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
// D-003: output:'hybrid' removed in Astro 6.x. output:'static' (default) has the same
// hybrid behaviour — SSG by default; add `export const prerender = false` per-route for SSR.
export default defineConfig({
  integrations: [preact()],
  adapter: vercel(),

  vite: {
    plugins: [tailwindcss()]
  }
});