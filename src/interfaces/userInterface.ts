export const role = ['admin', 'user'] as const;
export type roleT = typeof role[number];
