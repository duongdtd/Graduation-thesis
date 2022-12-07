import React, { useEffect } from 'react';
import { useState } from 'react';
import { decode, encode } from 'base-64'
import {
    ImageBackground, FlatList, StyleSheet, Text, View,
    Image, TextInput, Dimensions,ActivityIndicator, TouchableWithoutFeedback, Alert, Keyboard, TouchableOpacity, SafeAreaView, KeyboardAvoidingView
} from 'react-native';
import { Avatar } from 'react-native-elements';
const { width, height } = Dimensions.get('window')
const myServiceUUID = '12345678-1234-1234-1234-12345678910a'
import AsyncStorage from '@react-native-async-storage/async-storage'
const device_ch = '12345678-1234-1234-1234-12345678910c'
const data_ch = '12345678-1234-1234-1234-12345678910b'
import { Icon } from 'react-native-elements';
import { addfinger, getData, deleteFinger, checkfinger } from '../api/auth/fingerAPI';
const { width: WIDTH } = Dimensions.get('window')
export default function ListFinger({ navigation, route }) {
    const [fingerId, setFingerId] = useState("")
    const [name, setName] = useState("")
    const [fingerArray, setFingerArray] = useState([])
    const [token, setToken] = useState("")
    const [isConnecting, setIsConnecting] = React.useState(false)
    const [connectedDevice, setConnectedDevice] = React.useState('')
    const [ble_data, setBledata] = React.useState("");
    const [bufferId, setBufferId] = React.useState("")
    const [running, setRunning] = useState(false)
    //backend
    const addfingertest = async (_id) => {
        try {
            const token1 = await AsyncStorage.getItem('token')
            const accessToken = `Bearer ${token1}`
            const res = await addfinger({ fingerId: _id, name: `Finger${_id}` }, accessToken)
            if (res && res.data && res.data.success) {
                Alert.alert('Alert', res.data.message, [
                    {
                        text: 'OK',
                        onPress: () => {
                            setFingerArray([]), setName(""), setFingerId(""), navigation.navigate('MainScreen')
                        }
                    },
                    {
                        text: "Cancel",
                        style: "cancel"
                    },
                ])
                return null
            }
            else {
                Alert.alert('Alert', res.data.message, [
                    {
                        text: 'OK',
                    },
                ])
                return null
            }
            throw new Error(res.data.message || 'Error')
        } catch (error) {
            console.log(error)
        }
    }
    const deletefingertest = async () => {
        try {
            const token1 = await AsyncStorage.getItem('token')
            const accessToken = `Bearer ${token1}`
            const finger = await AsyncStorage.getItem('fingerId')
            const res = await deleteFinger(finger, accessToken)
            if (res && res.data && res.data.success) {
                Alert.alert('Alert', res.data.message, [
                    {
                        text: 'OK',
                        onPress: () => { setFingerArray([]), setName(""), setFingerId(""), navigation.navigate('MainScreen') }
                    },
                    {
                        text: "Cancel",
                        style: "cancel"
                    },
                ])
                return null
            }
            else {
                Alert.alert('Alert', res.data.message, [
                    {
                        text: 'OK',
                    },
                ])
                return null
            }
        } catch (error) {
            console.log(error)
        }
    }
    const fetchData = async () => {
        try {
            const token1 = await AsyncStorage.getItem('token')
            const accessToken = `Bearer ${token1}`
            setToken(accessToken)
            console.log(accessToken)
            const res = await getData(accessToken)
            if (res && res.data && res.data.success) {
                setFingerArray(res.data.fingers)
                return null
            }
        } catch (error) {
            console.log(error)
        }
    }
    const Delete = async (finger_Id, id) => {
        await AsyncStorage.setItem('fingerId', finger_Id)
        Alert.alert('Alert', "Delete this finger?", [
            {
                text: 'OK',
                onPress: () => { Delete_finge_BGM220(id) }
            },
            {
                text: "Cancel",
                style: "cancel"
            },
        ])
    }
    useEffect(() => {
        { fetchData(), connectDevice(route?.params?.device_connect), connectDevice(route?.params?.device_connect) }
    }, [])

    const data = route?.params?.device_connect
    const manager = route?.params?.manager
    const deviceInfo = route?.params?.deviceInfo
    //send request delete finger

    const Delete_finge_BGM220 = async (id) => {
        await manager.writeCharacteristicWithResponseForDevice(
            data,
            myServiceUUID,
            device_ch,
            encode(
                String.fromCharCode(1) + String.fromCharCode(2) + String.fromCharCode(parseInt(id))
            )
        )
    }
    //send request add finger
    const Add_finger_BGM220 = async () => {
        try {
            await manager.writeCharacteristicWithResponseForDevice(
                data,
                myServiceUUID,
                device_ch,
                encode(
                    String.fromCharCode(1) + String.fromCharCode(1) + String.fromCharCode(parseInt(fingerId))
                )
            )

        } catch (error) {
            console.log(error)
        }
    }
    //Get data BLE
    const monitor = async (id) => {
        const subscription = manager.monitorCharacteristicForDevice(
            id,
            myServiceUUID,
            data_ch,
            (error, char) => {
                if (error) {
                    console.log(error.errorCode)
                    if (error.errorCode == 201) {
                        connectDevice(id)
                    } else if (error.errorCode != 2) {
                        Alert.alert('Alert', `${error.errorCode}: ${error.reason}`)
                    }
                    return null
                }
                if (char.uuid === data_ch) {
                    try {
                        if (decode(char.value).charCodeAt(0) == 1) {
                            let temp = decode(char.value).charCodeAt(1).toString()
                            if (temp == 1) {
                                let id = decode(char.value).charCodeAt(2).toString()
                                addfingertest(id);
                            }
                            else if (temp == 3) {
                                setRunning(false)
                                Alert.alert('Alert', "Change successful", [
                                    {
                                        text: 'OK',
                                    },
                                ])
                                
                            }
                            else if (temp == 2) {
                                Alert.alert('Alert', "Delete successful", [
                                    {
                                        text: 'OK',
                                        onPress: () => { deletefingertest() }
                                    },
                                    {
                                        text: "Cancel",
                                        style: "cancel"
                                    },
                                ])
                            }
                            else if(temp == 90)
                            {
                                Alert.alert('Alert', "Failed", [
                                    {
                                        text: 'OK',
                                    },
                                    {
                                        text: "Cancel",
                                        style: "cancel"
                                    },
                                ])
                            }
                            else if (temp == 98)
                            {
                                Alert.alert('Alert', "Open success", [
                                    {
                                        text: 'OK',
                                    },
                                    {
                                        text: "Cancel",
                                        style: "cancel"
                                    },
                                ])
                            }
                            else 
                            {
                                Alert.alert('Alert', "Error", [
                                    {
                                        text: 'OK',
                                    },
                                    {
                                        text: "Cancel",
                                        style: "cancel"
                                    },
                                ])
                            }
                        }
                    } catch (error) {
                        Alert.alert('Error', error.toString(), [{ text: 'OK' }])
                    }
                }
            },
            'monitoring'
        )
    }
    if (running) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator color='red' size='large' />
            </View>
        );
    }
    // connect BLE
    const connectDevice = async (id) => {
        try {
            const findDeviceWithId = deviceInfo.filter((item) => item.id === id)
            let device =
                Array.isArray(findDeviceWithId) && findDeviceWithId.length > 0
                    ? findDeviceWithId[0]
                    : null
            if (device === null) {
                Alert.alert(
                    'Connecting Error',
                    'Can not find this device, please scan again!',
                    [{ text: 'OK' }]
                )
                return false
            }

            const isConnected = await manager.isDeviceConnected(id)
            if (!isConnected) {
                device = await manager.connectToDevice(id, {
                    refreshGatt: 'OnConnected',
                    autoConnect: true,
                })
                await device.discoverAllServicesAndCharacteristics()
            }
            //   Send_ACK(id)
            monitor(id)
            device.onDisconnected((error, device) => {
                if (error) {
                    Alert.alert('Disconected Error', error.reason, [
                        {
                            text: 'OK',
                        },
                    ])
                }

                setConnectedDevice('')
            })
            setIsConnecting('')
            setConnectedDevice(id)
        } catch (error) {
            console.log(error)
            Alert.alert('Connecting Error', `${error.toString()}`)
        }
    }
    const Change_Local_Password = async () => {
        try {
            await manager.writeCharacteristicWithResponseForDevice(
                data,
                myServiceUUID,
                device_ch,
                encode(
                    String.fromCharCode(1) + String.fromCharCode(3) + String.fromCharCode(3)
                )
            )

        } catch (error) {
            console.log(error)
        }
    }
    const change = async () => {
        setRunning(true)
        Alert.alert('Alert', "Change the local password?", [
            {
                text: 'OK',
                onPress: () => { Change_Local_Password() }
            },
            {
                text: "Cancel",
                style: "cancel"
            },
        ])
    }
    const renderItem = ({ item }) => (
        <TouchableOpacity>
            <View style={styles.item}>
                <View>
                    <Text style={styles.title}>Name: {item.name}</Text>
                    <Text style={styles.title}>ID: {item.fingerId}</Text>
                </View>
                <View>
                    <TouchableOpacity onPress={() => Delete(item._id, item.fingerId)}>
                        <Icon name="trash-2" type="feather" color="black" />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
    return (
        <SafeAreaView style={styles.container}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

                <View style={{ flex: 1, margin: 10, flexDirection: 'row', justifyContent: 'space-around' }}>
                    <View
                        style={{
                            flex: 1, alignItems: 'center',
                            justifyContent: 'space-around'
                        }}
                    >
                        <TextInput
                            style={styles.input2} placeholder="FingerID" placeholderTextColor='rgba(255,255,255,1)'
                            returnKeyType="go"
                            type='number'
                            value={fingerId}
                            keyboardType="numeric"
                            onChangeText={setFingerId}
                        >
                        </TextInput>
                    </View>
                    <View style={{
                        flex: 0.35,
                        flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
                        marginLeft: 20,
                        marginRight: 10,
                        borderRadius: 10
                    }}>
                        <View style={styles.button}>
                            <TouchableOpacity
                                style={{ width: '90%', height: '90%', alignItems: 'center', justifyContent: 'center' }}
                                onPress={() => Add_finger_BGM220()}>
                                <Icon name="plus" type="feather" color="#212437" />
                            </TouchableOpacity>
                        </View>
                    </View>

                </View>
            </TouchableWithoutFeedback>
            <View
                style={styles.deviler} />
            <TouchableOpacity
                onPress={() => change()}
                style={{ height: 40, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={styles.title}>Change local password</Text>
            </TouchableOpacity>
            <View
                style={styles.deviler} />
            <View style={{ marginTop: 10, flex: 8 }}>
                <FlatList
                    data={fingerArray}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    item: {
        backgroundColor: '#FFA500',
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 25,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    title: {
        fontSize: 16,
        color: 'black'
    },
    input2: {
        width: WIDTH / 1.6,
        height: 45,
        borderRadius: 45,
        fontSize: 16,
        backgroundColor: 'rgba(0,0,0,1)',
        color: 'rgba(255,255,255,1)',
        paddingHorizontal: 10,
    },
    deviler: {
        borderBottomColor: '#dddddd',
        borderBottomWidth: 1,
        width: '90%',
        alignSelf: 'center',
    },
    button: {
        borderWidth: 1,
        borderRadius: 25,
        width: '80%',
        alignItems: 'center',
        justifyContent: 'center',
        height: "80%"
    }
});