import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DashboardService } from '../dashboard.service';
import { Player } from 'server/src/player.model';
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

}
