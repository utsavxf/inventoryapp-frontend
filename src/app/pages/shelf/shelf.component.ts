import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ShelfService } from '../../services/shelf/shelf.service';
import { Shelf } from '../../../interface/shelf';

@Component({
  selector: 'app-shelf',
  imports: [FormsModule,CommonModule],
  templateUrl: './shelf.component.html',
  styleUrl: './shelf.component.scss'
})
export class ShelfComponent {
  shelves: Shelf[] = []
  newShelf: Shelf= {
    name:'',
    type:''
  }
  showAddForm = false

  private shelfService=inject(ShelfService)

  constructor() {}

  ngOnInit(): void {
    // Fetch shelves from your API
    // this.shelves = [
    //   {
    //     id: 1,
    //     name: 'Shelf A',
    //     shelfPosition:
    //       { name: 'Position 1'}
    //   },
    //   {
    //     id: 2,
    //     name: 'Shelf B', 
    //     shelfPosition:
    //       { name: 'Position 2'}
    //   },
    //   {
    //     id: 3,
    //     name: 'Shelf C',
    //     shelfPosition:
    //       { name: 'Position 5'}
    //   }
    // ];
    this.fetchAllShelves();
    //now let's listen for the event
    this.shelfService.shelves$.subscribe((shelves)=>{
      this.shelves=shelves
    })
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm
  }

  fetchAllShelves(){
    this.shelfService.fetchShelves();
  }

  
  addShelf(): void {
    this.shelfService.addShelf(this.newShelf)
    this.newShelf={
      name:'',
      type:'' 
    }
  }
 

  editShelf(shelf: any): void {
    // Implement edit shelf logic
  }

  deleteShelf(shelf: any): void {
    // Implement delete shelf logic
  }

  assignShelfPosition(shelf:any){

  }
}
