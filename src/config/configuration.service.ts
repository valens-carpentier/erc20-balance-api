import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import { NetworkConfig, RootConfigSchema } from './config.validator';
import { Network } from '../interfaces/token-balance.interface';

@Injectable()
export class NetworkConfigService {
  private networks: Record<string, Network>;

  constructor(private configService: ConfigService) {
    this.networks = this.loadNetworkConfig();
  }

  private loadNetworkConfig(): Record<string, Network> {
    try {
      const configFile = fs.readFileSync('config/networks.yaml', 'utf8');
      const rawConfig = yaml.load(configFile);
      
      // Replace environment variables in RPC URLs
      const processedConfig = this.processEnvironmentVariables(rawConfig);
      
      // Validate configuration
      const validatedConfig = RootConfigSchema.parse(processedConfig);
      
      // Create network mapping using both chainId and name as keys
      return Object.entries(validatedConfig.networks).reduce((acc, [chainId, network]) => {
        // Add entry with network name as key
        acc[network.name.toLowerCase()] = {
          name: network.name,
          rpcUrl: network.rpcUrl,
          chainId: network.chainId,
        };
        
        // Add entry with chain ID as key
        acc[chainId] = {
          name: network.name,
          rpcUrl: network.rpcUrl,
          chainId: network.chainId,
        };
        
        return acc;
      }, {} as Record<string, Network>);
    } catch (error) {
      throw new Error(`Failed to load network configuration: ${error.message}`);
    }
  }

  private processEnvironmentVariables(config: any): any {
    const processValue = (value: any): any => {
      if (typeof value === 'string' && value.startsWith('${') && value.endsWith('}')) {
        const envVar = value.slice(2, -1);
        return this.configService.get<string>(envVar);
      }
      return value;
    };

    return JSON.parse(
      JSON.stringify(config),
      (_, value) => processValue(value)
    );
  }

  getNetwork(networkName: string): Network {
    return this.networks[networkName.toLowerCase()];
  }

  getTokensForNetwork(networkName: string): TokenConfig[] {
    const network = this.networks[networkName.toLowerCase()];
    if (!network) {
      return [];
    }

    const config = Object.values(this.loadNetworkConfig())
      .find(n => n.name.toLowerCase() === networkName.toLowerCase());
    
    return config?.tokens || [];
  }
}