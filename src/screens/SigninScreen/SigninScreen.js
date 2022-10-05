import { View, Text, Image, Pressable, StyleSheet } from 'react-native'
import React, { useState, useContext } from 'react'
import Logo from '../../../assets/images/logo3.jpg'
import CustomInput from '../../components/CustomInput'
import CustomButton from '../../components/CustomButton/CustomButton.js'
import user from '../../../assets/icons/user.png'
import lock from '../../../assets/icons/lock.png'
import axios from 'axios'
import { BASE_URL } from '../../config'
import { useNavigation } from '@react-navigation/native';
// import { AuthContext } from '../../context/AuthContext'
import Toast from 'react-native-toast-message';


const SigninScreen = () => {

    const navigation = useNavigation();

    const [cccd, setCccd] = useState('');
    const [password, setPassword] = useState('');
    // const [check,setCheck] = useState(false);


    const onSignInPressed = () => {
        // navigation.navigate('Home');
        if (!cccd.trim() || !password.trim()) {
            Toast.show({
                type: "error",
                text1: "Lỗi đăng nhập",
                text2: "Bạn cần nhập thông tin đầy đủ!",
                topOffset: 10,
            })
        }
        else {
            const signin = () => {
                axios.post(`${BASE_URL}/api/patients/signin`, { cccd, password })
                    .then(res => {
                        const patientInfo = res.data;
                        console.log(patientInfo);
                        navigation.navigate('Home');
                    })
                    .catch(e => {
                        console.log('error: ' + e);
                        Toast.show({
                            type: "error",
                            text1: "Lỗi đăng nhập",
                            text2: "Số căn cước hoặc mật khẩu không đúng !",
                            topOffset: 10,
                        })
                    })
            }
            signin();
        }
    }


    return (
        <View style={styles.root}>
            <Image source={Logo} style={styles.logo} />
            <Text style={styles.title}>Đăng Nhập</Text>
            <CustomInput
                iconLeft={user}
                placeholder="Số CCCD"
                value={cccd}
                setValue={setCccd}
            />
            <CustomInput
                iconLeft={lock}
                placeholder="Mật khẩu"
                value={password}
                setValue={setPassword}
                secureTextEntry={true}
            />

            <CustomButton text='Đăng Nhập' onPress={onSignInPressed} />
            <View style={styles.bot}>
                <Text style={{ fontSize: 16 }}>Bạn chưa có tài khoản ?</Text>
                <Pressable onPress={() => { navigation.navigate('SignUp') }}><Text style={{ fontSize: 16, color: 'blue' }}> Đăng Ký</Text></Pressable>
            </View>
            <Toast />
        </View>
    )
}
const styles = StyleSheet.create({
    root: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
        height: '100%',
    },
    logo: {
        width: '70%',
        maxWidth: 200,
        height: 200,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 25,
        color: '#000',
    },
    bot: {
        flexDirection: 'row',
    }
})

export default SigninScreen