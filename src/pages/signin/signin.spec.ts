import { TestBed, ComponentFixture, async } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { MyApp } from '../../app/app.component';
import { SigninPage } from './';
import { NavController } from 'ionic-angular';
import { ApiProvider } from '../../providers/api';
import { IonicStorageModule } from '@ionic/storage';
import { Push } from '@ionic-native/push';
import { HttpClientModule } from '@angular/common/http';
import { Logger } from '../../providers/logger';

let comp: SigninPage;
let fixture: ComponentFixture<SigninPage>;
let de: DebugElement;
let el: HTMLElement;

describe('Page: Home Page', () => {

    beforeEach(async(() => {

        TestBed.configureTestingModule({

            declarations: [MyApp, SigninPage],

            providers: [NavController, Push, ApiProvider, Logger],

            imports: [
                HttpClientModule,
                IonicModule.forRoot(MyApp),
                IonicStorageModule.forRoot()
            ]

        }).compileComponents();

    }));

    beforeEach(() => {

        fixture = TestBed.createComponent(SigninPage);
        comp    = fixture.componentInstance;

    });

    afterEach(() => {
        fixture.destroy();
        comp = null;
        de   = null;
        el   = null;
    });

    it('is created', () => {

        expect(fixture).toBeTruthy();
        expect(comp).toBeTruthy();
    });

    it('initialises with a title of Sing In', () => {

        // expect(comp.title).toEqual('Sing In');
    });

    // it('can set the title to a supplied value', () => {
    //
    //     de = fixture.debugElement.query(By.css('ion-title'));
    //     el = de.nativeElement;
    //
    //     comp.changeTitle('Your Page');
    //     fixture.detectChanges();
    //     expect(comp.title).toEqual('Your Page');
    //     expect(el.textContent).toContain('Your Page');
    // });
});
