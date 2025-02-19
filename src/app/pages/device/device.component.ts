import { CommonModule } from '@angular/common';
import { Component, inject, TemplateRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DeviceService } from '../../services/device/device.service';
import { Device } from '../../../interface/device';
import { RouterLink } from '@angular/router';
import { BsModalService, BsModalRef, ModalModule } from "ngx-bootstrap/modal";
import { ShelfpositionService } from '../../services/shelfposition/shelfposition.service';

@Component({
  selector: 'app-device',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink,ModalModule],
  providers:[BsModalService],
  templateUrl: './device.component.html',
  styleUrls: ['./device.component.scss']
})
export class DeviceComponent {
  devices: Device[] = [];
  newDevice: Device = {
    name: '',
    type: ''
  };
  showAddForm = false;
  editingDevice:Device = { //updating device
    name:'',
    type:''
  };
  assigningDevice: Device = { //when assigning a shelf position
    name:'',
    type:''
  };
  selectedShelfPositionId = "";
  modalRef?: BsModalRef;  //as we have 2 modals so this will at a time contain the reference to either edit dialog or assign shelfPosition dialog
  


  private modalService = inject(BsModalService);
  private deviceService=inject(DeviceService)
  private shelfPositionService=inject(ShelfpositionService)

  constructor() {}

  ngOnInit(): void {
    this.fetchDevicesFromService();
    this.deviceService.devices$.subscribe((devices) => {
      this.devices = devices;
    });
  }

  fetchDevicesFromService() {
    this.deviceService.fetchAllDevices();
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
  }

  addDevice(): void {
    this.deviceService.addDevice(this.newDevice);
    this.newDevice = { name: '', type: '' };
  }

  openEditDialog(device:Device, template: TemplateRef<any>): void {
    this.editingDevice = { ...device };
    this.modalRef = this.modalService.show(template, { class: 'modal-lg' });
  }

  updateDevice(): void {
    
    this.deviceService.updateDevice(this.editingDevice)
    this.modalRef?.hide(); //the modal should hide after submitting the update request
  }

  //The ngOnInit method is not called again when the observable emits a new value. This method is only called once when the component is initialized.
 //Instead, the template is updated with the new data automatically. Angular's change detection handles this efficiently, and the UI reflects the changes without needing to reinitialize the component or call ngOnInit again.

  openAssignShelfPositionDialog(device: any, template: TemplateRef<any>): void {
    this.assigningDevice = device;
    this.modalRef = this.modalService.show(template, { class: 'modal-lg' });
  }

  assignShelfPosition(){
    this.shelfPositionService.getShelfPositionById(Number(this.selectedShelfPositionId)).subscribe((shelfPosition)=>{
      this.deviceService.addShelfPosition(Number(this.assigningDevice.id),Number(shelfPosition.id)).subscribe(()=>{
        const updateDevice={...this.assigningDevice}
        const index=this.devices.findIndex(d=>d.id===updateDevice.id)
        if(index!==-1){
          this.devices[index].shelfPositions?.push(shelfPosition)
        }

      })
    })
    this.selectedShelfPositionId=''
    this.modalRef?.hide(); //the modal should hide after submitting the add shelfPosition request
  }

  deleteDevice(device:Device){
   this.deviceService.deleteDevice(Number(device.id))
  }
}