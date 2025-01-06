import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BalanceController } from './balance.controller';
import { BalanceService } from './balance.service';
import { NetworkConfigService } from '../config/configuration.service';

@Module({
  imports: [ConfigModule],
  controllers: [BalanceController],
  providers: [BalanceService, NetworkConfigService],
})
export class BalanceModule {}