import {Injectable, Inject} from "@angular/core";
import {S3Service} from "./s3.service";
import {EC2Service} from "./ec2.service";
import {environment} from "../../environments/environment";
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';


export interface Callback {
    callback(): void;
    callbackWithParam(result: any): void;
}

export class CFAPI {
    result: Object;
    success: Boolean;
}

@Injectable()
export class CFService {

    constructor(public s3: S3Service, public ec2: EC2Service, public http: Http) {
    }

    updateCnameRecord(instanceId: string) {
        console.log("CFService: in updateCnameRecord()");
        this.ec2.getInstanceDnsName(instanceId, new CnameTargetReceivedCallback(this));
    }

    restoreDefaultCnameRecord() {
        console.log("CFService: in restoreDefaultCnameRecord()");
        this.getCfCredentials(new CfCredentialsReceivedCallback(this, environment.jupyterDefault));
    }

    getCfCredentials(callback: Callback) {
        this.s3.getBucketTags(environment.jupyterServer, callback);
    }

    makeCfApiCall(user: string, key: string, cname_target: string): Observable<CFAPI>{
        let headers = new Headers({'X-Auth-Email':user, 'X-Auth-Key': key, 'Content-Type': 'application/json'});
        let url = `https://api.cloudflare.com/client/v4/zones/${environment.cfZoneId}/dns_records/${environment.cfRecordId}`;
        let api_data = {
            type: 'CNAME',
            name: environment.jupyterServer,
            content: cname_target,
            ttl: 1,
            proxied: false
        }
        return this.http
                  .put(url, JSON.stringify(api_data), {headers: headers})
                  .map(this.extractData)
                  .catch(this.handleError);
    }

    private extractData(res: Response) {
        let body = res.json();
        if(body.success) {
           console.log('DNS update successful')
        }
        return body || { };
    }

    private handleError (error: Response | any) {
        // In a real world app, you might use a remote logging infrastructure
        let errMsg: string;
        if (error instanceof Response) {
          const body = error.json() || '';
          const err = body.error || JSON.stringify(body);
          errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
        } else {
          errMsg = error.message ? error.message : error.toString();
        }
        console.error(errMsg);
        return Observable.throw(errMsg);
    }
}

export class CnameTargetReceivedCallback implements Callback {

    constructor(public me: CFService) {}

    callback() {}

    callbackWithParam(cname_target: string) {
        this.me.getCfCredentials(new CfCredentialsReceivedCallback(this.me, cname_target));
    }
}

export class CfCredentialsReceivedCallback implements Callback {

    response: Object;
    success: Boolean;

    constructor(public me: CFService, public cname_target: string) {}

    callback() {}

    callbackWithParam(result: any) {
        this.me.makeCfApiCall(result.dns_user, result.dns_key, this.cname_target)
            .subscribe(
                 result =>  this.response = result,
                 success =>  this.success = success);
    }

}
