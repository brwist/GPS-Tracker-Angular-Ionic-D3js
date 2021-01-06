import { PipeTransform, Pipe } from '@angular/core';

@Pipe({
  name: 'camelStyle'
})
export class CamelPipe implements PipeTransform {
  transform(
    value: number | string,
    numberClass = 'number',
    factorialClass = 'factorial',
    delimiter = '.'
  ): any {
    const [number = 0, factorial = 0] = String(Number(value).toFixed(1)).split(
      delimiter
    );
    return `<span class="${numberClass}">${number}${delimiter}</span><span class="${factorialClass}">${factorial}</span>`;
  }
}
