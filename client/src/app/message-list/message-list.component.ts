import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { Chat, isChat } from '../Chat';
import { MessageHttpService } from '../message-http.service';
import { UserHttpService } from '../user-http.service';
import { Router, ActivatedRoute } from '@angular/router';
import { SocketioService } from '../socketio.service';

@Component({
  selector: 'app-message-list',
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.css']
})
export class MessageListComponent implements OnInit {

  public chat: Chat;
  public message: string;
  public isUser1: boolean;
  private userID: string;
  private sub: any;

  constructor( private sio: SocketioService , public ms: MessageHttpService, public us: UserHttpService, private router: Router, private route: ActivatedRoute) { }

  @Output() posted = new EventEmitter<Chat>();

  ngOnInit() {
    this.chat = {
      _id : null,
      user1 : this.us.get_id(),
      user2 : this.userID,
      messages: []
    }
    this.sub = this.route.params.subscribe(params => {
      this.userID = params['userID'];
   });
    this.sio.connect().subscribe( (m) => {
      if(this.chat._id == m)
      this.get_messages();
    });
    this.get_messages();
    this.set_empty();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  public get_messages() {
    console.log("updating chat");
    this.ms.get_messages(this.userID).subscribe(
      ( chat ) => {
        if(isChat(chat)){
          this.chat = chat;
        }
        this.isUser1 = this.chat.user2 == this.userID
      } , (err) => {
        // We need to login again
        this.logout();
      }
    );
  }

  set_empty() {
    this.message = "";
  }

  post_message( ) {
    this.ms.post_message( this.userID, this.message ).subscribe( (m) => {

      console.log('Message sent');
      this.set_empty();
      this.posted.emit( m );

    }, (error) => {
      console.log('Error occurred while sending the message: ' + error);
    });
  }

  logout() {
    this.us.logout();
    this.router.navigate(['/']);
  }

}
