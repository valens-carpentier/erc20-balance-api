import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { NetworkConfigService } from './configuration.service';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [NetworkConfigService],
  exports: [NetworkConfigService],
})
export class ConfigModule {} 