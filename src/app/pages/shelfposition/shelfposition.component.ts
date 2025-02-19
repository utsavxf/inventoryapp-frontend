import { CommonModule } from '@angular/common';
import { Component, inject, NgModule, TemplateRef } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { Shelfposition } from '../../../interface/shelfposition';
import { ShelfpositionService } from '../../services/shelfposition/shelfposition.service';
import { RouterLink } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-shelfposition',
  standalone:true,
  imports: [FormsModule,CommonModule,RouterLink],
  providers:[BsModalService],
  templateUrl: './shelfposition.component.html',
  styleUrl: './shelfposition.component.scss'
})
export class ShelfpositionComponent {
  shelfPositions: Shelfposition[] = []
  newPosition:Shelfposition = {
    'name':''
  }
  showAddForm = false
  editingShelfPosition:Shelfposition= { name: '' }; // Object for editing
  modalRef?:BsModalRef

  private modalService=inject(BsModalService)//injecting modal service
  private shelfPositionService=inject(ShelfpositionService)

  constructor() {}

  ngOnInit(): void {
    // Fetch shelf positions and shelves from your API
    // this.shelfPositions = [
    //   {
    //     name: 'Position 1',
    //     shelfId: 1, // Shelf A
    //     shelf: { name: 'Shelf A' },
    //     device: { name: 'iPhone 15' }
    //   },
    //   {
    //     name: 'Position 2',
    //     shelfId: 2, // Shelf B
    //     shelf: { name: 'Shelf B' },
    //     device: { name: 'Iphone 15' }
    //   },
    //   {
    //     name: 'Position 3',
    //     shelfId: 2, // Shelf B
    //     shelf: {},
    //     device: { name: 'MacBook Pro' }
    //   },
    //   {
    //     name: 'Position 4',
    //     shelfId: 2, // Shelf B
    //     shelf: {},
    //     device: { name: 'Dell XPS 13' }
    //   },
    //   {
    //     name: 'Position 5',
    //     shelfId: 3, // Shelf C
    //     shelf: { name: 'Shelf C' },
    //     device: null
    //   },
    //   {
    //     name: 'Position 6',
    //     shelfId: 4, // Shelf D
    //     shelf: {  },
    //     device: {name:"Google Pixel 7"} 
    //   },
    //   {
    //     name: 'Position 7',
    //     shelfId: 5, // Shelf E
    //     shelf: { },
    //     device: null // No device assigned
    //   },
    //   {
    //     name: 'Position 8',
    //     shelfId: 6, // Shelf F
    //     shelf: {  },
    //     device:null
    //   }
    // ];
    this.fetchAllShelfPositions()

    this.shelfPositionService.shelfPositions$.subscribe((shelfpositions)=>{
      this.shelfPositions=shelfpositions
    })

  }

  fetchAllShelfPositions() {
    this.shelfPositionService.fetchAllShelfPositions()
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm
  }

  addShelfPosition(): void {
    this.shelfPositionService.addPosition(this.newPosition)
    this.newPosition={
      name:'' //for clearing the form
    }

  }

  openEditShelfPositionDialog(position:Shelfposition, template: TemplateRef<any>): void {
    this.editingShelfPosition = { ...position }; // Copy the position to edit
    this.modalRef = this.modalService.show(template, { class: 'modal-lg' }); // Show the modal
  }

  updateShelfPosition(): void {
    this.shelfPositionService.updateShelfPosition(this.editingShelfPosition)
    this.modalRef?.hide(); //the modal should hide after submitting the update request

  }

  deleteShelfPosition(position: any): void {
    // Implement delete shelf position logic
  }
}
