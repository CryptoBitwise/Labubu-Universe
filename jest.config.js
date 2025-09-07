module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^react-native-linear-gradient$': '<rootDir>/__mocks__/react-native-linear-gradient.js',
    '^expo-haptics$': '<rootDir>/__mocks__/expo-haptics.js',
    '^react-native-image-picker$': '<rootDir>/__mocks__/react-native-image-picker.js',
    '^@react-native-firebase/app$': '<rootDir>/__mocks__/@react-native-firebase/app.js',
    '^@react-native-firebase/firestore$': '<rootDir>/__mocks__/@react-native-firebase/firestore.js',
    '^@react-native-firebase/storage$': '<rootDir>/__mocks__/@react-native-firebase/storage.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-linear-gradient|react-native-image-picker|@react-native-firebase)/)',
  ],
};
