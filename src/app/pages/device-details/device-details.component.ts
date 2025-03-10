import { Component, inject } from '@angular/core';
import { Device } from '../../../interface/device';
import { CommonModule } from '@angular/common';
import { DeviceService } from '../../services/device/device.service';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from '../../services/toast/toast.service';

@Component({
  selector: 'app-device-details',
  imports: [CommonModule],
  templateUrl: './device-details.component.html',
  styleUrl: './device-details.component.scss'
})
export class DeviceDetailsComponent {
  device:Device={
    name:'name1',
    type:'type1'
  }

  //we will now fetch the details of the device whose id is passed in the url
  private deviceService=inject(DeviceService)
  private toastService=inject(ToastService)
  private route=inject(ActivatedRoute)

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      console.log(id);
      if (id) {
        this.fetchDevice(Number(id));
      }
    });
  }

  fetchDevice(id:number): void {
    this.deviceService.getDeviceById(id).subscribe({
      next:(data: Device) => {
        this.device = data;
        console.log(this.device)
      },
      error:(error) => {
        this.showAlert(`Failed to fetched the device: ${error.message}`,error)
      }
  });
  }

  showAlert(message: string, type: 'success' | 'error') {
    this.toastService.show(message, type);
  }


}
