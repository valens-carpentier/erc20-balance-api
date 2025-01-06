import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Network } from '../interfaces/token-balance.interface';

@Injectable()
export class NetworkConfigService {
  private networks: Record<string, Network>;

  constructor(private configService: ConfigService) {
    this.networks = {
      ethereum: {
        name: 'ethereum',
        rpcUrl: this.configService.get<string>('ETHEREUM_RPC_URL'),
        chainId: 1,
      },
      polygon: {
        name: 'polygon',
        rpcUrl: this.configService.get<string>('POLYGON_RPC_URL'),
        chainId: 137,
      },
      base: {
        name: 'base',
        rpcUrl: this.configService.get<string>('BASE_RPC_URL'),
        chainId: 8453,
      },
    };
  }

  getNetwork(networkName: string): Network {
    return this.networks[networkName.toLowerCase()];
  }
}