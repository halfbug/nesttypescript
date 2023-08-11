import * as AWS from 'aws-sdk';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
const UID = uuidv4().slice(0, 6);
// const s3 = new AWS.S3({
//   accessKeyId: process.env.AWS_S3_ACCESS_KEY,
//   secretAccessKey: process.env.AWS_S3_KEY_SECRET,
// });
const s3 = new AWS.S3();

console.log(s3);

@Injectable()
export class AwsService {
  public async uploadFile(file: any): Promise<string> {
    const urlkey = `${UID}-${file.originalname}`;
    const params = {
      Bucket: 'gsnodeimages',
      Body: file.buffer,
      // region: process.env.AWS_REGION,
      Key: urlkey,
    };

    const data = await s3
      .upload(params)
      .promise()
      .then(
        (data) => {
          console.log('...uploaded to s3', data);
          return urlkey;
        },
        (err) => {
          console.log(err);
          return err;
        },
      );
    return data;
  }
}
