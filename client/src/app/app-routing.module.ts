import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserLoginComponent } from './user-login/user-login.component';
import { UserSignupComponent } from './user-signup/user-signup.component';
import { HomePageComponent } from './home-page/home-page.component';
import { GameComponent } from './game/game.component';
import { ProfileComponent } from './profile/profile.component';
import { NewModeratorComponent } from './new-moderator/new-moderator.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'home', component: HomePageComponent },
  { path: 'login', component: UserLoginComponent },
  { path: 'signup', component: UserSignupComponent },
  { path: 'game/:gameID', component: GameComponent },
  { path: 'profile/:userID', component: ProfileComponent },
  { path: 'newModerator', component: NewModeratorComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
