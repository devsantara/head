import { defineConfig } from 'tsdown';

export default defineConfig({
  platform: 'neutral',
  entry: 'src/index.ts',
  outDir: 'dist',
  dts: true,
  format: 'esm',
});
