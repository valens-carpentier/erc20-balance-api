import { Controller, Get, Param } from '@nestjs/common';
import { BalanceService } from './balance.service';
import { TokenBalance, TokenBalanceEntity } from '../interfaces/token-balance.interface';
import { BalanceParamsDto } from './dto/balance-params.dto';
import { ZodValidationPipe } from 'nestjs-zod';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('balances')
@Controller('balances')
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Get(':network/:address')
  @ApiOperation({ summary: 'Get token balances for an address on a specific network' })
  @ApiParam({ name: 'network', description: 'Blockchain network (ethereum, polygon, base)' })
  @ApiParam({ name: 'address', description: 'Ethereum address to check balances for' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of token balances',
    type: TokenBalanceEntity,
    isArray: true
  })
  async getBalances(
    @Param(ZodValidationPipe) params: BalanceParamsDto,
  ): Promise<TokenBalance[]> {
    return this.balanceService.getTokenBalances(params.network, params.address);
  }
}