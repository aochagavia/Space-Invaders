import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { MatchService } from '../match.service';
import { Subject, ReplaySubject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SocketHealthService } from '../socket-health.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, OnDestroy, AfterViewInit {
  private scriptLoaded$ = new ReplaySubject(1);
  private destroyed$ = new Subject();

  serverOnline = false;
  playing = false;

  constructor(private matchService: MatchService, private socketHealthService: SocketHealthService) { }

  ngOnInit() {
    combineLatest(this.matchService.matches(), this.scriptLoaded$).pipe(
      takeUntil(this.destroyed$),
    ).subscribe(([players, _]) => {
      this.playing = true;
      console.log('Players:', players);
      // @ts-ignore window method in game JS
      start();

      // FIXME: we need to get notified when all the games finish, so we can post the results to the server
      // this.matchService.sendMatchResult(finishedPlayers);
      // this.playing = false;
    });

    this.socketHealthService.connected().pipe(takeUntil(this.destroyed$)).subscribe(connected => {
      if (connected) {
        this.serverOnline = true;
        this.matchService.registerMatchServer();
      } else {
        this.serverOnline = false;
        this.playing = false;
      }
    });
  }

  ngOnDestroy() {
    this.destroyed$.next();
  }

  ngAfterViewInit() {
    const pixi = this.addScript('./assets/game/pixi.js');
    pixi.addEventListener('load', () => {
      const game = this.addScript('./assets/game/bundle.js');
      game.addEventListener('load', () => {
        this.scriptLoaded$.next();
      });
    });
    window["sendMatchResult"] = this.matchService.sendMatchResult.bind(this.matchService);
  }

  private addScript(src: string): Element {
    const s = document.createElement('script');
    s.type = 'text/javascript';
    s.src = src;
    document.body.appendChild(s);
    return s;
  }
}
