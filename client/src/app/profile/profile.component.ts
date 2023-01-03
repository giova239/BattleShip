import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserHttpService } from '../user-http.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  constructor(public us: UserHttpService, public route: ActivatedRoute) { }

  public userID;
  public user: any;
  public friendState = 0;
  //0 -> not-friends; 1 -> friend-request-sent; 2 -> friends; 3 -> yourProfile

  ngOnInit(): void {

    this.route.params.subscribe(params => {

      this.userID = params['userID'];

      this.us.get_user_by_id(this.userID).subscribe(u => {
        this.user = u;
        if(this.user.friends.includes(this.us.get_id())){
          this.friendState = 2
        }else if(this.user.pendingRequests.includes(this.us.get_id())){
          this.friendState = 1
        }else if(this.us.get_id() == this.userID){
          this.friendState = 3
        }
        console.log(this.friendState);
        
      })

    });

  }

  friendButtonClicked(){

    if(this.friendState == 0){
      //addFriend
      this.us.post_friends(this.userID).subscribe( resp => {
        this.friendState=1;
      })
    }else if(this.friendState == 1){
      //removeRequest
      this.friendState = 0;
    }else if(this.friendState == 2){
      //removeFriend
      this.friendState = 0;
    }
  }

}