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

export class DNS {
    user: string;
    key: string;
    zone: string;
    record: string;
}

@Injectable()
export class CFService {

    constructor(public s3: S3Service, public ec2: EC2Service, public http: Http) {
    }

    updateCnameRecord(instanceId: string, application: string) {
        console.log("CFService: in updateCnameRecord()");
        this.ec2.getInstanceDnsName(instanceId, new CnameTargetReceivedCallback(this, application));
    }

    restoreDefaultCnameRecord(application: string) {
        console.log("CFService: in restoreDefaultCnameRecord()");
        this.getCfCredentials(application, new CfCredentialsReceivedCallback(this, application+'.'+environment.defaultURL, application));
    }

    getCfCredentials(application: string, callback: Callback) {
        this.s3.getBucketTags(application+'.'+environment.baseURL, callback);
    }

    makeCfApiCall(dns: DNS, cname_target: string, application): Observable<CFAPI>{
        let headers = new Headers({'X-Auth-Email':dns.user, 'X-Auth-Key': dns.key, 'Content-Type': 'application/json'});
        let url = `https://api.cloudflare.com/client/v4/zones/${dns.zone}/dns_records/${dns.record}`;
        let api_data = {
            type: 'CNAME',
            name: application+'.'+environment.baseURL,
            content: cname_target,
            ttl: 1,
            proxied: true
        }
        url = environment.corsProxy+url;
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

    constructor(public me: CFService, public application: string) {}

    callback() {}

    callbackWithParam(cname_target: string) {
        this.me.getCfCredentials(this.application, new CfCredentialsReceivedCallback(this.me, cname_target, this.application));
    }
}

export class CfCredentialsReceivedCallback implements Callback {

    constructor(public me: CFService, public cname_target: string, public application: string) {}

    callback() {}

    callbackWithParam(result: any) {
        var dns = new DNS();

        for (let i = 0; i < result.length; i++) {
            if (result[i].Key=='dns_user') {
                dns.user = result[i].Value;
            } else if (result[i].Key=='dns_key') {
                dns.key = result[i].Value;
            } else if (result[i].Key=='dns_zone') {
                dns.zone = result[i].Value;
            } else if (result[i].Key=='dns_record') {
              dns.record = result[i].Value;
            }
        }
        this.me.makeCfApiCall(dns, this.cname_target, this.application).subscribe();
    }

}
