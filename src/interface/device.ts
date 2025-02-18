import { Shelfposition } from "./shelfposition"

export interface Device {
    id?:number //optional as it will be assigned by the backend
    name:string
    type:string
    shelfPositions?:Shelfposition[] //hover over it you will see ki type undefined bhi chalega,kyuki hum baad me assign karenge ye sab
}
