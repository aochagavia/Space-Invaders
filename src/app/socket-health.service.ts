import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketHealthService {
  private connected$ = new Subject<boolean>();

  constructor(socket: Socket) {
    socket.on('connect', () => {
      this.connected$.next(true);
    });

    socket.on('disconnect', () => {
      this.connected$.next(false);
    });
  }

  connected(): Observable<boolean> {
    return this.connected$.asObservable();
  }
}
