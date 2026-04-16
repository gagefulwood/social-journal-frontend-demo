module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom', // ✅ use full module name
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: ['**/?(*.)+(test).[tj]s?(x)'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
}