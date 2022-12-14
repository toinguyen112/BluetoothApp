//https://github.com/frost4869/rn-bluetooth-permission/blob/master/App.js
import React, { Component } from 'react';
import {
    Button,
    ScrollView,
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
            text: '',
            bluetoothPermission: false,
            isEnabled: false,
            displayText: '',
            deviceList: [],
            connectedDevices: [],
            isLoading: false,
            info: '',
            scanState: 'Stop Scan',
        };

    }

    //xxx
    toggleLoading = () => {
        this.setState({ isLoading: !this.state.isLoading });
    }

    //xxx bật bluetooth
    scanBluetooth = () => {
        this.setState({ deviceList: [] });
        if (Platform.OS === 'ios') {
            this.manager.onStateChange(state => {
                if (state === 'PoweredOn') {
                    this.toggleLoading();
                    this.scanAndConnect();
                }
            });
        } else {
            this.manager.state().then(state => {
                console.log('started', state);
                if (state == 'PoweredOff') {
                    this.manager.enable();
                    this.toggleLoading();
                    this.scanAndConnect();
                    // alert('Please turn on bluetooth to scan');
                } else {
                    this.toggleLoading();
                    this.scanAndConnect();
                }
            });

            // this.manager.onStateChange(state => {});
        }
    };
    //x
    info(message) {
        this.setState({ info: message });
    }
    //x
    error(message) {
        this.setState({ info: 'ERROR: ' + message });
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
            this.scanAndConnect();
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
            this.manager.startDeviceScan(null, null, (error, device) => {
                if (device.name !== null) {
                    console.log('device', device);
                    if (this.state.deviceList.length === 0) {
                        this.setState({
                            deviceList: [device]
                        });
                        // if (device.name == 'Hồng Nhung xttb') {
                        //   console.log('ok');
                        //   this.manager.stopDeviceScan();
                        // }
                    } else {
                        if (
                            this.state.deviceList.findIndex(x => x.id === device.id) === -1
                        ) {
                            this.setState({
                                deviceList: [...this.state.deviceList, device]
                            });
                        }
                    }
                }

                if (error) {
                    this.error(error.message);
                    return;
                }
            });
        }
    }

    connectDevice = device => {
        const ble = this.manage;
        ble.stopDeviceScan();
        ble.connectToDevice(device.id).then(async device => {
            await device.discoverAllServicesAndCharacteristics();
            ble.stopDeviceScan();
            console.log('Device connected with', device.name);
            //  setDisplaText(`Device connected\n with ${device.name}`);
            //  this.setState({
            //     connectedDevices: [this.state.connectedDevices,]
            //  });
            //  setConnectedDevice(device);

            device.services().then(async service => {
                for (const ser of service) {
                    ser.characteristics().then(characteristic => {
                        getCharacteristics([...characteristics, characteristic]);
                    });
                }
            });
        });
    };

    wholeDevices() {
        const ble = this.manager;
        return this.state.deviceList.map(function (device, i) {
            return (
                <View key={i} style={{ padding: 10 }}>
                    <TouchableOpacity
                        style={styles.btnDeviceList}
                        onPress={() => {
                            ble.stopDeviceScan();
                            device
                                .connect()
                                .then(device => {
                                    return device.discoverAllServicesAndCharacteristics();
                                })
                                .then(
                                    device => {
                                        alert(device.id);
                                        // console.log(device);
                                        this.setState({
                                            connectedDevices: [...this.state.connectedDevices, device]
                                        });
                                    },
                                    err => {
                                        alert('Can not connect to this device');
                                    }
                                );
                            // ble.stopDeviceScan();
                            // ble.connectToDevice(device.id).then(async device => {
                            //     await device.discoverAllServicesAndCharacteristics();
                            //     ble.stopDeviceScan();
                            //     // console.log('Device connected with', device.name);
                            //     console.log('connected device ', device);
                            // })
                        }}
                    >
                        <Text>
                            {device.name} - {device.id}
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        });
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
                    <Text>
                        Available Device
                    </Text>
                    <ScrollView style={{ flex: 1 }}>{this.wholeDevices()}</ScrollView>

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