import { Component, OnInit } from '@angular/core';
import { UserHttpService } from '../user-http.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {

  constructor( private router: Router, public us: UserHttpService ) { }

  public isMatchmakingActive = false;

  ngOnInit(): void {
    
  }

  public toggleMatchmaking(){
    this.isMatchmakingActive = ! this.isMatchmakingActive;
  }

}
