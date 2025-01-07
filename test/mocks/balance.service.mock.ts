import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TokenBalance } from '../../src/interfaces/token-balance.interface';

export class MockBalanceService {
  async getTokenBalances(
    network: string,
    address: string,
  ): Promise<TokenBalance[]> {
    if (network === 'unsupported') {
      throw new NotFoundException(`Network ${network} not supported`);
    }

    if (!address.startsWith('0x')) {
      throw new BadRequestException('Address must start with 0x');
    }
    if (address.length !== 42) {
      throw new BadRequestException('Address must be 42 characters long');
    }
    if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
      throw new BadRequestException('Address contains invalid characters');
    }

    if (address === '0x0000000000000000000000000000000000000000') {
      return [];
    }

    if (address === '0x1111111111111111111111111111111111111111') {
      return [
        {
          token_address: '0x6b175474e89094c44da98b954eedeac495271d0f',
          name: 'Dai Stablecoin',
          symbol: 'DAI',
          decimals: 18,
          balance: '1000000000000000000',
          balance_usd: 1.0,
        },
        {
          token_address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
          name: 'Wrapped Ether',
          symbol: 'WETH',
          decimals: 18,
          balance: '500000000000000000',
          balance_usd: 1000.0,
        },
      ];
    }

    return [
      {
        token_address: '0x6b175474e89094c44da98b954eedeac495271d0f',
        name: 'Dai Stablecoin',
        symbol: 'DAI',
        decimals: 18,
        balance: '1000000000000000000',
        balance_usd: 1.0,
      },
    ];
  }
}
