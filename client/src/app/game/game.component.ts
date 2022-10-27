import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Game } from '../Game';
import { SocketioService } from '../socketio.service';
import { GameHttpService } from '../game-http.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  public gameID: string;
  public game: Game;
  private sub: Subscription;
  private gameSocket: Subscription;

  constructor(private route: ActivatedRoute, private sio: SocketioService, public gs: GameHttpService) { }

  ngOnInit(): void {

    this.sub = this.route.params.subscribe(params => {

      this.gameID = params['gameID'];

      this.gs.get_game(this.gameID).subscribe(game => {

        this.game = game

        this.gameSocket = this.sio.connect(this.gameID).subscribe( m => {

          console.log(m);
    
          if(m && m.event && m.event == "move"){
    
          }else if(m && m.event && m.event == "userConnected"){
    
            if(m.content){
              if(m.content == this.game.user1){
                this.game.isUser1Connected = true;
              }else if(m.content == this.game.user2){
                this.game.isUser2Connected = true;
              }
            }
            
          }else if(m && m.event && m.event == "userDisconnected"){
    
          }
          
        });

      });

    });

  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.gameSocket.unsubscribe();
  }

}
