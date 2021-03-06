import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import * as d3 from 'd3';

import * as moment from 'moment';
import { DeviceProvider, SelectedRange } from '../../../../providers/device';
import { Subscription } from 'rxjs/Subscription';

declare var window: any;

interface rangeModelArgs{
  start: Date,
  end: Date
}

@Component({
  selector: 'page-temperature-chart',
  templateUrl: 'temperature-chart.html'
})
export class TemperatureChartComponent implements OnInit, OnDestroy {
  @Input() data = [];
  @Input() tempType;
  @Output() public rangeTabChange = new EventEmitter<number>();
  @Output() public rangeTimeChange = new EventEmitter<rangeModelArgs>();

  public datePipeFormat;
  public rangeDateStart: any;
  public rangeDateEnd: any;
  chartValueAround;
  title = 'Temperature';
  subtitle = '';
  activeTab = 1;
  selectedTimeDuration = 1;
  scaleValue = 1;
  width: number;
  height: number;
  margin = { top: 10, right: 10, bottom: 10, left: 20 };
  x: any;
  y: any;
  svg: any;
  g: any;
  gX: any;
  gY: any;
  line: any;
  // data: any;
  allData: any;
  xAxis: any;
  yAxis: any;
  voronoiGroup: any;
  zoom: any;
  voronoi: any;
  chartBody: any;
  formatMillisecond = d3.timeFormat('.%L');
  formatSecond = d3.timeFormat(':%S');
  formatMinute = d3.timeFormat('%I:%M');
  formatHour = d3.timeFormat('%I %p');
  formatDay = d3.timeFormat('%a %d');
  formatWeek = d3.timeFormat('%b %d');
  formatMonth = d3.timeFormat('%B');
  formatYear = d3.timeFormat('%Y');
  formatDate: any;
  lineSvg: any;
  xt: any;

  selectedDetailLeft = 10;
  verticalLineH: any;

  noData = false;
  xp: any;
  dataYrange: any;

  subscriptionZoomDate$: Subscription;
  subscriptionZoomType$: Subscription;

  constructor(private deviceProvider: DeviceProvider, private decimalPipe: DecimalPipe) {}

  ngOnInit() {
    this.width = window.innerWidth - this.margin.left - this.margin.right - 20;
    this.height = 400 - this.margin.top - this.margin.bottom;
    if(this.data.length <= 0) {
      this.noData = true;
    } else {
      this.noData = false;
      this.loadSvg();
    }
  }

  ngOnDestroy() {
    this.subscriptionZoomDate$.unsubscribe();
    this.subscriptionZoomType$.unsubscribe();
  }

  loadSvg() {
    if(this.data.length > 80000) {
      this.data = this.filterDate(this.data);
    }
    // if(this.data.length > 50000) {
    //   this.data = this.filterDate(this.data);
    // }
    // if(this.data.length > 20000) {
    //   this.data = this.filterDate(this.data);
    // }
    // if(this.data.length > 10000) {
    //   this.data = this.filterDate(this.data);
    // }
    // if(this.data.length > 5000) {
    //   this.data = this.filterDate(this.data);
    // }
    // if(this.data.length > 2000) {
    //   this.data = this.filterDate(this.data);
    // }
    // if(this.data.length > 1000) {
    //   this.data = this.filterDate(this.data);
    // }
    if(this.tempType === 'cTemp') {
      this.formatDate = d3.timeFormat('%d-%b, %H:%M');
      this.datePipeFormat = 'd-MMM h:mm a';
      this.formatDay = d3.timeFormat('%d-%a');
      this.formatWeek = d3.timeFormat('%d-%b');
    } else {
      this.formatDate = d3.timeFormat('%b-%d-%y, %H:%M');
      this.datePipeFormat = 'MMM-d-yy h:mm a';
      this.formatDay = d3.timeFormat('%a-%d');
      this.formatWeek = d3.timeFormat('%b-%d');
    }
    this.x = d3.scaleTime().range([0, this.width]);
    this.y = d3.scaleLinear().rangeRound([this.height, 0]); 
    this.xAxis = d3
      .axisBottom(this.x)
      .ticks((this.width / this.height) * 5)
      .tickSize(-this.height)
      .tickPadding(10)
      .tickFormat((d) => this.multiFormat(d));

    this.yAxis = d3
      .axisRight(this.y)
      .ticks(5)
      .tickSize(this.width)
      .tickPadding(-23 - this.width);
    this.line = d3
      .line()
      .x((d: any) => this.x(d.sortTime))
      .y((d: any) => this.y(d.temperature));

    this.zoom = d3
      .zoom()
      .scaleExtent([1, Infinity])
      .translateExtent([
        [0, 0],
        [this.width, this.height]
      ])
      .extent([
        [0, 0],
        [this.width, this.height]
      ])
      .on('zoom', () => {
        this.zoomed();
      });

    
    // d3.selectAll('#stacked-area > *').remove();
    
    // this.y = d3.scaleLinear().rangeRound([this.height, 0]);
    this.dataYrange = [-5, d3.max(this.data, (d) => d.temperature)]; // d3.extent(this.data, (d) => d.temperature)
    this.yAxis = d3
      .axisRight(this.y)
      .ticks(10)
      .tickSize(this.width)
      .tickPadding(-25 - this.width);
    this.x.domain(d3.extent(this.data, (d) => d.sortTime));
    this.y.domain(this.dataYrange);
    this.xAxis = d3
      .axisBottom(this.x)
      .ticks((this.width / this.height) * 5)
      .tickSize(-this.height)
      .tickPadding(10)
      .tickFormat((d) => this.multiFormat(d));
    const height = this.height + this.margin.top + this.margin.bottom;
    const width = this.width + this.margin.left + this.margin.right;

    this.svg = d3
      .select('#stacked-area-temp')
      .append('svg')
      .attr('width', '90%')
      .attr('height', '100%')
      .attr('viewBox', [-5, 0, width, height + 20])
      .call(this.zoom);
      
    // this.svg.select('*').remove();
    const g = this.svg.append('g').attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

    this.gX = g
      .append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(this.xAxis);

    this.gY = g.append('g').attr('class', 'axis axis-temp-y').call(this.yAxis);

    g.append('g')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(d3.axisBottom(this.x).ticks(0));

    g.append('g').call(d3.axisLeft(this.y).ticks(0));
    this.chartBody = g.append('g').attr('class', 'chartbody').attr('clip-path', 'url(#clip)');

    this.chartBody
      .append('path').data([this.data]).attr('class', 'line').attr('d', this.line).attr('transform', 'translate(-8,0)');
    this.chartBody
      .append('rect')
      .attr('width', (this.width - 4))
      .attr('height', this.height)
      .attr('pointer-events', 'all')
      .style('fill', 'transparent')
      .on('click', (() => {
        if(this.data.length === 0) {
          return;
        }
        var x0 = this.xt.invert(d3.mouse(d3.event.currentTarget)[0]);
        const selectedTime: any = new Date(x0).getTime();
        
        var temp = this.data.map(d => Math.abs(selectedTime - new Date(d.sortTime).getTime()));
        var idx = temp.indexOf(Math.min(...temp));
        var d = this.data[idx];
        this.chartValueAround = this.formatDate(x0) + ' ' + this.decimalPipe.transform(d.temperature, '1.1-1') + '\u00B0';

        const xCor = d3.event.x - 52;
        this.selectedDetailLeft = xCor;
      }));

    g.append('defs')
      .append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('width', this.width)
      .attr('height', this.height);
    this.voronoiGroup = g
      .append('g')
      .attr('class', 'voronoiParent')
      .append('g')
      .attr('class', 'voronoi')
      .attr('clip-path', 'url(#clip)');
    this.voronoiGroup.append('path').attr('d', function (d) {
      return d ? 'M' + d.join('L') + 'Z' : null;
    });

    this.verticalLineH = d3.select('rect').node().getBoundingClientRect().height + 8;

    this.subscriptionZoomDate$ = this.deviceProvider.$zoomDateRange.subscribe((res) => {
      const lastEl = this.data[0];
      const endDate = moment(lastEl.sortTime);
      let start;
      switch (res) {
        case 'hour':
          start = moment(endDate).add(-1, 'hours');
          break;
        case 'day':
            start = moment(endDate).add(-1, 'day');
            break;
        case 'week':
            start = moment(endDate).add(-1, 'week');
            break;
        case 'month':
            start = moment(endDate).add(-1, 'month');
            break;
        case 'year':
          start = moment(endDate).add(-1, 'year');
          break;
        default:
          break;
      }

      this.rezoom(start.valueOf(), endDate.valueOf());
    });

    this.subscriptionZoomType$ = this.deviceProvider.$zoomChangeTemp.subscribe(val => {
      if(val) {
        this.customeZoom(val); //Not sure why customeZoom is added, D3 already handles zooming in zoomed function
      }
    });
  }

  resetZoom() {
    d3.selectAll('.axis--x').style('stroke-width', 0.3);
    d3.selectAll('.axis-temp-y').style('stroke-width', 0.3);
    this.chartBody.select('rect').transition().duration(1000).call(this.zoom.scaleTo, this.scaleValue, [0, 0]);
  }

  rezoom(dateS, dateE) {
    const width = this.width; //I removed "this.margin.left + this.margin.right" because x scale uses "this.width" as a length measurement

    this.svg.call(this.zoom)
      .transition()
      .duration(1500)
      .call(this.zoom.transform, d3.zoomIdentity
          .scale(width / (this.x(dateE) - this.x(dateS)))
          .translate(-this.x(dateS), 0));

  }

  multiFormat(date) {
    return (d3.timeSecond(date) < date
      ? this.formatMillisecond
      : d3.timeMinute(date) < date
      ? this.formatSecond
      : d3.timeHour(date) < date
      ? this.formatMinute
      : d3.timeDay(date) < date
      ? this.formatHour
      : d3.timeMonth(date) < date
      ? d3.timeWeek(date) < date
        ? this.formatDay
        : this.formatWeek
      : d3.timeYear(date) < date
      ? this.formatMonth
      : this.formatYear)(date);
  }

  setYdomain() {
    const domain = this.xt.domain();
    let xleft = moment(domain[0]).valueOf(); // this.rangeDateStart.valueOf();
    let xright = moment(domain[1]).valueOf(); // this.rangeDateEnd.valueOf();

    let temp1 = this.data.map(d => Math.abs(xleft - new Date(d.sortTime).getTime()));
    let iL = temp1.indexOf(Math.min(...temp1));
    
    let yleft;
    if (this.data[iL] !== undefined && this.data[iL - 1] !== undefined) {
      yleft = this.data[iL].temperature ? this.data[iL].temperature : this.data[iL-1].temperature;
    } else {
      yleft = 0;
    }

    let temp2 = this.data.map(d => Math.abs(xright - new Date(d.sortTime).getTime()));
    let iR = temp2.indexOf(Math.min(...temp2));

    let yright;

    if (this.data[iR] !== undefined && this.data[iR - 1] !== undefined) {
      yright = this.data[iR].temperature ? this.data[iR].temperature : this.data[iR-1].temperature;
    } 

    let dataSubset = this.data.filter(function (d) {
      return d.sortTime >= xleft && d.sortTime <= xright;
    });

    let countSubset = [];
    dataSubset.map(function (d) {
      countSubset.push(d.temperature);
    });

    countSubset.push(yleft);
    countSubset.push(yright);
    let ymax_new = d3.max(countSubset);
    let ymin_new = d3.min(countSubset);

    if (ymax_new == 0) {
      ymax_new = this.dataYrange[1];
    }
    this.y.domain([ymin_new - 4, ymax_new * 1.05]);
    d3.selectAll('.axis-temp-y').transition().call(this.yAxis);
  }

  private zoomed(): void {
    this.chartValueAround = undefined;
    const event = d3.event;
    this.gX.call(this.xAxis.scale(d3.event.transform.rescaleX(this.x)));
    // this.gY.call(this.yAxis.scale(d3.event.transform.rescaleY(this.y)));
    this.xt = d3.event.transform.rescaleX(this.x);
    // this.xp = d3.event.transform.rescaleY(this.y);
    const domain = this.xt.domain();
    this.rangeDateStart = moment(domain[0]).isValid() ? moment(domain[0]) : undefined;
    this.rangeDateEnd = moment(domain[1]).isValid() ? moment(domain[1]) : undefined;
    // this.rangeTimeChange.emit({start: domain[0], end: domain[1]});
    const newLine = d3
    .line()
    .x((d: any) => this.xt(d.sortTime))
    .y((d: any) => this.y(d.temperature));
    d3.voronoi()
    .x((d: any) => {
      return this.xt(d.sortTime);
    })
    .y((d: any) => {
      return this.y(d.temperature);
    })
    .extent([
      [-this.margin.left, -this.margin.top],
      [this.width + this.margin.right, this.height + this.margin.bottom]
    ]);
    
    this.chartBody.selectAll('path').attr('d', newLine);
    this.voronoiGroup.attr('transform', d3.event.transform);
    this.setYdomain();
    this.deviceProvider.zoomedVolt(event);
  }

  private customeZoom(event) {
    this.chartValueAround = undefined;
    this.gX.call(this.xAxis.scale(event.transform.rescaleX(this.x)));
    this.xt = event.transform.rescaleX(this.x);
    // this.gY.call(this.yAxis.scale(event.transform.rescaleY(this.y)));
    // this.xp = event.transform.rescaleY(this.y);
    const domain = this.xt.domain();
    this.rangeDateStart = moment(domain[0]).isValid() ? moment(domain[0]) : undefined;
    this.rangeDateEnd = moment(domain[1]).isValid() ? moment(domain[1]) : undefined;
    // this.rangeTimeChange.emit({start: domain[0], end: domain[1]});
    const newLine = d3
      .line()
      .x((d: any) => this.xt(d.sortTime))
      .y((d: any) => this.y(d.temperature));
    d3.voronoi()
      .x((d: any) => {
        return this.xt(d.sortTime);
      })
      .y((d: any) => {
        return this.y(d.temperature);
      })
      .extent([
        [-this.margin.left, -this.margin.top],
        [this.width + this.margin.right, this.height + this.margin.bottom]
      ]);

    this.chartBody.selectAll('path').attr('d', newLine);
    this.voronoiGroup.attr('transform', event.transform);
    this.setYdomain();
  }

  private filterDate(data: any[]) {
    let res = data.map((item, index) => {
        return (index % 2 !== 1) ? {
            sortTime: item.sortTime,
            temperature: item.temperature
        } : null;
    }).filter(function(entry) {
        return entry != null;
    });

    return res;
  }
}
