import { View, Text, Image, StyleSheet } from 'react-native'
import React, { useState, useContext } from 'react'
import Logo from '../../../assets/images/logo3.jpg'
import CustomInput from '../../components/CustomInput'
import CustomButton from '../../components/CustomButton/CustomButton.js'
import user from '../../../assets/icons/user.png'
import lock from '../../../assets/icons/lock.png'
import nameI from '../../../assets/icons/name.png'
import addressI from '../../../assets/icons/address.png'
import phoneI from '../../../assets/icons/phone.png'
// import { AuthContext } from '../../context/AuthContext'
import axios from 'axios'
import { BASE_URL } from '../../config'
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage'
import Toast from 'react-native-toast-message';




const SignupScreen = () => {

    const navigation = useNavigation();

    const [cccd, setCccd] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState();
    const [address, setAddress] = useState('');
    const [patientInfo, setPatientInfo] = useState();
    // const { register, test } = useContext(AuthContext);

    const storeData = async (value) => {
        try {
            await AsyncStorage.setItem('@patientID', value)
        } catch (e) {
            console.log('error: ', e);
        }
    }


    const onSignUpPressed = () => {
        // register(cccd, name, phone, address, password);
        // test();
        // console.log(cccd, name, phone, address, password);
        // navigation.navigate('Home');

        if (!cccd.trim() || !password.trim() || !name.trim() || !phone.trim() || !address.trim()) {
            Toast.show({
                type: "error",
                text1: "Lỗi đăng ký",
                text2: "Bạn cần nhập đầy đủ thông tin !",
                topOffset: 10
            })
        }
        else {
            const register = () => {
                axios.post(`${BASE_URL}/api/patients/register`, { cccd, password, name, phone, address })
                    .then(res => {
                        const patientInfo = res.data;
                        // setPatientInfo(patientInfo);
                        // AsyncStorage.setItem('patientInfo', JSON.stringify(patientInfo));
                        console.log(patientInfo);
                        storeData(res.data._id);
                        navigation.navigate('Home');
                    })
                    .catch(e => {
                        console.log('register error: ' + e);
                        Toast.show({
                            type: "error",
                            text1: "Lỗi đăng ký",
                            text2: "Số căn cước đã được đăng ký !",
                            topOffset: 10
                        })
                    });
            }
            register();
        }



    }
    return (
        <View style={styles.root}>
            <Image source={Logo} style={styles.logo} />
            <Text style={styles.title}>Đăng Ký</Text>
            <CustomInput
                iconLeft={user}
                placeholder="Số CCCD"
                value={cccd}
                setValue={setCccd}
            />
            <CustomInput
                iconLeft={nameI}
                placeholder="Họ tên"
                value={name}
                setValue={setName}
            />
            <CustomInput
                iconLeft={addressI}
                placeholder="Địa chỉ"
                value={address}
                setValue={setAddress}
            />

            <CustomInput
                iconLeft={phoneI}
                placeholder="Số điện thoại"
                value={phone}
                setValue={setPhone}
            />

            <CustomInput
                iconLeft={lock}
                placeholder="Mật khẩu"
                value={password}
                setValue={setPassword}
                secureTextEntry={true}
            />

            <CustomButton text='Đăng Ký' onPress={onSignUpPressed} />
            <Toast />
        </View>
    )
}
const styles = StyleSheet.create({
    root: {
        alignItems: 'center',
        padding: 20,
        height: '100%',
        backgroundColor: '#fff',
    },
    logo: {
        width: '70%',
        maxWidth: 200,
        height: 200,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 10,
        color: '#000',
    }
})

export default SignupScreen