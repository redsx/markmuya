import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import image from '@rollup/plugin-image';
import babel from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';

import postcss from 'rollup-plugin-postcss';
import svg from 'rollup-plugin-svg';
// import { terser } from 'rollup-plugin-terser';
// import { uglify } from "rollup-plugin-uglify";

const plugins = [
  json(),
  resolve(),
  commonjs(),
  image(),
  svg(),
  postcss({
    extensions: ['.css'],
  }),
  babel({
    exclude: 'node_modules/**' // only transpile our source code
  }),
  // terser(),
  // uglify(),
];

const pInfos = [['Muya', 'lib/index.js'], ["EmojiPicker", "lib/ui/emojiPicker"], ["TablePicker", "lib/ui/tablePicker"], ["QuickInsert", "lib/ui/quickInsert"], ["CodePicker", "lib/ui/codePicker"], ["ImagePathPicker", "lib/ui/imagePicker"], ["ImageSelector", "lib/ui/imageSelector"], ["ImageToolbar", "lib/ui/imageToolbar"], ["Transformer", "lib/ui/transformer"], ["FormatPicker", "lib/ui/formatPicker"], ["LinkTools", "lib/ui/linkTools"], ["FootnoteTool", "lib/ui/footnoteTool"], ["TableBarTools", "lib/ui/tableTools"], ["FrontMenu", "lib/ui/frontMenu"]];

export default pInfos.map(item => ({
  input: item[1],
  output: {
    // file: 'muya.js',
    format: 'cjs',
    dir: `dist/${item[0]}`,
    sourcemap: true,
  },
  plugins: plugins,
}));
