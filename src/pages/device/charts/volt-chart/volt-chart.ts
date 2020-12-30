import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as d3 from 'd3';

declare var window: any;

interface rangeModelArgs{
  start: Date,
  end: Date
}

@Component({
  selector: 'page-volt-chart',
  templateUrl: 'volt-chart.html'
})
export class VoltChartComponent implements OnInit {
  @Input() data = [];
  @Output() public rangeTabChange = new EventEmitter<number>();
  @Output() public rangeTimeChange = new EventEmitter<rangeModelArgs>();

  chartValueAround;
  title = 'Volt';
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

  constructor() {}

  ngOnInit() {
    this.width = window.innerWidth - this.margin.left - this.margin.right - 20;
    this.height = 500 - this.margin.top - this.margin.bottom;
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
      .tickPadding(-35 - this.width);
    this.line = d3
      .line()
      .x((d: any) => this.x(d.sortTime))
      .y((d: any) => this.y(d.batteryOrVolts));

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
    this.formatDate = d3.timeFormat('%d-%b, %H:%M');
    this.y = d3.scaleLinear().rangeRound([this.height, 0]);
    this.yAxis = d3
      .axisRight(this.y)
      .ticks(10)
      .tickSize(this.width)
      .tickPadding(-35 - this.width);
    this.x.domain(d3.extent(this.data, (d) => d.sortTime));
    this.y.domain(d3.extent(this.data, (d) => d.batteryOrVolts));
    this.xAxis = d3
      .axisBottom(this.x)
      .ticks((this.width / this.height) * 5)
      .tickSize(-this.height)
      .tickPadding(10)
      .tickFormat((d) => this.multiFormat(d));
    const height = this.height + this.margin.top + this.margin.bottom;
    const width = this.width + this.margin.left + this.margin.right;

    this.svg = d3
      .select('#stacked-area')
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', [-40, 0, width + 90, height + 20])
      .call(this.zoom);
    // this.svg.select('*').remove();
    const g = this.svg.append('g').attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

    this.gX = g
      .append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(this.xAxis);

    this.gY = g.append('g').attr('class', 'axis axis--y').call(this.yAxis);

    g.append('g')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(d3.axisBottom(this.x).ticks(0));

    g.append('g').call(d3.axisLeft(this.y).ticks(0));
    this.chartBody = g.append('g').attr('class', 'chartbody').attr('clip-path', 'url(#clip)');

    this.chartBody
      .append('path').data([this.data]).attr('class', 'line').attr('d', this.line);
    this.chartBody
      .append('rect')
      .attr('width', this.width)
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
        this.chartValueAround = this.formatDate(x0) + ' ' + d.batteryOrVolts;

        const xCor = d3.event.x - 44;
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

    this.resetZoom();
  }

  resetZoom() {
    d3.selectAll('.axis--x').style('stroke-width', 0.3);
    d3.selectAll('.axis--y').style('stroke-width', 0.3);
    this.chartBody.select('rect').transition().duration(1000).call(this.zoom.scaleTo, this.scaleValue, [0, 0]);
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

  private zoomed(): void {
    this.chartValueAround = undefined;
    if(this.data.length > 0) {
      const defData = this.data[0];
      if(defData) {
        this.chartValueAround = this.formatDate(defData.sortTime) + ' ' + defData.batteryOrVolts;
      }
    }
    this.gX.call(this.xAxis.scale(d3.event.transform.rescaleX(this.x)));
    this.xt = d3.event.transform.rescaleX(this.x);
    const domain = this.xt.domain();
    this.rangeTimeChange.emit({start: domain[0], end: domain[1]});
    const newLine = d3
      .line()
      .x((d: any) => this.xt(d.sortTime))
      .y((d: any) => this.y(d.batteryOrVolts));
    d3.voronoi()
      .x((d: any) => {
        return this.xt(d.sortTime);
      })
      .y((d: any) => {
        return this.y(d.batteryOrVolts);
      })
      .extent([
        [-this.margin.left, -this.margin.top],
        [this.width + this.margin.right, this.height + this.margin.bottom]
      ]);

    this.chartBody.selectAll('path').attr('d', newLine);
    this.voronoiGroup.attr('transform', d3.event.transform);
  }
}