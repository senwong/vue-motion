// rollup.config.js
import typescript from "rollup-plugin-typescript";
import resolve from "rollup-plugin-node-resolve";
import commonJS from "rollup-plugin-commonjs";

export default {
  input: "./src/index.ts",
  plugins: [
    typescript(),
    resolve(),
    commonJS({
      include: "node_modules/**",
      namedExports: {
        "node_modules/lodash/lodash.js": ["throttle", "debounce"]
      }
    })
  ],
  output: {
    file: "dist/bundle.js",
    format: "iife",
    name: "VueMotion",
    exports: "named",
    globals: {
      lodash: "lodash"
    }
  }
};
