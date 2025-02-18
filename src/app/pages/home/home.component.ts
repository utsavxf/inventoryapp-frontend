import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DeviceService } from '../../services/device/device.service';
import { ShelfService } from '../../services/shelf/shelf.service';
import { ShelfpositionService } from '../../services/shelfposition/shelfposition.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  totalDevices=0
  totalShelves=0
  totalShelfPositions=0

  private deviceService=inject(DeviceService)
  private shelfService=inject(ShelfService)
  private shelfPositionService=inject(ShelfpositionService)
  
 ngOnInit(){
  this.deviceService.fetchDevices()
  this.deviceService.devices$.subscribe((devices)=>{
    this.totalDevices=devices.length
  })
  this.shelfService.fetchShelves()
  this.shelfService.shelves$.subscribe((shelves)=>{
    this.totalShelves=shelves.length
  })

  this.shelfPositionService.fetchShelfPositions()
  this.shelfPositionService.shelfPositions$.subscribe((shelfpositions)=>{
    this.totalShelfPositions=shelfpositions.length
  })
 } 


}
