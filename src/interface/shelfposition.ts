import { Device } from "./device"
import { Shelf } from "./shelf"

export interface Shelfposition {
    id?:number
    name:string
    device?:Device
    shelf?:Shelf
}
