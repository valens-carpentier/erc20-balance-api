export interface TokenBalance {
    token_address: string;
    name: string;
    symbol: string;
    decimals: number;
    balance: string;
    balance_usd: number;
}

export interface Network {
    name: string;
    rpcUrl: string;
    chainId: number;
}
