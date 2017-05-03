import {BrowserModule} from "@angular/platform-browser";
import {NgModule} from "@angular/core";
import {FormsModule} from "@angular/forms";
import {HttpModule} from "@angular/http";
import {AppComponent} from "./app.component";
import {UserLoginService, UserParametersService, CognitoUtil} from "./service/cognito.service";
import {routing} from "./app.routes";
import {HomeComponent, AboutComponent, HomeLandingComponent} from "./public/home.component";
import {AwsUtil} from "./service/aws.service";
import {UseractivityComponent} from "./secure/useractivity/useractivity.component";
import {MyProfileComponent} from "./secure/profile/myprofile.component";
import {MyS3ObjectComponent} from "./secure/buckets/mys3objects.component";
import {MyInstancesComponent} from "./secure/instances/myinstances.component";
import {SecureHomeComponent} from "./secure/landing/securehome.component";
import {JwtComponent} from "./secure/jwttokens/jwt.component";
import {DynamoDBService} from "./service/ddb.service";
import {S3Service} from "./service/s3.service";
import {EC2Service} from "./service/ec2.service";
import {LoginComponent} from "./public/auth/login/login.component";
import {LogoutComponent} from "./public/auth/logout/logout.component";


@NgModule({
    declarations: [
        LoginComponent,
        LogoutComponent,
        AboutComponent,
        HomeLandingComponent,
        HomeComponent,
        UseractivityComponent,
        MyProfileComponent,
        MyS3ObjectComponent,
        MyInstancesComponent,
        SecureHomeComponent,
        JwtComponent,
        AppComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        routing
    ],
    providers: [
        CognitoUtil,
        AwsUtil,
        DynamoDBService,
        S3Service,
        EC2Service,
        UserLoginService,
        UserParametersService],
    bootstrap: [AppComponent]
})
export class AppModule {
}
