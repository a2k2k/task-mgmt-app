import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UserDetailsService } from '@tma/backend/db-access';
import { JwtAuthGuard } from '@tma/backend/auth';
import {
  CreateUserDTO,
  CurrentUser,
  JwtTokenData,
  ListResponse,
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

  @Get('/:id')
  async getUserById(
    @CurrentUser() user: JwtTokenData,
    @Param('id') userIdOrEmail: string
  ): Promise<UserDetails> {
    if (user == null) {
      throw new UnauthorizedException();
    }
    return this.userService.findUserByEmailOrId(userIdOrEmail, user.user_id);
  }
  @Delete('/:id')
  async deleteUser(
    @CurrentUser() user: JwtTokenData,
    @Param('id') id: string
  ): Promise<UserDetails> {
    if (user == null) {
      throw new UnauthorizedException();
    }
    return this.userService.deleteUser(id, user.user_id);
  }
  @Put('/:id')
  async updateUser(
    @CurrentUser() user: JwtTokenData,
    @Param('id') id: string,
    @Body() userData: UpdateUserDTO
  ): Promise<UserDetails> {
    if (user == null) {
      throw new UnauthorizedException();
    }
    return this.userService.updateUser(user.user_id, id, userData);
  }
  @Put('me')
  async updateCurrentUser(
    @CurrentUser() user: JwtTokenData,
    @Body() userData: UpdateUserDTO
  ): Promise<UserDetails> {
    if (user == null) {
      throw new UnauthorizedException();
    }
    return this.userService.updateUser(user.user_id, user.user_id, userData);
  }
  @Get()
  async getUsers(
    @CurrentUser() user: JwtTokenData,
    @Query() query: { [key: string]: string }
  ): Promise<ListResponse<UserDetails>> {
    const offset = query.offset ? parseInt(query.offset) : 0;
    const limit = query.limit ? parseInt(query.limit) : 10;
    if (user == null) {
      throw new UnauthorizedException();
    }
    return this.userService.getUsers(offset, limit, user.user_id);
  }
  @Post()
  async createUser(
    @CurrentUser() user: JwtTokenData,
    @Body() userData: CreateUserDTO
  ): Promise<UserDetails> {
    if (user == null) {
      throw new UnauthorizedException(
        'You need to be loggedIn to perform this operation'
      );
    }
    return this.userService.createUser(userData, user.user_id, false);
  }
}
