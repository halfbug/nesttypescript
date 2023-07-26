import { Test, TestingModule } from '@nestjs/testing';
import { ThemeAppExtensionController } from './theme-app-extension.controller';

describe('ThemeAppExtensionController', () => {
  let controller: ThemeAppExtensionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ThemeAppExtensionController],
    }).compile();

    controller = module.get<ThemeAppExtensionController>(
      ThemeAppExtensionController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
