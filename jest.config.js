module.exports = {
  moduleDirectories: ["node_modules", "<rootDir>/node_modules"],
  setupFiles: ["<rootDir>/__mocks__/jest-setup.js"],
  moduleNameMapper: {
    "@prisma/client": "<rootDir>/__mocks__/mock-prisma.js",
    bull: "<rootDir>/__mocks__/mock-bull.js",
    "@link-scraper/shared": "<rootDir>/__mocks__/mock-shared.js",
  },
  transformIgnorePatterns: ["/node_modules/(?!bull|ioredis|msgpackr).+\\.js$"],
  projects: [
    {
      displayName: "unit",
      testMatch: ["<rootDir>/packages/*/tests/unit/**/*.test.ts?(x)"],
      preset: "ts-jest",
      testEnvironment: "node",
      moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
      transform: {
        "^.+\\.(ts|tsx)$": [
          "ts-jest",
          {
            tsconfig: "packages/api/tsconfig.json",
            isolatedModules: true,
          },
        ],
      },
      moduleDirectories: [
        "node_modules",
        "<rootDir>/node_modules",
        "packages/api/node_modules",
      ],
      moduleNameMapper: {
        "@prisma/client": "<rootDir>/__mocks__/mock-prisma.js",
        bull: "<rootDir>/__mocks__/mock-bull.js",
        "@link-scraper/shared": "<rootDir>/__mocks__/mock-shared.js",
      },
    },
    {
      displayName: "integration",
      testMatch: ["<rootDir>/packages/*/tests/integration/**/*.test.ts?(x)"],
      preset: "ts-jest",
      testEnvironment: "node",
      moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
      transform: {
        "^.+\\.(ts|tsx)$": [
          "ts-jest",
          {
            tsconfig: "packages/worker/tsconfig.json",
            isolatedModules: true,
          },
        ],
      },
      moduleDirectories: [
        "node_modules",
        "<rootDir>/node_modules",
        "packages/worker/node_modules",
      ],
      moduleNameMapper: {
        "@prisma/client": "<rootDir>/__mocks__/mock-prisma.js",
        bull: "<rootDir>/__mocks__/mock-bull.js",
        "@link-scraper/shared": "<rootDir>/__mocks__/mock-shared.js",
      },
      setupFilesAfterEnv: [
        "<rootDir>/__mocks__/jest-setup.js",
        "<rootDir>/packages/worker/tests/setup.ts",
      ],
    },
    {
      displayName: "e2e",
      testMatch: ["<rootDir>/packages/*/tests/e2e/**/*.test.ts?(x)"],
      preset: "ts-jest",
      testEnvironment: "jsdom",
      moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
      transform: {
        "^.+\\.(ts|tsx)$": [
          "ts-jest",
          {
            tsconfig: "packages/frontend/tsconfig.json",
            isolatedModules: true,
          },
        ],
      },
      moduleNameMapper: {
        "@prisma/client": "<rootDir>/__mocks__/mock-prisma.js",
        bull: "<rootDir>/__mocks__/mock-bull.js",
        "@link-scraper/shared": "<rootDir>/__mocks__/mock-shared.js",
        "\\.(css|less|scss|sass)$": "identity-obj-proxy",
      },
      setupFilesAfterEnv: ["<rootDir>/packages/frontend/tests/setup.ts"],
    },
  ],
  collectCoverageFrom: [
    "packages/**/src/**/*.{ts,tsx}",
    "!packages/**/src/**/*.d.ts",
    "!**/node_modules/**",
  ],
  coverageDirectory: "<rootDir>/coverage",
};
