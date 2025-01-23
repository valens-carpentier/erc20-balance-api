import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { createPublicClient, http, getContract, formatUnits, multicall } from 'viem';
import axios from 'axios';
import { TokenBalance } from '../interfaces/token-balance.interface';
import { NetworkConfigService } from '../config/configuration.service';

// ERC20 ABI
const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'decimals',
    type: 'function',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    name: 'symbol',
    type: 'function',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
  },
  {
    name: 'name',
    type: 'function',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
  },
] as const;

@Injectable()
export class BalanceService {
  private readonly logger = new Logger(BalanceService.name);

  constructor(private readonly networkConfigService: NetworkConfigService) {}

  async getTokenBalances(
    networkName: string,
    address: string,
  ): Promise<TokenBalance[]> {
    this.logger.log(
      `Fetching balances for address ${address} on ${networkName}`,
    );

    const network = this.networkConfigService.getNetwork(networkName);
    if (!network) {
      throw new NotFoundException(`Network ${networkName} not supported`);
    }

    const client = createPublicClient({
      transport: http(network.rpcUrl),
    });

    const tokens = await this.getTokenList(network.name);
    
    try {
      // Prepare multicall contracts
      const contracts = tokens.map(token => ({
        address: token.address as `0x${string}`,
        abi: ERC20_ABI,
      }));

      // Prepare multicall calls
      const calls = contracts.flatMap(contract => [
        {
          ...contract,
          functionName: 'balanceOf',
          args: [address as `0x${string}`],
        },
        {
          ...contract,
          functionName: 'decimals',
        },
        {
          ...contract,
          functionName: 'symbol',
        },
        {
          ...contract,
          functionName: 'name',
        },
      ]);

      // Execute multicall
      const results = await multicall(client, {
        contracts: calls as any[],
      });

      // Process results
      const balances: TokenBalance[] = [];
      const tokenPrices = await this.getTokenPrices(
        tokens.map(t => t.address)
      );

      for (let i = 0; i < results.length; i += 4) {
        const [balance, decimals, symbol, name] = results.slice(i, i + 4);
        const token = tokens[Math.floor(i / 4)];

        if (balance > 0n) {
          const balanceFormatted = formatUnits(balance, decimals);
          const tokenPrice = tokenPrices[token.address.toLowerCase()] || 0;
          const balanceUsd = parseFloat(balanceFormatted) * tokenPrice;

          balances.push({
            token_address: token.address,
            name,
            symbol,
            decimals,
            balance: balance.toString(),
            balance_usd: Number(balanceUsd.toFixed(2)),
          });
        }
      }

      return balances;
    } catch (error) {
      this.logger.error('Error fetching token balances:', error);
      throw error;
    }
  }

  private async getTokenList(network: string): Promise<{ address: string }[]> {
    const networkConfig = this.networkConfigService.getNetwork(network);
    if (!networkConfig) {
      return [];
    }

    // Get tokens from network configuration
    const tokens = this.networkConfigService.getTokensForNetwork(network);
    return tokens.map(token => ({ address: token.address }));
  }

  private async getTokenPrices(
    tokenAddresses: string[],
  ): Promise<Record<string, number>> {
    try {
      const addresses = tokenAddresses.join(',');
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${addresses}&vs_currencies=usd`,
      );
      // Convert response to a simple address -> price mapping
      return Object.entries(response.data).reduce((acc, [address, data]: [string, any]) => {
        acc[address.toLowerCase()] = data.usd || 0;
        return acc;
      }, {} as Record<string, number>);
    } catch (error) {
      this.logger.error('Error fetching token prices:', error);
      return {};
    }
  }
}