import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserHttpService } from '../user-http.service';
import { Router } from '@angular/router';
import { Popover } from 'bootstrap';
import { SocketioService } from '../socketio.service';

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

  constructor(private sio: SocketioService, public us: UserHttpService, private router: Router) { }

  ngOnInit(): void {
    this.userID = this.us.get_id();
    //Socket connection to chat room
    this.friendListSocket = this.sio.connect(this.userID).subscribe( m => {
      console.log(m);
      this.friendRequests.push(m);
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

      this.friends.array.forEach(element => {
        this.us.get_unread_messages(element._id)
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
      this.reload_data();
    }, err => {
      console.log(err);
    });
  }

  public reject_friend_request(userID: string){
    this.us.delete_friend_requests(userID).subscribe( resp => {
      console.log(resp);
      this.reload_data();
    }, err => {
      console.log(err);
    });
  }

  open_chat(userID){
    console.log(userID);
    this.router.navigate(['/chat/', userID]);
  }

  copy_to_clipboard_ID(){
    navigator.clipboard.writeText(this.userID);
  }

  reload_data(){
    this.get_friends();
    this.get_friend_requests();
  }

  logout() {
    this.us.logout();
    this.router.navigate(['/']);
  }

}
