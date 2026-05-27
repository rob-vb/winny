module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/__tests__/**/*.test.ts'],
  setupFilesAfterEach: [],
  setupFiles: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^expo-localization$': '<rootDir>/src/__mocks__/expo-localization.ts',
    '^@/(.*)$': '<rootDir>/$1',
  },
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react',
      },
    },
  },
};
