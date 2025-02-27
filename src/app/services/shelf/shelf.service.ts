import { HttpClient } from '@angular/common/http';
import { inject, Injectable, Injector } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Shelf } from '../../../interface/shelf';
import { ShelfpositionService } from '../shelfposition/shelfposition.service';

@Injectable({
  providedIn: 'root'
})
export class ShelfService {

  private apiUrl='http://localhost:8080/shelf' //base url for shelves in our backend
   
  constructor(private http:HttpClient) { }

  private shelvesFetched=false
   
  private injector=inject(Injector) 
    
   private get shelfPositionService():ShelfpositionService{
      return this.injector.get(ShelfpositionService)
    }

  //let's make subject to hold all shelfs and observable as a read only to which other components can subscribe this behaviour subject
  shelfSubject=new BehaviorSubject<Shelf[]>([]);
  shelves$=this.shelfSubject.asObservable();

  fetchAllShelves(){
    if(this.shelvesFetched)return
    this.http.get<Shelf[]>(this.apiUrl+'/getAllShelves')
    .subscribe((shelves)=>{
      this.shelfSubject.next(shelves)
      this.shelvesFetched=true 
    })
  }

  addShelf(shelf:Shelf){
    this.http.post<Shelf>(this.apiUrl+'/save',shelf)
    .subscribe((newShelf)=>{
       //get the current list,add the new shelf and emit to all subscribers/listeners
       const currentShelves=this.shelfSubject.value
       this.shelfSubject.next([...currentShelves,newShelf])
    })
  }

  getShelfById(id:number){
    return this.http.get<Shelf>(`${this.apiUrl}/${id}`)

  }

  updateShelf(shelf:Shelf){
    this.http.put<Shelf>(`${this.apiUrl}/update/${shelf.id}`,shelf).subscribe((shelf)=>{
      const currentShelfs=this.shelfSubject.value
      const index=currentShelfs.findIndex(s=>s.id===shelf.id)
      if(index!==-1){
        currentShelfs[index]=shelf
        this.shelfSubject.next([...currentShelfs])
      }
    })
  } 

  addShelfPosition(shelfId: number, shelfPositionId: number) {
    // Making the HTTP POST request to add a shelf position
    this.http.post(`${this.apiUrl}/${shelfId}/addShelfPosition/${shelfPositionId}`, {}).subscribe(() => {
      // Fetching all shelf positions
      const allShelfPositions = this.shelfPositionService.shelfPositionSubject.value;
      const targetShelfPosition = allShelfPositions.find((sp) => sp.id === shelfPositionId);
  
      if (targetShelfPosition) {
        // Fetching all shelves
        const allShelves = this.shelfSubject.value;
        const targetShelf = allShelves.find((s) => s.id === shelfId);
  
        if (targetShelf) {
          // Updating the shelf position and shelf references
          targetShelfPosition.shelf = targetShelf; // Assigning targetShelf to shelf property of targetShelfPosition
          targetShelf.shelfPosition = targetShelfPosition; // Assigning targetShelfPosition to shelfPosition property of targetShelf
  
          // Emit updated subjects to notify all subscribers
          this.shelfSubject.next([...allShelves]);
          this.shelfPositionService.shelfPositionSubject.next([...allShelfPositions]);
        }
      }
    });
  }

  deleteShelf(shelfId:number){
    this.http.delete(`${this.apiUrl}/delete/${shelfId}`).subscribe(()=>{
      const taregtShelf=this.shelfSubject.value.find((s)=>s.id===shelfId)
      const currentShelves=this.shelfSubject.value.filter((s)=>s.id!==shelfId)
      this.shelfSubject.next([...currentShelves])
      

      //also we have to free up that shelfPosition
      const allShelfPositions=this.shelfPositionService.shelfPositionSubject.value
      const targetShelfPosition=allShelfPositions.find((sp)=>sp.id===taregtShelf?.shelfPosition?.id)
      if(targetShelfPosition){
        targetShelfPosition.shelf=undefined
      }
      //and now have to notify it everywhere else
      this.shelfPositionService.shelfPositionSubject.next([...allShelfPositions])


    })
  }

  removeShelfPosition(shelfId:number,shelfPositionId:number){
    this.http.delete(`${this.apiUrl}/${shelfId}/removeShelfPosition/${shelfPositionId}`).subscribe(()=>{
      const allShelves=this.shelfSubject.value
      const targetShelf=allShelves.find((s)=>s.id===shelfId)
      if(targetShelf)targetShelf.shelfPosition=undefined
      this.shelfSubject.next([...allShelves])

      //do changes to shelfPosition and emit to all other subscibers
      const allShelfPositions=this.shelfPositionService.shelfPositionSubject.value
      const targetShelfPosition=allShelfPositions.find((sp)=>sp.id===shelfPositionId)
      if(targetShelfPosition)targetShelfPosition.shelf=undefined
      this.shelfPositionService.shelfPositionSubject.next([...allShelfPositions])
    })
  }


}
