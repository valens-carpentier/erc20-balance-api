import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { BalanceModule } from './balance/balance.module';

@Module({
  imports: [
    ConfigModule,
    BalanceModule,
  ],
})
export class AppModule {}
