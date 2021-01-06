import { OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

export class BaseComponent implements OnDestroy {
  private _sub: Subscription[] = [];

  public set sub(value: Subscription) {
    this._sub.push(value);
  }

  public ngOnDestroy() {
    this._sub.forEach((el) => el.unsubscribe());
  }
}
