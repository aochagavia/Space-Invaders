import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register-player',
  templateUrl: './register-player.component.html',
  styleUrls: ['./register-player.component.css']
})
export class RegisterPlayerComponent implements OnInit {
  nickname = '';

  constructor(private httpClient: HttpClient) { }

  ngOnInit() {
  }

  registerPlayer(event: any) {
    event.preventDefault();
    this.httpClient.post('http://localhost:4444/new-player', { nickname: this.nickname }).subscribe();
  }

}
