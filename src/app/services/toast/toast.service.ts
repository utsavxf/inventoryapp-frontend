import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Toast } from '../../../interface/toast';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  private toastSubject = new Subject<Toast>()
  toast$ = this.toastSubject.asObservable()

  show(message: string, type: "success" | "error") {
    this.toastSubject.next({ message, type })
  }
}
