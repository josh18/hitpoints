import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        setupFiles: ['./test/mockDatabase.ts'],
        globalSetup: ['./test/setupDatabase.ts'],
    },
});
