import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { DatabaseAccessModule } from '@tma/backend/db-access';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import authConfig from './auth.config';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtAuthStrategy } from './jwt-auth.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [authConfig]
    }),
    DatabaseAccessModule, JwtModule.registerAsync({
    imports: [ConfigModule],
    useFactory: (authConfig: ConfigService) => {
      return {
        secret: authConfig.get<string>('auth.jwt.secret')
      };
    },
    inject: [ConfigService]
  })],
  controllers: [],
  providers: [AuthService, JwtAuthGuard, JwtAuthStrategy],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
