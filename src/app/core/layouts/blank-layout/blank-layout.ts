import { Component, input, Input } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { BottomNav } from '../../../shared/components/bottom-nav/bottom-nav';

@Component({
  selector: 'app-blank-layout',
  imports: [Navbar, RouterOutlet, BottomNav],
  templateUrl: './blank-layout.html',
  styleUrl: './blank-layout.css',
})
export class BlankLayout {}
