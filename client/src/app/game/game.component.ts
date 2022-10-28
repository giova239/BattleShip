import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Game } from '../Game';
import { SocketioService } from '../socketio.service';
import { UserHttpService } from '../user-http.service';
import { GameHttpService } from '../game-http.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  public stringRef: StringConstructor = String;
  public gameID: string;
  public game: Game;
  private sub: Subscription;
  private gameSocket: Subscription;

  constructor(private route: ActivatedRoute, private sio: SocketioService, public us: UserHttpService, public gs: GameHttpService) { }

  ngOnInit(): void {


    this.sub = this.route.params.subscribe(params => {

      this.gameID = params['gameID'];

      this.gs.get_game(this.gameID).subscribe(game => {

        this.game = game

        this.gameSocket = this.sio.connect(this.gameID).subscribe( m => {

          console.log(m);
    
          if(m && m.event && m.event == "move"){
    
          }else if(m && m.event && m.event == "user1ConnenctionUpdate"){
    
            if(m.content != null && typeof m.content == "boolean"){
                this.game.isUser1Connected = m.content;
            }
            
          }else if(m && m.event && m.event == "user2ConnenctionUpdate"){
    
            if(m.content != null && typeof m.content == "boolean"){
              this.game.isUser2Connected = m.content;
          }

          }
          
        });

        this.updateUserConnection(true);

      });

    });

  }

  ngOn

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.gameSocket.unsubscribe();
    this.updateUserConnection(false);
  }

  private updateUserConnection(status: boolean){
    var currentUserID = this.us.get_id();
    if(currentUserID == this.game.user1){
      this.gs.put_game(this.gameID, {isUser1Connected: status}).subscribe()
    }else if(currentUserID == this.game.user2){
      this.gs.put_game(this.gameID, {isUser2Connected: status}).subscribe()
    }
  }

}
