import {
  Post,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  Controller,
  Res,
  Get,
  Req,
  Delete,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiResponse } from '@nestjs/swagger';

import { ImageFileDTO, ImageResponseDTO } from './UploadImageDTO';
import { UploadImageService } from './uploadimage.service';
import { Express } from 'express';
import { UploadedFiles } from '@nestjs/common';
import { Public } from 'src/auth/public.decorator';

@Controller('image')
export class UploadImageController {
  constructor(private readonly uploadImageService: UploadImageService) {}

  @Public()
  @Post('')
  @UseInterceptors(FileInterceptor('image', { limits: { files: 1 } }))
  @ApiResponse({ status: HttpStatus.CREATED, type: ImageResponseDTO })
  async upload(
    @Req() req,
    @UploadedFile() file: ImageFileDTO,
    @Res() response,
  ) {
    try {
      const data: ImageResponseDTO = await this.uploadImageService.upload(file);
      const dataDel = await this.uploadImageService.deleteImage(
        req.body.previousimage,
      );

      return response.status(200).json({
        message: `Image ${file.originalname} uploaded to S3`,
        data,
      });
    } catch (error) {
      return response
        .status(500)
        .json(`Failed to upload image to S3: ${error.message}`);
    }
  }

  @Public()
  @Delete('bannerimage')
  @ApiResponse({ status: HttpStatus.CREATED, type: ImageResponseDTO })
  async removeImageUrl(@Req() req, @Res() response) {
    const { key } = req.query;
    try {
      const data = await this.uploadImageService.deleteImage(key);
      return response.status(200).json({
        message: `s3 url removed`,
        data,
      });
    } catch (error) {
      return response
        .status(500)
        .json(`Failed to remove image from S3: ${error.message}`);
    }
  }

  @Public()
  @Post('video')
  @UseInterceptors(FilesInterceptor('video'))
  @ApiResponse({ status: HttpStatus.CREATED, type: ImageResponseDTO })
  async uploadFile(
    @Req() req,
    @UploadedFiles() file: Array<any>,
    @Res() response,
  ) {
    try {
      const data: any = await this.uploadImageService.uploadMany(file);
      // const dataDel = await this.uploadImageService.deleteImage(
      //   req.body.previousimage,
      // );

      return response.status(200).json({
        // message: `Video ${file.originalname} uploaded to S3`,
        data,
      });
    } catch (error) {
      return response
        .status(500)
        .json(`Failed to upload video to S3: ${error.message}`);
    }
  }

  @Public()
  @Get('')
  @ApiResponse({ status: HttpStatus.CREATED, type: ImageResponseDTO })
  async getImageUrl(@Req() req, @Res() response) {
    // console.log(req.query);
    // response.send(req.query);
    const { key } = req.query;

    try {
      const data = await this.uploadImageService.getSignedUrl(key);
      return response.status(200).json({
        message: `s3 url sent`,
        data,
      });
    } catch (error) {
      return response
        .status(500)
        .json(`Failed to get image from S3: ${error.message}`);
    }
  }

  @Get('video')
  @ApiResponse({ status: HttpStatus.CREATED, type: ImageResponseDTO })
  async getVideoUrl(@Req() req, @Res() response) {
    const { key } = req.query;

    try {
      const data = await this.uploadImageService.getSignedUrlVideo(key);
      return response.status(200).json({
        message: `s3 url sent`,
        data,
      });
    } catch (error) {
      return response
        .status(500)
        .json(`Failed to get video from S3: ${error.message}`);
    }
  }

  @Public()
  @Delete('video')
  @ApiResponse({ status: HttpStatus.CREATED, type: ImageResponseDTO })
  async removeVideoUrl(@Req() req, @Res() response) {
    const { key } = req.query;
    try {
      const data = await this.uploadImageService.deleteVideo(key);
      return response.status(200).json({
        message: `s3 url removed`,
        data,
      });
    } catch (error) {
      return response
        .status(500)
        .json(`Failed to remove video from S3: ${error.message}`);
    }
  }
}
