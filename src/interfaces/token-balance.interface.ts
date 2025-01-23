import { z } from 'zod';

// Zod schemas for validation
export const TokenBalanceSchema = z.object({
  token_address: z.string()
    .startsWith('0x')
    .length(42)
    .regex(/^0x[0-9a-fA-F]{40}$/),
  name: z.string().min(1),
  symbol: z.string().min(1),
  decimals: z.number().int().min(0).max(18),
  balance: z.string(),
  balance_usd: z.number().nonnegative()
});

export const NetworkSchema = z.object({
  name: z.string().toLowerCase(),
  rpcUrl: z.string().url(),
  chainId: z.number().int().positive()
});

// TypeScript types inferred from the schemas
export type TokenBalance = z.infer<typeof TokenBalanceSchema>;
export type Network = z.infer<typeof NetworkSchema>;
