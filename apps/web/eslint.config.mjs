import next from 'eslint-config-next';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

/** @type {import('eslint').Linter.Config[]} */
const config = [
  ...next,
  ...nextCoreWebVitals,
  ...nextTs,
  {
    ignores: ['.next/**', 'node_modules/**', 'out/**'],
  },
  {
    rules: {
      '@typescript-eslint/consistent-type-imports': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
];

export default config;
