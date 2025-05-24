import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  template: `<h1>Hello from {{ name }}!</h1>
<a target="_blank" href="https://angular.dev/overview">
    <span slot="dama">HElo</span>
    Learn more about Angular
</a>`,
})
export class App {
  name = 'Angular';
}

bootstrapApplication(App);
