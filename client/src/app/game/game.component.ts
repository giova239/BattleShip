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
  public ships = {
    destroyers :
    {
      size: 2,
      ammount: 5,
      cells: [[],[],[],[],[]]
    },
    cruisers :
    {
      size: 3,
      ammount: 3,
      cells: [[],[],[]]
    },
    battleships :
    {
      size: 4,
      ammount: 2,
      cells: [[],[]]
    },
    carrier :
    {
      size: 5,
      ammount: 1,
      cells: [[]]
    }
  }
  private sub: Subscription;
  private gameSocket: Subscription;
  private draggingElem;
  private dragSize;
  private dragCoordinates;

  constructor(private route: ActivatedRoute, private sio: SocketioService, public us: UserHttpService, public gs: GameHttpService) { }

  ngOnInit(): void {

    this.game = {
      _id : "",
      user1 : "",
      user2 : "",
      board1 : [],
      board2 : [],
      moves : [],
      isUser1Connected : false,
      isUser2Connected : false
    }

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

        setTimeout(()=>this.updateUserConnection(true), 500); 

      });

    });

  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.gameSocket.unsubscribe();
    this.updateUserConnection(false);
  }

  onDragStart(e, size){
    this.draggingElem = e.target;
    this.dragSize = {x: size, y: 1};
    if(size == 2){
      this.ships.destroyers.cells[0].forEach(c => {
        this.game.board1[c.y][c.x] = false;
      });
      this.ships.destroyers.cells[0] = [];
    }else if (size == 3){
      this.ships.cruisers.cells[0].forEach(c => {
        this.game.board1[c.y][c.x] = false;
      });
      this.ships.cruisers.cells[0] = [];
    }else if(size == 4){
      this.ships.battleships.cells[0].forEach(c => {
        this.game.board1[c.y][c.x] = false;
      });
      this.ships.battleships.cells[0] = [];
    }else if(size == 5){
      this.ships.carrier.cells[0].forEach(c => {
        this.game.board1[c.y][c.x] = false;
      });
      this.ships.carrier.cells[0] = [];
    }
    //TODO: set cells to false when repositioning
  }

  onDragEnd(e){
    if(this.dragCoordinates && this.dragSize && this.dragCoordinates.x+this.dragSize.x<12 && this.dragCoordinates.y+this.dragSize.y<12){
      let occupiedCells = [];
      for(let i = 0; i < this.dragSize.y; i++){
        for(let j = 0; j < this.dragSize.x; j++){
          this.game.board1[this.dragCoordinates.y+i-1][this.dragCoordinates.x+j-1] = true;
          occupiedCells.push({x : this.dragCoordinates.x+j-1 ,y : this.dragCoordinates.y+i-1})
        }
      }
      if(this.dragSize.x == "2"){
        this.ships.destroyers.cells[0] = occupiedCells;
      }else if (this.dragSize.x == "3"){
        this.ships.cruisers.cells[0] = occupiedCells;
      }else if(this.dragSize.x == "4"){
        this.ships.battleships.cells[0] = occupiedCells;
      }else if(this.dragSize.x == "5"){
        this.ships.carrier.cells[0] = occupiedCells;
      }
    }
    this.draggingElem = null;
    this.dragSize = null;
    
  }

  onDragEnter(e){
    var rowCord = Number(e.target.style.gridRow.split(" ", 2)[0]);
    var colCord = Number(e.target.style.gridColumn.split(" ", 2)[0])-1;
    if(this.draggingElem && this.dragSize && colCord+this.dragSize.x<12 && rowCord+this.dragSize.y<12){
      this.dragCoordinates = {x: colCord, y: rowCord};
      var rec = e.target.getBoundingClientRect();
      var offset = document.getElementById("hotbar").getBoundingClientRect();
      this.draggingElem.style="position:absolute; left:"+ (rec.left - offset.left) +"px; top:"+ (rec.top - offset.top) +"px; width:";
    }
  }

  submitPosition(){
    var currentUserID = this.us.get_id();
    if(currentUserID == this.game.user1){
      this.gs.put_game(this.gameID, {board1 : this.game.board1}).subscribe(g => this.game = g)
    }else if(currentUserID == this.game.user2){
      this.gs.put_game(this.gameID, {board2 : this.game.board1}).subscribe(g => this.game = g)
    }
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
