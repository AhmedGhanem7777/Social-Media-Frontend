import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.css',
})
export class AuthLayout {

}