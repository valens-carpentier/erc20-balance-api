import { z } from 'zod';

export const TokenConfigSchema = z.object({
  address: z.string()
    .startsWith('0x')
    .length(42)
    .regex(/^0x[0-9a-fA-F]{40}$/),
  symbol: z.string().min(1)
});

export const NetworkConfigSchema = z.object({
  name: z.string().min(1),
  rpcUrl: z.string().url(),
  chainId: z.number().int().positive(),
  tokens: z.array(TokenConfigSchema)
});

export const NetworksConfigSchema = z.record(
  z.string(),
  NetworkConfigSchema
);

export const RootConfigSchema = z.object({
  networks: NetworksConfigSchema
});

export type NetworkConfig = z.infer<typeof NetworkConfigSchema>;
export type TokenConfig = z.infer<typeof TokenConfigSchema>; 