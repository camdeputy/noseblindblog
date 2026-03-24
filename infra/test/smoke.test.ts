import { describe, expect, it } from 'vitest';

describe('infra smoke test', () => {
    it('runs', () => {
        expect('cdk').toContain('cd');
    });
});