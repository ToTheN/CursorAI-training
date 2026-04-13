module.exports = {
  preset: '@react-native/jest-preset',
  moduleNameMapper: {
    '^@env$': '<rootDir>/__mocks__/env.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation)/)',
  ],
};
