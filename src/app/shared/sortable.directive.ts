import { Directive, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '../product/product.model';
export type SortColumn = keyof Product | '';
export type SortDirection = 'asc' | 'desc' | '';
const rotate: { [key: string]: SortDirection } = {
  asc: 'desc',
  desc: '',
  '': 'asc',
};

export interface SortEvent {
  column: SortColumn;
  direction: SortDirection;
}

export interface Pagination {
  currentPage: number;
  itemsPerPage: number;
}

@Directive({
  standalone: true,
  selector: 'th[sortable]',
  host: {
    '[class.asc]': 'direction === "asc"',
    '[class.desc]': 'direction === "desc"',
    '(click)': 'rotate()',
  },
})
export class NgbdSortableHeader {
  @Input() sortable: SortColumn = '';
  @Input() direction: SortDirection = '';
  @Output() sort = new EventEmitter<SortEvent>();
  constructor() {}

  rotate() {
    this.direction = rotate[this.direction];
    this.sort.emit({ column: this.sortable, direction: this.direction });
  }
}
