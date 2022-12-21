import { Component, OnInit } from '@angular/core';
import { UserHttpService } from '../user-http.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor( private router: Router, public us: UserHttpService ) { }

  ngOnInit(): void {
    
  }

  public logout() {
    this.us.logout();
    this.router.navigate(['/login']);
  }

}
