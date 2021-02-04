import { Component } from '@angular/core';
import { IDevice } from '../../providers/device';
import { RuleProvider, IRule } from '../../providers/rule';
import {
    NavController, NavParams, ItemSliding, LoadingController, PopoverController,
    AlertController, Refresher
} from 'ionic-angular';
import { RulesEditorPage } from './rule-editor/rule-editor';
import { IPagination } from '../../providers/base';
import { ConditionFactory } from '../../app/conditions/condition-factory';
import { RulesPopoverPage } from './popover';

@Component({
    selector: 'page-rules',
    templateUrl: 'rules.html'
})
export class RulesPage {

    public device: IDevice;
    public rules: IRule[] = [];

    private pagination: IPagination;

    constructor(private navCtrl: NavController,
        private ruleProvider: RuleProvider,
        private loadingCtrl: LoadingController,
        private popoverCtrl: PopoverController,
        private alertCtrl: AlertController,
        private params: NavParams) {

        this.device = this.params.get('device');
    }

    public doRefresh(refresher: Refresher) {

        this.loadRules({ pagination: { page: 1 } }, refresher);
    }

    public doInfinite(infiniteScroll) {

        if (this.pagination.nextPage) {

            this.ruleProvider.getList({ pagination: { page: this.pagination.nextPage } }).then((data: any) => {

                data.items = this.prepareRules(data.items);

                data.items.forEach((item) => {

                    let found = false;

                    this.rules.forEach((rule) => {

                        if (rule.id === item.id) {

                            found = true;
                        }
                    });

                    if (!found) {

                        this.rules.push(item);
                    }
                });

                this.pagination = data.pagination;

                infiniteScroll.complete();
            });

        } else {

            infiniteScroll.complete();
        }
    }

    public enableRule(rule, slidingItem: ItemSliding) {

        this.rules = this.rules.map((r) => {
            if (r.id === rule.id) {
                r.enabled = true;
            }

            return r;
        });

        slidingItem.close();

        this.ruleProvider.updateItem(rule);
    }

    public disableRule(rule, slidingItem: ItemSliding) {

        this.rules = this.rules.map((r) => {
            if (r.id === rule.id) {
                r.enabled = false;
            }

            return r;
        });

        slidingItem.close();

        this.ruleProvider.updateItem(rule);
    }

    public presentPopover(ev) {

        this.popoverCtrl.create(RulesPopoverPage, {
            newRuleCallback: () => {
                this.navCtrl.push(RulesEditorPage, { device: this.device });
            }
        }).present({ ev });
    }

    public goEditRulePage(id) {

        this.navCtrl.push(RulesEditorPage, { id });
    }

    public removeRule(rule: IRule, slidingItem: ItemSliding) {

        this.alertCtrl.create({
            title: 'Confirmation',
            message: `Do you really want to remove rule "${rule.name}"?`,
            buttons: [{
                text: 'Cancel',
                role: 'cancel',
                handler: () => {
                    slidingItem.close();
                }
            }, {
                text: 'Remove',
                handler: () => {
                    this.ruleProvider.removeItem(rule.id).then(() => {

                        this.rules = this.rules.filter((r) => r.id !== rule.id);
                    });
                }
            }]
        }).present();
    }

    public ionViewDidEnter() {

        this.loadRules({ pagination: { page: 1 } });
    }

    private loadRules(options, refresher?: Refresher) {

        const loader = this.loadingCtrl.create({ content: `Loading rules` });

        // noinspection JSIgnoredPromiseFromCall
        loader.present();

        if (!options.filter) {

            options.filter = {};
        }

        if (this.device) {

            options.filter.devices = this.device.id;
        }

        this.ruleProvider.getList(options).then((data: any) => {

            loader.dismiss().catch((err) => {
                console.error(err);
            });

            if (refresher) refresher.complete();

            this.rules = this.prepareRules(data.items);
            this.pagination = data.pagination;

        }).catch(() => {
            loader.dismiss().catch((err) => {
                console.error(err);
            });
            if (refresher) refresher.complete();
        });
    }

    private prepareRules(rules: any) {

        return rules.map((rule) => {

            const explanationArr = [];

            let conditions;
            let separator;

            if (rule.conditions.all) {
                separator = 'AND';
                conditions = rule.conditions.all;
            } else {
                separator = 'OR';
                conditions = rule.conditions.any;
            }

            conditions.forEach((conditionData) => {

                explanationArr.push(ConditionFactory.createCondition(conditionData).getExplanation());
            });

            rule.explanation = explanationArr.join(` ${separator} `);

            return rule;
        });
    }
}
