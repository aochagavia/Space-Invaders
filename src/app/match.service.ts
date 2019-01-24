import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Player } from 'server/src/player.model';

@Injectable({
  providedIn: 'root'
})
export class MatchService {

  constructor(private socket: Socket, private httpClient: HttpClient) { }

  matches(): Observable<Player[]> {
    return this.socket.fromEvent('match-start');
  }

  registerMatchServer() {
    this.socket.emit('registerMatchServer');
  }

  sendMatchResult(players: Player[]) {
    this.httpClient.post('http://localhost:4444/match-finished', { players }).subscribe();
  }
}
