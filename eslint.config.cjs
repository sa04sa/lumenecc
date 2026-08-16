const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({
  // resolvePlugin: require.resolve, // default
});

module.exports = [
  ...compat.extends('next', 'next/core-web-vitals'),
  {
    ignores: ['.next/**', 'out/**', 'build/**', 'next-env.d.ts'],
  },
];
