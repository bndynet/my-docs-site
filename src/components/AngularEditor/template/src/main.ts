import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  template: '<h1>Hello Angular 18 in Sandpack!</h1>',
})
export class App {
  console.log('Hello from the App component!');
}

bootstrapApplication(App);
