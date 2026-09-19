import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', '.next', 'node_modules', 'next-env.d.ts']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'react-hooks/set-state-in-effect': 'off',
      'no-empty': ['error', { allowEmptyCatch: true }],
      'preserve-caught-error': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    // NEXTJS-STRUCTURE-CONVENTIONS.md §8: client arithmetic on a money-named
    // value is forbidden — the API must return any total/derived amount a
    // page needs. See implementation-plan/web/18-money-math-lint-guardrail.md.
    //
    // usePaginatedList.ts is excluded: its `total` field is a pagination
    // item-count (PaginationMeta), never a money amount, in every one of its
    // generic, resource-agnostic call sites.
    files: ['src/features/**/*.{ts,tsx}', 'src/shared/**/*.{ts,tsx}'],
    ignores: ['src/shared/hooks/usePaginatedList.ts', 'src/**/__tests__/**'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "BinaryExpression[operator=/^[+\\-*/]$/] > :matches(Identifier[name=/^(?!.*(?:Pages|Count|Items|Length|Index|Steps|Percent|Percentage|Progress|People|Users|Members|Days|Months|Years|Weeks|Records|Rows|Entries)$).*(?:amount|balance|price|cost|remaining|spent|earned|contribution|principal|salary|networth|payout|fee|total|value).*$/i], MemberExpression[property.name=/^(?!.*(?:Pages|Count|Items|Length|Index|Steps|Percent|Percentage|Progress|People|Users|Members|Days|Months|Years|Weeks|Records|Rows|Entries)$).*(?:amount|balance|price|cost|remaining|spent|earned|contribution|principal|salary|networth|payout|fee|total|value).*$/i])",
          message:
            'Client-side arithmetic on a money-named value is forbidden — the API must return the computed total/derived amount instead of the page deriving it. See NEXTJS-STRUCTURE-CONVENTIONS.md §8.',
        },
        {
          selector:
            "AssignmentExpression[operator=/^[+\\-*/]=$/] > :matches(Identifier[name=/^(?!.*(?:Pages|Count|Items|Length|Index|Steps|Percent|Percentage|Progress|People|Users|Members|Days|Months|Years|Weeks|Records|Rows|Entries)$).*(?:amount|balance|price|cost|remaining|spent|earned|contribution|principal|salary|networth|payout|fee|total|value).*$/i], MemberExpression[property.name=/^(?!.*(?:Pages|Count|Items|Length|Index|Steps|Percent|Percentage|Progress|People|Users|Members|Days|Months|Years|Weeks|Records|Rows|Entries)$).*(?:amount|balance|price|cost|remaining|spent|earned|contribution|principal|salary|networth|payout|fee|total|value).*$/i])",
          message:
            'Client-side arithmetic on a money-named value is forbidden — the API must return the computed total/derived amount instead of the page deriving it. See NEXTJS-STRUCTURE-CONVENTIONS.md §8.',
        },
      ],
    },
  },
])
