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
export class EC2Service {

    constructor() {

    }

    private getEC2(): any {

        AWS.config.update({
            region: environment.ec2region
        });

        var ec2 = new AWS.EC2({
            region: environment.ec2region
        });

        return ec2
    }

    listInstances(callback: Callback) {
        this.getEC2().describeInstances(function (err, result) {
            if (err) {
                console.log("EC2Service: in listInstances: " + err);
            } else {
                callback.callbackWithParam(result.Reservations);
            }
        });
    }

    startInstance(instanceId: string, callback: Callback) {
        this.getEC2().startInstances({InstanceIds: [instanceId]}, function (err, result) {
            if (err) {
                console.log("EC2Service: in startInstance: " + err);
            } else {
                callback.callback();
            }

        });
    }

    waitForRunning(instanceId: string, callback: Callback) {
        this.getEC2().waitFor('instanceRunning', {InstanceIds: [instanceId]}, function(err, result) {
            if (err) {
                console.log("EC2Service: in waitForRunning: " + err);
            } else {
                callback.callback();
            }
        });
    }

    getInstanceDnsName(instanceId: string, callback: Callback) {
        this.getEC2().describeInstances({InstanceIds: [instanceId]}, function(err, result) {
            if (err) {
                console.log("EC2Service: in getInstanceDnsName: " + err);
            } else {
                callback.callbackWithParam(result.Reservations[0].Instances[0].PublicDnsName);
            }
        });
    }

    stopInstance(instanceId: string, callback: Callback) {
        this.getEC2().stopInstances({InstanceIds: [instanceId]}, function (err, result) {
            if (err) {
                console.log("EC2Service: in stopInstance: " + err);
            } else {
                callback.callback();
            }

        });
    }

    waitForStopped(instanceId: string, callback: Callback) {
        this.getEC2().waitFor('instanceStopped', {InstanceIds: [instanceId]}, function(err, result) {
            if (err) {
                console.log("EC2Service: in waitForStopped: " + err);
            } else {
                callback.callback();
            }
        });
    }

}
