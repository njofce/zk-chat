module.exports = {
    roots: ['<rootDir>'],
    preset: 'ts-jest',
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
        '!src/**/*.types.ts',
        '!src/create_server.ts',
        '!src/index.ts',
        '!src/services/index.ts',
        '!src/jobs/cleanup.ts',
        '!src/persistence/index.ts',
        '!src/config.ts',
        '!src/communication/index.ts',
        '!src/communication/pub_sub.ts',
        '!src/util/hasher.ts',
        '!src/persistence/db/index.ts',
        '!src/interrep/interfaces.ts'],
    setupFilesAfterEnv: ['./tests/jest.setup.ts'],
    coverageThreshold: {
        'global': {
            "branches": 80,
            "functions": 80,
            "lines": 80,
            "statements": 80
        }
    },
    verbose: true,
    testTimeout: 20000
}