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

  fetchShelves(){
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



}
