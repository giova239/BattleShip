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

      //FRIENDLIST SOCKETS

      this.socket.on('newFriendRequest', message => {
        observer.next( {event : "newFriendRequest", content : message} );
      });

      this.socket.on('newUnreadMessage', message => {
        observer.next( {event : "newUnreadMessage", content : message} );
      });

      //CHAT SOCKETS

      this.socket.on('newMessage', message => {
        observer.next( {event : "newMessage", content : message} );
      });

      this.socket.on('readMessage', message => {
        observer.next( {event : "readMessage", content : message} );
      });

      //GAME SOCKETS

      this.socket.on('matchFound', message => {
        observer.next( {event : "matchFound", content : message} );
      });

      this.socket.on('challenged', message => {
        observer.next( {event : "challenged", content : message} );
      });

      this.socket.on('user1ConnenctionUpdate', message => {
        observer.next( {event : "user1ConnenctionUpdate", content : message} );
      });

      this.socket.on('user2ConnenctionUpdate', message => {
        observer.next( {event : "user2ConnenctionUpdate", content : message} );
      });

      this.socket.on('board1Update', message => {
        observer.next( {event : "board1Update", content : message} );
      });

      this.socket.on('board2Update', message => {
        observer.next( {event : "board2Update", content : message} );
      });

      this.socket.on('move', message => {
        observer.next( {event : "move", content : message} );
      });

      this.socket.on('win', message => {
        observer.next( {event : "win", content : message} );
      });

      //ERROR

      this.socket.on('error', (err) => {
        observer.error( err );
      });

      // When the consumer unsubscribes, clean up data ready for next subscription.
      return { unsubscribe: () => this.socket.disconnect()};
    });

  }

}
