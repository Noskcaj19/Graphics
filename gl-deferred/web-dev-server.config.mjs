import { esbuildPlugin } from '@web/dev-server-esbuild';
import { rollupPluginHTML as html } from '@web/rollup-plugin-html';

export default {
  input: 'index.html',
  output: { dir: 'dist' },
  plugins: [html(), esbuildPlugin({ ts: true, target: 'auto' })],
};
