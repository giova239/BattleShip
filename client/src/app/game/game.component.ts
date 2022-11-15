import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
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

  @ViewChild("ships")
  private shipsRef: ElementRef<HTMLElement>;
  @ViewChild("board")
  private boardRef: ElementRef<HTMLElement>;
  public stringRef: StringConstructor = String;
  public gameID: string;
  public game: Game;
  public isGameStarted: boolean = false;
  public ships = {
    destroyers :
    {
      size: 2,
      cells: [[],[],[],[],[]]
    },
    cruisers :
    {
      size: 3,
      cells: [[],[],[]]
    },
    battleships :
    {
      size: 4,
      cells: [[],[]]
    },
    carrier :
    {
      size: 5,
      cells: [[]]
    }
  }
  public positioningBoard: Boolean[][] = new Array(10).fill(false).map(() => new Array(10).fill(false));
  private sub: Subscription;
  private gameSocket: Subscription;
  private draggingElem;
  private dragSize;
  private dragCoordinates;
  private dragImage;

  constructor(private route: ActivatedRoute, private sio: SocketioService, public us: UserHttpService, public gs: GameHttpService) { }

  ngOnInit(): void {

    this.dragImage = document.createElement("img");   
    this.dragImage.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

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

  onDragStart(e, size, index){
    e.dataTransfer.setDragImage(this.dragImage, 0, 0);
    this.draggingElem = e.target;
    if(this.draggingElem.classList.contains("rotated")){
      this.dragSize = {x: 1, y: size};
    }else{
      this.dragSize = {x: size, y: 1};
    }
    if(size == 2){
      this.ships.destroyers.cells[index].forEach(c => {
        this.positioningBoard[c.y][c.x] = false;
      });
      this.ships.destroyers.cells[index] = [];
    }else if (size == 3){
      this.ships.cruisers.cells[index].forEach(c => {
        this.positioningBoard[c.y][c.x] = false;
      });
      this.ships.cruisers.cells[index] = [];
    }else if(size == 4){
      this.ships.battleships.cells[index].forEach(c => {
        this.positioningBoard[c.y][c.x] = false;
      });
      this.ships.battleships.cells[index] = [];
    }else if(size == 5){
      this.ships.carrier.cells[index].forEach(c => {
        this.positioningBoard[c.y][c.x] = false;
      });
      this.ships.carrier.cells[index] = [];
    }
  }

  onDragEnd(e, size, index){
    
    if(this.dragCoordinates && this.dragSize && this.dragCoordinates.x+this.dragSize.x<12 && this.dragCoordinates.y+this.dragSize.y<12){
      let occupiedCells = [];
      for(let i = 0; i < this.dragSize.y; i++){
        for(let j = 0; j < this.dragSize.x; j++){
          occupiedCells.push({x : this.dragCoordinates.x+j-1 ,y : this.dragCoordinates.y+i-1})
        }
      }

      if(this.checkPlacement(occupiedCells)){
        occupiedCells.forEach(e => {
          this.positioningBoard[e.y][e.x] = true;
        })
        if(size == 2){
          this.ships.destroyers.cells[index] = occupiedCells;
        }else if (size == 3){
          this.ships.cruisers.cells[index] = occupiedCells;
        }else if(size == 4){
          this.ships.battleships.cells[index] = occupiedCells;
        }else if(size == 5){
          this.ships.carrier.cells[index] = occupiedCells;
        }
      }else{
        this.draggingElem.classList.remove("rotated")
        this.draggingElem.style="";
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
      this.draggingElem.style="position:absolute; left:"+ (rec.left - offset.left) +"px; top:"+ (rec.top - offset.top) +"px;";
    }
  }

  submitPosition(){
    var currentUserID = this.us.get_id();
    if(currentUserID == this.game.user1){
      this.gs.put_game(this.gameID, {board1 : this.positioningBoard}).subscribe(g => this.game = g)
    }else if(currentUserID == this.game.user2){
      this.gs.put_game(this.gameID, {board2 : this.positioningBoard}).subscribe(g => this.game = g)
    }
    this.isGameStarted = true;
  }

  private updateUserConnection(status: boolean){
    var currentUserID = this.us.get_id();
    if(currentUserID == this.game.user1){
      this.gs.put_game(this.gameID, {isUser1Connected: status}).subscribe()
    }else if(currentUserID == this.game.user2){
      this.gs.put_game(this.gameID, {isUser2Connected: status}).subscribe()
    }
  }

  checkPlacement(cells){

    var from = {x: (cells[0].x)-1, y: (cells[0].y)-1};
    var to = {x: (cells[cells.length-1].x)+1, y: (cells[cells.length-1].y)+1};
    if(from.x < 0) from.x = 0
    if(from.y < 0) from.y = 0
    if(to.x > this.positioningBoard.length-1) to.x = this.positioningBoard.length-1
    if(to.y > this.positioningBoard.length-1) to.y = this.positioningBoard.length-1
    for(let i = from.y; i <= to.y; i++){
      for(let j = from.x; j <= to.x; j++){
        if(this.positioningBoard[i][j]){
          return false
        }
      }
    }
    return true;

  }

  rotateShip(e, size, index){

    var rotatedCells = [];
    var guard = true;
    var offset = 0;
    if(e.target.classList.contains("rotated")){
      offset = +1
    }else{
      offset = -1
    }
    
    if(size == 2 && this.ships.destroyers.cells[index].length>0){
      this.ships.destroyers.cells[index].forEach((c, i) => {
        if(c.x+(i*offset)>9 || c.y-(i*offset)>9) guard = false;
        rotatedCells.push({x: c.x+(i*offset), y: c.y-(i*offset)})
        this.positioningBoard[c.y][c.x] = false;
      });
    }else if (size == 3 && this.ships.cruisers.cells[index].length>0){
      this.ships.cruisers.cells[index].forEach((c, i) => {
        if(c.x+(i*offset)>9 || c.y-(i*offset)>9) guard = false;
        rotatedCells.push({x: c.x+(i*offset), y: c.y-(i*offset)})
        this.positioningBoard[c.y][c.x] = false;
      });
    }else if(size == 4 && this.ships.battleships.cells[index].length>0){
      this.ships.battleships.cells[index].forEach((c, i) => {
        if(c.x+(i*offset)>9 || c.y-(i*offset)>9) guard = false;
        rotatedCells.push({x: c.x+(i*offset), y: c.y-(i*offset)})
        this.positioningBoard[c.y][c.x] = false;
      });
    }else if(size == 5 && this.ships.carrier.cells[index].length>0){
      this.ships.carrier.cells[index].forEach((c, i) => {
        if(c.x+(i*offset)>9 || c.y-(i*offset)>9) guard = false;
        rotatedCells.push({x: c.x+(i*offset), y: c.y-(i*offset)})
        this.positioningBoard[c.y][c.x] = false;
      });
    }
    

    if(guard && rotatedCells.length>0 && this.checkPlacement(rotatedCells)){
      e.target.classList.toggle("rotated");
      if(size == 2){
        this.ships.destroyers.cells[index] = rotatedCells;
      }else if (size == 3){
        this.ships.cruisers.cells[index] = rotatedCells;
      }else if(size == 4){
        this.ships.battleships.cells[index] = rotatedCells;
      }else if(size == 5){
        this.ships.carrier.cells[index] = rotatedCells;
      }
    }

    if(size == 2){
      this.ships.destroyers.cells[index].forEach(c => {
        this.positioningBoard[c.y][c.x] = true;
      })
    }else if (size == 3){
      this.ships.cruisers.cells[index].forEach(c => {
        this.positioningBoard[c.y][c.x] = true;
      })
    }else if(size == 4){
      this.ships.battleships.cells[index].forEach(c => {
        this.positioningBoard[c.y][c.x] = true;
      })
    }else if(size == 5){
      this.ships.carrier.cells[index].forEach(c => {
        this.positioningBoard[c.y][c.x] = true;
      })
    }

  }

  randomizePosition(){

    let openCells = new Set<String>();

    for(let i = 0; i < 10; i++){
      for(let j = 0; j < 10; j++){
        openCells.add(i.toString() + j.toString())
      }
    }

    let ships = Array.from(this.shipsRef.nativeElement.children[3].children as HTMLCollectionOf<HTMLElement>).concat(
      Array.from(this.shipsRef.nativeElement.children[2].children as HTMLCollectionOf<HTMLElement>),
      Array.from(this.shipsRef.nativeElement.children[1].children as HTMLCollectionOf<HTMLElement>),
      Array.from(this.shipsRef.nativeElement.children[0].children as HTMLCollectionOf<HTMLElement>)
    );

    ships.forEach(element => {
      let rotation = Math.floor(Math.random() * 2);
      console.log("rotation: " + rotation);
      let randomMapEntry = (Array.from(openCells.keys()))[Math.floor(Math.random() * openCells.size)];
      console.log("randomEntry(" + openCells.size + "): " + randomMapEntry[0] + " / " + randomMapEntry[1]);
      let randomCell = document.getElementById(""+randomMapEntry);
      console.log(randomCell);
      let shipType = element.classList[0];
      let size = 0;
      if(shipType == "destroyer"){
        size = 2;
      }else if(shipType == "cruiser"){
        size = 3;
      }else if(shipType == "battleship"){
        size = 4;
      }else if(shipType == "carrier"){
        size = 5;
      }
      console.log("size: " + size);
      //TODO: calculate occupied cells
      let occupiedCells = [];
      //TODO: check if position was valid
      let rec = randomCell.getBoundingClientRect();
      let offset = document.getElementById("hotbar").getBoundingClientRect();
      element.style.position="absolute"
      element.style.left=(rec.left - offset.left)+"px";
      element.style.top=(rec.top - offset.top)+"px";
      if(rotation){
        element.classList.add("rotated")
      }else{
        element.classList.remove("rotated")
      }
      //TODO: remove occupiedcells from openCells and set true in positioningBoard
    });
    
  }

}
