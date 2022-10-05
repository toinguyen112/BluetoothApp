import { View, Text, StyleSheet, Pressable } from 'react-native'
import React from 'react'

const CustomButton = ({ onPress, text }) => {
    return (
        <Pressable style={styles.container} onPress={onPress}>
            <Text style={styles.text}>{text}</Text>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#93cd01',
        width: '80%',
        padding: 15,
        // paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginVertical: 30,

    },
    text: {
        color: '#000',
        fontSize: 18,
        fontWeight: 'bold',
    }
})

export default CustomButton