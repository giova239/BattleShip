import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserHttpService } from '../user-http.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  constructor(public us: UserHttpService, public route: ActivatedRoute) { }

  public userID;
  public user;

  ngOnInit(): void {

    this.route.params.subscribe(params => {

      this.userID = params['userID'];

      this.us.get_user_by_id(this.userID).subscribe(u => this.user = u)

    });

  }

}