import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastService } from '../../services/toast/toast.service';

@Component({
  selector: 'app-toast',
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss'
})
export class ToastComponent {
  show = false
  message = ""
  type: "success" | "error" = "success"
  private subscription?: Subscription

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.subscription = this.toastService.toast$.subscribe((toast) => {
      this.message = toast.message
      this.type = toast.type
      this.show = true
      setTimeout(() => (this.show = false), 2000)
    })
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe()
  }
}
