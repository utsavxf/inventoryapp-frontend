import { CommonModule } from '@angular/common';
import { Component, inject, type TemplateRef } from '@angular/core';
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
export class DeviceComponent {
  devices: Device[] = [];
  shelfPositions: Shelfposition[] = [];
  availableShelfPositions: Shelfposition[] = [];
  newDevice: Device = {
    name: '',
    type: '',
  };
  showAddForm = false;
  editingDevice: Device = {
    name: '',
    type: '',
  };
  assigningDevice: Device = {
    name: '',
    type: '',
  };
  selectedShelfPositionId = '';
  modalRef?: BsModalRef;
  alertMessage: string | null = null;
  alertType: 'success' | 'error' = 'success';

  private modalService = inject(BsModalService);
  private loaderService = inject(LoaderService);
  private toastService = inject(ToastService);

  private deviceService = inject(DeviceService);
  private shelfPositionService = inject(ShelfpositionService);

  constructor() {
    this.deviceService.devices$
      .pipe(takeUntilDestroyed())
      .subscribe((devices) => {
        this.devices = devices;
      });

    this.shelfPositionService.shelfPositions$
      .pipe(takeUntilDestroyed())
      .subscribe((shelfPositions) => {
        this.shelfPositions = shelfPositions;
        //after fetching all let's get available shelfPositions,and this should be inside subscribe
        this.availableShelfPositions = this.shelfPositions.filter(
          (sp) => !sp.device
        );
      });
  }

  ngOnInit(): void {
    this.fetchDevicesFromService();
    //let's fetch all shelfPositions too from the Service
    this.shelfPositionService.fetchAllShelfPositions(); //again this will only be called when if we are refreshing device pages and shelfPosition subject doesn't have all shelf position
  }

  fetchDevicesFromService() {
    this.loaderService.show();
    this.deviceService.fetchAllDevices().subscribe({
      next: () => this.loaderService.hide(),
      error: (err) => {
        this.showAlert(`Failed to fetch devices: ${err.message}`, 'error');
        this.loaderService.hide();
      },
    });
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
  }

  addDevice(): void {
    this.loaderService.show();
    this.deviceService.addDevice(this.newDevice).subscribe({
      next: () => {
        this.showAlert('Device added successfully', 'success');
        this.newDevice = { name: '', type: '' };
        this.showAddForm = false;
        this.loaderService.hide();
      },
      error: (err) => {
        this.showAlert(`Failed to add device :${err.message}`, 'error');
        this.loaderService.hide();
      },
    });
  }

  openEditDialog(device: Device, template: TemplateRef<any>): void {
    this.editingDevice = { ...device };
    this.modalRef = this.modalService.show(template, { class: 'modal-lg' });
  }

  updateDevice(): void {
    this.loaderService.show();
    this.deviceService.updateDevice(this.editingDevice).subscribe({
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
    this.assigningDevice = device;
    this.modalRef = this.modalService.show(template, { class: 'modal-lg' });
  }

  assignShelfPosition() {
    if (this.selectedShelfPositionId) {
      this.deviceService.addShelfPosition(
        Number(this.assigningDevice.id),
        Number(this.selectedShelfPositionId)
      );
      this.selectedShelfPositionId = '';
      this.showAlert('Shelf Position Assigned Successfully', 'success');
    }
    this.modalRef?.hide();
  }

  confirmDeleteDevice(device: Device) {
    if (confirm('Are you sure you want to delete this device?')) {
      this.deleteDevice(device);
    }
  }

  deleteDevice(device: Device) {
    this.deviceService.deleteDevice(Number(device.id)).subscribe({
      next:()=>{
        this.showAlert('Device deleted successfully', 'success');
      },
      error:(err)=>{
        this.showAlert(`Failed to delete device :${err.message}`,"error")
      }
    })
   
  }

  removeShelfPosition(event: MouseEvent, deviceId: any, ShelfpositionId: any) {
    event.stopPropagation(); //to stop triggering the router link
    this.deviceService.removeShelfPosition(
      Number(deviceId),
      Number(ShelfpositionId)
    );
    this.showAlert('Shelf Position removed successfully', 'success');
  }

  showAlert(message: string, type: 'success' | 'error') {
    // this.alertMessage = message
    // this.alertType = type
    // setTimeout(() => {
    //   this.alertMessage = null
    // }, 3000)
    this.toastService.show(message, type);
  }
}
