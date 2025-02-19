
import { CommonModule } from "@angular/common"
import { Component, inject, type TemplateRef } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { DeviceService } from "../../services/device/device.service"
import type { Device } from "../../../interface/device"
import { RouterLink } from "@angular/router"
import { BsModalService, type BsModalRef, ModalModule } from "ngx-bootstrap/modal"
import { ShelfpositionService } from "../../services/shelfposition/shelfposition.service"
import { Shelfposition } from "../../../interface/shelfposition"

@Component({
  selector: "app-device",
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink, ModalModule],
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
  private deviceService = inject(DeviceService)
  private shelfPositionService = inject(ShelfpositionService)

  constructor() {}

  ngOnInit(): void {
    this.fetchDevicesFromService()
    this.deviceService.devices$.subscribe((devices) => {
      this.devices = devices
    })

    //let's fetch all shelfPositions too from the Service
    this.shelfPositionService.shelfPositions$.subscribe((shelfPositions)=>{
      this.shelfPositions=shelfPositions
    })

    //after fetching all let's get available shelfPositions
    this.availableShelfPositions=this.shelfPositions.filter((sp)=>!sp.device)
  }

  fetchDevicesFromService() {
    this.deviceService.fetchAllDevices()
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm
  }

  addDevice(): void {
    this.deviceService.addDevice(this.newDevice);
    this.showAlert("Device added successfully", "success")
    this.newDevice = { name: "", type: "" }
    this.showAddForm = false
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
      this.shelfPositionService.getShelfPositionById(Number(this.selectedShelfPositionId)).subscribe(
        (shelfPosition) => {
          this.deviceService.addShelfPosition(Number(this.assigningDevice.id), Number(shelfPosition.id)).subscribe(
            () => {
              const updatedDevice = { ...this.assigningDevice }
              const index = this.devices.findIndex((d) => d.id === updatedDevice.id)
              if (index !== -1) {
                this.devices[index].shelfPositions?.push(shelfPosition)
              }
              this.showAlert("Shelf position assigned successfully", "success")
              this.selectedShelfPositionId = ""
              this.modalRef?.hide()
            },
            (error) => {
              this.showAlert("Error assigning shelf position", "error")
            },
          )
        },
        (error) => {
          this.showAlert("Error fetching shelf position", "error")
        },
      )
    }
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

  

  // removeShelfPosition(event: Event, device: Device, position: any) {
  //   event.stopPropagation()
  //   if (confirm("Are you sure you want to remove this shelf position from the device?")) {
  //     this.deviceService.removeShelfPosition(Number(device.id), Number(position.id)).subscribe(
  //       () => {
  //         const index = this.devices.findIndex((d) => d.id === device.id)
  //         if (index !== -1) {
  //           this.devices[index].shelfPositions = this.devices[index].shelfPositions?.filter((p) => p.id !== position.id)
  //         }
  //         this.showAlert("Shelf position removed successfully", "success")
  //       },
  //       (error) => {
  //         this.showAlert("Error removing shelf position", "error")
  //       },
  //     )
  //   }
  // }

  showAlert(message: string, type: "success" | "error") {
    this.alertMessage = message
    this.alertType = type
    setTimeout(() => {
      this.alertMessage = null
    }, 3000)
  }
}


