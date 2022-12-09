import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    Platform,
    ActivityIndicator,
    Image
} from 'react-native';
import Modal from 'react-native-modal';
import { BleManager } from 'react-native-ble-plx';
import Logo from '../../../assets/images/logo3.jpg'
import { SOCKET_URL } from '../../config'
import io from "socket.io-client";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

import PushNotification from "react-native-push-notification";



export default class HomeScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            text: '',
            isLoading: false,
            isModalVisible: false,
            info: '',
            listDevices: [],
            scanState: 'Stop Scan',
            patientID: '',
            bluetoothStatus: 'PoweredOn'
        };
        this.manager = new BleManager();
        this.socket = io.connect(`${SOCKET_URL}`);

    };

    // toggleModal = () => {
    //     this.setState({ isModalVisible: !this.state.isModalVisible });
    // };
    toggleLoading = () => {
        this.setState({ isLoading: !this.state.isLoading });
    };

    toggleTrue = () => {
        this.setState({ isLoading: true });
        // this.getData();
        // console.log(this.state.patientID);

    };

    toggleFalse = () => {
        this.setState({ isLoading: false });
    };

    componentDidMount() {
        this.createChannels();
        this.subscription = this.manager.onStateChange(state => {
            this.setState({
                bluetoothStatus: state,
            });
        }, true);

        const getData = async () => {
            try {
                const value = await AsyncStorage.getItem('@patientID');
                // console.log(value);
                if (value !== null) {
                    // value previously stored
                    this.setState({ patientID: value })
                    // console.log('Get patientID from home: ', value);
                }
            } catch (e) {
                console.log(e);
            }
        };

        getData();
    };

    // Check bluetooth PoweredOff
    componentDidUpdate(pP, pS, sS) {
        // console.log(pS);
        if (this.state.bluetoothStatus === 'PoweredOff' && this.state.bluetoothStatus !== pS.bluetoothStatus) {
            // console.log("Bạn đã tắt bluetooth");
            this.toggleLoading();
            this.manager.stopDeviceScan();
            this.setState({ listDevices: [] });
            this.handlePoweredOff();
            this.socket.emit('warning', this.state.patientID);
            return;
        }
    };



    // getData = async () => {
    //     try {
    //         const value = await AsyncStorage.getItem('@patientID')
    //         if (value !== null) {
    //             // value previously stored
    //             console.log('Get patientID from home: ', value);
    //         }
    //     } catch (e) {
    //         console.log(e);
    //     }
    // }

    // push notification

    createChannels = () => {
        PushNotification.createChannel(
            {
                channelId: 'test-channel',
                channelName: 'Test Channel'
            }
        )
    }

    handleNotification = () => {
        PushNotification.localNotification({
            channelId: 'test-channel',
            title: 'Cảnh báo',
            message: 'Bạn đã ra khỏi khu vực cho phép. Vui lòng trở lại !'
        })
    }

    handlePoweredOff = () => {
        PushNotification.localNotification({
            channelId: 'test-channel',
            title: 'Cảnh báo',
            message: 'Bạn đã tắt Bluetooth. Vui lòng bật Bluetooth !'
        })
    }

    // bluetooth

    scanBluetooth = () => {
        // console.log(this.state.bluetoothStatus);
        this.setState({ listDevices: [] });
        if (Platform.OS === 'ios') {
            this.manager.onStateChange(state => {
                if (state === 'PoweredOn') {
                    // this.toggleLoading();
                    // this.toggleModal();
                    this.toggleTrue();
                    this.scanAndConnect();
                }
            });
        } else {
            this.manager.state().then(state => {
                if (state == 'PoweredOff') {
                    this.manager.enable();
                    // this.toggleModal();
                    // this.toggleLoading();
                    this.toggleTrue();
                    this.scanAndConnect();
                    // alert('Please turn on bluetooth to scan');
                } else {
                    // this.toggleModal();
                    // this.toggleLoading();
                    this.toggleTrue();
                    this.scanAndConnect();
                }
            });

            // this.manager.onStateChange(state => {});
        }
    };
    info(message) {
        this.setState({ info: message });
    }

    error(message) {
        this.setState({ info: 'ERROR: ' + message });
    }

    scanAndConnect() {
        this.manager.startDeviceScan(null, null, (error, device) => {

            if (device !== null) {
                if (device.name === 'iTAG') {
                    console.log('scanning device: ', device.id, device.name, device.rssi);
                    // if (this.state.listDevices.length === 2) {
                    //     this.toggleFalse();
                    // }
                    // if (this.state.listDevices.length === 2) {
                    //     console.log('list device: ', this.state.listDevices);
                    // }
                    // this.socket.emit('warning', device.rssi);

                    if (device.rssi <= -88) {
                        this.manager.stopDeviceScan();
                        this.toggleLoading();
                        this.setState({ listDevices: [] });
                        this.socket.emit('warning', this.state.patientID);
                        this.handleNotification();
                    }

                    if (this.state.listDevices.length === 0) {
                        this.setState({
                            listDevices: [device]
                        });
                    } else {
                        if (
                            // Duyệt nếu id k có trong listDevices thì thêm vào listDevices, không thì thôi
                            this.state.listDevices.findIndex(x => x.id === device.id) === -1
                        ) {
                            // Khi thêm thiết bị thứ 2
                            this.setState({
                                listDevices: [...this.state.listDevices, device]
                            });
                        }
                    }
                }
            }
            if (error) {
                this.error(error.message);
                return;
            }
        });
    }



    connectBluetooth(device) {
        device
            .connect()
            .then(device => {
                return device.discoverAllServicesAndCharacteristics();
            })
            .then(
                device => {
                    alert(device.id);
                },
                err => {
                    alert('Can not connect to this device');
                }
            );
    }

    wholeDevices() {
        const ble = this.manager;
        return this.state.listDevices.map(function (device, i) {
            return (
                <View key={i} style={{ padding: 10 }}>
                    <TouchableOpacity
                        style={styles.btnDeviceList}
                    // onPress={() => {
                    //     ble.stopDeviceScan();
                    //     device
                    //         .connect()
                    //         .then(device => {
                    //             return device.discoverAllServicesAndCharacteristics();
                    //         })
                    //         .then(
                    //             device => {
                    //                 alert(device.id);
                    //                 // console.log(device.isConnectable);
                    //                 console.log('connected device: ', device);
                    //                 console.log('connected device: ', device.id, device.name, device.rssi);
                    //             },
                    //             err => {
                    //                 alert('Can not connect to this device');
                    //             }
                    //         );
                    // }}
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

        return (
            <View style={styles.container}>
                <View
                    style={{
                        flex: 1,
                        backgroundColor: '#fff',
                        width: '100%',
                        height: '100%'

                    }}
                >

                    <Image source={Logo} style={styles.logo} />
                    <View style={styles.headerModal}>
                        <Text style={styles.textTitle}>Theo dõi bệnh nhân</Text>
                    </View>
                    <View style={styles.titleModal}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>thiết bị gần đây</Text>
                        {this.state.isLoading ? (
                            <ActivityIndicator size="small" color="#00ff00" />
                        ) : null}
                    </View>
                    <ScrollView style={{ flex: 1 }}>{this.wholeDevices()}</ScrollView>
                    <View
                        style={{
                            flexDirection: "row",
                            padding: 10,
                            position: "absolute",
                            bottom: 20,
                            justifyContent: "space-around",
                            width: "100%"
                        }}
                    >
                        {
                            this.state.listDevices.length === 2 ?
                                (
                                    <View style={styles.trackView}>
                                        <Text style={styles.trackText}>Đã bật theo dõi</Text>
                                    </View>
                                )
                                : (
                                    <>
                                        <TouchableOpacity
                                            style={[styles.modalButton, { backgroundColor: "#93cd01" }]}
                                            onPress={() => {
                                                this.scanBluetooth();
                                            }}
                                        >
                                            <Text style={[styles.textSmall, { textAlign: "center" }]}>
                                                Quét
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.modalButton, { backgroundColor: '#FF1E1E' }]}
                                            onPress={() => {
                                                // this.manager.disable();
                                                this.manager.stopDeviceScan();
                                                this.toggleLoading();
                                                // this.toggleModal();
                                                this.setState({ listDevices: [] });

                                            }}
                                        >
                                            <Text style={[styles.textSmall, { textAlign: 'center' }]}>
                                                Dừng quét
                                            </Text>
                                        </TouchableOpacity>
                                    </>
                                )
                        }


                    </View>
                </View>
                {/* </Modal> */}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: '#F5FCFF',
        backgroundColor: '#fff',
        height: '100%',
        width: '100%'
    },
    // modal
    textTitle: {
        color: '#000',
        fontSize: 24,
        fontWeight: 'bold'
    },

    logo: {
        width: '70%',
        maxWidth: 200,
        height: 200,
        marginHorizontal: '25%',
    },

    textSmall: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold'
    },
    modalButton: {
        padding: 30,
        paddingTop: 5,
        paddingBottom: 10,
        borderRadius: 30,
        // borderColor: '#000',
        // borderWidth: 1
    },
    baseButton: {
        paddingTop: 10,
        paddingBottom: 10,
        borderRadius: 10,
        width: '48%'
    },
    buttonBack: {
        backgroundColor: '#93cd01'
    },
    buttonNext: {
        borderColor: '#125990',
        backgroundColor:
            'linear-gradient(180deg, rgba(41,126,189,1) 30%, rgba(27,95,148,1) 30%, rgba(26,94,146,1) 40%)'
    },
    btnDeviceList: {
        width: '100%',
        borderBottomWidth: 1,
        borderBottomColor: '#ffffff',
        paddingBottom: 5
    },
    headerModal: {
        // backgroundColor: '#326488',
        padding: 10,
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 20,
        color: '#000',
        alignItems: 'center'
    },
    titleModal: {
        backgroundColor: '#93cd01',
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    trackView: {
        backgroundColor: '#93cd01',
        padding: 30,
        paddingTop: 5,
        paddingBottom: 10,
        borderRadius: 30,
    },
    trackText: {
        fontSize: 20,
        color: '#000',
        fontWeight: 'bold'

    }
});