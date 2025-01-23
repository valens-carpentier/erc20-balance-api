import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

// Class for Swagger documentation
export class TokenBalanceEntity {
  @ApiProperty({ example: '0x6b175474e89094c44da98b954eedeac495271d0f' })
  token_address: string;

  @ApiProperty({ example: 'Dai Stablecoin' })
  name: string;

  @ApiProperty({ example: 'DAI' })
  symbol: string;

  @ApiProperty({ example: 18 })
  decimals: number;

  @ApiProperty({ example: '1000000000000000000' })
  balance: string;

  @ApiProperty({ example: 1.0 })
  balance_usd: number;
}

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
  chainId: z.number().int().positive(),
  tokens: z.array(z.any())
});

// TypeScript types inferred from the schemas
export type TokenBalance = z.infer<typeof TokenBalanceSchema>;
export type Network = z.infer<typeof NetworkSchema>;
