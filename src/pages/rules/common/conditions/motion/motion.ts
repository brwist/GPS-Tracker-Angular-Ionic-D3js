import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { MotionCondition } from '../../../../../app/conditions/motion';

/**
 * - Any motion (any motion >= 1)
 * - Motion Level 2 (motion >= 2)
 * - Motion Level 3 (motion >= 3)
 * - Motion Level 4 (motion >= 4)
 * - Motion Level 5 (motion >= 5)
 */
@Component({
    selector: 'page-motion-condition',
    templateUrl: 'motion.html'
})
export class MotionConditionPage {

    public condition: MotionCondition;

    private callback: (condition: MotionCondition) => void;

    constructor(public navCtrl: NavController,
                public params: NavParams) {

        this.callback  = this.params.get('callback');
        this.condition = this.params.get('condition');

        if (!this.condition) {

            this.condition = new MotionCondition();
        }
    }

    set motionOption(value) {

        this.condition.operator = 'greaterThan';

        switch (value) {
            case 'any-motion':
                this.condition.value = 0;
                break;
            case 'motion-level-2':
                this.condition.value = 1;
                break;
            case 'motion-level-3':
                this.condition.value = 2;
                break;
            case 'motion-level-4':
                this.condition.value = 3;
                break;
            case 'motion-level-5':
                this.condition.value = 4;
                break;
            default:
                throw new Error(`MotionComponent::motionOption(set): Unexpected motionOption: ${value}`);
        }
    }

    get motionOption() {

        switch (this.condition.value) {
            case 0:
                return 'any-motion';
            case 1:
                return 'motion-level-2';
            case 2:
                return 'motion-level-3';
            case 3:
                return 'motion-level-4';
            case 4:
                return 'motion-level-5';
            default:
                throw new Error(`MotionComponent::motionOption(get): Unexpected motionOption: ${this.condition.value}`);
        }
    }

    public save() {

        this.callback(this.condition);

        this.navCtrl.pop();
    }
}
