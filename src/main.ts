import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { useContainer } from 'class-validator';
import { ValidationPipe } from '@nestjs/common';
import { Gslogger } from './applogger/gslogger';

async function bootstrap() {
  // const app = await NestFactory.create(AppModule);
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(Gslogger));
  app.enableCors();

  // enable validation globally

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false,
      transform: true,
    }),
  );

  // enable DI for class-validator
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  const port = process.env.PORT || 5000;
  await app.listen(5000);
}
bootstrap();
