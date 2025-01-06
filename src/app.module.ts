import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BalanceModule } from './balance/balance.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BalanceModule,
  ],
})
export class AppModule {}
