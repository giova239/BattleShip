import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserHttpService } from './user-http.service';
import * as io from 'socket.io-client';

@Injectable()
export class SocketioService {

  private socket: SocketIOClient.Socket;
  constructor( private us: UserHttpService ) { }

  connect(roomID: string): Observable< any > {

    this.socket = io(this.us.url);
    this.socket.emit("join-room", roomID);

    return new Observable( (observer) => {

      // The observer object must have two functions: next and error.
      // the first is invoked by our observable when new data is available. The
      // second is invoked if an error occurred

      this.socket.on('newMessage', message => {
        console.log('Socket.io event: newMessage');
        observer.next( message );
      });

      this.socket.on('newFriendRequest', message => {
        console.log('Socket.io event: newFriendRequest');
        observer.next( message );
      });

      this.socket.on('error', (err) => {
        console.log('Socket.io error: ' + err);
        observer.error( err );
      });

      // When the consumer unsubscribes, clean up data ready for next subscription.
      return { unsubscribe: () => this.socket.disconnect()};
    });

  }

}
