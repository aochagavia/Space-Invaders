import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';
import { Dashboard } from 'server/src/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private socket: Socket) { }

  dashboard(): Observable<Dashboard> {
    return this.socket.fromEvent('dashboard');
  }
}
