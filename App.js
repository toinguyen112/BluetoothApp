//https://github.com/frost4869/rn-bluetooth-permission/blob/master/App.js
import React, { Component } from 'react';
import {
    Button,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    Linking,
    Platform,
    Alert,
    Switch,
    PermissionsAndroid
} from 'react-native';

import { BleManager } from 'react-native-ble-plx';

class App extends Component {
    constructor(props) {
        super(props);

        this.manager = new BleManager();
        this.subscription = null;
        this.manager.disable();
        this.state = {
            bluetoothPermission: false,
            isEnabled: false,
            displayText: '',
            deviceList: [],
        };

    }
    componentDidMount() {
        this.subscription = this.manager.onStateChange(state => {
            this.setState({
                bluetoothStatus: state,
            });
        }, true);
    }

    openSetting = () => {
        Linking.openSettings();
    };

    // componentWillMount() {
    //     const subscription = this.manager.onStateChange(state => {
    //         console.log(this.state.bluetoothStatus);
    //         if (this.state.bluetoothStatus === 'PoweredOn') {
    //             this.scanAndConnect();
    //             subscription.remove();
    //         }
    //     }, true);

    // }



    enableBluetooth = () => {
        if (this.state.bluetoothStatus === 'PoweredOff') {
            Alert.alert(
                '"SureReserve" would like to use Bluetooth',
                '',
                [
                    {
                        text: "Don't allow",
                        style: 'cancel',
                        onPress: () => this.setState({ isEnabled: false }),


                    },
                    {
                        text: 'Ok',
                        onPress: () =>
                            Platform.OS === 'ios'
                                ? this.openSetting()
                                : this.enableAndScan(),
                        // : this.manager.enable(),
                    },
                ],
                { cancelable: false },
            );
        } else {
            alert('Already on');
        }

    };

    enableAndScan = () => {
        this.manager.enable();
        // if (this.state.bluetoothStatus == 'PoweredOn')
        // this.scanAndConnect();
        // else
        //     console.log(this.state.bluetoothStatus);
    }

    disableBluetooth = () => {
        this.manager.disable();
    }



    toggleSwitch = () => {


        if (this.state.isEnabled === false) {
            this.manager.enable();
            this.setState({
                isEnabled: true,
            }
            );
            // startScan();
            return
        }
        if (this.state.isEnabled === true) {
            this.disableBluetooth();
            this.setState({
                isEnabled: false,
            }
            );
            return
        }

        // this.setState({
        //     isEnabled: !this.state.isEnabled,
        // }
        // );

        // console.log(this.state.isEnabled);
    }

    requestLocationPermission = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
                title: 'Location permission for bluetooth scanning',
                message: 'whatever',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
            },
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log('Location permission for bluetooth scanning granted');
                return true;
            } else {
                console.log('Location permission for bluetooth scanning revoked');
                return false;
            }
        } catch (err) {
            console.warn(err);
            return false;
        }
    }

    scanAndConnect = () => {
        const permission = this.requestLocationPermission();
        if (permission) {
            this.state.deviceList = [];
            this.manager.startDeviceScan(null, null, (error, device) => {
                if (error) {
                    // Handle error (scanning will be stopped automatically)
                    // console.log('Loi ' + error.message);
                    return
                }

                // Check if it is a device you are looking for based on advertisement data
                // or other criteria.

                // console.log('device', device);

                this.state.deviceList.unshift(device);
                console.log(this.state.deviceList.length);
                if (this.state.deviceList.length == 1) {
                    this.manager.stopDeviceScan();
                }

            });
        }
    }




    render() {
        const { bluetoothStatus } = this.state;
        const { isEnabled } = this.state;
        const startScan = () => {
            if (isEnabled == true || bluetoothStatus == 'PoweredOn') {
                this.scanAndConnect();
            }
        }
        // console.log(isEnabled);
        // console.log(bluetoothStatus);
        // startScan();
        return (
            <>
                <StatusBar barStyle="dark-content" />
                <SafeAreaView style={styles.container}>
                    <Text>
                        Bluetooth status:{' '}
                        <Text style={styles.status}>{bluetoothStatus}</Text>{' '}
                    </Text>
                    {/* <Button title="Enable Bluetooth" onPress={this.enableBluetooth} />
                    <Button title="Disable Bluetooth" onPress={this.disableBluetooth} /> */}
                    {/* <Button title="Scanning" onPress={this.scanAndConnect} /> */}
                    <Switch
                        trackColor={{ false: "#767577", true: "#81b0ff" }}
                        thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
                        value={isEnabled}
                        onValueChange={this.toggleSwitch}
                    />
                </SafeAreaView>
            </>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    status: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default App;