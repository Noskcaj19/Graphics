import {defineConfig} from "vite";
import {viteSingleFile} from "vite-plugin-singlefile";
import files from "rollup-plugin-import-file";

/** @type {import('vite').UserConfig} */
export default defineConfig({
  plugins: [viteSingleFile(),files({output: 'dist/assetsFiles', extensions: /\.gltf$/, hash: true})],
  build: {
    minify: false,
    cssMinify: false,
    modulePreload: false,
    sourcemap: "inline",
    target: "esnext",
  },
  base:"test"
})