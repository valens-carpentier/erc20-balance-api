import { Injectable, NotFoundException } from '@nestjs/common';
import { ethers } from 'ethers';
import axios from 'axios';
import { TokenBalance } from '../interfaces/token-balance.interface';
import { NetworkConfigService } from '../config/configuration.service';

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

    return balances;
  }

  private async getTokenList(network: string): Promise<{ address: string }[]> {
    // Token lists for different networks
    const tokenLists = {
      ethereum: [
        { address: '0x6b175474e89094c44da98b954eedeac495271d0f' }, // DAI
        { address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' }, // WETH
        { address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' }  // USDC
      ],
      polygon: [
        { address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063' }, // DAI
        { address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619' }, // WETH
        { address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174' }  // USDC
      ],
      base: [
        { address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb' }, // DAI
        { address: '0x4200000000000000000000000000000000000006' }, // WETH
        { address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' }  // USDC
      ]
    };
    
    return tokenLists[network.toLowerCase()] || [];
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