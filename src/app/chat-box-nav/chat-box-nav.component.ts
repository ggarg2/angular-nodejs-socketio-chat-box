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

  typingMessage: Message = {};

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

    this.socketService.onEvent(Event.RECIEVE_MSG + '-' + this.myuser.id)
      .subscribe((msg: Message) => {
        this.processTypingMessage(msg);
    });

    this.socketService.onEvent(Event.RECIEVE_MSG_ON_ENTER + '-' + this.myuser.id)
      .subscribe((msg: Message) => {
        this.processTypingMessage(msg);
    });

    this.socketService.onEvent(Event.RECIEVE_TYPINGS + '-' + this.myuser.id)
      .subscribe((msg: Message) => {
        this.processTypingMessage(msg);
    });

    this.sendNotification(Action.INIT_USER_LIST, 'Initialize user list');
    this.sendNotification(Action.JOINED, 'User is joined successfully!!');
  }

  sendMessageOnEnter(msg: string) {
    this.publishMessage(msg, 'sendmessageOnEnter');
  }

  sendMessage(msg: string, action: string) {
    this.publishMessage(msg, 'sendmessage');
  }

  sendTypings(event, msg: string): void {
    if (event.key === 'Enter') {
      return;
    }
    console.log('Inside sendTypings ');
    this.createMessage(msg);
    if (this.typingMessage.id) {
      this.socketService.send('sendTypings', this.typingMessage);
    }
  }

  selectReciever(user: any) {
    this.toUser = user;
    if (this.userMessages[user.id]) {
      for (const message of this.userMessages[user.id]) {
        message.isNew = false;
      }
    }
  }

  getNotificationCount(user: User): number {
    if (this.toUser && this.toUser.id === user.id) {
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

  private sendNotification(action: any, content: any): void {
    const message: Message = {
      from: this.myuser,
      action: action,
      content: content,
    };
    this.socketService.send(action, message);
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

  private processTypingMessage(msg: Message): void {
    console.log('got message  ', msg);
    if (this.toUser && msg.from.id === this.toUser.id) {
      msg.isNew = false;
    }
    if (this.userMessages[msg.from.id]) {
      for (const message of this.userMessages[msg.from.id]) {
        console.log(`message.id is ${message.id} and msg.id is ${msg.id}`);
        if (message.id === msg.id) {
          message.content = msg.content;
          return;
        }
      }
      console.log('before pushing');
      this.userMessages[msg.from.id].push(msg);
    } else {
      this.userMessages[msg.from.id] = [];
      this.userMessages[msg.from.id].push(msg);
    }
  }

  private processCompleteMessage(msg: Message): void {
    console.log('got message  ', msg);
    if (this.toUser && msg.from.id === this.toUser.id) {
      msg.isNew = false;
    }
    if (this.userMessages[msg.from.id]) {
      this.userMessages[msg.from.id].push(msg);
    } else {
      this.userMessages[msg.from.id] = [];
      this.userMessages[msg.from.id].push(msg);
    }
  }

  private createMessage(msg: string): void {
    if (msg == null || msg === undefined || msg.trim() === '' ) {
      return;
    }
    this.typingMessage = {
     id: this.typingMessage.id,
     from: this.myuser,
     // action: 'sendTypings',
     content: msg,
     to: this.toUser,
     isNew: true,
     isTyping: true,
   };

   if (!this.typingMessage.id) {
     this.typingMessage.id = this.getRandomId();
   }
  }

  private addMyMessagesInChatBox(): void {
    if (this.userMessages[this.toUser.id]) {
      this.userMessages[this.toUser.id].push(this.typingMessage);
    } else {
      this.userMessages[this.toUser.id] = [];
      this.userMessages[this.toUser.id].push(this.typingMessage);
    }
  }

  private publishMessage(msg: string, action: string): void {
    this.createMessage(msg);
    if (this.typingMessage.id) {
      this.addMyMessagesInChatBox();
      this.socketService.send(action, this.typingMessage);
      this.messageContent = '';
      this.typingMessage = {};
    }
  }
}
