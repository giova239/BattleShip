import { Component, OnInit } from '@angular/core';
import { UserHttpService } from '../user-http.service';

@Component({
  selector: 'app-friend-list',
  templateUrl: './friend-list.component.html',
  styleUrls: ['./friend-list.component.css']
})
export class FriendListComponent implements OnInit {

  public friends;

  constructor(public us: UserHttpService) { }

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

  open_chat(userID){
    console.log(userID);
  }

}
