import Commonjs from '@rollup/plugin-commonjs'
import Typescript from '@rollup/plugin-typescript'
import Filesize from 'rollup-plugin-filesize'
import License from 'rollup-plugin-license'

import Pkg from './package.json'

const config = [
  {
    input: 'src/hooray.ts',
    output: [
      {
        name: 'hooray',
        format: 'es',
        dir: './',
        entryFileNames: Pkg.exports.import.replace(/^\.\//, ''),
        sourcemap: true,
      },
      {
        name: 'hooray',
        format: 'cjs',
        dir: './',
        entryFileNames: Pkg.exports.require.replace(/^\.\//, ''),
        sourcemap: true,
      },
      {
        name: 'hooray',
        format: 'umd',
        dir: './',
        entryFileNames: Pkg.exports.browser.replace(/^\.\//, ''),
        sourcemap: true,
      },
    ],
    plugins: [
      Commonjs({ include: 'node_modules/**' }),
      Typescript({
        tsconfig: 'tsconfig.json',
        declaration: true,
        declarationDir: 'build/',
        rootDir: '.',
        include: ['src/**/*.ts'],
      }),
      Filesize({}),
      License({
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

// eslint-disable-next-line import/no-default-export -- library export
export default config
