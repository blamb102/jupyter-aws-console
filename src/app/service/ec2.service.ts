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

    getInstanceDnsName(instanceId: string, callback: Callback) {
        this.getEC2().describeInstances({InstanceIds: [instanceId]}, function(err, result) {
            if (err) {
                console.log("EC2Service: in getInstanceDnsName: " + err);
            } else {
                callback.callbackWithParam(result.Reservations[0].Instances[0].PublicDnsName);
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

    stopInstance(instanceId: string, callback: Callback) {
        this.getEC2().stopInstances({InstanceIds: [instanceId]}, function (err, result) {
            if (err) {
                console.log("EC2Service: in stopInstance: " + err);
            } else {
                callback.callback();
            }

        });
    }

    checkIfRunning(instanceId: string, isRunningCallback: Callback, notRunningCallback: Callback) {
      this.getEC2().describeInstances({InstanceIds: [instanceId]}, function(err, result) {
          if (err) {
              console.log("EC2Service: in checkIfRunning: " + err);
          } else {
              if (result.Reservations[0].Instances[0].State.Name=='running') {
                isRunningCallback.callback();
              } else {
                notRunningCallback.callback();
              }
          }
      });
    }

    checkIfStopped(instanceId: string, isStoppedCallback: Callback, notStoppedCallback: Callback) {
      this.getEC2().describeInstances({InstanceIds: [instanceId]}, function(err, result) {
          if (err) {
              console.log("EC2Service: in checkIfRunning: " + err);
          } else {
              if (result.Reservations[0].Instances[0].State.Name=='stopped') {
                isStoppedCallback.callback();
              } else {
                notStoppedCallback.callback();
              }
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

    detachVolume(volumeId: string, callback: Callback) {
        this.getEC2().detachVolume({VolumeId: volumeId}, function (err, result) {
            if (err) {
                console.log("EC2Service: in detachVolume: " + err);
            } else {
                callback.callback();
            }

        });
    }

    checkIfDetached(volumeId: string, isDetachedCallback: Callback, notDetachedCallback: Callback) {
      this.getEC2().describeVolumes({VolumeIds: [volumeId]}, function(err, result) {
          if (err) {
              console.log("EC2Service: in checkIfRunning: " + err);
          } else {
              if (result.Volumes[0].State=='available') {
                isDetachedCallback.callback();
              } else {
                notDetachedCallback.callback();
              }
          }
      });
    }

    checkIfAttached(volumeId: string, isAttachedCallback: Callback, notAttachedCallback: Callback) {
      this.getEC2().describeVolumes({VolumeIds: [volumeId]}, function(err, result) {
          if (err) {
              console.log("EC2Service: in checkIfRunning: " + err);
          } else {
              if (result.Volumes[0].Attachments.length > 0) {
                  if (result.Volumes[0].Attachments[0].State=='attached') {
                    isAttachedCallback.callback();
                  } else {
                    notAttachedCallback.callback();
                  }
              } else {
                  notAttachedCallback.callback();
              }
          }
      });
    }

}
