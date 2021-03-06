import {Component, OnInit} from "@angular/core";
import {Router} from "@angular/router";
import {CognitoCallback, UserLoginService, LoggedInCallback} from "../../../service/cognito.service";
import {DynamoDBService} from "../../../service/ddb.service";

@Component({
    selector: 'my-aws-console-app',
    templateUrl: './login.html'
})
export class LoginComponent implements CognitoCallback, LoggedInCallback, OnInit {
    password: string;
    errorMessage: string;

    constructor(public router: Router,
                public ddb: DynamoDBService,
                public userService: UserLoginService) {
        console.log("LoginComponent constructor");
    }

    ngOnInit() {
        this.errorMessage = null;
        console.log("Checking if the user is already authenticated. If so, then redirect to the secure site");
        this.userService.isAuthenticated(this);
    }

    onLogin() {
        if (this.password == null) {
            this.errorMessage = "Password required";
            return;
        }
        let email = "me@brianlambson.com"
        this.errorMessage = null;
        this.userService.authenticate(email, this.password, this);
    }

    cognitoCallback(message: string, result: any) {
        if (message != null) { //error
            this.errorMessage = message;
            console.log("result: " + this.errorMessage);
        } else { //success
            this.ddb.writeLogEntry("login");
            this.router.navigate(['/securehome']);
        }
    }

    isLoggedIn(message: string, isLoggedIn: boolean) {
        if (isLoggedIn)
            this.router.navigate(['/securehome']);
    }
}
