import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DeviceService } from '../../services/device/device.service';
import { Device } from '../../../interface/device';


@Component({
  selector: 'app-device',
  standalone:true,
  imports: [FormsModule,CommonModule],
  templateUrl: './device.component.html',
  styleUrls: ['./device.component.scss']
})
export class DeviceComponent {
  devices:Device[] = []
  newDevice:Device = {
    name: '',
    type: ''
  }
  showAddForm = false


  constructor(private deviceService:DeviceService) {}

  ngOnInit(): void {
     // Populate devices with dummy data
    //  this.devices = [
    //   {
    //     name: 'iPhone 15',
    //     type: 'Mobile',
    //     shelfPositions: [
    //       { name: 'Position 1' },
    //       { name: 'Position 2' }
    //     ]
    //   },
    //   {
    //     name: 'MacBook Pro',
    //     type: 'Laptop',
    //     shelfPositions: [
    //       { name: 'Position 3' }
    //     ]
    //   },
    //   {
    //     name: 'Samsung Galaxy S23',
    //     type: 'Mobile',
    //     shelfPositions: [
          
    //     ]
    //   },
    //   {
    //     name: 'Dell XPS 13',
    //     type: 'Laptop',
    //     shelfPositions: [
    //       { name: 'Position 4' }
    //     ]
    //   },
    //   {
    //     name: 'iPad Pro',
    //     type: 'Tablet',
    //     shelfPositions: [
    //     ]
    //   },
    //   {
    //     name: 'Google Pixel 7',
    //     type: 'Mobile',
    //     shelfPositions: [
    //       { name: 'Position 6' }
    //     ]
    //   }
    // ];
    //I want to populate the devices with all the devices

    this.fetchDevicesFromService(); //call kardia ab backend par vo next me devices ki list dega jisko hum ab local variable me store kar lenge
    this.deviceService.devices$.subscribe((devices)=>{
      this.devices=devices
    })
  }

  fetchDevicesFromService(){
    this.deviceService.fetchDevices();
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm
  }

  addDevice(): void {
    this.deviceService.addDevice(this.newDevice);
    //clearing the form after adding the device
    this.newDevice={name:'',type:''}; //we could also have a seperate function but we would optimize later along with form validations
  }

  editDevice(device: any): void {
    // Implement edit device logic
  }

  deleteDevice(device: any): void {
    // Implement delete device logic
  }

  assignToShelf(device: any): void {
    // Implement assign to shelf logic
  }
}
