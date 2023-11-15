import {
  Controller,
  Get,
  Put,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UserDetailsService } from '@tma/backend/db-access';
import { JwtAuthGuard } from '@tma/backend/auth';
import {
  CurrentUser,
  JwtTokenData,
  UpdateUserDTO,
  UserDetails,
} from '@tma/shared/api-model';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserDetailsService) {}

  @Get('me')
  async findOne(@CurrentUser() user: JwtTokenData): Promise<UserDetails> {
    if (user == null) {
      throw new UnauthorizedException();
    }
    return this.userService.findUserById(user.user_id);
  }

  @Put('me')
  async updateUser(
    @CurrentUser() user: JwtTokenData,
    userData: UpdateUserDTO
  ): Promise<UserDetails> {
    if (user == null) {
      throw new UnauthorizedException();
    }
    return this.userService.updateUser(user.user_id, user.user_id, userData);
  }
}
