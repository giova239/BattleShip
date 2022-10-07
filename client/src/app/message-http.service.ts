import { Injectable } from '@angular/core';
import { Chat } from './Chat';
import { Observable } from 'rxjs';
import { throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { UserHttpService } from './user-http.service';


@Injectable()
export class MessageHttpService {

  private messages = [];

  constructor( private http: HttpClient, private us: UserHttpService ) {
    console.log('Message service instantiated');
    console.log('User service token: ' + us.get_token() );
   }


  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(
        `Backend returned code ${error.status}, ` +
        'body was: ' + JSON.stringify(error.error));
    }
    return throwError('Something bad happened; please try again later.');
  }

  private create_options( params = {} ) {
    return  {
      headers: new HttpHeaders({
        authorization: 'Bearer ' + this.us.get_token(),
        'cache-control': 'no-cache',
        'Content-Type':  'application/json',
      }),
      params: new HttpParams( {fromObject: params} )
    };
  }

  get_messages(): Observable<Chat> {
    return this.http.get<Chat>( this.us.url + '/chat/633af81678b4d7050836c7c0', this.create_options() ).pipe(
        tap( (data) => console.log(JSON.stringify(data))) ,
        catchError( this.handleError )
      );
  }

  post_message( m: string ): Observable<Chat> {
    console.log('Posting ' + JSON.stringify(m) );
    return this.http.post<Chat>( this.us.url + '/chat/633af81678b4d7050836c7c0', {text: m},  this.create_options() ).pipe(
      catchError(this.handleError)
    );
  }

}
