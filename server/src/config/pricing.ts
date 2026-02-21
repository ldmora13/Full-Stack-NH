export const PROGRAM_PRICING = {
    'TALENT': {
        basePrice: 1.00,
        currency: 'USD',
        label: 'Passeport Talent'
    },
    'VLSTS': {
        basePrice: 2.00,
        currency: 'USD',
        label: 'VLS-TS Salarié / Visitor'
    },
    'INVESTOR': {
        basePrice: 3.00,
        currency: 'USD',
        label: 'Business / Investor'
    }
} as const;

export type ProgramId = keyof typeof PROGRAM_PRICING;

export const calculateTotal = (programId: ProgramId, adults: number, children: number) => {
    const program = PROGRAM_PRICING[programId];
    if (!program) throw new Error('Invalid program ID');

    // Simple logic: Total = Base Price * (Adults + Children)
    // Adjust if business logic requires different pricing for children
    const totalMembers = adults + children;
    return program.basePrice * totalMembers;
};
