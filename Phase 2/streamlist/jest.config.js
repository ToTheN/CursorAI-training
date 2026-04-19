module.exports = {
  preset: '@react-native/jest-preset',
  moduleNameMapper: {
    '^@env$': '<rootDir>/__mocks__/env.js',
    '^@react-native-async-storage/async-storage$':
      '<rootDir>/__mocks__/asyncStorageMock.js',
    '^react-native-vector-icons/.+$': '<rootDir>/__mocks__/vectorIconMock.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|react-native-linear-gradient)/)',
  ],
};
