module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFiles: [
      "<rootDir>/jest-pre.ts"
  ],
  moduleNameMapper: {
    '\\.css$': 'identity-obj-proxy'
  },
};