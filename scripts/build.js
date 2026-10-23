import { build } from 'vite';
import { cp, mkdir } from 'node:fs/promises';

await build();
await mkdir('site', { recursive: true });
await cp('dist', 'site/dist', { recursive: true });
await cp('demo', 'site/demo', { recursive: true });
await cp('tests/browser/fixtures', 'site/fixtures', { recursive: true });
