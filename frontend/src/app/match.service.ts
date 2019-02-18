import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';
import { Player } from 'shared/lib/player.model';

@Injectable({
  providedIn: 'root'
})
export class MatchService {

  constructor(private socket: Socket) { }

  matches(): Observable<Player[]> {
    return this.socket.fromEvent('match-start');
  }

  registerMatchServer() {
    // TODO: get this from the environment instead of hardcoding it
    const apiKey = 'superSecureKeyNoOneWillEverGuess!';
    this.socket.emit('registerMatchServer', apiKey);
  }

  sendMatchResult(players: Player[]) {
    this.socket.emit('matchFinished', players);
  }
}
