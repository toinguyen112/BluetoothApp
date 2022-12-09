/**
 * @format
 */

import { AppRegistry, Platform } from 'react-native';
import App from './AppMain';
// import App from './AppTest';
import PushNotification from "react-native-push-notification";


import { name as appName } from './app.json';

PushNotification.configure({
    onNotification: function (notification) {
        console.log("NOTIFICATION:", notification);

    },
    requestPermissions: Platform.OS === 'ios'
})

AppRegistry.registerComponent(appName, () => App);

