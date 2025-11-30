/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.(t|j)sx?$": ["ts-jest", { tsconfig: "tsconfig.json" }]
  },
  testMatch: ["**/tests/**/*.test.(ts|tsx|js)"],
  moduleNameMapper: {
    "^@/lib/(.*)$": "<rootDir>/lib/$1",
    "^@/models/(.*)$": "<rootDir>/models/$1",
    "^@/utils/(.*)$": "<rootDir>/utils/$1"
  }
};


