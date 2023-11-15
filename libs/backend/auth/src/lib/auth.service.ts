import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  UserCredsService,
  UserDetailsService,
} from '@tma/backend/db-access';
import {
  CreateUserDTO,
  GenericSuccessResponse,
  JwtTokenData,
  LoginRequest,
  TokenResponse,
  UpdatePasswordRequest,
  UserDetails,
} from '@tma/shared/api-model';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private userCredsService: UserCredsService,
    private userDetailsService: UserDetailsService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}
  async changePassword(
    updatePasswordRequest: UpdatePasswordRequest
  ): Promise<GenericSuccessResponse> {
    const error = this.userCredsService.verify({
      username: updatePasswordRequest.username,
      password: updatePasswordRequest.oldPassword,
    });
    if (error) {
      throw new BadRequestException(error);
    }
    this.userCredsService.update({
      username: updatePasswordRequest.username,
      password: updatePasswordRequest.oldPassword,
    });
    return Promise.resolve({ result: 'ok' });
  }
  async registerUser(
    createUserRequest: CreateUserDTO
  ): Promise<UserDetails> {
    await this.userCredsService.create({
      username: createUserRequest.username,
      password: createUserRequest.password,
    });
    if (createUserRequest.admin == null) {
      createUserRequest.admin = true;
    }
    return await this.userDetailsService.createUser(createUserRequest, null, true);
  }
  async login(request: LoginRequest): Promise<TokenResponse | null> {
    const result = await this.userCredsService.verify(request);
    if (result) {
      throw new UnauthorizedException(result);
    }
    const user: UserDetails =
      (await this.userDetailsService.findUserByUsername(
        request.username
      )) as UserDetails;
    if (!user) {
      throw new InternalServerErrorException(
        `Internal error occured while fetching details for user "${request.username}"`
      );
    }
    return this.createTokens(user);
  }

  async verifyToken(token: string): Promise<UserDetails> {
    let tokenObject: JwtTokenData;
    try {
      tokenObject = this.jwtService.verify(token);
    } catch (e) {
      throw new UnauthorizedException(e);
    }
    const user: UserDetails = (await this.userDetailsService.findUserById(
      tokenObject.user_id
    )) as UserDetails;
    if (!user) {
      throw new UnauthorizedException('invalid access token');
    }
    return Promise.resolve(user);
  }

  async refreshToken(token: string): Promise<TokenResponse> {
    const user = await this.verifyToken(token);
    return this.createTokens(user);
  }
  private async createTokens(user: UserDetails): Promise<TokenResponse> {
    const tokenData: JwtTokenData = {
      username: user.username,
      user_id: user.id,
      email: user.email,
    };
    const accessToken = await this.jwtService.signAsync(tokenData, {
      expiresIn: this.configService.get<string>('auth.jwt.access_token_expiry'),
    });
    const refreshToken = await this.jwtService.signAsync(tokenData, {
      expiresIn: this.configService.get<string>(
        'auth.jwt.refresh_token_expiry'
      ),
    });
    return Promise.resolve({
      access_token: accessToken,
      refresh_token: refreshToken,
      expires: this.configService.get<number>(
        'auth.jwt.access_token_expiry'
      ) as number,
      token_type: 'bearer',
    });
  }
  async getCurrentUser(token: string): Promise<UserDetails> {
    return this.verifyToken(token);
  }
}
