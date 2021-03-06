import {environment} from "../../environments/environment";
import {Injectable, Inject} from "@angular/core";

/**
 * Created by Vladimir Budilov
 */

declare var AWS: any;

export interface Callback {
    callback(): void;
    callbackWithParam(result: any): void;
}

@Injectable()
export class S3Service {

    constructor() {

    }

    private getS3(): any {

        AWS.config.update({
            region: environment.bucketRegion
        });

        var s3 = new AWS.S3({
            region: environment.bucketRegion,
            apiVersion: '2006-03-01',
            params: {Bucket: environment.appBucket}
        });

        return s3
    }

    listObjects(callback: Callback) {
        this.getS3().listObjects(function (err, result) {
            if (err) {
                console.log("S3Service: in listObjects: " + err);
            } else {
                callback.callbackWithParam(result.Contents);
            }
        });
    }

    getBucketTags(bucket: string, callback: Callback) {
        this.getS3().getBucketTagging({Bucket: bucket}, function (err, result) {
            if (err) {
                console.log("S3Service: in getBucketTagging: " + err);
            } else {
                callback.callbackWithParam(result.TagSet);
            }
        });
    }
}
