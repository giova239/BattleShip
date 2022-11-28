import { Injectable } from '@angular/core';
import { Game } from './Game';
import { Observable } from 'rxjs';
import { throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { UserHttpService } from './user-http.service';


@Injectable()
export class GameHttpService {

  constructor( private http: HttpClient, private us: UserHttpService ) {
    console.log('Game service instantiated');
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

  challenge(userID: string): Observable<Game> {
    return this.http.post<Game>( this.us.url + '/challenge/' + userID, {}, this.create_options() ).pipe(
      catchError(this.handleError)
    );
  }

  get_game(gameID: string): Observable<Game> {
    return this.http.get<Game>( this.us.url + '/game/' + gameID, this.create_options() ).pipe(
      catchError(this.handleError)
    );
  }

  put_game(gameID: string, body: Object): Observable<Game> {
    return this.http.put<Game>( this.us.url + '/game/' + gameID, body, this.create_options() ).pipe(
      catchError(this.handleError)
    );
  }

  fire(gameID: string, move: string): Observable<Game> {
    return this.http.post<Game>( this.us.url + '/fire/' + gameID + '/' + move, {}, this.create_options() ).pipe(
      catchError(this.handleError)
    );
  }

}
