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

  constructor(public us: UserHttpService, private router: Router) { }

  ngOnInit(): void {
    this.get_friends();
  }

  public get_friends(){
    this.us.get_friends().subscribe( friendList => {
      this.friends = friendList;
    }, err => {
      console.log(err);
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
