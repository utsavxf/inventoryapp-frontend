import { Component, inject } from '@angular/core';
import { Shelf } from '../../../interface/shelf';
import { ShelfService } from '../../services/shelf/shelf.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-shelf-details',
  imports: [],
  templateUrl: './shelf-details.component.html',
  styleUrl: './shelf-details.component.scss'
})
export class ShelfDetailsComponent {
  shelf:Shelf={
    name:'',
    type:''
  }

  private shelfService=inject(ShelfService)
  private route=inject(ActivatedRoute)

  ngOnInit(){
    this.route.paramMap.subscribe((params)=>{
        const id=params.get('id')
        if(id){
          this.fetchShelf(Number(id))
        }
    })
  }

  fetchShelf(id:number){
   this.shelfService.getShelfById(id).subscribe((shelf)=>{
     this.shelf=shelf
   })
  }
  
}

