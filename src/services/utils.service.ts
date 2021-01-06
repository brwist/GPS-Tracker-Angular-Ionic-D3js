import { Injectable } from '@angular/core';

interface IFeatureFlag {
    pushLastOpenedDevicePage: boolean;
}

@Injectable()
export class UtilsService {

    public static toFixed(value: string | number, n = 2) {
        return Number(value).toFixed(n);
    }

    public static getPointColor(coordinates): string {

        let numberOf = 0;

        const decimalPlaces0 = coordinates[0].toString().split('.')[1];
        const decimalPlaces1 = coordinates[1].toString().split('.')[1];

        if (decimalPlaces0 && decimalPlaces1) {

            if (decimalPlaces0.length === decimalPlaces1.length) {

                if (decimalPlaces0.length > 4) {

                    return 'blue';

                } else {

                    return 'red';
                }
            }

            if (decimalPlaces0.length > 4 || decimalPlaces1.length > 4) {

                return 'blue';
            }
        }

        if (decimalPlaces0) {

            numberOf = decimalPlaces0.length;

        } else if (decimalPlaces1) {

            numberOf = decimalPlaces1.length;
        }

        return numberOf > 4 ? 'blue' : 'red';
    }

    public static featureFlags(): IFeatureFlag {

        return {
            pushLastOpenedDevicePage: false
        };
    }
}
