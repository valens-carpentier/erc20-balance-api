import { Injectable, NotFoundException } from '@nestjs/common';
import { ethers } from 'ethers';
import axios from 'axios';
import { TokenBalance } from '../interfaces/token-balance.interface';
import { NetworkConfigService } from '../config/configuration.service';
import { TokenBalanceSchema } from '../interfaces/token-balance.interface';

// ERC20 ABI for balanceOf and decimals functions
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
];

@Injectable()
export class BalanceService {
  constructor(private readonly networkConfigService: NetworkConfigService) {}

  async getTokenBalances(
    networkName: string,
    address: string,
  ): Promise<TokenBalance[]> {
    console.log(`Fetching balances for address ${address} on ${networkName}`);
    const network = this.networkConfigService.getNetwork(networkName);
    if (!network) {
      throw new NotFoundException(`Network ${networkName} not supported`);
    }

    // Initialize provider
    const provider = new ethers.JsonRpcProvider(network.rpcUrl);

    // Get token list from network
    const tokens = await this.getTokenList(network.name);
    const balances: TokenBalance[] = [];

    // Fetch balances for each token
    for (const token of tokens) {
      try {
        const contract = new ethers.Contract(
          token.address,
          ERC20_ABI,
          provider,
        );

        const [balance, decimals, symbol, name] = await Promise.all([
          contract.balanceOf(address),
          contract.decimals(),
          contract.symbol(),
          contract.name(),
        ]);

        const tokenPrice = await this.getTokenPrice(token.address);
        const balanceFormatted = ethers.formatUnits(balance, decimals);
        const balanceUsd = parseFloat(balanceFormatted) * tokenPrice;

        if (parseFloat(balanceFormatted) > 0) {
          balances.push({
            token_address: token.address,
            name,
            symbol,
            decimals: Number(decimals),
            balance: balance.toString(),
            balance_usd: Number(balanceUsd.toFixed(2)),
          });
        }
      } catch (error) {
        console.error(
          `Error fetching balance for token ${token.address}:`,
          error,
        );
      }
    }

    return balances.map(balance => {
      const result = TokenBalanceSchema.safeParse(balance);
      if (!result.success) {
        console.error('Invalid token balance data:', result.error);
        return null;
      }
      return result.data;
    }).filter((balance): balance is TokenBalance => balance !== null);
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

  private async getTokenPrice(tokenAddress: string): Promise<number> {
    try {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${tokenAddress}&vs_currencies=usd`,
      );
      return response.data[tokenAddress.toLowerCase()]?.usd || 0;
    } catch (error) {
      console.error('Error fetching token price:', error);
      return 0;
    }
  }
}