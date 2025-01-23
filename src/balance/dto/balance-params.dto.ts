import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const BalanceParamsSchema = z.object({
  network: z.string().min(1),
  address: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address format')
});

export class BalanceParamsDto extends createZodDto(BalanceParamsSchema) {} 