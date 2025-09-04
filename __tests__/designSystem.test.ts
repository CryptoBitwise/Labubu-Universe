import { colors, spacing, fontSizes, shadows, gradients } from '../designSystem';

describe('Design System', () => {
    test('colors are properly defined', () => {
        expect(colors.background).toBeDefined();
        expect(colors.primary).toBeDefined();
        expect(colors.accent).toBeDefined();
        expect(colors.card).toBeDefined();
        expect(colors.text).toBeDefined();
        expect(colors.textSecondary).toBeDefined();
    });

    test('spacing values are numbers', () => {
        expect(typeof spacing.xs).toBe('number');
        expect(typeof spacing.sm).toBe('number');
        expect(typeof spacing.md).toBe('number');
        expect(typeof spacing.lg).toBe('number');
        expect(typeof spacing.xl).toBe('number');
    });

    test('font sizes are numbers', () => {
        expect(typeof fontSizes.xs).toBe('number');
        expect(typeof fontSizes.sm).toBe('number');
        expect(typeof fontSizes.md).toBe('number');
        expect(typeof fontSizes.lg).toBe('number');
        expect(typeof fontSizes.xl).toBe('number');
        expect(typeof fontSizes.xxl).toBe('number');
    });

    test('shadows are properly structured', () => {
        expect(shadows.card).toBeDefined();
        expect(shadows.card.shadowColor).toBeDefined();
        expect(shadows.card.shadowOffset).toBeDefined();
        expect(shadows.card.shadowOpacity).toBeDefined();
        expect(shadows.card.shadowRadius).toBeDefined();
        expect(shadows.card.elevation).toBeDefined();
    });

    test('gradients are arrays', () => {
        expect(Array.isArray(gradients.header)).toBe(true);
        expect(gradients.header.length).toBeGreaterThan(0);
    });
});
