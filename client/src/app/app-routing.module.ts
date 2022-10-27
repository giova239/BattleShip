import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { UserLoginComponent } from './user-login/user-login.component';
import { AppComponent } from './app.component';
import { MessageListComponent } from './message-list/message-list.component';
import { UserSignupComponent } from './user-signup/user-signup.component';
import { FriendListComponent } from './friend-list/friend-list.component';
import { GameComponent } from './game/game.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: UserLoginComponent },
  { path: 'signup', component: UserSignupComponent },
  { path: 'friends', component: FriendListComponent},
  { path: 'chat/:userID', component: MessageListComponent },
  { path: 'game/:gameID', component: GameComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
