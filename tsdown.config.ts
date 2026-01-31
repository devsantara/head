import { defineConfig } from 'tsdown';

export default defineConfig({
  platform: 'neutral',
  entry: ['src/index.ts', 'src/adapters/index.ts'],
  outDir: 'dist',
  dts: true,
  format: 'esm',
});
