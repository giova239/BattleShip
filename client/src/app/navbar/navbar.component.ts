import { Component, OnInit } from '@angular/core';
import { UserHttpService } from '../user-http.service';
import { Router } from '@angular/router';
import { Popover, Toast } from 'bootstrap';
import { SocketioService } from '../socketio.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  public challengeSocket
  public incomingChallenge;
  public userID;

  constructor( private sio: SocketioService, private router: Router, public us: UserHttpService ) { }

  ngOnInit(): void {
    this.userID = this.us.get_id();
    let toast = new Toast(document.querySelector('.toast'), {autohide: false});
    [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]')).map(popoverTriggerEl => new Popover(popoverTriggerEl));
    this.challengeSocket = this.sio.connect(this.userID).subscribe( m => {

      if(m && m.event && m.event == "challenged"){
        this.incomingChallenge = m.content;
        toast.show();
      }
      
    });
  }

  public logout() {
    this.us.logout();
    this.router.navigate(['/login']);
  }

  public navigate_home(){
    this.router.navigate(['/home']);
  }

  accept_challenge(){
    this.router.navigate(['/game/', this.incomingChallenge.gameID]);
  }

}
