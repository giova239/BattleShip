import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserHttpService } from '../user-http.service';
import { SocketioService } from '../socketio.service';
import { GameHttpService } from '../game-http.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {

  constructor( private router: Router, private sio: SocketioService, public us: UserHttpService, public gs: GameHttpService ) { }

  public isMatchmakingActive = false;
  public matchMakingSocket;

  ngOnInit(): void {
    
    this.matchMakingSocket = this.sio.connect(this.us.get_id()).subscribe( m => {

      if(m && m.event && m.event == "matchFound"){
        
        this.router.navigate(['/game/', m.content._id]);

      }

    });

  }

  public toggleMatchmaking(){
    this.gs.matchmaking().subscribe(res => {
      this.isMatchmakingActive = ! this.isMatchmakingActive;
    })
  }

}
