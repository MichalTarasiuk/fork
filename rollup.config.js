import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import filesize from 'rollup-plugin-filesize'
import license from 'rollup-plugin-license'

import pkg from './package.json'

const config = [
  {
    input: 'src/remind.ts',
    output: [
      {
        name: 'remind',
        format: 'es',
        dir: './',
        entryFileNames: pkg.exports.import.replace(/^\.\//, ''),
        sourcemap: true,
      },
      {
        name: 'remind',
        format: 'cjs',
        dir: './',
        entryFileNames: pkg.exports.require.replace(/^\.\//, ''),
        sourcemap: true,
      },
      {
        name: 'remind',
        format: 'umd',
        dir: './',
        entryFileNames: pkg.exports.browser.replace(/^\.\//, ''),
        sourcemap: true,
      },
    ],
    plugins: [
      commonjs({ include: 'node_modules/**' }),
      typescript({
        tsconfig: 'tsconfig.json',
        declaration: true,
        declarationDir: 'dist/',
        rootDir: '.',
        include: ['src/**/*.ts'],
      }),
      filesize({}),
      license({
        banner: `
         <%= pkg.name %>@<%= pkg.version %>
         Copyright (c) <%= moment().format('YYYY') %> Michał Tarasiuk
         This source code is licensed under the MIT license found in the
         LICENSE file in the root directory of this source tree.
        `.trim(),
      }),
    ],
  },
]

export default config
