import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

/**
 * ESLint Configuration for MatStore
 * ==================================
 * Reglas estrictas según AGENT_RULES.md:
 * - No any (Types First)
 * - No console.log en producción
 * - Prettier integration
 */
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettierConfig,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'src-tauri/**', // Rust/Tauri files (not JavaScript)
  ]),
  // Custom rules for MATSTORE
  {
    plugins: {
      prettier,
    },
    rules: {
      // === PRETTIER INTEGRATION ===
      'prettier/prettier': 'error',

      // === TYPESCRIPT STRICT ===
      // No any - Types First (AGENT_RULES.md)
      '@typescript-eslint/no-explicit-any': 'error',

      // No unused variables
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      // === CODE QUALITY ===
      // No console.log in production (warn, not error - for debugging)
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      // Prefer const
      'prefer-const': 'error',

      // No var
      'no-var': 'error',

      // === REACT ===
      // React hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
]);

export default eslintConfig;
