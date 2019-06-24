const path = require('path')

module.exports = {
  globals: {
    'ts-jest': {
      tsConfig: './tsconfig.json',
    }
  },
  testRegex: '(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js)$',
  testEnvironment: 'node',
  moduleFileExtensions: [
    'js',
    'ts',
    'tsx',
  ],
  collectCoverageFrom: [
    'src/**/*.ts'
  ],
  preset: 'ts-jest',
  testMatch: null,
}
