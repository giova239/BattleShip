import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewModeratorComponent } from './new-moderator.component';

describe('NewModeratorComponent', () => {
  let component: NewModeratorComponent;
  let fixture: ComponentFixture<NewModeratorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewModeratorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewModeratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
