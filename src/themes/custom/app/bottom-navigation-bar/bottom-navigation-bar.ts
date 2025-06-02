import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'bottom-navigation-bar',
  styleUrls: ['./bottom-navigation-bar.scss'],
  templateUrl: './bottom-navigation-bar.html',
  standalone: true,
  imports: [
    RouterLink,
  ],
})
export class BottomNavigationBarComponent {}
