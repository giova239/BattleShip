import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Game } from '../Game';
import { SocketioService } from '../socketio.service';
import { UserHttpService } from '../user-http.service';
import { GameHttpService } from '../game-http.service';

//TODO: surrender button, chat, expire game or leave surrender, time management, show player turn

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
  @ViewChild("board1")
  private board1Ref: ElementRef<HTMLElement>;
  @ViewChild("board2")
  private board2Ref: ElementRef<HTMLElement>;
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
  public targeted;
  public gameWinner;
  public isPositioningPhaseConcluded = false;
  private sub: Subscription;
  private gameSocket: Subscription;
  private draggingElem;
  private dragSize;
  private dragCoordinates;
  private dragImage;

  constructor(private router: Router, private route: ActivatedRoute, private sio: SocketioService, public us: UserHttpService, public gs: GameHttpService) { }

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
      isUser2Connected : false,
      isUser1Turn : false
    }

    this.sub = this.route.params.subscribe(params => {

      this.gameID = params['gameID'];

      this.gs.get_game(this.gameID).subscribe(game => {

        this.game = game

        if(this.us.get_id() == this.game.user1){
          this.game.board1.forEach(r => {
            r.forEach(c => {
              if(c) this.isGameStarted = true;
            })
          })
          this.game.board2.forEach(r => {
            r.forEach(c => {
              if(c) this.isPositioningPhaseConcluded = true;
            })
          })
        }else if(this.us.get_id() == this.game.user2){
          this.game.board2.forEach(r => {
            r.forEach(c => {
              if(c) this.isGameStarted = true;
            })
          })
          this.game.board1.forEach(r => {
            r.forEach(c => {
              if(c) this.isPositioningPhaseConcluded = true;
            })
          })
        }else{
          this.isGameStarted = true;
          this.isPositioningPhaseConcluded = true;
        }

        this.gameSocket = this.sio.connect(this.gameID).subscribe( m => {
    
          if(m && m.event && m.event == "move"){
            
            this.game.moves.push(m.content);
            if((this.us.get_id() == this.game.user1 && !this.game.isUser1Turn) || (this.us.get_id() == this.game.user2 && this.game.isUser1Turn)){
              var cell = this.board1Ref.nativeElement.children[((Number(m.content.substring(1))-1)*10) + m.content.charCodeAt(0)-65];
              if(cell.classList.contains("occupied")){
                cell.classList.add("hitted")
              }else{
                cell.classList.add("missed")
              }
            }
            this.game.isUser1Turn = !this.game.isUser1Turn;

          }else if(m && m.event && m.event == "user1ConnenctionUpdate"){
    
            if(m.content != null && typeof m.content == "boolean"){
              this.game.isUser1Connected = m.content;
            }
            
          }else if(m && m.event && m.event == "user2ConnenctionUpdate"){
    
            if(m.content != null && typeof m.content == "boolean"){
              this.game.isUser2Connected = m.content;
            }

          }else if(m && m.event && m.event == "board1Update"){

            if(m.content != null){
              this.game.board1 = m.content;
              if(this.us.get_id() == this.game.user2){
                this.isPositioningPhaseConcluded = true;
              }
            }

          }else if(m && m.event && m.event == "board2Update"){

            if(m.content != null){
              this.game.board2 = m.content;
              if(this.us.get_id() == this.game.user1){
                this.isPositioningPhaseConcluded = true;
              }
            }

          }else if(m && m.event && m.event == "win"){
    
            if(this.game.isUser1Turn){
              this.us.get_user_by_id(this.game.user2).subscribe(u => {
                this.gameWinner = u;
              })
            }else{
              this.us.get_user_by_id(this.game.user1).subscribe(u => {
                this.gameWinner = u;
              })
            }

          }
        });

        setTimeout(()=>this.updateUserConnection(true), 500);
        setTimeout(()=>this.loadMoves(), 500);

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
        this.draggingElem.style.left= "0px";
        this.draggingElem.style.top = "0px";
        this.draggingElem.style.position="static";
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
      this.draggingElem.style.position="absolute";
      this.draggingElem.style.left= (rec.left - offset.left) + "px";
      this.draggingElem.style.top = (rec.top - offset.top) + "px";
    }
  }

  submitPosition(){
    let ammount = 0;
    this.positioningBoard.forEach(row => row.forEach(col => {if(col) ammount++}))
    if(ammount == 32){
      var currentUserID = this.us.get_id();
      if(currentUserID == this.game.user1){
        this.gs.put_game(this.gameID, {board1 : this.positioningBoard}).subscribe(g => this.game = g)
      }else if(currentUserID == this.game.user2){
        this.gs.put_game(this.gameID, {board2 : this.positioningBoard}).subscribe(g => this.game = g)
      }
      this.isGameStarted = true;
    }
    console.log(this.game.board1);
    console.log(this.game.board2);
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

    if(cells[cells.length-1].x >= this.positioningBoard.length || cells[cells.length-1].y >= this.positioningBoard.length || cells[0].x < 0 || cells[0].y < 0){
      return false;
    }
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

    this.positioningBoard = new Array(10).fill(false).map(() => new Array(10).fill(false));

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

    ships.forEach((element, index) => {
      let guard = false;
      let randomCell;
      let rotation;
      let occupiedCells;
      let size;
      let counter = 0;

      while(!guard && counter<100 && openCells.size > 1){
        rotation = Math.floor(Math.random() * 2);
        let randomMapEntry = (Array.from(openCells.keys()))[Math.floor(Math.random() * openCells.size)];
        randomCell = document.getElementById(""+randomMapEntry);
        let shipType = element.classList[0];
        size = 0;
        if(shipType == "destroyer"){
          size = 2;
        }else if(shipType == "cruiser"){
          size = 3;
        }else if(shipType == "battleship"){
          size = 4;
        }else if(shipType == "carrier"){
          size = 5;
        }
        occupiedCells = [];
        if(rotation == 1){
          for(let i = 0; i < size; i++){
            occupiedCells.push({x: Number(randomMapEntry[1]), y: Number(randomMapEntry[0])+i})
          }
        }else{
          for(let i = 0; i < size; i++){
            occupiedCells.push({x: Number(randomMapEntry[1])+i, y: Number(randomMapEntry[0])})
          }
        }
        guard = this.checkPlacement(occupiedCells);
        counter++;
      }

      if(guard){
        occupiedCells.forEach(e => {
          this.positioningBoard[e.y][e.x] = true;
        })
        if(size == 2){
          this.ships.destroyers.cells[index-this.ships.cruisers.cells.length-this.ships.battleships.cells.length-this.ships.carrier.cells.length] = occupiedCells;
        }else if (size == 3){
          this.ships.cruisers.cells[index-this.ships.battleships.cells.length-this.ships.carrier.cells.length] = occupiedCells;
        }else if(size == 4){
          this.ships.battleships.cells[index-this.ships.carrier.cells.length] = occupiedCells;
        }else if(size == 5){
          this.ships.carrier.cells[index] = occupiedCells;
        }
        var from = {x: (occupiedCells[0].x)-1, y: (occupiedCells[0].y)-1};
        var to = {x: (occupiedCells[occupiedCells.length-1].x)+1, y: (occupiedCells[occupiedCells.length-1].y)+1};
        if(from.x < 0) from.x = 0
        if(from.y < 0) from.y = 0
        if(to.x > this.positioningBoard.length-1) to.x = this.positioningBoard.length-1
        if(to.y > this.positioningBoard.length-1) to.y = this.positioningBoard.length-1
        for(let i = from.y; i <= to.y; i++){
          for(let j = from.x; j <= to.x; j++){
            openCells.delete(i.toString()+j.toString())
          }
        }
        let rec = randomCell.getBoundingClientRect();
        let offset = document.getElementById("hotbar").getBoundingClientRect();
        element.style.position="absolute";
        element.style.left=(rec.left - offset.left)+"px";
        element.style.top=(rec.top - offset.top)+"px";
        if(rotation){
          element.classList.add("rotated")
        }else{
          element.classList.remove("rotated")
        }
      }else{
        this.randomizePosition();
      }
    });
  }

  targetCell(event){
    if((this.us.get_id() == this.game.user1 && this.game.isUser1Turn) || (this.us.get_id() == this.game.user2 && !this.game.isUser1Turn)){
      if(event.target.classList.contains("targeted")){
        event.target.classList.remove("targeted");
        this.targeted = null;
      }else if(!event.target.classList.contains("hitted") && !event.target.classList.contains("missed")){
        if(this.targeted) this.targeted.classList.remove("targeted")
        event.target.classList.add("targeted")
        this.targeted = event.target;
      }
    }
  }

  fire(){
    if(this.targeted){
      var move = this.targeted.innerText
      this.gs.fire(this.gameID, move).subscribe(hitted => {
        this.targeted.classList.remove("targeted")
        if(hitted){
          this.targeted.classList.add("hitted")
          this.isSunk(move)
        }else{
          this.targeted.classList.add("missed")
        }
        this.targeted = null;
      })
    }
  }

  private loadMoves(){

    if(this.game.moves.length>0){
          
      var alternate;

      if(this.us.get_id() == this.game.user1){
        alternate = this.game.isUser1Turn;
      }else if(this.us.get_id() == this.game.user2){
        alternate = !this.game.isUser1Turn;
      }
      
      if(alternate != null){
        this.game.moves.slice().reverse().forEach(m => {
          var cell;
          var hitted;
          var x = m.charCodeAt(0)-65;
          var y = Number(m.substring(1))-1;
          if(alternate){
            cell = this.board1Ref.nativeElement.children[(y*10) + x];
            if(this.us.get_id() == this.game.user1){
              hitted = this.game.board1[y][x];
            }else{
              hitted = this.game.board2[y][x];
            }
          }else{
            cell = this.board2Ref.nativeElement.children[(y*12) + x];
            if(this.us.get_id() == this.game.user1){
              hitted = this.game.board2[y][x];
            }else{
              hitted = this.game.board1[y][x];
            }
            if(hitted){
              this.isSunk(m)
            }
          }
          if(hitted){
            cell.classList.add("hitted")
          }else{
            cell.classList.add("missed")
          }
          alternate = !alternate;
        })
      }
    }
  }

  private isSunk(move){
    var playerRest;
    if((this.game.isUser1Turn && this.us.get_id() == this.game.user1) || (!this.game.isUser1Turn && this.us.get_id() == this.game.user2)){
      playerRest = 1;
    }else{
      playerRest = 0;
    }
    var sunk = true
    var x = move.charCodeAt(0)-65;
    var y = Number(move.substring(1))-1;
    var b = this.us.get_id() == this.game.user1 ? this.game.board2 : this.game.board1
    var allCells = [move];
    while(b[y+1] && b[y+1][x] && sunk){
      let found = false;
      let cellName = move[0] + (y+2).toString();
      this.game.moves.forEach((m, index) => {
        if(!found && (((this.game.moves.length-(index+1))%2) == playerRest)){
          if(m == cellName){
            found = true;
          }
        }
      })
      if(found){
        allCells.push(cellName);
        y++;
      }else{
        sunk = false;
      }
    }
    y = Number(move.substring(1))-1;
    while(b[y-1] && b[y-1][x] && sunk){
      let found = false;
      let cellName = move[0] + (y).toString();
      this.game.moves.forEach((m, index) => {
        if(!found && (((this.game.moves.length-(index+1))%2) == playerRest)){
          if(m == cellName){
            found = true;
          }
        }
      })
      if(found){
        allCells.push(cellName);
        y--;
      }else{
        sunk = false;
      }
    }
    y = Number(move.substring(1))-1;
    while(b[y] && b[y][x+1] && sunk){
      let found = false;
      let cellName = String.fromCharCode(66+x) + move.substring(1);
      this.game.moves.forEach((m, index) => {
        if(!found && (((this.game.moves.length-(index+1))%2) == playerRest)){
          if(m == cellName){
            found = true;
          }
        }
      })
      if(found){
        allCells.push(cellName);
        x++;
      }else{
        sunk = false;
      }
    }
    x = move.charCodeAt(0)-65;
    while(b[y] && b[y][x-1] && sunk){
      let found = false;
      let cellName = String.fromCharCode(64+x) + move.substring(1);
      this.game.moves.forEach((m, index) => {
        if(!found && (((this.game.moves.length-(index+1))%2) == playerRest)){
          if(m == cellName){
            found = true;
          }
        }
      })
      if(found){
        allCells.push(cellName);
        x--;
      }else{
        sunk = false;
      }
    }
    x = move.charCodeAt(0)-65;
    if(sunk){
      allCells.forEach(m => {
        var col = m.charCodeAt(0)-65;
        var row = Number(m.substring(1))-1;
        var cell = this.board2Ref.nativeElement.children[(row*12) + col];
        cell.classList.add("occupied")
      })
    }
    return sunk
  }

  navigateHome(){
    this.router.navigate(["/home/"])
  }
}
