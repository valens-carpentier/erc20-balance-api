import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { BalanceService } from '../src/balance/balance.service';
import { MockBalanceService } from './mocks/balance.service.mock';

describe('BalanceController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(BalanceService)
      .useClass(MockBalanceService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // Tests retrieval of balance for a single token
  it('/balances/:network/:address (GET) - Supported network', () => {
    return request(app.getHttpServer())
      .get('/balances/ethereum/0x1234567890123456789012345678901234567890')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toBe(1);
        expect(res.body[0].symbol).toBe('DAI');
      });
  });

  // Tests error handling for unsupported blockchain networks
  it('/balances/:network/:address (GET) - Unsupported network', () => {
    return request(app.getHttpServer())
      .get('/balances/unsupported/0x1234567890123456789012345678901234567890')
      .expect(404);
  });

  // Tests invalid wallet addresses
  it('/balances/:network/:address (GET) - Invalid address', () => {
    return request(app.getHttpServer())
      .get('/balances/ethereum/invalid-address')
      .expect(400);
  });

  // Tests handling of addresses with no token balances
  it('/balances/:network/:address (GET) - Zero balance address', () => {
    return request(app.getHttpServer())
      .get('/balances/ethereum/0x0000000000000000000000000000000000000000')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toBe(0);
      });
  });

  // Tests multiple token balances for a single address
  it('/balances/:network/:address (GET) - Multiple tokens', () => {
    return request(app.getHttpServer())
      .get('/balances/ethereum/0x1111111111111111111111111111111111111111')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toBe(2);
        expect(res.body[0].symbol).toBe('DAI');
        expect(res.body[1].symbol).toBe('WETH');
      });
  });

  // Tests that network parameter is case-insensitive
  it('/balances/:network/:address (GET) - Case insensitive network', () => {
    return request(app.getHttpServer())
      .get('/balances/ETHEREUM/0x1234567890123456789012345678901234567890')
      .expect(200);
  });

  // Tests validation of addresses missing 0x prefix
  it('/balances/:network/:address (GET) - Address without 0x prefix', () => {
    return request(app.getHttpServer())
      .get('/balances/ethereum/1234567890123456789012345678901234567890')
      .expect(400);
  });

  // Tests validation of addresses containing invalid characters
  it('/balances/:network/:address (GET) - Address with invalid characters', () => {
    return request(app.getHttpServer())
      .get('/balances/ethereum/0x12345678901234567890123456789012345678ZZ')
      .expect(400);
  });

  // Tests validation of addresses that are too short
  it('/balances/:network/:address (GET) - Short address', () => {
    return request(app.getHttpServer())
      .get('/balances/ethereum/0x123456789')
      .expect(400);
  });

  // Tests that response contains all required token balance fields with correct types
  it('/balances/:network/:address (GET) - Response format validation', () => {
    return request(app.getHttpServer())
      .get('/balances/ethereum/0x1234567890123456789012345678901234567890')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBeTruthy();
        const token = res.body[0];
        expect(token).toHaveProperty('token_address');
        expect(token).toHaveProperty('name');
        expect(token).toHaveProperty('symbol');
        expect(token).toHaveProperty('decimals');
        expect(token).toHaveProperty('balance');
        expect(token).toHaveProperty('balance_usd');
        expect(typeof token.decimals).toBe('number');
        expect(typeof token.balance_usd).toBe('number');
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
