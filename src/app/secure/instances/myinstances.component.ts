import {Component} from "@angular/core";
import {LoggedInCallback, UserLoginService, Callback} from "../../service/cognito.service";
import {EC2Service} from "../../service/ec2.service";
import {CFService} from "../../service/cloudflare.service";
import {Router} from "@angular/router";


export class Instances {
    id: string;
    type: string;
    state: string;
    ip: string;
}

declare var AWS: any;
@Component({
    selector: 'my-aws-console-app',
    templateUrl: './myinstances.html'
})
export class MyInstancesComponent implements LoggedInCallback {

    public instances: Array<Instances> = [];
    public cognitoId: String;

    constructor(public router: Router, public userService: UserLoginService, public ec2: EC2Service, public cf: CFService) {
        this.userService.isAuthenticated(this);
        console.log("In MyInstancesComponent");
    }

    isLoggedIn(message: string, isLoggedIn: boolean) {
        if (!isLoggedIn) {
            this.router.navigate(['/home/login']);
        } else {
            this.ec2.listInstances(new GetInstancesCallback(this));
        }
    }

    onAction(instance: Instances) {
      this.cf.restoreDefaultCnameRecord();
        // if (instance.state=='stopped') {
        //     this.ec2.startInstance(instance.id, new StartInstanceCallback(this, instance))
        // }
        // if (instance.state=='running') {
        //     this.ec2.stopInstance(instance.id, new StopInstanceCallback(this, instance))
        // }
    }

    onConnect(instanceIp: string) {
        var newWindow = window.open('https://jupyter.brianlambson.com:8888');
        //this.cf.updateCnameRecord('i-054a8ea940daaf4af');
        //this.cf.restoreDefaultCnameRecord();
    }

}

export class GetInstancesCallback implements Callback {

    constructor(public me: MyInstancesComponent) {}

    callback() {}

    callbackWithParam(result: any) {
        this.me.instances = [];
        for (let i = 0; i < result.length; i++) {
            for (let j = 0; j < result[i].Instances.length; j++){
                let instance = new Instances();
                instance.id = result[i].Instances[j].InstanceId;
                instance.type = result[i].Instances[j].InstanceType;
                instance.state = result[i].Instances[j].State.Name;
                instance.ip = result[i].Instances[j].PublicIpAddress;
                this.me.instances.push(instance);
            }
        }

    }
}

export class StartInstanceCallback implements Callback {

    constructor(public me: MyInstancesComponent, public instance: Instances) {}

    callback() {
        this.me.ec2.waitForRunning(this.instance.id, new InstanceRunningCallback(this.me, this.instance));
        this.me.ec2.listInstances(new GetInstancesCallback(this.me));
    }

    callbackWithParam(result: any) {}
}

export class InstanceRunningCallback implements Callback {

    constructor(public me: MyInstancesComponent, public instance: Instances) {}

    callback() {
        console.log(this.instance.id);
        this.me.cf.updateCnameRecord(this.instance.id);
        this.me.ec2.listInstances(new GetInstancesCallback(this.me));
    }

    callbackWithParam() {}
}

export class StopInstanceCallback implements Callback {

    constructor(public me: MyInstancesComponent, public instance: Instances) {}

    callback() {
        this.me.ec2.waitForStopped(this.instance.id, new InstanceStoppedCallback(this.me));
        this.me.ec2.listInstances(new GetInstancesCallback(this.me));
    }

    callbackWithParam(result: any) {}
}

export class InstanceStoppedCallback implements Callback {

    constructor(public me: MyInstancesComponent) {}

    callback() {
        this.me.cf.restoreDefaultCnameRecord();
        this.me.ec2.listInstances(new GetInstancesCallback(this.me));
    }

    callbackWithParam(result: any) {}
}
