import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChatBoxComponent } from './chat-box/chat-box.component';
import { MatGridListModule, MatCardModule, MatMenuModule,
  MatIconModule, MatButtonModule, MatToolbarModule,
  MatSidenavModule, MatListModule, MatFormFieldModule,
  MatInputModule, MatDialogModule } from '@angular/material';
import {MatBadgeModule} from '@angular/material/badge';
import { LayoutModule } from '@angular/cdk/layout';
import { ChatBoxNavComponent } from './chat-box-nav/chat-box-nav.component';
import { FormsModule } from '@angular/forms';
import { UserDialogComponent } from './chat-box-nav/user-dialog/user-dialog.component';
import {MatChipsModule} from '@angular/material/chips';


@NgModule({
  declarations: [
    AppComponent,
    ChatBoxComponent,
    ChatBoxNavComponent,
    UserDialogComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatGridListModule,
    MatCardModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    LayoutModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatDialogModule,
    MatBadgeModule,
    MatChipsModule,
  ],
  entryComponents: [UserDialogComponent],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
