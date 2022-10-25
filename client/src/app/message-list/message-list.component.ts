import { Component, OnInit, EventEmitter, Output, OnDestroy } from '@angular/core';
import { Chat, isChat } from '../Chat';
import { MessageHttpService } from '../message-http.service';
import { UserHttpService } from '../user-http.service';
import { ActivatedRoute } from '@angular/router';
import { SocketioService } from '../socketio.service';

@Component({
  selector: 'app-message-list',
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.css']
})
export class MessageListComponent implements OnInit, OnDestroy {

  public chat: Chat;
  public message: string;
  public isUser1: boolean;
  private userID: string;
  private sub: any;
  private chatSocket;

  constructor( private sio: SocketioService , public ms: MessageHttpService, public us: UserHttpService, private route: ActivatedRoute) { }

  ngOnInit() {
    
    this.chat ={
      _id : null,
      user1 : null,
      user2 : null,
      messages : []
    }

    this.sub = this.route.params.subscribe(params => {
      this.userID = params['userID'];
    });

    this.get_messages();
    this.set_empty();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.chatSocket.unsubscribe();
  }

  public get_messages() {
    this.ms.get_messages(this.userID).subscribe(
      ( chat ) => {
        if(isChat(chat)){
          this.chat = chat;
          this.isUser1 = this.chat.user2 == this.userID

          //Socket connection to chat room
          this.chatSocket = this.sio.connect(this.chat._id).subscribe( m => {

            console.log(m);

            if(m && m.event && m.event == "newMessage"){
              this.chat.messages.push(m.content);
              if(m.content.isFromUser1 != this.isUser1){
                this.ms.read_messages(this.userID).subscribe();
              }
            }else if(m && m.event && m.event == "readMessage"){
              console.log(m.content);
              
              for (var i = 1; i <= m.content; i++){
                this.chat.messages[this.chat.messages.length - i].read = true;
              }
            }

          });

        }
      } , (err) => {
        // We need to login again
        this.us.logout();
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

    }, (error) => {
      console.log('Error occurred while sending the message: ' + error);
    });
  }

}
