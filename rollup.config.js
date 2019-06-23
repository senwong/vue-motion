// rollup.config.js
import typescript from "rollup-plugin-typescript";
import { terser } from "rollup-plugin-terser";
import clear from "rollup-plugin-clear";
const input = "./src/index.ts";
const plugins = [
  typescript(),
  clear({
    targets: ["dist"]
  })
];
export default [
  {
    input,
    plugins,
    output: [
      {
        file: "example/vue-motion.js",
        format: "umd",
        name: "VueMotion"
      },
      {
        file: "dist/vue-motion.js",
        format: "umd",
        name: "VueMotion"
      },
      {
        file: "dist/vue-motion.esm.js",
        format: "esm",
        name: "VueMotion"
      },
      {
        file: "dist/vue-motion.common.js",
        format: "cjs",
        name: "VueMotion"
      }
    ]
  },
  {
    input,
    plugins: plugins.concat([terser()]),
    output: [
      {
        file: "dist/vue-motion.min.js",
        format: "umd",
        name: "VueMotion"
      },
      {
        file: "dist/vue-motion.esm.min.js",
        format: "esm",
        name: "VueMotion"
      },
      {
        file: "dist/vue-motion.common.min.js",
        format: "cjs",
        name: "VueMotion"
      }
    ]
  }
];
