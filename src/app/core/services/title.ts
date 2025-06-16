import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TitleService {
  private _title = new BehaviorSubject<string>('');
  readonly title$: Observable<string> = this._title.asObservable();

  constructor() { }

  setTitle(newTitle: string): void {
    this._title.next(newTitle);
  }
}


