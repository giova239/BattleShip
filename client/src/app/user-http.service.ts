import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import * as jwtdecode from 'jwt-decode';



interface TokenData {
  username:string,
  mail:string,
  roles:string[],
  id:string
}

@Injectable()
export class UserHttpService {

  private token = '';
  public url = 'http://localhost:8080';

  constructor( private http: HttpClient, private router: Router ) {
    console.log('User service instantiated');
    
    this.token = localStorage.getItem('postmessages_token');
    if ( !this.token || this.token.length < 1 ) {
      console.log("No token found in local storage");
      this.token = ""
    } else {
      console.log("JWT loaded from local storage.")
    }
  }

  private create_options( params = {} ) {
    return  {
      headers: new HttpHeaders({
        authorization: 'Bearer ' + this.get_token(),
        'cache-control': 'no-cache',
        'Content-Type':  'application/json',
      }),
      params: new HttpParams( {fromObject: params} )
    };
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
      return throwError(error.error.message);
    } else {
      console.error(
        `Backend returned code ${error.status}, ` +
        'body was: ' + JSON.stringify(error.error));
        return throwError(error.error.errormessage);
    }
  }

  login( mail: string, password: string, remember: boolean ): Observable<any> {
    const options = {
      headers: new HttpHeaders({
        authorization: 'Basic ' + btoa( mail + ':' + password),
        'cache-control': 'no-cache',
        'Content-Type':  'application/x-www-form-urlencoded',
      })
    };

    return this.http.get( this.url + '/login',  options, ).pipe(
      tap( (data) => {
        console.log(JSON.stringify(data));
        this.token = data.token;
        if ( remember ) {
          localStorage.setItem('postmessages_token', this.token );
        }
      }));
  }

  logout() {
    console.log('Logging out');
    this.token = '';
    localStorage.setItem('postmessages_token', this.token);
    this.router.navigate(['/']);
  }

  register( user ): Observable<any> {
    const options = {
      headers: new HttpHeaders({
        'cache-control': 'no-cache',
        'Content-Type':  'application/json',
      })
    };

    return this.http.post( this.url + '/register', user, options ).pipe(
      tap( (data) => {
        console.log(JSON.stringify(data) );
      })
    );

  }

  newModerator( user ): Observable<any> {
    return this.http.post( this.url + '/users', user, this.create_options() ).pipe(
      tap( (data) => {
        console.log(JSON.stringify(data) );
      })
    );
  }

  get_token() {
    return this.token;
  }

  get_username() {
    return (jwtdecode(this.token) as TokenData).username;
  }

  get_mail() {
    return (jwtdecode(this.token) as TokenData).mail;
  }

  get_id() {
    return (jwtdecode(this.token) as TokenData).id;
  }

  is_admin(): boolean {
    const roles = (jwtdecode(this.token) as TokenData).roles;
    for ( let idx = 0; idx < roles.length; ++idx ) {
      if ( roles[idx] === 'ADMIN' ) {
        return true;
      }
    }
    return false;
  }

  is_moderator(): boolean {
    const roles = (jwtdecode(this.token) as TokenData).roles;
    for ( let idx = 0; idx < roles.length; ++idx ) {
      if ( roles[idx] === 'MODERATOR' ) {
        return true;
      }
    }
    return false;
  }

  get_friends(){
    return this.http.get<JSON>( this.url + '/friends',  this.create_options() ).pipe(
      tap( (data) => console.log(JSON.stringify(data))) ,
      catchError(this.handleError)
    );
  }

  post_friends(id : string){
    console.log(id);
    return this.http.post<JSON>( this.url + '/friends', {friendID: id},  this.create_options() ).pipe(
      tap( (data) => console.log(JSON.stringify(data))) ,
      catchError(this.handleError)
    );
  }

  get_friend_requests(){
    return this.http.get<JSON>( this.url + '/pendingRequests',  this.create_options() ).pipe(
      tap( (data) => console.log(JSON.stringify(data))) ,
      catchError(this.handleError)
    );
  }

  delete_friend_requests(id : string){
    return this.http.delete<JSON>( this.url + '/pendingRequests/' + id, this.create_options() ).pipe(
      tap( (data) => console.log(JSON.stringify(data))) ,
      catchError(this.handleError)
    );
  }

  get_unread_messages(id : string){
    return this.http.get<JSON>( this.url + '/unreadMessages/' + id,  this.create_options() ).pipe(
      tap( (data) => console.log(JSON.stringify(data))) ,
      catchError(this.handleError)
    );
  }

  get_user_by_id(id: string){
    return this.http.get<JSON>( this.url + '/users/' + id,  this.create_options() ).pipe(
      tap( (data) => console.log(JSON.stringify(data))) ,
      catchError(this.handleError)
    );
  }

  delete_user(id : string){
    return this.http.delete<JSON>( this.url + '/users/' + id, this.create_options() ).pipe(
      tap( (data) => console.log(JSON.stringify(data))) ,
      catchError(this.handleError)
    );
  }
}
