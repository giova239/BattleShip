import { Component, ComponentFactoryResolver, OnDestroy, OnInit, ViewContainerRef, ViewChild } from '@angular/core';
import { UserHttpService } from '../user-http.service';
import { GameHttpService } from '../game-http.service';
import { Router } from '@angular/router';
import { Popover, Toast } from 'bootstrap';
import { SocketioService } from '../socketio.service';
import { Icu } from '@angular/compiler/src/i18n/i18n_ast';
import { MessageListComponent } from '../message-list/message-list.component';

@Component({
  selector: 'app-friend-list',
  templateUrl: './friend-list.component.html',
  styleUrls: ['./friend-list.component.css']
})
export class FriendListComponent implements OnInit, OnDestroy {

  @ViewChild('slot', {read: ViewContainerRef}) chatSlot : ViewContainerRef;

  public friends;
  public friendRequests;
  public errmessage;
  public vldmessage;
  public userID;
  public incomingChallenge;
  public showChat = false;
  private friendListSocket;

  constructor(private sio: SocketioService, public us: UserHttpService, public gs: GameHttpService, private router: Router, private cfr: ComponentFactoryResolver) { }

  ngOnInit(): void {
    this.userID = this.us.get_id();
    let toast = new Toast(document.querySelector('.toast'), {autohide: false});
    [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]')).map(popoverTriggerEl => new Popover(popoverTriggerEl));
    //Socket connection to chat room
    this.friendListSocket = this.sio.connect(this.userID).subscribe( m => {

      if(m && m.event && m.event == "newFriendRequest"){
        this.friendRequests.push(m);
      }else if(m && m.event && m.event == "newUnreadMessage"){
        var index = this.friends.findIndex(elem => elem._id.toString() == m.content)
        if(index >= 0){
          if(this.friends[index].numberOfUnreadMessages){
            this.friends[index].numberOfUnreadMessages++;
          }else{
            this.friends[index].numberOfUnreadMessages = 1;
          }
        }
      }else if(m && m.event && m.event == "challenged"){
        this.incomingChallenge = m.content;
        toast.show();
      }
      
    });
    this.get_friends();
    this.get_friend_requests();
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
      this.errmessage = null;
      this.vldmessage = "Friend request sent";
    }, err => {
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
      this.get_friend_requests();
    }, err => {
      console.log(err);
    });
  }

  public reject_friend_request(userID: string){
    this.us.delete_friend_requests(userID).subscribe( resp => {
      this.get_friend_requests();
    }, err => {
      console.log(err);
    });
  }

  open_chat(userID){
    this.showChat = true;
    this.clear()
    const factory = this.cfr.resolveComponentFactory(MessageListComponent);
    const component = this.chatSlot.createComponent(factory);
    component.instance.userID = userID;
  }

  close_chat(){
    this.showChat = false;
    this.clear()
  }

  async clear(){
    return await this.chatSlot.clear();
  }

  challenge(userID){
    this.gs.challenge(userID).subscribe( resp => {
      this.router.navigate(['/game/', resp]);
    }, err => {
      console.log(err);
    });
  }

  accept_challenge(){
    this.router.navigate(['/game/', this.incomingChallenge.gameID]);
  }

  copy_to_clipboard_ID(){
    navigator.clipboard.writeText(this.userID);
  }

  logout() {
    this.us.logout();
    this.router.navigate(['/']);
  }

}
