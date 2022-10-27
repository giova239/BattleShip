import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserHttpService } from '../user-http.service';
import { GameHttpService } from '../game-http.service';
import { Router } from '@angular/router';
import { Popover } from 'bootstrap';
import { SocketioService } from '../socketio.service';
import { Icu } from '@angular/compiler/src/i18n/i18n_ast';

@Component({
  selector: 'app-friend-list',
  templateUrl: './friend-list.component.html',
  styleUrls: ['./friend-list.component.css']
})
export class FriendListComponent implements OnInit, OnDestroy {

  public friends;
  public friendRequests;
  public errmessage;
  public vldmessage;
  public userID;
  private friendListSocket;

  constructor(private sio: SocketioService, public us: UserHttpService, public gs: GameHttpService, private router: Router) { }

  ngOnInit(): void {
    this.userID = this.us.get_id();
    //Socket connection to chat room
    this.friendListSocket = this.sio.connect(this.userID).subscribe( m => {

      console.log(m);

      if(m && m.event && m.event == "newFriendRequest"){
        this.friendRequests.push(m);
      }else if(m && m.event && m.event == "newUnreadMessage"){
        var index = this.friends.findIndex(elem => elem._id.toString() == m.content)
        console.log(index);
        if(index >= 0){
          if(this.friends[index].numberOfUnreadMessages){
            this.friends[index].numberOfUnreadMessages++;
          }else{
            this.friends[index].numberOfUnreadMessages = 1;
          }
        }
      }
      
    });
    this.get_friends();
    this.get_friend_requests();
    [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]')).map(popoverTriggerEl => new Popover(popoverTriggerEl))
  }

  ngOnDestroy() {
    this.friendListSocket.unsubscribe();
  }

  public get_friends(){
    this.us.get_friends().subscribe( friendList => {

      this.friends = friendList;

      this.friends.forEach((element, index) => {
        this.us.get_unread_messages(element._id.toString()).subscribe( numberOfUnreadMessages => {
            this.friends[index].numberOfUnreadMessages = numberOfUnreadMessages
        })
      });

    }, (err) => {
      // We need to login again
      this.logout();
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
      // We need to login again
      this.logout();
    });
  }

  public accept_friend_request(userID: string){
    this.us.post_friends(userID).subscribe( resp => {
      console.log(resp);
      this.get_friend_requests();
    }, err => {
      console.log(err);
    });
  }

  public reject_friend_request(userID: string){
    this.us.delete_friend_requests(userID).subscribe( resp => {
      console.log(resp);
      this.get_friend_requests();
    }, err => {
      console.log(err);
    });
  }

  open_chat(userID){
    this.router.navigate(['/chat/', userID]);
  }

  challenge(userID){
    console.log("challenging user: " + userID);
    this.gs.challenge(userID).subscribe( resp => {
      console.log(resp);
      this.router.navigate(['/game/', resp]);
    }, err => {
      console.log(err);
    });
  }

  copy_to_clipboard_ID(){
    navigator.clipboard.writeText(this.userID);
  }

  logout() {
    this.us.logout();
    this.router.navigate(['/']);
  }

}
