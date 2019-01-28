import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatchService } from '../match.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Player } from 'server/src/player.model';
import { SocketHealthService } from '../socket-health.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, OnDestroy {
  private destroyed$ = new Subject();
  player1: Player;
  player2: Player;

  serverOnline = false;

  constructor(private matchService: MatchService, private socketHealthService: SocketHealthService) { }

  ngOnInit() {
    this.matchService.matches().pipe(takeUntil(this.destroyed$)).subscribe(players => {
      // See PLAYERS_PER_MATCH in the server
      this.player1 = players[0];
      this.player2 = players[1];
    });

    this.socketHealthService.connected().pipe(takeUntil(this.destroyed$)).subscribe(connected => {
      if (connected) {
        this.serverOnline = true;
        this.matchService.registerMatchServer();
      } else {
        this.serverOnline = false;
      }
    });
  }

  ngOnDestroy() {
    this.destroyed$.next();
  }

  sendResults(event: any) {
    event.preventDefault();
    this.matchService.sendMatchResult([ this.player1, this.player2 ]);
    this.player1 = undefined;
    this.player2 = undefined;
  }

}
