import { Component, OnInit } from '@angular/core';
import { NotificationService, Notification } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {
  notifications: Notification[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.notifications$.subscribe(notifications => {
      this.notifications = notifications;
    });
  }

  removeNotification(id: number): void {
    this.notificationService.removeNotification(id);
  }

  getNotificationClass(notification: Notification): string {
    return `notification-${notification.type}`;
  }
}