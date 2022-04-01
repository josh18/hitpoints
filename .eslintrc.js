module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        project: 'tsconfig.json',
    },
    plugins: ['@typescript-eslint'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:import/typescript',
    ],
    rules: {
        'arrow-parens': ['warn', 'as-needed'],
        'prefer-const': ['warn', {
            'destructuring': 'all'
        }],
        '@typescript-eslint/array-type': [
            'warn',
            {
                default: 'array-simple',
            },
        ],
        '@typescript-eslint/consistent-type-definitions': [
            'warn',
            'interface',
        ],
        '@typescript-eslint/explicit-member-accessibility': [
            'warn',
            {
                accessibility: 'no-public',
            }
        ],
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/member-ordering': [
            'warn',
            {
                default: [
                    // Index signature
                    'signature',

                    // Static
                    'public-static-field',
                    'protected-static-field',
                    'private-static-field',
                    'public-static-method',
                    'protected-static-method',
                    'private-static-method',

                    // Fields
                    'public-instance-field',
                    'protected-instance-field',
                    'private-instance-field',
                    'public-abstract-field',
                    'protected-abstract-field',
                    'private-abstract-field',

                    // Constructors
                    'public-constructor',
                    'protected-constructor',
                    'private-constructor',

                    // Methods
                    'public-instance-method',
                    'protected-instance-method',
                    'private-instance-method',
                    'public-abstract-method',
                    'protected-abstract-method',
                    'private-abstract-method',
                ],
            },
        ],
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-extra-semi': 'warn',
        '@typescript-eslint/no-floating-promises': 'off',
        '@typescript-eslint/no-misused-promises': [
            'error',
            {
                checksVoidReturn: false,
            },
        ],
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-unused-vars': ['off', {
            ignoreRestSiblings: true,
        }],
        '@typescript-eslint/no-useless-constructor': 'warn',
        '@typescript-eslint/quotes': ['warn', 'single', {
            allowTemplateLiterals: true,
        }],
        '@typescript-eslint/restrict-plus-operands': 'off',
        '@typescript-eslint/restrict-template-expressions': 'off',
        '@typescript-eslint/semi': 'warn',
        'comma-dangle': ['warn', 'always-multiline'],
        'import/default': 'off',
        'import/extensions': [
            'error',
            'ignorePackages',
            {
                ts: 'never',
                tsx: 'never',
            },
        ],
        'import/order': [
            'warn',
            {
                alphabetize: {
                    order: 'asc',
                    caseInsensitive: true,
                },
                groups: [
                    ['builtin', 'external'],
                    ['internal'],
                    ['index', 'sibling', 'parent'],
                ],
                'newlines-between': 'always',
            },
        ],
        'import/no-unresolved': 'off',
        'no-empty': ['warn', {
            allowEmptyCatch: true,
        }],
        'no-irregular-whitespace': ['warn', {
            skipStrings: false,
        }],
        'quote-props': ['warn', 'consistent-as-needed'],
        'sort-imports': ['warn', {
            'ignoreCase': true,
            'ignoreDeclarationSort': true,
        }],
    },
    settings: {
        'import/internal-regex': '^@hitpoints/',
    },
};
