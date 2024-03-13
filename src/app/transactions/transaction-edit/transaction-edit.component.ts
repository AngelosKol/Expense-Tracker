import { Component, OnInit } from '@angular/core';
import { TransactionService } from '../transaction.service';
import { ActivatedRoute, Params } from '@angular/router';
import { Transaction } from '../transaction.model';

@Component({
  selector: 'app-transaction-edit',
  templateUrl: './transaction-edit.component.html',
})
export class TransactionEditComponent implements OnInit {
  transaction:Transaction
id:number
date:string
totalSpent:number 
  constructor(private transactionService:TransactionService,private route:ActivatedRoute){}

  ngOnInit() {
    this.route.params.subscribe(
      (params:Params) =>{
        this.id = params['id']
      }
    )

      this.transactionService.getTransaction(this.id).subscribe(
        (data:Transaction) =>{
          this.transaction = data
          console.log(this.transaction)
          this.date = this.transaction.date
          
        })
        this.transactionService.totalSpentSubject.subscribe(
          (data:number)=>{
            this.totalSpent = data
          }
        )
      
  }
}
