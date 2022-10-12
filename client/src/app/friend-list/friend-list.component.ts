import { Component, OnInit } from '@angular/core';
import { UserHttpService } from '../user-http.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-friend-list',
  templateUrl: './friend-list.component.html',
  styleUrls: ['./friend-list.component.css']
})
export class FriendListComponent implements OnInit {

  public friends;
  public friendRequests;
  public errmessage;
  public vldmessage;

  constructor(public us: UserHttpService, private router: Router) { }

  ngOnInit(): void {
    this.get_friends();
    this.get_friend_requests();
  }

  public get_friends(){
    this.us.get_friends().subscribe( friendList => {
      this.friends = friendList;
    }, err => {
      console.log(err);
    });
  }

  public add_friend(userID: string){
    this.us.post_friends(userID).subscribe( resp => {
      console.log(resp);
      this.errmessage = null;
      this.vldmessage = "Friend request sent";
    }, err => {
      console.log(err);
      this.vldmessage = null;
      this.errmessage = err;
    });
  }

  public get_friend_requests(){
    this.us.get_friend_requests().subscribe( friendRequests => {
      this.friendRequests = friendRequests;
    }, err => {
      console.log(err);
    });
  }

  open_chat(userID){
    console.log(userID);
    this.router.navigate(['/chat/', userID]);
  }

}
