import { Component } from '@angular/core';
import {
  BreakpointObserver,
  Breakpoints,
  BreakpointState
} from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SocketService } from '../shared/services/socket.service';
import { MatDialog } from '@angular/material';
import { UserDialogComponent } from './user-dialog/user-dialog.component';
import { User } from '../shared/model/user';
import { Event } from '../shared/model/event';
import { Message } from '../shared/model/message';
import { Action } from '../shared/model/action';

const AVATAR_URL = 'https://api.adorable.io/avatars/285';

@Component({
  selector: 'app-chat-box-nav',
  templateUrl: './chat-box-nav.component.html',
  styleUrls: ['./chat-box-nav.component.css']
})
export class ChatBoxNavComponent {

  myuser: User;

  toUser: User;

  listOfUsers: User[] = [];

  userMessages: any = {};

  messageContent: string;

  selectedMessages: any = [];

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(map(result => result.matches));

  constructor(
    private breakpointObserver: BreakpointObserver,
    private socketService: SocketService,
    public dialog: MatDialog
  ) {
    this.openUserDialog();
  }

  openUserDialog(): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '250px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.createNewUser(result);
      this.initIoConnection();
    });
  }

  private initIoConnection(): void {

    this.socketService.initSocket();

    this.socketService.onMessage()
      .subscribe((message: Message) => {
        // this.messages.push(message);
        console.log('message is ', message);
    });

    this.socketService.onEvent(Event.INIT_USER_LIST + '-' + this.myuser.id)
      .subscribe((users: any[]) => {
        console.log('init user list');
        this.listOfUsers = users;
    });

    this.socketService.onEvent(Event.DISCONNECT)
      .subscribe(() => {
        console.log('disconnected');
    });

    this.socketService.onEvent(Event.NEW_USER_ADDED)
    .subscribe((user: any) => {
      console.log('new user is ', user);
      if (user.id !== this.myuser.id) {
        this.listOfUsers.push(user);
      }
    });

    this.socketService.onEvent(Event.INIT_USER_LIST)
    .subscribe((users: any[]) => {
      console.log('new user list is ', users);
      this.listOfUsers = users;
    });

    this.socketService.onEvent(Event.RECIEVE_MSG + '-' + this.myuser.id)
      .subscribe((msg: Message) => {
        console.log('got message  ', msg);
        if (this.toUser && msg.from.id == this.toUser.id) {
          msg.isNew = false;
        }
        if (this.userMessages[msg.from.id]) {
          this.userMessages[msg.from.id].push(msg);
        } else {
          this.userMessages[msg.from.id] = [];
          this.userMessages[msg.from.id].push(msg);
        }
    });

    this.sendNotification(Action.INIT_USER_LIST, 'Initialize user list');
    this.sendNotification(Action.JOINED, 'User is joined successfully!!');
  }

  sendMessage(msg: string) {
    const message: Message = {
      from: this.myuser,
      action: 'sendmessage',
      content: msg,
      to: this.toUser,
      isNew: true,
    };

    if (this.userMessages[this.toUser.id]) {
      this.userMessages[this.toUser.id].push(message);
    } else {
      this.userMessages[this.toUser.id] = [];
      this.userMessages[this.toUser.id].push(message);
    }

    this.socketService.send('sendmessage', message);
    this.messageContent = '';
  }

  public sendNotification(action: any, content: any): void {
    const message: Message = {
      from: this.myuser,
      action: action,
      content: content,
    };
    this.socketService.send(action, message);
  }

  selectReciever(user: any) {
    this.toUser = user;
    if (this.userMessages[user.id]) {
      for (const message of this.userMessages[user.id]) {
        message.isNew = false;
      }
    }
  }

  getNotificationCount(user: any): number {
    if (this.toUser && this.toUser.id == user.id) {
      if (this.userMessages[user.id]) {
        for (const message of this.userMessages[user.id]) {
          message.isNew = false;
        }
      }
      return 0;
    }
    let i = 0;
    if (this.userMessages[user.id]) {
      for (const message of this.userMessages[user.id]) {
        if (message.isNew) {
          i++;
        }
      }
    }
    return i;
  }

  private createNewUser(userName: string) {
    console.log('userName is ', userName);
    const randomId = this.getRandomId();
    this.myuser = new User();
    this.myuser.id = randomId;
    this.myuser.avatar = `${AVATAR_URL}/${randomId}.png`;
    this.myuser.name = userName;
  }

  private getRandomId(): number {
    return Math.floor(Math.random() * (1000000)) + 1;
  }
}
