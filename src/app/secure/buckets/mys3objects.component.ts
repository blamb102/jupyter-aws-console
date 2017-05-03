import {Component} from "@angular/core";
import {LoggedInCallback, UserLoginService, Callback} from "../../service/cognito.service";
import {S3Service} from "../../service/s3.service";
import {Router} from "@angular/router";


export class Objects {
    key: string;
}

declare var AWS: any;
@Component({
    selector: 'brianlambson-angular2-app',
    templateUrl: './mys3objects.html'
})
export class MyS3ObjectComponent implements LoggedInCallback {

    public objects: Array<Objects> = [];
    public cognitoId: String;

    constructor(public router: Router, public userService: UserLoginService, public s3: S3Service) {
        this.userService.isAuthenticated(this);
        console.log("In MyS3ObjectsComponent");
    }

    isLoggedIn(message: string, isLoggedIn: boolean) {
        if (!isLoggedIn) {
            this.router.navigate(['/home/login']);
        } else {
            this.s3.listObjects(new GetS3ObjectsCallback(this));
        }
    }
}

export class GetS3ObjectsCallback implements Callback {

    constructor(public me: MyS3ObjectComponent) {

    }

    callback() {

    }

    callbackWithParam(result: any) {
        console.log("Result 1: " + result[0].Key)
        for (let i = 0; i < result.length; i++) {
            let object = new Objects();
            object.key = result[i].Key;
            this.me.objects.push(object);
        }
    }
}
