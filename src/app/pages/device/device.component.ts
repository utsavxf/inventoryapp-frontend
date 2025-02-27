
import { CommonModule } from "@angular/common"
import { Component, inject, type TemplateRef } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { DeviceService } from "../../services/device/device.service"
import type { Device } from "../../../interface/device"
import { RouterLink } from "@angular/router"
import { BsModalService, type BsModalRef, ModalModule } from "ngx-bootstrap/modal"
import { ShelfpositionService } from "../../services/shelfposition/shelfposition.service"
import { Shelfposition } from "../../../interface/shelfposition"
import { LoaderComponent } from "../../components/loader/loader.component";
import { ToastComponent } from "../../components/toast/toast.component";
import { LoaderService } from "../../services/loader/loader.service"
import { ToastService } from "../../services/toast/toast.service"

@Component({
  selector: "app-device",
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink, ModalModule, LoaderComponent, ToastComponent],
  providers: [BsModalService],
  templateUrl: "./device.component.html",
  styleUrls: ["./device.component.scss"],
})
export class DeviceComponent {
  devices: Device[] = []
  shelfPositions:Shelfposition[]=[]
  availableShelfPositions:Shelfposition[]=[]
  newDevice: Device = {
    name: "",
    type: "",
  }
  showAddForm = false
  editingDevice: Device = {
    name: "",
    type: "",
  }
  assigningDevice: Device = {
    name: "",
    type: "",
  }
  selectedShelfPositionId = ""
  modalRef?: BsModalRef
  alertMessage: string | null = null
  alertType: "success" | "error" = "success"

  private modalService = inject(BsModalService)
  private loaderService=inject(LoaderService)
  private toastService=inject(ToastService)


  private deviceService = inject(DeviceService)
  private shelfPositionService = inject(ShelfpositionService)

  constructor() {}

  ngOnInit(): void {
    this.fetchDevicesFromService()
    this.deviceService.devices$.subscribe((devices) => {
      this.devices = devices
    })

    //let's fetch all shelfPositions too from the Service
    this.shelfPositionService.fetchAllShelfPositions() //again this will only be called when if we are refreshing device pages and shelfPosition subject doesn't have all shelf position
    
    this.shelfPositionService.shelfPositions$.subscribe((shelfPositions)=>{
      this.shelfPositions=shelfPositions
    //after fetching all let's get available shelfPositions,and this should be inside subscribe
    this.availableShelfPositions=this.shelfPositions.filter((sp)=>!sp.device)
    })

    
  }

  fetchDevicesFromService() {
    this.loaderService.show()
    this.deviceService.fetchAllDevices()
    this.loaderService.hide()
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm
  }

  addDevice(): void {
    this.loaderService.show()
    this.deviceService.addDevice(this.newDevice);
    this.showAlert("Device added successfully", "success")
    this.newDevice = { name: "", type: "" }
    this.showAddForm = false
    this.loaderService.hide()
  }




  openEditDialog(device: Device, template: TemplateRef<any>): void {
    this.editingDevice = { ...device }
    this.modalRef = this.modalService.show(template, { class: "modal-lg" })
  }

  updateDevice(): void {
    
    this.deviceService.updateDevice(this.editingDevice)
    this.showAlert("Device updated successfully", "success")
    this.modalRef?.hide(); //the modal should hide after submitting the update request
  }


  openAssignShelfPositionDialog(device: any, template: TemplateRef<any>): void {
    this.assigningDevice = device
    this.modalRef = this.modalService.show(template, { class: "modal-lg" })
  }
  
  assignShelfPosition() {
    if (this.selectedShelfPositionId) {
      this.deviceService.addShelfPosition(Number(this.assigningDevice.id),Number(this.selectedShelfPositionId))
      this.selectedShelfPositionId=""
      this.showAlert("Shelf Position Assigned Successfully","success")
    }
    this.modalRef?.hide()
  }

  confirmDeleteDevice(device: Device) {
    if (confirm("Are you sure you want to delete this device?")) {
      this.deleteDevice(device)
    }
  }

  deleteDevice(device:Device){
    this.deviceService.deleteDevice(Number(device.id))
    this.showAlert("Device deleted successfully", "success")
   }

  

  removeShelfPosition(event:MouseEvent,deviceId:any,ShelfpositionId:any){
     event.stopPropagation() //to stop triggering the router link
     this.deviceService.removeShelfPosition(Number(deviceId),Number(ShelfpositionId))
     this.showAlert("Shelf Position removed successfully","success")
  }

  showAlert(message: string, type: "success" | "error") {
    // this.alertMessage = message
    // this.alertType = type
    // setTimeout(() => {
    //   this.alertMessage = null
    // }, 3000) 
    this.toastService.show(message,type)
  }
}


