import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  id: number;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = new BehaviorSubject<Notification[]>([]);
  private currentId = 0;

  notifications$ = this.notifications.asObservable();

  showSuccess(message: string, duration: number = 3000): void {
    this.showNotification('success', message, duration);
  }

  showError(message: string, duration: number = 5000): void {
    this.showNotification('error', message, duration);
  }

  showInfo(message: string, duration: number = 3000): void {
    this.showNotification('info', message, duration);
  }

  showWarning(message: string, duration: number = 4000): void {
    this.showNotification('warning', message, duration);
  }

  private showNotification(type: Notification['type'], message: string, duration: number): void {
    const notification: Notification = {
      id: this.currentId++,
      type,
      message,
      duration
    };

    const currentNotifications = this.notifications.value;
    this.notifications.next([...currentNotifications, notification]);

    if (duration > 0) {
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, duration);
    }
  }

  removeNotification(id: number): void {
    const currentNotifications = this.notifications.value;
    this.notifications.next(currentNotifications.filter(n => n.id !== id));
  }

  clearAll(): void {
    this.notifications.next([]);
  }
}