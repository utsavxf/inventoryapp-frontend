import { CommonModule } from '@angular/common';
import { Component, inject, TemplateRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ShelfService } from '../../services/shelf/shelf.service';
import { Shelf } from '../../../interface/shelf';
import { RouterLink } from '@angular/router';
import { BsModalRef, BsModalService, ModalModule } from 'ngx-bootstrap/modal';
import { ShelfpositionService } from '../../services/shelfposition/shelfposition.service';

@Component({
  selector: 'app-shelf',
  imports: [FormsModule,CommonModule,RouterLink,ModalModule],
  providers:[BsModalService],
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
  editingShelf: Shelf = { name: '', type: '' }; // Object for editing
  assigningShelf: Shelf = { name: '', type: '' }; // Object for editing
  selectedShelfPositionId = ''; // ID for shelf position assignment
  modalRef?: BsModalRef; // Reference for the modal

  private shelfService=inject(ShelfService)
  private shelfPositionService=inject(ShelfpositionService)
  modalService=inject(BsModalService)

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
    this.shelfService.fetchAllShelves();
  }

  
  addShelf(): void {
    this.shelfService.addShelf(this.newShelf)
    this.newShelf={
      name:'',
      type:'' 
    }
  }

  openEditShelfDialog(shelf: Shelf, template: TemplateRef<any>): void {
    this.editingShelf = { ...shelf }; // Copy the shelf to edit
    this.modalRef = this.modalService.show(template, { class: 'modal-lg' }); // Show the modal
  }
 
  openAssignShelfPositionDialog(shelf: Shelf, template: TemplateRef<any>): void {
    this.selectedShelfPositionId = ''; // Reset the selected shelf position ID
    this. assigningShelf={...shelf}
    this.modalRef = this.modalService.show(template, { class: 'modal-lg' }); // Show the modal
  }


  updateShelf(): void {
    this.shelfService.updateShelf(this.editingShelf)
    this.modalRef?.hide(); //the modal should hide after submitting the add shelfPosition request
  }


  deleteShelf(shelf: any): void {
    // Implement delete shelf logic
  }

  assignShelfPosition(){

   //NOW WE WANT TO REFLECT THE CHANGES AS SOON AS WE CALL THE ASSIGN SHELF POSITION FUNCTION 
   //EITHER YOU CAN CALL fetchAllDevices() again and we are subscribing to the devices$ observable so that would render the whole list again but result in extra api call
   //or we can manuall do the changes here locally in shelf pages and we don't need to to do that for ShelfPosition cuz backend has been changes and when we will go to shelfPosition page,it will automatically fetch the new list of shelf positions so it will reflect current changes
   //but in second method we want to update the shelf with the whole object of shelfPosition so anyways we want to do 1 request to the database,but getting a single shelfPosition is I think more feasable then getting list of all devices
   this.shelfPositionService.getShelfPositionById(Number(this.selectedShelfPositionId)).subscribe((shelfPosition)=>{
     //now we have the shelfPosition object
     this.shelfService.addShelfPosition(Number(this.assigningShelf.id),Number(shelfPosition.id)).subscribe(()=>{
        const updatedShelf={...this.assigningShelf}
        updatedShelf.shelfPosition=shelfPosition
        const index=this.shelves.findIndex(s=>s.id===updatedShelf.id)
        if(index!==-1){
          this.shelves[index]=updatedShelf
        }
     })
   })
   
   this.modalRef?.hide(); // Hide the modal after success
   this.selectedShelfPositionId = ''; // Reset the selected shelf position ID

  }
}
