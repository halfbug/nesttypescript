import { Logger } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { S3ConfigProvider } from './S3ConfigProvider';

export class UploadImageService {
  private readonly s3Provider: S3ConfigProvider;

  constructor() {
    this.s3Provider = new S3ConfigProvider();
  }

  async upload(file) {
    const { originalname, mimetype } = file;
    const S3bucket =
      mimetype === 'video/mp4'
        ? this.s3Provider.getBucketNameVideo()
        : this.s3Provider.getBucketName();
    return await this.uploadS3(file.buffer, S3bucket, originalname, mimetype);
  }

  async uploadMany(files: any) {
    const result = [];
    for (const file of files) {
      const { originalname, mimetype, buffer } = file;
      const S3bucket =
        mimetype === 'video/mp4'
          ? this.s3Provider.getBucketNameVideo()
          : this.s3Provider.getBucketName();
      const response: any = await this.uploadS3(
        buffer,
        S3bucket,
        originalname,
        mimetype,
      );
      result.push(response);
    }
    return result;
  }

  async deleteImage(file) {
    const s3 = this.s3Provider.getS3();
    const S3bucket = this.s3Provider.getBucketName();
    s3.deleteObject(
      {
        Bucket: S3bucket,
        Key: file,
      },
      function (err, data) {
        if (err) {
          console.log(err);
          Logger.error(
            'Error in file delete from S3',
            err,
            UploadImageService.name,
          );
        }
      },
    );
  }

  async uploadS3(file, bucket, name, mimetype) {
    const s3 = this.s3Provider.getS3();
    const s3Params = {
      Bucket: bucket,
      Key: String(name),
      Body: file,
      ContentType: mimetype,
    };

    const data = await this.uploadImageToS3(s3, s3Params);

    return data;
  }

  async uploadImageToS3(s3: S3, s3Params) {
    return new Promise((resolve, reject) => {
      s3.upload(s3Params, (err, data) => {
        if (err) {
          Logger.error(err, UploadImageService.name);
          reject(err);
        }
        resolve(data);
      });
    });
  }
  async getSignedUrl(key: string) {
    const S3 = this.s3Provider.getS3();
    const S3bucket = this.s3Provider.getBucketName();
    const params = { Bucket: S3bucket, Key: key };
    // console.log(S3Obj);
    const SignedUrl = await S3.getSignedUrl('getObject', params);
    // console.log(
    //   '🚀 ~ file: uploadimage.service.ts ~ line 47 ~ UploadImageService ~ getSignedUrl ~ SignedUrl',
    //   SignedUrl,
    // );
    return SignedUrl;

    // return await this.uploadS3(file.buffer, S3bucket, originalname);
  }

  async getSignedUrlVideo(key: string) {
    const S3 = this.s3Provider.getS3();
    const S3bucket = this.s3Provider.getBucketNameVideo();
    const params = { Bucket: S3bucket, Key: key };
    // console.log(S3Obj);
    const SignedUrl = await S3.getSignedUrl('getObject', params);
    // console.log(
    //   '🚀 ~ file: uploadimage.service.ts ~ line 47 ~ UploadImageService ~ getSignedUrl ~ SignedUrl',
    //   SignedUrl,
    // );
    return SignedUrl;

    // return await this.uploadS3(file.buffer, S3bucket, originalname);
  }

  async deleteVideo(file) {
    const s3 = this.s3Provider.getS3();
    const S3bucket = this.s3Provider.getBucketNameVideo();
    s3.deleteObject(
      {
        Bucket: S3bucket,
        Key: file,
      },
      function (err) {
        if (err) {
          console.log(err);
          Logger.error(
            'Error in file delete from S3',
            err,
            UploadImageService.name,
          );
        }
      },
    );
  }
}
