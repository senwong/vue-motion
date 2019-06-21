// rollup.config.js
import typescript from "rollup-plugin-typescript";

export default {
  input: "./src/index.ts",
  plugins: [typescript()],
  output: {
    file: "dist/bundle.js",
    format: "iife",
    name: "VueMotion",
    exports: "named"
  }
};
