import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { GeoZoneCondition } from '../../../../../app/conditions/geo-zone';

declare const google: any;

const fillColor                = '#ddfcff';
const strokeColor              = '#387ef5';
const circleNotInZoneFillColor = 'rgba(255, 255, 255, 0.1)';

@Component({
    selector: 'page-geo-zone-condition',
    templateUrl: 'geo-zone.html'
})
export class GeoZoneConditionPage {

    public condition: GeoZoneCondition;

    private map: any;
    private marker: any;
    private circle: any;

    private callback: (condition: GeoZoneCondition) => void;

    constructor(public navCtrl: NavController,
                public params: NavParams,
                public platform: Platform) {

        this.callback  = this.params.get('callback');
        this.condition = this.params.get('condition');

        if (!this.condition) {

            this.condition = new GeoZoneCondition(null, this.params.get('mobileDeviceLocation'));
        }
    }

    get latitude() {

        return this.condition.value.center.latitude;
    }

    set latitude(value) {

        this.condition.value.center.latitude = value;

        this.marker.setPosition({lat: this.latitude, lng: this.longitude});
        this.circle.setCenter({lat: this.latitude, lng: this.longitude});
    }

    get longitude() {

        return this.condition.value.center.longitude;
    }

    set longitude(value) {

        this.condition.value.center.longitude = value;

        this.marker.setPosition({lat: this.latitude, lng: this.longitude});
        this.circle.setCenter({lat: this.latitude, lng: this.longitude});
    }

    get radius() {

        return this.condition.value.radius;
    }

    set radius(value) {

        this.condition.value.radius = value;

        this.circle.setRadius(value);
    }

    get operator() {

        return this.condition.operator;
    }

    set operator(value) {

        this.condition.operator = value;
    }

    public save() {

        this.callback(this.condition);

        this.navCtrl.pop();
    }

    public ionViewDidEnter() {

        this.loadMap();
    }

    private loadMap() {

        const location = {lat: this.condition.value.center.latitude, lng: this.condition.value.center.longitude};

        this.map = new google.maps.Map(document.getElementById('map-geo-zone'), {
            center: location,
            scrollwheel: false,
            zoom: 15
        });

        this.marker = new google.maps.Marker({
            map: this.map,
            position: location,
            title: `Center`,
            draggable: true
        });

        this.marker.addListener('dragend', (event) => {

            this.latitude  = event.latLng.lat();
            this.longitude = event.latLng.lng();
        });

        this.circle = new google.maps.Circle({
            map: this.map,
            center: location,
            radius: this.radius,
            strokeColor,
            strokeWeight: 1,
            fillColor: this.operator === 'inZone' ? fillColor : circleNotInZoneFillColor
        });
    }
}
