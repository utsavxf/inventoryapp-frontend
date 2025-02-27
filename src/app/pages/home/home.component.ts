import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DeviceService } from '../../services/device/device.service';
import { ShelfService } from '../../services/shelf/shelf.service';
import { ShelfpositionService } from '../../services/shelfposition/shelfposition.service';
import { LoaderService } from '../../services/loader/loader.service';
import { LoaderComponent } from '../../components/loader/loader.component';

@Component({
  selector: 'app-home',
  imports: [RouterLink,LoaderComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  totalDevices=0
  totalShelves=0
  totalShelfPositions=0


  private loaderSerivce=inject(LoaderService)
  private deviceService=inject(DeviceService)
  private shelfService=inject(ShelfService)
  private shelfPositionService=inject(ShelfpositionService)
  
 ngOnInit(){
  this.loaderSerivce.show()
  this.deviceService.fetchAllDevices()
  this.deviceService.devices$.subscribe((devices)=>{
    this.totalDevices=devices.length
  })
  this.shelfService.fetchAllShelves()
  this.shelfService.shelves$.subscribe((shelves)=>{
    this.totalShelves=shelves.length
  })

  this.shelfPositionService.fetchAllShelfPositions()
  this.shelfPositionService.shelfPositions$.subscribe((shelfpositions)=>{
    this.totalShelfPositions=shelfpositions.length
  })
  this.loaderSerivce.hide()
 } 
}
