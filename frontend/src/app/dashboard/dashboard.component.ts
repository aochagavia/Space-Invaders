import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DashboardService } from '../dashboard.service';
import { Player } from 'shared/lib/player.model';
import { SocketHealthService } from '../socket-health.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {

  private destroyed$ = new Subject();
  playingPlayers: Player[] = [];
  waitingPlayers: Player[] = [];
  finishedPlayers: Player[] = [];
  matchServerOnline = false;
  dashboardServerOnline = false;

  constructor(private dashboardService: DashboardService, private socketHealthService: SocketHealthService) { }

  ngOnInit() {
    this.dashboardService.dashboard().pipe(
      takeUntil(this.destroyed$),
    ).subscribe(dashboard => {
      this.waitingPlayers = dashboard.waiting;
      this.finishedPlayers = dashboard.leaderboard;
      this.playingPlayers = dashboard.playing;
      this.matchServerOnline = dashboard.matchServerOnline;
      this.dashboardServerOnline = true;
    });

    this.socketHealthService.connected().pipe(takeUntil(this.destroyed$)).subscribe(connected => {
      this.dashboardServerOnline = connected;
    });
  }

  ngOnDestroy() {
    this.destroyed$.next();
  }

  private winnerTexts = [
    'Winner Takes All',
    'The Champion',
    'Prime Target',
    'Nice View Up Here',
    'No. 1',
    'Lonely Here',
    'Master',
    'King',
    'Emperor',
    'Insanely Good'
  ]

  private runnerUpTexts = [
    'Almost There',
    'Best Of The Rest',
    'Almost Top',
    'Not Too Bad',
    'Eternal No. 2',
    'Just Missed It',
    'I Want Higher',
    'Starkiller',
    'Monster'
  ]

  private otherTexts = [
    'Way To Go',
    'Up!',
    'Made The List',
    'Not So Bad',
    'Got Them Aliens',
    'Pretty Good',
    'Dope',
    'Cool',
    'It\'s Something',
    'Loading...',
    'Not Yet Lost',
    'Look At Me',
    'Need Coffee',
    'Fire And Fury',
    'Good Shot',
    'Worth It',
    'Famous Now',
    'There We Go',
    'Still Awesome',
    'On The Dark Side',
    'Improving!',
    'Witty Joke Here',
    'Star Destroyer',
    'Prospering',
    'Living The Life',
    'Deploy The Fleet',
    'Solid',
    'Hyper',
    'Brutal',
    'Blaster',
    'Extreme',
    'Awesome',
    'Insane',
    'Beastly',
    'Guardian'
  ]

  private playerTexts: string[] = [];
  randomText(position: number) {
    if (this.playerTexts[position]) {
      return this.playerTexts[position];
    }

    if (position === 0) {
      this.playerTexts[position] = this.winnerTexts[Math.floor(Math.random() * this.winnerTexts.length)];
    } else if (position === 1) {
      this.playerTexts[position] = this.runnerUpTexts[Math.floor(Math.random() * this.runnerUpTexts.length)];
    } else {
      this.playerTexts[position] = this.otherTexts[Math.floor(Math.random() * this.otherTexts.length)];
    }

    return this.playerTexts[position];
  }

  leftPad2(num: number) {
    var s = "000000000" + num;
    return s.substr(s.length - 2);
  }

  getTime(seconds: number) {
    let fixedSeconds = parseInt(seconds.toFixed(0));
    let minutes = Math.floor(fixedSeconds / 60);
    let realSeconds = fixedSeconds - minutes * 60;
    return `${this.leftPad2(minutes)}:${this.leftPad2(realSeconds)}`
  }
}
