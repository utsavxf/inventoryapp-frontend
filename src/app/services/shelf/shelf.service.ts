import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Shelf } from '../../../interface/shelf';

@Injectable({
  providedIn: 'root'
})
export class ShelfService {

  private apiUrl='http://localhost:8080/shelf' //base url for shelves in our backend
   
  constructor(private http:HttpClient) { }

  //let's make subject to hold all shelfs and observable as a read only to which other components can subscribe this behaviour subject
  shelfSubject=new BehaviorSubject<Shelf[]>([]);
  shelves$=this.shelfSubject.asObservable();

  fetchAllShelves(){
    this.http.get<Shelf[]>(this.apiUrl+'/getAllShelves')
    .subscribe((shelves)=>{
      this.shelfSubject.next(shelves)
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

  addShelfPosition(shelfId:number,shelfPositionId:number){
   return this.http.post(`${this.apiUrl}/${shelfId}/addShelfPosition/${shelfPositionId}`,{})
  }


}
