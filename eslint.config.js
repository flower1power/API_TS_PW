// eslint.config.js
import js from '@eslint/js';
import tslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';
import globals from 'globals';

export default [
  { ignores: ['dist', 'node_modules'] },

  js.configs.recommended,

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
      },
      globals: globals.node,
    },
    plugins: {
      '@typescript-eslint': tslint,
      prettier,
    },
    rules: {
      ...tslint.configs.recommended.rules,
      '@typescript-eslint/default-param-last': 'error',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-function-return-type': 'error',

      'prettier/prettier': [
        'error',
        {
          printWidth: 100,
          tabWidth: 2,
          useTabs: false,
          semi: true,
          singleQuote: true,
          quoteProps: 'as-needed',
          jsxSingleQuote: false,
          trailingComma: 'all',
          bracketSpacing: true,
          bracketSameLine: false,
          arrowParens: 'always',
          rangeStart: 0,
          requirePragma: false,
          insertPragma: false,
          proseWrap: 'preserve',
          htmlWhitespaceSensitivity: 'css',
          vueIndentScriptAndStyle: false,
          endOfLine: 'lf',
        },
      ],
      eqeqeq: ['error', 'always'],
      semi: ['error', 'always'],
      indent: ['error', 2],
    },
  },
];
