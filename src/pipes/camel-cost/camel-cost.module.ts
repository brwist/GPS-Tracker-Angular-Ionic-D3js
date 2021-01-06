import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CamelPipe } from './camel-cost.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [CamelPipe],
  exports: [CamelPipe]
})
export class CamelCostModule {}
