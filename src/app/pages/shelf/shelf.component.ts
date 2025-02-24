
import { CommonModule } from "@angular/common"
import { Component, inject, Injector, type TemplateRef } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { ShelfService } from "../../services/shelf/shelf.service"
import type { Shelf } from "../../../interface/shelf"
import { RouterLink } from "@angular/router"
import { type BsModalRef, BsModalService, ModalModule } from "ngx-bootstrap/modal"
import { ShelfpositionService } from "../../services/shelfposition/shelfposition.service"
import { Shelfposition } from "../../../interface/shelfposition"

@Component({
  selector: "app-shelf",
  imports: [FormsModule, CommonModule, RouterLink, ModalModule],
  providers: [BsModalService],
  templateUrl: "./shelf.component.html",
  styleUrl: "./shelf.component.scss",
})
export class ShelfComponent {
  shelves: Shelf[] = []
  newShelf: Shelf = {
    name: "",
    type: "",
  }
  showAddForm = false
  editingShelf: Shelf = { name: "", type: "" }
  assigningShelf: Shelf = { name: "", type: "" }
  selectedShelfPositionId = ""
  modalRef?: BsModalRef
  alertMessage: string | null = null
  alertType: "success" | "error" = "success" 

  shelfPositions:Shelfposition[]=[]
  availableShelfPositions:Shelfposition[]=[]
   
  private shelfService = inject(ShelfService)
  private shelfPositionService = inject(ShelfpositionService)
  modalService = inject(BsModalService)

  constructor() {}

  ngOnInit(): void {
    this.fetchAllShelves() 
    this.shelfService.shelves$.subscribe((shelves) => {
      this.shelves = shelves
    })

    this.shelfPositionService.fetchAllShelfPositions();

    this.shelfPositionService.shelfPositionSubject.subscribe((shelfPositions)=>{
       this.shelfPositions=shelfPositions
       this.availableShelfPositions=shelfPositions.filter((sp)=>!sp.shelf)
    })


  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm
  }

  fetchAllShelves() {
    this.shelfService.fetchAllShelves()
  }

  addShelf(): void {
    if (this.newShelf.name && this.newShelf.type) {
      this.shelfService.addShelf(this.newShelf)
      this.newShelf = {
        name: "",
        type: "",
      }
      this.showAlert("Shelf added successfully", "success")
      this.showAddForm = false
    }

  }

  openEditShelfDialog(shelf: Shelf, template: TemplateRef<any>): void {
    this.editingShelf = { ...shelf }
    this.modalRef = this.modalService.show(template, { class: "modal-lg" })
  }

  openAssignShelfPositionDialog(shelf: Shelf, template: TemplateRef<any>): void {
    this.selectedShelfPositionId = ""
    this.assigningShelf = { ...shelf }
    this.modalRef = this.modalService.show(template, { class: "modal-lg" })
  }

  updateShelf(): void {
    if (this.editingShelf.name && this.editingShelf.type) {
      this.shelfService.updateShelf(this.editingShelf)
      this.modalRef?.hide()
      this.showAlert("Shelf updated successfully", "success")
    }
  }

  assignShelfPosition() {
    if (this.selectedShelfPositionId) {
      console.log("assigning shelf position in component")
      this.shelfService.addShelfPosition(Number(this.assigningShelf.id),Number(this.selectedShelfPositionId))
    }
    this.modalRef?.hide()
  }

  deleteShelf(shelf: Shelf) {
    if (confirm("Are you sure you want to delete this shelf?")) {
      this.shelfService.deleteShelf(Number(shelf.id))
      this.showAlert("Shelf deleted successfully", "success")
    }
  }

  showAlert(message: string, type: "success" | "error") {
    this.alertMessage = message
    this.alertType = type
    setTimeout(() => {
      this.alertMessage = null
    }, 3000)
  }
}