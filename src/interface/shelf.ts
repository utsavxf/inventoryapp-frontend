import { Shelfposition } from "./shelfposition"

export interface Shelf {
    id?:number
    name:string
    type:string
    shelfPosition?:Shelfposition;
}
