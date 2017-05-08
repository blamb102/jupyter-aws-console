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

    describeVolume(volumeId: string, callback: Callback) {
        this.getEC2().describeVolumes({VolumeIds: [volumeId]}, function (err, result) {
            if (err) {
                console.log("EC2Service: in listInstances: " + err);
            } else {
                if(result.Volumes[0].Attachments.length>0) {
                    callback.callbackWithParam({
                      InstanceId: result.Volumes[0].Attachments[0].InstanceId,
                      State: result.Volumes[0].Attachments[0].State,
                      Availability: result.Volumes[0].State
                    });
                } else {
                    callback.callbackWithParam({
                      InstanceId: 'none',
                      State: 'none',
                      Availability: result.Volumes[0].State});
                }
            }
        });
    }

    attachVolume(volumeId: string, instanceId: string, callback: Callback) {
        this.getEC2().attachVolume({VolumeId: volumeId, InstanceId: instanceId, Device: '/dev/sdh'}, function (err, result) {
            if (err) {
                console.log("EC2Service: in attachVolume: " + err);
            } else {
                callback.callback();
            }

        });
    }

    waitForAttached(volumeId: string, callback: Callback) {
        this.getEC2().waitFor('volumeInUse', {VolumeIds: [volumeId]}, function(err, result) {
            if (err) {
                console.log("EC2Service: in waitForAttached: " + err);
            } else {
                callback.callback();
            }
        });
    }

    detachVolume(volumeId: string, callback: Callback) {
        this.getEC2().detachVolume({VolumeId: volumeId}, function (err, result) {
            if (err) {
                console.log("EC2Service: in detachVolume: " + err);
            } else {
                callback.callback();
            }

        });
    }

    waitForDetached(volumeId: string, callback: Callback) {
        this.getEC2().waitFor('volumeAvailable', {VolumeIds: [volumeId]}, function(err, result) {
            if (err) {
                console.log("EC2Service: in waitForDetached: " + err);
            } else {
                callback.callback();
            }
        });
    }

}
