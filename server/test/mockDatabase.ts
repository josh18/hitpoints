import { vitest } from 'vitest';

export default () => {
    vitest.mock('../src/adapters/local-database');
};
