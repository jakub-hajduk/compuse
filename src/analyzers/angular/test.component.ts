import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './test.component.html',
})
export class App {
  name = 'Angular';
}

bootstrapApplication(App);
