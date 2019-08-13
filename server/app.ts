import { pinus } from 'pinus';
import { preload } from './preload';
import Updater from "./app/domain/Updater";

/**
 *  替换全局Promise
 *  自动解析sourcemap
 *  捕获全局错误
 */
preload();

/**
 * Init app for client.
 */
let app = pinus.createApp();
app.set('name', 'LockStepTest');

// app configuration
app.configure('production|development', 'connector', function () {
    app.set('connectorConfig',
        {
            connector: pinus.connectors.hybridconnector,
            heartbeat: 30,
            useDict: true,
            useProtobuf: true
        });
});

app.configure('production|development', 'game', function () {
    Updater.init();
});

// start app
app.start();