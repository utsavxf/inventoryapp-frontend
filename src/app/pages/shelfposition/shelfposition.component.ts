import { CommonModule } from "@angular/common"
import { Component, inject, type TemplateRef } from "@angular/core"
import { FormsModule } from "@angular/forms"
import type { Shelfposition } from "../../../interface/shelfposition"
import { ShelfpositionService } from "../../services/shelfposition/shelfposition.service"
import { RouterLink } from "@angular/router"
import { type BsModalRef, BsModalService } from "ngx-bootstrap/modal"

@Component({
  selector: "app-shelfposition",
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  providers: [BsModalService],
  templateUrl: "./shelfposition.component.html",
  styleUrl: "./shelfposition.component.scss",
})
export class ShelfpositionComponent {
  shelfPositions: Shelfposition[] = []
  newPosition: Shelfposition = {
    name: "",
  }
  showAddForm = false
  editingShelfPosition: Shelfposition = { name: "" }
  modalRef?: BsModalRef
  alertMessage: string | null = null
  alertType: "success" | "error" = "success"

  private modalService = inject(BsModalService)
  private shelfPositionService = inject(ShelfpositionService)

  constructor() {}

  ngOnInit(): void {
    this.fetchAllShelfPositions() 

    this.shelfPositionService.shelfPositions$.subscribe((shelfpositions) => {
      this.shelfPositions = shelfpositions
    })
  }

  fetchAllShelfPositions() {
    this.shelfPositionService.fetchAllShelfPositions()
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm
  }

  addShelfPosition(): void {
    if (this.newPosition.name) {
      this.shelfPositionService.addPosition(this.newPosition)
      this.newPosition = {
        name: "",
      }
      this.showAddForm=false
      this.showAlert("Shelf position added successfully", "success")
    }
  }

  openEditShelfPositionDialog(position: Shelfposition, template: TemplateRef<any>): void {
    this.editingShelfPosition = { ...position }
    this.modalRef = this.modalService.show(template, { class: "modal-lg" })
  }

  updateShelfPosition(): void {
    if (this.editingShelfPosition.name) {
      this.shelfPositionService.updateShelfPosition(this.editingShelfPosition)
      this.modalRef?.hide()
      this.showAlert("Shelf position updated successfully", "success")
    }
  }

  deleteShelfPosition(shelfPosition: Shelfposition) {
    if (confirm("Are you sure you want to delete this shelf position?")) {
      this.shelfPositionService.deleteShelfPosition(Number(shelfPosition.id))
      this.showAlert("Shelf position deleted successfully", "success")
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

