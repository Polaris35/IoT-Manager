import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginJs from '@eslint/js';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginTypeScript from '@typescript-eslint/eslint-plugin';
import parserTypeScript from '@typescript-eslint/parser';
import pluginPrettier from 'eslint-config-prettier';


export default tseslint.config({
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: parserTypeScript,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react: pluginReact,
      'react-hooks': pluginReactHooks,
      '@typescript-eslint': pluginTypeScript,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...pluginJs.configs.recommended.rules,
      ...pluginReact.configs.recommended.rules,
      ...pluginReactHooks.configs.recommended.rules,
      ...pluginTypeScript.configs.recommended.rules,
      ...pluginPrettier.rules,
      'react/prop-types': 'off', // Отключено, так как используется TypeScript
      '@typescript-eslint/no-unused-vars': ['error'],
    },
  },)