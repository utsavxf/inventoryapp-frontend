import { CommonModule } from "@angular/common"
import { Component, inject, signal, type TemplateRef } from "@angular/core"
import { FormsModule } from "@angular/forms"
import type { Shelfposition } from "../../../interface/shelfposition"
import { ShelfpositionService } from "../../services/shelfposition/shelfposition.service"
import { RouterLink } from "@angular/router"
import { type BsModalRef, BsModalService } from "ngx-bootstrap/modal"
import { ToastService } from "../../services/toast/toast.service"
import { LoaderService } from "../../services/loader/loader.service"
import { LoaderComponent } from "../../components/loader/loader.component";
import { ToastComponent } from "../../components/toast/toast.component";

@Component({
  selector: "app-shelfposition",
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink, LoaderComponent, ToastComponent],
  providers: [BsModalService],
  templateUrl: "./shelfposition.component.html",
  styleUrl: "./shelfposition.component.scss",
})
export class ShelfpositionComponent {
  shelfPositions=inject(ShelfpositionService).shelfPositions //get shelf position directly from the service as a signal
  newPosition=signal<Shelfposition>({name: ""})
  showAddForm = signal(false)
  editingShelfPosition= signal<Shelfposition>({ name: "" })
  modalRef?: BsModalRef
  alertMessage: string | null = null

  //injecting services
  private modalService = inject(BsModalService)
  private loaderService= inject(LoaderService)
  private toastService=inject(ToastService)
  private shelfPositionService = inject(ShelfpositionService)

  constructor() {}

  ngOnInit(): void {
    this.fetchAllShelfPositions() 
  }

  toggleAddForm(): void {
    this.showAddForm.update((val)=>!val) //flip the signal value
  }
 
  fetchAllShelfPositions() { 
    this.loaderService.show()
    this.shelfPositionService.fetchAllShelfPositions()?.subscribe({
      next:()=>{
        this.loaderService.hide()
      },
      error:(err)=>{
        this.toastService.show(`Failed to fetch all Shelf Positions:${err.message}`,"error")
      }
    })
  }

 
  addShelfPosition(): void {
    this.loaderService.show()
    this.shelfPositionService.addPosition(this.newPosition()).subscribe({
      next:()=>{
        this.toastService.show("Shelf Position Added successfully","success")
        this.newPosition.set({name:''})
        this.showAddForm.set(false)
        this.loaderService.hide()
      },
      error:(err)=>{
        this.toastService.show(`Failed to add shelf Position:${err.message}`,"error")
        this.loaderService.hide()
      }
    })
  }

  openEditShelfPositionDialog(position: Shelfposition, template: TemplateRef<any>): void {
    this.editingShelfPosition.set({...position})
    this.modalRef = this.modalService.show(template, { class: "modal-lg" })
  }

  updateShelfPosition(): void {
    this.loaderService.show()
    this.shelfPositionService.updateShelfPosition(this.editingShelfPosition()).subscribe({
      next:()=>{
        this.toastService.show("Shelf Position updated successfully","success")
        this.modalRef?.hide()
        this.loaderService.hide()
      },
      error:(err)=>{
        this.toastService.show(`Failed in adding shelf Position:${err.message}`,"error")
        this.loaderService.hide()
      }
    })
  }

  deleteShelfPosition(shelfPosition: Shelfposition) {
    if (confirm("Are you sure you want to delete this shelf position?")) {
      this.loaderService.show()
     this.shelfPositionService.deleteShelfPosition(Number(shelfPosition.id)).subscribe({
      next:()=>{
        this.loaderService.hide()
        this.toastService.show("shelf position deleted successfully","success")
      },
      error:(err)=>{
        this.loaderService.hide()
        this.toastService.show(`Failed to delete shelf position:${err.message}`,"error")
      }
     })
    }
  }

  showAlert(message: string, type: "success" | "error") {
    this.toastService.show(message,type)
  }
}

