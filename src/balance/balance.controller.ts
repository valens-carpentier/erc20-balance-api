import { Controller, Get, Param } from '@nestjs/common';
import { BalanceService } from './balance.service';
import { TokenBalance } from '../interfaces/token-balance.interface';

@Controller('balances')
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Get(':network/:address')
  async getBalances(
    @Param('network') network: string,
    @Param('address') address: string,
  ): Promise<TokenBalance[]> {
    return this.balanceService.getTokenBalances(network, address);
  }
}