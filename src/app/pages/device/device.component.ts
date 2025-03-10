import { CommonModule } from '@angular/common';
import { AfterViewChecked, AfterViewInit, Component, computed, DoCheck, inject, OnChanges, OnInit, signal, SimpleChanges, type TemplateRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DeviceService } from '../../services/device/device.service';
import type { Device } from '../../../interface/device';
import { RouterLink } from '@angular/router';
import {
  BsModalService,
  type BsModalRef,
  ModalModule,
} from 'ngx-bootstrap/modal';
import { ShelfpositionService } from '../../services/shelfposition/shelfposition.service';
import { Shelfposition } from '../../../interface/shelfposition';
import { LoaderComponent } from '../../components/loader/loader.component';
import { ToastComponent } from '../../components/toast/toast.component';
import { LoaderService } from '../../services/loader/loader.service';
import { ToastService } from '../../services/toast/toast.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-device',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    RouterLink,
    ModalModule,
    LoaderComponent,
    ToastComponent,
  ],
  providers: [BsModalService],
  templateUrl: './device.component.html',
  styleUrls: ['./device.component.scss'],
})
export class DeviceComponent implements OnInit {
  devices=inject(DeviceService).devices
  shelfPositions=inject(ShelfpositionService).shelfPositions
  availableShelfPositions=computed(()=>this.shelfPositions().filter((sp)=>!sp.device))
  newDevice=signal<Device>({
    name: '',
    type: '',
  })
  showAddForm = signal(false);
  editingDevice=signal<Device>({
    name: '',
    type: '',
  })
  assigningDevice=signal<Device>({
    name: '',
    type: '',
  })
  selectedShelfPositionId = signal('');
  modalRef?: BsModalRef;

  //injecting various services
  private modalService = inject(BsModalService);
  private loaderService = inject(LoaderService);
  private toastService = inject(ToastService);
  private deviceService = inject(DeviceService);
  private shelfPositionService = inject(ShelfpositionService);


  constructor(){
    console.log("Device constructor called")
  }

  


  ngOnInit(): void {
    console.log("Device ngOninit called")
    this.loaderService.show();
    this.deviceService.fetchAllDevices().subscribe({
      next: () => this.loaderService.hide(),
      error: (err) => {
        this.showAlert(`Failed to fetch devices: ${err.message}`, 'error');
        this.loaderService.hide();
      },
    });



    //let's fetch all shelfPositions too from the Service
    this.shelfPositionService.fetchAllShelfPositions() //again this will only be called when if we are refreshing device pages and shelfPosition subject doesn't have all shelf position
    .subscribe({
      next:()=>this.loaderService.hide(),
      error:()=>this.toastService.show(`Failed to fetch all shelf positions`,"error")
    })
  }






  toggleAddForm(): void {
    this.showAddForm.update((val)=>!val)
  }

  addDevice(): void {
    this.loaderService.show();
    this.deviceService.addDevice(this.newDevice()).subscribe({
      next: () => {
        this.showAlert('Device added successfully', 'success');
        this.newDevice.set({ name: '', type: '' }) 
        this.showAddForm.set(false)
        this.loaderService.hide();
      },
      error: (err) => {
        this.showAlert(`Failed to add device :${err.message}`, 'error');
        this.loaderService.hide();
      },
    });
  }

  openEditDialog(device: Device, template: TemplateRef<any>): void {
    this.editingDevice.set({...device});
    this.modalRef = this.modalService.show(template, { class: 'modal-lg' });
  }

  updateDevice(): void {
    this.loaderService.show();
    this.deviceService.updateDevice(this.editingDevice()).subscribe({
      next: () => {
        this.showAlert('Device updated successfully', 'success');
        this.modalRef?.hide(); //the modal should hide after submitting the update request
        this.loaderService.hide();
      },
      error: (err) => {
        this.showAlert(`Failed to update device :${err.message}`, 'error');
        this.loaderService.hide();
      },
    });
  }

  openAssignShelfPositionDialog(device: any, template: TemplateRef<any>): void {
    this.assigningDevice.set({...device})
    this.modalRef = this.modalService.show(template, { class: 'modal-lg' });
  }

  assignShelfPosition() {
    if (this.selectedShelfPositionId) {
      this.loaderService.show()
      this.deviceService.addShelfPosition(
        Number(this.assigningDevice().id),
        Number(this.selectedShelfPositionId())
      ).subscribe({
        next:()=>{
        this.loaderService.hide()   
        this.modalRef?.hide();  
        this.selectedShelfPositionId.set('')
        this.showAlert('Shelf Position Assigned Successfully', 'success');
        },
        error:(err)=>{
          this.loaderService.hide()
          this.showAlert(`Failed in assigning shelf Position:${err.message}`,"error")
        }
      })
      
    }
    
  }

  confirmDeleteDevice(device: Device) {
    if (confirm('Are you sure you want to delete this device?')) {
      this.deleteDevice(device);
    }
  }

  deleteDevice(device: Device) {
    this.loaderService.show()
    this.deviceService.deleteDevice(Number(device.id)).subscribe({
      next:()=>{
        this.showAlert('Device deleted successfully', 'success');
        this.loaderService.hide()
      },
      error:(err)=>{
        this.showAlert(`Failed to delete device :${err.message}`,"error")
        this.loaderService.hide()
      }
    })
   
  }

  removeShelfPosition(event: MouseEvent, deviceId: any, ShelfpositionId: any) {
    event.stopPropagation(); //to stop triggering the router link
    this.loaderService.show()
    this.deviceService.removeShelfPosition(
      Number(deviceId),
      Number(ShelfpositionId)
    ).subscribe({
      next:()=>{
       this.showAlert('Shelf Position removed successfully', 'success');
       this.loaderService.hide()
      },
      error:(err)=>{
       this.showAlert(`Failed to remove shelf position:${err.message}`,"error")
       this.loaderService.hide()
      }
    })
    
  }

  showAlert(message: string, type: 'success' | 'error') {
    this.toastService.show(message, type);
  }
}
