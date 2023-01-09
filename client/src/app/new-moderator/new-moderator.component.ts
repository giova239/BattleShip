import { Component, OnInit } from '@angular/core';
import { UserHttpService } from '../user-http.service';

@Component({
  selector: 'app-new-moderator',
  templateUrl: './new-moderator.component.html',
  styleUrls: ['./new-moderator.component.css']
})
export class NewModeratorComponent implements OnInit {

  public errmessage = undefined;
  public vldmessage = undefined;
  public user = {field1: '', field2: ''};

  constructor(public us: UserHttpService) { }

  ngOnInit(): void {}

  createNewModerator(){
    this.us.newModerator( {username: this.user.field1, password: this.user.field2} ).subscribe( (d) => {
      console.log('Registration ok: ' + JSON.stringify(d) );
      this.vldmessage = "USER CREATED";
      this.user.field1 = '';
      this.user.field2 = '';
    }, (err) => {
      console.log('Signup error: ' + JSON.stringify(err.error.errormessage) );
      this.errmessage = err.error.errormessage || err.error.message;
    });
  }

}