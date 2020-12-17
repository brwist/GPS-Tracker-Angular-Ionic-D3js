import { TestBed, ComponentFixture, async } from '@angular/core/testing';
import { IonicModule } from 'ionic-angular';
import { MyApp } from './app.component';
import { ApiProvider } from '../providers/api';
import { IonicStorageModule } from '@ionic/storage';
import { Push } from '@ionic-native/push';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { HttpClientModule } from '@angular/common/http';
import { Logger } from '../providers/logger';
import { AlertProvider } from '../providers/alert';
import { DeviceProvider } from '../providers/device';
import { RuleProvider } from '../providers/rule';
import { Settings } from '../providers/settings';
import { NotificationProvider } from '../providers/notification';

let comp: MyApp;
let fixture: ComponentFixture<MyApp>;

describe('Component: Root Component', () => {

    beforeEach(async(() => {

        TestBed.configureTestingModule({

            declarations: [MyApp],

            providers: [
                Push, SplashScreen, StatusBar, ApiProvider, Logger, AlertProvider, DeviceProvider, RuleProvider,
                Settings, NotificationProvider
            ],

            imports: [
                HttpClientModule,
                IonicModule.forRoot(MyApp),
                IonicStorageModule.forRoot()
            ]

        }).compileComponents();
    }));

    beforeEach(() => {

        fixture = TestBed.createComponent(MyApp);
        comp    = fixture.componentInstance;
    });

    afterEach(() => {
        fixture.destroy();
        comp = null;
    });

    it('is created', () => {

        expect(fixture).toBeTruthy();
        expect(comp).toBeTruthy();
    });

    // it('initialises with a root page of TabsPage', () => {
    //     expect(comp['rootPage']).toBe(TabsPage);
    // });
});
