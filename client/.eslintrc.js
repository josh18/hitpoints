module.exports = {
    extends: [
        'plugin:react/recommended',
        'plugin:react-hooks/recommended'
    ],
    parserOptions: {
        project: 'tsconfig.json',
    },
    env: {
        es6: true,
        browser: true,
    },
    rules: {
        '@typescript-eslint/unbound-method': 'off',
        'react/prop-types': 'off',
        'react/react-in-jsx-scope': 'off',
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
};
