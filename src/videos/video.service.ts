import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getMongoManager, MongoRepository } from 'typeorm';
import { CreateVideoInput } from './dto/create-video.input';
import { UpdateVideoInput } from './dto/update-video.input';
import { Video } from './entities/video.modal';
import { ObjectId } from 'mongodb';

@Injectable()
export class VideoService {
  constructor(
    @InjectRepository(Video) private VideoRepository: MongoRepository<Video>,
  ) {}
  create(createVideoInput: CreateVideoInput): Promise<Video> {
    const store = this.VideoRepository.create({ ...createVideoInput });
    const videoInput = [];
    videoInput.push({ ...createVideoInput });
    Logger.log(
      '/store/videoupload',
      'Video Management',
      false,
      'CREATE',
      videoInput,
      createVideoInput.userId,
      'oldValue',
      createVideoInput.storeId,
    );
    return this.VideoRepository.save(store);
  }

  async findAll(storeId: string) {
    const allvideoData = await this.VideoRepository.find({ storeId });
    return allvideoData;
  }

  async findOne(id: string) {
    return await this.VideoRepository.findOne({
      where: {
        _id: new ObjectId(id),
      },
    });
  }

  async update(updateVideoInput: UpdateVideoInput) {
    const { selectedIds, storeId, userId } = updateVideoInput;
    try {
      const findVideos = await this.findAll(storeId);
      const manager = getMongoManager();
      await manager.updateMany(
        Video,
        { storeId: storeId },
        {
          $set: {
            status: 'InActive',
            orderId: 0,
          },
        },
      );
      const newValues = [];
      for (let i = 0; i < selectedIds.length; i++) {
        await manager.updateOne(
          Video,
          { _id: new ObjectId(selectedIds[i]) },
          { $set: { status: 'Active', orderId: i + 1 } },
        );
        newValues.push({
          id: selectedIds[i],
          status: 'Active',
          orderId: i + 1,
        });
      }
      Logger.log(
        '/store/videoupload',
        'Video Management',
        false,
        'UPDATE',
        newValues,
        userId,
        findVideos,
        storeId,
      );
    } catch (er) {
      console.log(er);
    }
    const allvideoData = await this.VideoRepository.find({ storeId });

    return allvideoData;
  }

  async remove(id: string) {
    const oldValue = await this.findOne(id);
    const videoInput = [];
    videoInput.push(oldValue);
    Logger.log(
      '/store/videoupload',
      'Video Management',
      false,
      'REMOVE',
      'newValue',
      oldValue.userId,
      videoInput,
      oldValue.storeId,
    );
    await this.VideoRepository.delete(id);
    return { status: 'video deleted successfully' };
  }
}
