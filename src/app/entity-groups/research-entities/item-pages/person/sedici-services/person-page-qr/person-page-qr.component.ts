import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'ds-person-page-qr',
  templateUrl: './person-page-qr.component.html',
  styleUrls: ['./person-page-qr.component.scss']
})
export class PersonPageQrComponent implements OnInit {

  private personUrl: String;

  constructor(private router: Router) {}

  ngOnInit() {
      this.personUrl = window.location.href;
  }

}
