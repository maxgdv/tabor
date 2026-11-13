import next from 'eslint-config-next';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

/** @type {import('eslint').Linter.Config[]} */
const config = [
  ...next,
  ...nextCoreWebVitals,
  ...nextTs,
  {
    // public/vendor: el worker de MapLibre que copia el build (código de
    // terceros minificado, no nuestro).
    ignores: ['.next/**', 'node_modules/**', 'out/**', 'public/vendor/**'],
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
