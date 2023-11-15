import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UserDetailsService } from '@tma/backend/db-access';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UserDetailsService],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
