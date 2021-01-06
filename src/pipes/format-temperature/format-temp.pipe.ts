import { PipeTransform, Pipe } from '@angular/core';

@Pipe({
  name: 'formatTemperature'
})
export class FormatTempPipe implements PipeTransform {
  public transform(value: string | number, current: 'C' | 'F' = 'C'): any {

    if (current === 'C') {
      return convertFToC(value);
    } else {
      return Number(value).toFixed(1);
    }
  }
}

export const convertFToC = (value) =>
  Number((((Number(value) - 32) * 5) / 9).toFixed(1));
export const convertCToF = (value) =>
  Number(((Number(value) * 9) / 5 + 32).toFixed(1));
