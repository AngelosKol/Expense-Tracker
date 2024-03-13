import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TransactionModalComponent } from '../../modals/transaction-modal.component';
import { TransactionService } from '../transaction.service';
import { Transaction } from '../transaction.model';
import { Router } from '@angular/router';
import { Product } from 'src/app/products/product.model';
import { Currency, CurrencyService } from 'src/app/shared/currency.service';

@Component({
  selector: 'app-transactions-list',
  templateUrl: './transactions-list.component.html',
  styles: `
  tr{
    transition: transform 0.1 ease; 
  }
  tr:hover{
    margin-top:0.3rem;
    transform: scaleY(1.1);
  }`
})
export class TransactionsListComponent  implements OnInit{
  transactions: Transaction[]
  products : Product[]
  currency : Currency
  totalSpent : {[key:string] : number} = {}
  id:string 

  constructor(private modalService: NgbModal,private transactionService:TransactionService,private router:Router,private currencyService:CurrencyService){}



  ngOnInit() {
    this.currencyService.currencies$.subscribe((data)=>{
      this.currency = data
    })

    this.loadTransactions();
    this.transactionService.transactionsUpdated
    .subscribe(()=>{
      this.loadTransactions()
    })
  }


  loadTransactions(){
    this.transactionService.getTransactions().subscribe({
      next: (data:Transaction[])=>{
        this.transactions = data
      },
      error:(err)=>{
        console.log(err)
      }
    })
  }

  /**
   * A method that calculates totalspent for each transactions.
   * To DO : Replace this with one source of truth for both transactions and products component.
   */
  calculateTotalSpent() {
    for (const transaction of this.transactions) {
      this.transactionService.getTransactionProducts(transaction.id).subscribe({
        next: (products: Product[]) => {
          const transactionPrice = products.reduce((total, prod) =>{
            if(prod.price <=0){
              return total
            }
            return  total + prod.price
          }, 0);
          this.totalSpent[transaction.id] = transactionPrice;
        },
        error: (error) => {
          console.error(`Error calculating total spent for transaction ${transaction.id}: ${error.message}`);
        },
      });
    }
  }

  open(){
    this.modalService.open(TransactionModalComponent,{ size: 'xl' ,animation:true})
  
  }

  navigateToTransactionItem(id:number) {
    this.router.navigate(['/transactions', id, 'edit']);
  }
  
  onDelete(id:number){
    this.transactionService.deleteTransaction(id).subscribe({
      next: () => {
        console.log('item deleted')
      }
    })
  }

 


  
}

