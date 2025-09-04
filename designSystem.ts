// Labubu/POP MART-inspired design system
export const colors = {
    background: '#FDF6FF', // dreamy lavender-pink
    card: '#FFFFFF',
    primary: '#C7B6F9', // soft lavender
    accent: '#F9C6E0', // dreamy pink
    blue: '#BEE7F7', // sky blue
    yellow: '#FFF7D6', // soft yellow
    green: '#C6F9E0', // mint
    orange: '#FFE5C7', // pastel orange
    text: '#3A2C5A', // gentle purple for text
    textSecondary: '#8B7CA6', // muted purple
    border: '#E9D7F7', // pastel border
    shadow: 'rgba(199, 182, 249, 0.12)',
    gradientStart: '#F9C6E0',
    gradientEnd: '#BEE7F7',
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
};

export const fontSizes = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 28,
    xxl: 36,
};

export const fontWeights = {
    regular: 400,
    medium: 500,
    bold: 700,
};

export const shadows = {
    card: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
        elevation: 6,
    },
};

export const gradients = {
    header: [colors.gradientStart, colors.gradientEnd],
}; 