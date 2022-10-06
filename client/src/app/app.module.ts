import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';


import { AppComponent } from './app.component';
import { MessageListComponent } from './message-list/message-list.component';

// Services
import { MessageHttpService } from './message-http.service';
import { UserHttpService } from './user-http.service';
import { UserLoginComponent } from './user-login/user-login.component';
import { AppRoutingModule } from './/app-routing.module';
import { UserSignupComponent } from './user-signup/user-signup.component';
import { SocketioService } from './socketio.service';


@NgModule({
  declarations: [
    AppComponent,
    MessageListComponent,
    UserLoginComponent,
    UserSignupComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [
    {provide: UserHttpService, useClass: UserHttpService },
    {provide: SocketioService, useClass: SocketioService },
    {provide: MessageHttpService, useClass: MessageHttpService} 
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
