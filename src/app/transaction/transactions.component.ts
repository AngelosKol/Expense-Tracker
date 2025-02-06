import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  imports: [RouterOutlet],
})
export class TransactionsComponent {}
