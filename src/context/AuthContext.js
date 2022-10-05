import axios from 'axios';
import React, { createContext } from 'react';
import { BASE_URL } from '../config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const register = () => {
        // axios
        //     .post(`${BASE_URL}/patients/register`, {
        //         cccd,
        //         name,
        //         phone,
        //         address,
        //         password,
        //     })
        //     .then(res => {
        //         let userInfo = res.data;

        //         console.log(userInfo);
        //     })
        //     .catch(e => {
        //         console.log(`register error ${e}`);
        //     });
        console.log('vao register');
    };

    const test = () => {
        axios.get(`${BASE_URL}/api/patients/m`)
            .then(res => {
                const patientInfo = res.data;
                console.log(patientInfo);
            })
            .catch(e => {
                console.log('register error: ' + e)
            });
    }


    return (
        <AuthContext.Provider
            value={[
                register,
                test
            ]}>
            {children}
        </AuthContext.Provider>
    );
};