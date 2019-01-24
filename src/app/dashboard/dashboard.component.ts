import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DashboardService } from '../dashboard.service';
import { Player } from 'server/src/player.model';

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

  constructor(private dashboardService: DashboardService) { }

  ngOnInit() {
    this.dashboardService.dashboard().pipe(takeUntil(this.destroyed$)).subscribe(dashboard => {
      this.waitingPlayers = dashboard.waiting;
      this.finishedPlayers = dashboard.leaderboard;
      this.playingPlayers = dashboard.playing;
      this.matchServerOnline = dashboard.matchServerOnline;
    });
  }

  ngOnDestroy() {
    this.destroyed$.next();
  }

}
