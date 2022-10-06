import { Component, OnInit } from '@angular/core';
import { Chat } from '../Chat';
import { MessageHttpService } from '../message-http.service';
import { UserHttpService } from '../user-http.service';
import { Router } from '@angular/router';
import { SocketioService } from '../socketio.service';

@Component({
  selector: 'app-message-list',
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.css']
})
export class MessageListComponent implements OnInit {

  public chat: Chat;

  constructor( private sio: SocketioService , public ms: MessageHttpService, public us: UserHttpService, private router: Router ) { }

  ngOnInit() {
    this.get_messages();
    this.sio.connect().subscribe( (m) => {
      this.get_messages();
    });
  }

  public get_messages() {
    this.ms.get_messages().subscribe(
      ( chat ) => {
        this.chat = chat;
      } , (err) => {
        // We need to login again
        this.logout();
      }
    );
  }

  logout() {
    this.us.logout();
    this.router.navigate(['/']);
  }

}
