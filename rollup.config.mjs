import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import postcss from "rollup-plugin-postcss";

const external = ["react", "react-dom", "react/jsx-runtime"];

export default [
  {
    input: "src/index.ts",
    output: [
      { file: "dist/index.js", format: "esm", sourcemap: true },
      { file: "dist/index.cjs", format: "cjs", sourcemap: true, exports: "named" }
    ],
    external,
    plugins: [
      resolve({ extensions: [".js", ".ts", ".tsx"] }),
      commonjs(),
      postcss({ extract: "style.css", minimize: true }),
      typescript({ tsconfig: "./tsconfig.json", declaration: false, declarationMap: false })
    ]
  }
];
