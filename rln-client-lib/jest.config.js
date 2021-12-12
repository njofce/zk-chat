module.exports = {
    roots: ['<rootDir>'],
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    testRegex: 'tests/.*\\.test.ts$',
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    transformIgnorePatterns: [],
    moduleDirectories: ['node_modules', 'src', 'tests'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    moduleNameMapper: {
        '\\.(css|scss|jpg|png|svg)$': 'mocks/empty.ts'
    },
    collectCoverage: true,
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/main-test.ts',
        '!src/communication/websocket.ts',
        '!src/index.ts',
        '!src/hasher.ts'
    ],
    setupFilesAfterEnv: ['./tests/jest.setup.ts'],
    coverageThreshold: {
        'global': {
            "branches": 80,
            "functions": 80,
            "lines": 80,
            "statements": 50
        }
    },
    verbose: true
}