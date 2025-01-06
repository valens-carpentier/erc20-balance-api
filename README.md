# ERC20 Balance API

A NestJS-based API service that fetches ERC20 token balances across multiple blockchain networks (Ethereum, Polygon, and Base) for any given wallet address.

## Overview

This API allows users to query ERC20 token balances for specific addresses across different networks. It supports major tokens like DAI, WETH, and USDC, and includes USD value calculations using CoinGecko price data.

## Key Features

- Multi-network support (Ethereum, Polygon, Base)
- Real-time balance checking using network RPC endpoints
- USD value calculations for token balances
- Built-in support for major tokens (DAI, WETH, USDC)
- Error handling and logging
- CORS enabled for frontend integration

## Technical Architecture

### Core Components

1. **Balance Service** (`balance.service.ts`)
   - Handles connecting to blockchain networks
   - Fetches token balances using ethers.js
   - Converts token amounts using proper decimals
   - Calculates USD values

2. **Network Configuration** (`configuration.service.ts`)
   - Manages network configurations and RPC endpoints through environment variables

### Technical Choices & Trade-offs

1. **Ethers.js vs Web3.js**
   - Chose ethers.js for its better TypeScript support and modern API
   - Trade-off: Slightly steeper learning curve but better maintainability

2. **Token List Implementation**
   - Hardcoded major tokens instead of using token lists APIs
   - Trade-off: Less comprehensive but more reliable and faster response times

3. **Price Fetching**
   - Using CoinGecko's free API for price data
   - Trade-off: Rate limits but no API key requirement

4. **Network Support**
   - Limited to three major networks initially
   - Trade-off: Smaller scope but better testing and reliability

## Setup and Installation

1. Clone the repository

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your RPC URLs:
   ```
   ETHEREUM_RPC_URL=your_ethereum_rpc_url
   POLYGON_RPC_URL=your_polygon_rpc_url
   BASE_RPC_URL=your_base_rpc_url
   ```

4. Run the development server:
   ```bash
   npm run start:dev
   ```

## API Endpoints

### Get Token Balances

`GET /balances/:network/:address`

Parameters:
- `network`: ethereum | polygon | base
- `address`: Wallet address to query