import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormatTempPipe } from './format-temp.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [FormatTempPipe],
  exports: [FormatTempPipe]
})
export class FormatTempModule {}
