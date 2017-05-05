import {Injectable, Inject} from "@angular/core";
import {environment} from "../../environments/environment";


export interface Callback {
    callback(): void;
    callbackWithParam(result: any): void;
}

@Injectable()
export class CloudflareService {

    constructor() {

    }

    updateDns(host: string, target: string) {

        let headers = new Headers();
        headers.append('X-Auth-Email','')
        headers.append('X-Auth-Key',)
        headers.append('Content-Type', 'application/json');
        let url = https://api.cloudflare.com/client/v4/zones/${environment.cfZoneId}/dns_records/${environment.cfRecordId};
        let api_data = {
            type: "CNAME",
            name: host,
            content: target,
            ttl: 1,
            proxied: true
        }
        return this.http
             .put(url, JSON.stringify(hero), {headers: headers})
             .map(res => res.json());
    }
}
