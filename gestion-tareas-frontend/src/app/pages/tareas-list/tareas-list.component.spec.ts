import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TareasListComponent } from './tareas-list.component';

describe('TareasListComponent', () => {
  let component: TareasListComponent;
  let fixture: ComponentFixture<TareasListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TareasListComponent]
    });
    fixture = TestBed.createComponent(TareasListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
