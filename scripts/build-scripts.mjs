// Builds background.js and content.js as self-contained IIFE files.
// Vite/Rollup doesn't support multiple entries with IIFE format in a single build,
// so we run a separate build per script.
import { build } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const scripts = [
  { name: 'background', entry: 'src/background/index.ts' },
  { name: 'content', entry: 'src/content/index.ts' },
];

for (const { name, entry } of scripts) {
  await build({
    configFile: false,
    root,
    logLevel: 'warn',
    resolve: {
      alias: { '@shared': resolve(root, 'src/shared') },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: false,
      lib: {
        entry: resolve(root, entry),
        formats: ['iife'],
        name: 'UrqlDevtools',
        fileName: () => `${name}.js`,
      },
    },
  });
  console.log(`  Built dist/${name}.js`);
}
