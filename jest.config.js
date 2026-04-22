module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest-setup.js'],
  moduleNameMapper: {
    '^components/(.*)$': '<rootDir>/src/components/$1',
    '^config/(.*)$': '<rootDir>/src/config/$1',
    '^types/(.*)$': '<rootDir>/src/types/$1',
    '^utils/(.*)$': '<rootDir>/src/utils/$1',
    '^hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^navigation/(.*)$': '<rootDir>/src/navigation/$1',
    '^context/(.*)$': '<rootDir>/src/context/$1',
    '^constants/(.*)$': '<rootDir>/src/constants/$1',
    '^store/(.*)$': '<rootDir>/src/redux/$1',
    '^theme/(.*)$': '<rootDir>/src/theme/$1',
    '^i18n/(.*)$': '<rootDir>/src/i18n/$1',
    '^api/(.*)$': '<rootDir>/src/api/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-.*|@react-navigation|react-redux|redux|@reduxjs/toolkit|redux-persist|immer|@react-native-firebase)/)',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
  maxWorkers: 1,
};
