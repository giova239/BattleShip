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

  ngOnInit(): void {
    
  }

  public logout() {
    this.us.logout();
    this.router.navigate(['/login']);
  }

}
