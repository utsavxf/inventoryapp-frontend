import { HttpClient } from '@angular/common/http';
import { inject, Injectable, Injector } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Shelfposition } from '../../../interface/shelfposition';
import { DeviceService } from '../device/device.service';
import { ShelfService } from '../shelf/shelf.service';

@Injectable({
  providedIn: 'root'
})
export class ShelfpositionService {
  private apiUrl='http://localhost:8080/shelfposition'
  private injector=inject(Injector)
  constructor(private http:HttpClient) { }
  private shelvesPositionsFetched=false

  private get deviceService():DeviceService{ 
    return this.injector.get(DeviceService)//Dynamically get DeviceService
  }

  private get shelfService():ShelfService{ 
    return this.injector.get(this.shelfService)//Dynamically get DeviceService
  }

  shelfPositionSubject=new BehaviorSubject<Shelfposition[]>([]);
  shelfPositions$=this.shelfPositionSubject.asObservable();


  fetchAllShelfPositions(){
    if(this.shelvesPositionsFetched)return
    this.http.get<Shelfposition[]>(this.apiUrl+'/getAllShelfPositions')
    .subscribe((shelfpositions)=>{
      this.shelfPositionSubject.next(shelfpositions)
      this.shelvesPositionsFetched=true
    })
  }

  addPosition(shelfPosition:Shelfposition){
    this.http.post<Shelfposition>(this.apiUrl+'/save',shelfPosition)
    .subscribe((newShelfPosition)=>{
      const currentShelfPositions=this.shelfPositionSubject.value
      this.shelfPositionSubject.next([...currentShelfPositions,newShelfPosition])
    })
  }

  getShelfPositionById(id:number){
    return this.http.get<Shelfposition>(`${this.apiUrl}/${id}`)
  }

  updateShelfPosition(shelPosition:Shelfposition){
    this.http.put<Shelfposition>(`${this.apiUrl}/update/${shelPosition.id}`,shelPosition).subscribe((shelPosition)=>{
      const currentShelfPositions=this.shelfPositionSubject.value
      const targetIndex=currentShelfPositions.findIndex(sp=>sp.id===shelPosition.id)
      if(targetIndex!==-1){
        currentShelfPositions[targetIndex]=shelPosition
        this.shelfPositionSubject.next([...currentShelfPositions])
      }
    })
  }

  deleteShelfPosition(shelfPositionId:number){
    this.http.delete(`${this.apiUrl}/delete/${shelfPositionId}`).subscribe(()=>{
      const targetShelfPosition=this.shelfPositionSubject.value.find((sp)=>sp.id===shelfPositionId)
      const currentShelfPositions=this.shelfPositionSubject.value.filter((sp)=>sp.id!==shelfPositionId)
      this.shelfPositionSubject.next([...currentShelfPositions])
      
      if (targetShelfPosition && targetShelfPosition.device) {
        const allDevices = this.deviceService.devicesSubject.value;

        // Find the device associated with the shelf position
        const targetDevice = allDevices.find(d => d.id === targetShelfPosition.device?.id);

        if (targetDevice) {
            // Remove the shelf position from the device's shelfPositions array
            targetDevice.shelfPositions = targetDevice.shelfPositions?.filter(sp => sp.id !== shelfPositionId);
            //this above targetDevice is reference to object in all devices,it will directly update in the allDevices array
            // Emit the updated devices list
            this.deviceService.devicesSubject.next([...allDevices]);
        }



        
        // Now for Shelf
        const allShelves = this.shelfService.shelfSubject.value;
        const targetShelf = allShelves.find((s) => s.id === targetShelfPosition.shelf?.id);
        if (targetShelf) {
            targetShelf.shelfPosition = undefined; // Set the shelfPosition to undefined
            // Emit the updated shelves list
            this.shelfService.shelfSubject.next([...allShelves]);
        }
        
    }

    })
  }




}
