const path = require('path');

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        // Resolve next to this file so the token loads even if Metro/CLI cwd differs.
        path: path.resolve(__dirname, '.env'),
        allowUndefined: true,
      },
    ],
  ],
};
