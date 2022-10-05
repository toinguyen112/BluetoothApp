import { View, Image, StyleSheet, TextInput, Button } from 'react-native'
import React, { useState } from 'react'


const CustomInput = ({ iconLeft, value, setValue, placeholder, secureTextEntry }) => {
    const [secureState, setSecureState] = useState(secureTextEntry);
    const changeSecureState = () => {
        setSecureState(!secureState);
    }
    return (
        <View style={styles.container}>
            <Image source={iconLeft} style={styles.iconLeft} />
            <TextInput
                placeholder={placeholder}
                style={styles.input}
                value={value}
                onChangeText={setValue}
                secureTextEntry={secureState}
            />
            {/* {
                secureTextEntry && (
                    <Button title="Change State" onPress={changeSecureState} />
                )
            } */}

        </View>
    )
};

const styles = StyleSheet.create({
    container: {
        width: '80%',
        borderBottomWidth: 1,
        borderBottomColor: '#CBCBD4',
        paddingHorizontal: 10,
        marginVertical: 20,
        flexDirection: 'row',
    },
    iconLeft: {
        width: 25,
        height: 25,
        marginTop: 10,

    },
    input: {
        fontSize: 16,
        marginLeft: 10,
    }
})

export default CustomInput