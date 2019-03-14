import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { MatchService } from '../match.service';
import { Subject, ReplaySubject, combineLatest, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SocketHealthService } from '../socket-health.service';
import { Player } from 'shared/lib/player.model';

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
  demoPlaying = false;

  constructor(private matchService: MatchService, private socketHealthService: SocketHealthService) { }

  ngOnInit() {
    combineLatest(this.matchService.matches(), this.scriptLoaded$).pipe(
      takeUntil(this.destroyed$),
    ).subscribe(([players, _]) => {
      this.demoPlaying = false;
      this.playing = true;

      // @ts-ignore window method in game JS
      start(players[0], players[1], players[2], players[3]);
    });

    this.scheduleDemoPlay();

    this.socketHealthService.connected().pipe(takeUntil(this.destroyed$)).subscribe(connected => {
      if (connected) {
        this.serverOnline = true;
        this.matchService.registerMatchServer();
      } else {
        this.serverOnline = false;
      }
    });
  }

  scheduleDemoPlay() {
    // Start a demo play after some seconds of inactivity
    timer(15_000).pipe(takeUntil(this.destroyed$)).subscribe(() => {
      if (!this.playing) {
        this.demoPlaying = true;

        const p1: Partial<Player> = {
          nickname: 'Demo Player 1',
          settings_DEFENSE_THICKNESS: 2,
          settings_DODGE_CHANCE: 2,
          settings_DEFENSE_WIDTH: 2,
          settings_FIREPOWER: 4,
          settings_SHIELDS: 0,
        };

        const p2: Partial<Player> = {
          nickname: 'Demo Player 2',
          settings_DEFENSE_THICKNESS: 2,
          settings_DODGE_CHANCE: 2,
          settings_DEFENSE_WIDTH: 2,
          settings_FIREPOWER: 4,
          settings_SHIELDS: 0,
        };

        const p3: Partial<Player> = {
          nickname: 'Demo Player 3',
          settings_DEFENSE_THICKNESS: 2,
          settings_DODGE_CHANCE: 2,
          settings_DEFENSE_WIDTH: 2,
          settings_FIREPOWER: 4,
          settings_SHIELDS: 0,
        };

        const p4: Partial<Player> = {
          nickname: 'Demo Player 4',
          settings_DEFENSE_THICKNESS: 2,
          settings_DODGE_CHANCE: 2,
          settings_DEFENSE_WIDTH: 2,
          settings_FIREPOWER: 4,
          settings_SHIELDS: 0,
        };

        // @ts-ignore window method in game JS
        start(p1, p2, p3, p4);
      }
    });
  }

  ngOnDestroy() {
    this.destroyed$.next();
  }

  ngAfterViewInit() {
    document.body.style.overflow = 'hidden';

    const pixi = this.addScript('./assets/game/pixi.js');
    pixi.addEventListener('load', () => {
      const game = this.addScript('./assets/game/bundle.js');
      game.addEventListener('load', () => {
        this.scriptLoaded$.next();
      });
    });
    window['sendMatchResult'] = result => {
      if (this.demoPlaying) {
        // Ignore the result, since it was just a demo round
      } else {
        this.matchService.sendMatchResult(result);
      }

      this.playing = false;
      this.demoPlaying = false;
      this.scheduleDemoPlay();
    };
  }

  private addScript(src: string): Element {
    const s = document.createElement('script');
    s.type = 'text/javascript';
    s.src = src;
    document.body.appendChild(s);
    return s;
  }
}
