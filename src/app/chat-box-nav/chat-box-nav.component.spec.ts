
import { fakeAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ChatBoxNavComponent } from './chat-box-nav.component';

describe('ChatBoxNavComponent', () => {
  let component: ChatBoxNavComponent;
  let fixture: ComponentFixture<ChatBoxNavComponent>;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatSidenavModule],
      declarations: [ChatBoxNavComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatBoxNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should compile', () => {
    expect(component).toBeTruthy();
  });
});
