module.exports = {
  extends: [
    '@diamondyuan/react-typescript',
    'prettier',
    'prettier/@typescript-eslint',
    'prettier/react',
  ],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
    '@typescript-eslint/class-name-casing': 'off',
  },
};
