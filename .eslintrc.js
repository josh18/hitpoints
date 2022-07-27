module.exports = {
    root: true,
    extends: [
        './node_modules/armoury/eslint',
    ],
    settings: {
        'import/internal-regex': '^@hitpoints/',
    },
    rules: {
        '@typescript-eslint/no-shadow': ['error', {
            ignoreOnInitialization: true,
        }],
    },
};
