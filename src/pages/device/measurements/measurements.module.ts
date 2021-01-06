import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { FormatTempModule } from '../../../pipes/format-temperature/format-temp.module';
import { MeasurementsPage } from './measurements';

@NgModule({
  imports: [CommonModule, IonicModule, FormatTempModule],
  declarations: [MeasurementsPage],
  exports: [MeasurementsPage],
  entryComponents: [MeasurementsPage]
})
export class MeasurementsModule { }
