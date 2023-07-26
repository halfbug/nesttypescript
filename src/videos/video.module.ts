import { Module } from '@nestjs/common';
import { VideoService } from './video.service';
import { VideoResolver } from './video.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from './entities/video.modal';

@Module({
  imports: [TypeOrmModule.forFeature([Video])],
  providers: [VideoResolver, VideoService],
  exports: [VideoResolver, VideoService],
})
export class VideoModule {}
