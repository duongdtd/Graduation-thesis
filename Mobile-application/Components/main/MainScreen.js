import { decode, encode } from 'base-64'
import moment from 'moment'
import React from 'react'
import { LogBox } from 'react-native';
LogBox.ignoreLogs(['new NativeEventEmitter']); // Ignore log notification by message
LogBox.ignoreAllLogs(); //Ignore all log notifications
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  TextInput,
} from 'react-native'
import { useNetInfo, NetInfoState } from "@react-native-community/netinfo";
import Modal from 'react-native-modal'
import { Icon, Avatar } from 'react-native-elements'
import { BleManager } from 'react-native-ble-plx'
import AsyncStorage from '@react-native-async-storage/async-storage'
const { width, height } = Dimensions.get('window')
const myServiceUUID = '12345678-1234-1234-1234-12345678910a'
import { fetchMe, open, login } from '../api/auth/authAPI';
import { Buffer } from "buffer";
const device_ch = '12345678-1234-1234-1234-12345678910c'
const data_ch = '12345678-1234-1234-1234-12345678910b'
const manager = new BleManager()
const public_key = 10;
export default function MainScreen({ navigation, route }) {
  const internetState = useNetInfo();
  React.useEffect(() => {
    // if (internetState.isConnected === false) {
    //   Alert.alert(
    //     "No Internet! ❌",
    //     "Sorry, we need an Internet connection for MY_APP to run correctly.",
    //     [{ text: "Okay" }]
    //   );
    // }
  }, [internetState.isConnected]);
  const handleCheckPassword = async (pass) => {
    try {
        const mail = await AsyncStorage.getItem('email')
        const res = await login({ username: mail, password: pass })
        if (res && res.data && res.data.success) {
          setModalVisible1(false),navigation.navigate('ListFinger', {
            device_connect: connectedDevice,
            manager: manager,
            deviceInfo: deviceInfo
          })
          return null
        }
        Alert.alert('Error', "Missing password or incorrect password", [
          {
            text: 'OK',
          },
        ])
        throw new Error(res.data.message || 'Unknown error!!!')
    } catch (error) {
      console.log(error)
    }
    return null
  }

  const handleLogin = async (pass) => {
    try {
      if (internetState.isConnected === true) {
        const mail = await AsyncStorage.getItem('email')
        const res = await login({ username: mail, password: pass })
        if (res && res.data && res.data.success) {
          open()
          Alert.alert('Alert', 'Success', [
            {
              text: 'OK',
              onPress: () => { { setModalVisible1(false) } }
            },
          ])
          return null
        }
        Alert.alert('Error', "Missing password or incorrect password", [
          {
            text: 'OK',
          },
        ])
        throw new Error(res.data.message || 'Unknown error!!!')
      }
      else if (internetState.isConnected === false && connectedDevice === "") {
        Alert.alert('Error', "No Internet!", "Connect to device with BLE connection!", [
          {
            text: 'OK',
          },
        ])
      }
      else {
        requestData(pass)
      }
    } catch (error) {
      console.log(error)
    }
    return null
  }

  React.useEffect(() => {
    // Use `setOptions` to update the button that we previously specified
    // Now the button includes an `onPress` handler to update the count
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={{ margin: 5 }}
          onPress={() => setModalVisible1(true)}>
          <Icon name="unlock" type="feather" color="black" />
        </TouchableOpacity>

      ),
    });
  }, [navigation]);



  const handleSignal = (signal) => {
    if (signal < -90) {
      return 'Very low'
    }
    if (signal < -80) {
      return 'Low'
    }
    if (signal < -70) {
      return 'Good'
    }
    if (signal < -60) {
      return 'Very good'
    }
    if (signal < -50) {
      return 'Excellent'
    }
    return 'Unknown'
  }
  const [modalVisible, setModalVisible] = React.useState(false)
  const [modalVisible1, setModalVisible1] = React.useState(false)
  const [bluetoothStatus, setBluetoothStatus] = React.useState('PoweredOff')
  const [deviceInfo, setDeviceInfo] = React.useState([])
  const [connectedDevice, setConnectedDevice] = React.useState('')
  const [data, setData] = React.useState(-1)
  const [isShow, setIs] = React.useState(false)
  const [email, setEmail] = React.useState('')
  const [se, setSe] = React.useState("")
  const [pass, SetPass] = React.useState("")
  // scroll ref
  const scrollViewRef = React.useRef()
  // state action
  const [scanLoading, setScanLoading] = React.useState(false)
  const [isConnecting, setIsConnecting] = React.useState(false)
  const [isRequest, setIsRequest] = React.useState(false)
  const [isLoadingData, setIsLoadingData] = React.useState(false)
  const [isFetchLastest, setIsFetchLastest] = React.useState(false)

  //text
  const [text, onChangeText] = React.useState("Useless Text");
  const [number, onChangeNumber] = React.useState(null);

  const [password, setPassword] = React.useState("");
  const [passhidden, setPasshidend] = React.useState("");
  const [pin, setPin] = React.useState("");
  const updatePassword = async (text) => {
    setPassword(password => password + text)
    setPasshidend(passhidden => passhidden + '*')

  }
  const clearPassword = async () => {
    setPassword("")
    setPasshidend("")
    console.log(se)
  }
  const [ble_data, setBledata] = React.useState("");
  const scanDevice = () => {
    if (bluetoothStatus === 'PoweredOn') {
      setScanLoading(true)
      manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          Alert.alert('Scanning error', error.reason, [
            {
              text: 'OK',
            },
          ])
          setScanLoading(false)
          return null
        }
        // Scan thiết bị trong 5s
        setTimeout(() => {
          manager.stopDeviceScan()
          setScanLoading(false)
        }, 5000)
        // Cập nhật signal và thông tin thiết bị trong  5s
        setDeviceInfo((s) => {
          if (!device.id) {
            return s
          }
          if (s.map((item) => item.id).includes(device.id)) {
            const newS = s.map((item) =>
              item.id !== device.id ? item : device
            )
            return newS
          }
          return [...s, device]
        })
      })
    }
    else {
      Alert.alert('Permission', 'Turn on bluetooth?', [
        {
          text: 'OK',
          onPress: () => {
            manager.enable()
          },
        },
        {
          text: 'Cancel',
        },
      ])
    }
  }
  function decode_ble(value, pub_key, pri_key) {
    return value - pri_key - pub_key
  }
  function encode_ble(val, pub_key) {
    let value = [...Buffer.from(val)]
    let pri_key = Math.floor(Math.random() * 20);
    console.log("len :", value.length)
    let x = value.length
    pri_key = pri_key + pub_key
    for (let i = 0; i < x; i++) {
      value[i] += pri_key
    }
    value.unshift((pri_key - pub_key))
    return value
  }
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
            let private_key = decode(char.value).charCodeAt(2)
            if (decode_ble(decode(char.value).charCodeAt(0), public_key, private_key) == 2) {
              let temp = decode_ble(decode(char.value).charCodeAt(1), public_key, private_key)
              console.log(temp)
              if (temp == 0) {
                disconnectDevice();
              }
              else
              {
                setPin(temp)
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
  const Send_ACK = async (id, data) => {
    let str = encode_ble(data, public_key)
    str.unshift(2)
    let length = str.length
    console.log("len :", length)
    let code = "";
    for (let i = 0; i < length; i++) {
      code = code + String.fromCharCode(str[i])
    }
    await manager.writeCharacteristicWithResponseForDevice(
      id,
      myServiceUUID,
      device_ch,
      encode(code)
    )
  }
  const connectDevice = async (id) => {
    try {
      setIsConnecting(id)
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
      Send_ACK(id, se)
      monitor(id)
      device.onDisconnected((error, device) => {
        if (error) {
          Alert.alert('Disconected Error', error.reason, [
            {
              text: 'OK',
            },
          ])
        }
        setIsRequest(false)
        setIsLoadingData(false)
        setConnectedDevice('')
      })
      setIsConnecting('')
      setConnectedDevice(id)
    } catch (error) {
      console.log(error)
      Alert.alert('Connecting Error', `${error.toString()}`)
    }
  }
  const requestData = async (data) => {
    try {
      if (connectedDevice.length > 0) {
        let device
        const isConnected = await manager.isDeviceConnected(connectedDevice)
        if (!isConnected) {
          device = await manager.connectToDevice(connectedDevice)
          await device.discoverAllServicesAndCharacteristics()
        }
        let string = data
        let length = string.length
        let code = "";
        for (let i = 0; i < length; i++) {
          let num = parseInt(string[i])
          code = code + String.fromCharCode(num)
        }
        await manager.writeCharacteristicWithResponseForDevice(
          connectedDevice,
          myServiceUUID,
          device_ch,
          encode(code)
        )
      } else {
        Alert.alert('Error', 'You have not connected any device yet!')
      }
    } catch (error) {
      Alert.alert('With Response Error', error.toString(), [{ text: 'OK' }])
    }
  }
  const check_data = async (data) => {
    let string = data
    let length = string.length
    console.log(string.length)
    let code = "";
    for (let i = 0; i < length; i++) {
      let num = parseInt(string[i])
      code = code + String.fromCharCode(num)
    }
    await manager.writeCharacteristicWithResponseForDevice(
      connectedDevice,
      myServiceUUID,
      device_ch,
      encode(code)
    )
  }
  const handleLogout = async () => {
    try {
      await AsyncStorage.clear()

      // disconnectDevice()
      // setDeviceInfo([])
      navigation.navigate('Login')
    } catch (error) {
      console.log(error)
      Alert.alert('Error', 'Cannot logout!')
    }
  }
  const disconnectDevice = async () => {
    try {
      setConnectedDevice('')
      // await manager.cancelDeviceConnection(id)
      // console.log('disconnect')
      manager.cancelTransaction('monitoring')
      await manager.disable()
      await manager.enable()
    } catch (error) {
      console.log(error)
      Alert.alert('Disconnecting Error', `${error.toString()}`)
    }
  }
  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'ios') {
        Alert.alert('We will not support ios in near future!', [
          { text: 'OK', onPress: () => handleLogout() },
        ])
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Covid Care App',
            message: 'Covid Care App access to your location!',
          }
        )
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Alert', 'Location permission denied', [
            {
              text: 'OK',
              onPress: () => handleLogout(),
            },
          ])
        }
      }
    } catch (err) {
      console.warn(err)
    }
  }
  const handleFetchMe = async () => {
    try {
      const token = await AsyncStorage.getItem('token')
      if (!token) {
        navigation.navigate('Login')
        return null
      }
      const accessToken = `Bearer ${token}`
      console.log(accessToken)
      const res = await fetchMe(accessToken)
      if (res && res.data && res.data.success) {
        await AsyncStorage.setItem('token', token)
        await AsyncStorage.setItem('email', res.data.user.username)
        setEmail(res.data.user.username)
        setSe(res.data.user.device_id)
        return null
      }
      throw new Error('Unauthorized')
    } catch (error) {
      console.log(error)
      await AsyncStorage.clear()
    }
  }
  React.useEffect(() => {
    const subscription = manager.onStateChange((state) => {
      setBluetoothStatus(state)
    }, true)
    return () => subscription.remove()
  }, [manager])
  React.useEffect(() => {
    // side effects
    handleFetchMe()
    requestLocationPermission()
  }, [requestLocationPermission, handleFetchMe])
  return (

    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ flex: 0.8,alignItems:'center', marginTop: 10 ,flexDirection:'row'}}>
        <View style={{alignItems:'center'}}>
        
        <Avatar 
          rounded
          size="medium"
          onPress={() => navigation.navigate('Profile',{email: route?.params?.email})}
          containerStyle={{marginLeft: 10, marginTop: 2}}
          source={{
            uri:
              'https://png.pngtree.com/png-clipart/20190924/original/pngtree-user-vector-avatar-png-image_4830521.jpg',
          }}></Avatar>
          </View>
          <View style={{marginLeft :10,alignItems:'stretch'}}>
            <Text style={{fontSize :18,color:'black'}}>Hello, Welcome Home!</Text>
            <Text style={{fontSize :18,color:'black'}}>{route?.params?.email}</Text>
          </View>
          <View style={{marginLeft :50,alignItems:'stretch'}}>
            <Text style={{fontSize :18,color:'black'}}>Pin:98%</Text>
          </View>
      </View>
      <View style={styles.deviler}></View>
      {modalVisible1 ?
        <Modal
          isVisible={modalVisible1}
          onBackdropPress={() => setModalVisible1(false)}
          animationOut="slideOutUp"
          transparent={true}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>Insert password</Text>
              <TextInput
                style={{
                  height: 40, width: width / 1.5, borderRadius: 25,
                  margin: 12,
                  borderWidth: 1,
                  padding: 10,
                }} placeholder="Password" placeholderTextColor='rgba(255,255,255,1)'
                returnKeyType="go"
                secureTextEntry={true}
                type='text'
                value={pass}
                onChangeText={(text) => SetPass(text)}
              />
              <View style={{
                marginTop: 10, width: width / 1.5, justifyContent: 'center', alignItems: 'center', flexDirection:
                  'row', justifyContent: 'space-between'
              }}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonClose]}
                  onPress={() => { handleCheckPassword(pass), SetPass("") }}
                >
                  <Text style={styles.textStyle}>OK</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.buttonClose]}
                  onPress={() => { setModalVisible1(false), SetPass("") }}
                >
                  <Text style={styles.textStyle}>Cancel</Text>
                </TouchableOpacity>
              </View>

            </View>
          </View>
        </Modal> : null}
      <View style={{ flex: 1 }}>
        <ScrollView style={styles.container}>
          <Modal
            isVisible={modalVisible}
            onBackdropPress={() => setModalVisible(false)}
            animationOut="slideOutUp"
          >
            <View
              style={{
                flex: 1,
                backgroundColor: '#F4F3F8',
                padding: 20,
                paddingTop: 40,
                alignItems: 'center',
              }}
            >
              <TouchableOpacity
                style={{ position: 'absolute', right: 10, top: 10 }}
                onPress={() => setModalVisible(false)}
              >
                <Icon name="closecircleo" type="ant-design" color="#ff0000" />
              </TouchableOpacity>
              {scanLoading && <ActivityIndicator color="#212437" />}
              <ScrollView
                style={{
                  flex: 1,
                  width: '100%',
                  marginTop: 25,
                }}
              >
                {Array.isArray(deviceInfo) &&
                  deviceInfo.length > 0 &&
                  deviceInfo.map((item, id) => (
                    <View
                      key={id}
                      style={{
                        backgroundColor: 'white',
                        borderRadius: 10,
                        padding: 10,
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 10,
                      }}
                    >
                      <View>
                        <View style={styles.deviceInfoRow}>
                          <Icon
                            name="perm-device-information"
                            type="material-icons"
                            color="#212437"
                          />

                          <Text style={[styles.headerText, { fontSize: 13 }]}>
                            {item.id ? `: ${item.id}` : ': Unknown ID'}
                          </Text>
                        </View>
                        <View style={styles.deviceInfoRow}>
                          <Icon name="user" type="ant-design" color="#212437" />
                          <Text
                            style={[styles.headerText, { fontSize: 13 }]}
                            numberOfLines={1}
                          >
                            {item.name
                              ? item.name.length > 10
                                ? `: ${item.name.slice(0, 12)}...`
                                : `: ${item.name}`
                              : ': ???'}
                          </Text>
                        </View>
                        <View style={styles.deviceInfoRow}>
                          <Icon
                            name="signal-cellular-alt"
                            type="material-icons"
                            color="#212437"
                          />
                          <Text style={[styles.headerText, { fontSize: 13 }]}>
                            {item.rssi
                              ? `: ${handleSignal(item.rssi)}`
                              : `: No signal`}
                          </Text>
                        </View>
                      </View>
                      <View>
                        {isConnecting === item.id ? (
                          <ActivityIndicator
                            color="#212437"
                            size={'large'}
                            style={{ marginRight: 40 }}
                          />
                        ) : (
                          <TouchableOpacity
                            style={[
                              styles.connectButton,
                              connectedDevice === item.id
                                ? styles.connectedState
                                : styles.notConnectedState,
                            ]}
                            // Không thể connect nếu đang scan
                            disabled={scanLoading}
                            onPress={async () => {
                              if (connectedDevice === item.id) {
                                disconnectDevice(item.id)
                              } else {
                                connectDevice(item.id)
                              }
                            }}
                          >
                            <Text style={{ color: '#212437', fontSize: 15 }}>
                              {connectedDevice === item.id
                                ? 'Disconnect'
                                : 'Connect'}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  ))}
              </ScrollView>
            </View>
          </Modal>
        </ScrollView>
      </View>
      {/* <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Text>recieve</Text>
        <Text>{ble_data}</Text>
        <Text>data</Text>
      </View> */}

      <View style={{ flex: 4, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{
          alignItems: 'center',
          justifyContent: 'center', marginBottom: 20,
          borderRadius: 30, height: height / 15, width: width / 1.2, borderWidth: 1
        }}>
          {isShow ? <Text style={styles.text}>{password}</Text> : <Text style={styles.text}>{passhidden}</Text>}
          <TouchableOpacity style={styles.inputIcon3} onPress={() => { setIs((x) => !x) }} >
            <Icon name={isShow ? "visibility" : "visibility-off"} type="material" color='black' />
          </TouchableOpacity>
        </View>
        <View style={{ height: height / 2, width: width / 1.2, borderWidth: 1, borderRadius: 30 }}>
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
            <View style={styles.viewText}>
              <TouchableOpacity style={styles.Opacity} onPress={() => updatePassword('1')}>
                <Text style={styles.text}>1</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.viewText}>
              <TouchableOpacity style={styles.Opacity} onPress={() => updatePassword('2')}>
                <Text style={styles.text}>2</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.viewText}>
              <TouchableOpacity style={styles.Opacity} onPress={() => updatePassword('3')}>
                <Text style={styles.text}>3</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
            <View style={styles.viewText}>
              <TouchableOpacity style={styles.Opacity} onPress={() => updatePassword('4')}>
                <Text style={styles.text}>4</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.viewText}>
              <TouchableOpacity style={styles.Opacity} onPress={() => updatePassword('5')}>
                <Text style={styles.text}>5</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.viewText}>
              <TouchableOpacity style={styles.Opacity} onPress={() => updatePassword('6')}>
                <Text style={styles.text}>6</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
            <View style={styles.viewText}>
              <TouchableOpacity style={styles.Opacity} onPress={() => updatePassword('7')}>
                <Text style={styles.text}>7</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.viewText}>
              <TouchableOpacity style={styles.Opacity} onPress={() => updatePassword('8')}>
                <Text style={styles.text}>8</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.viewText}>
              <TouchableOpacity style={styles.Opacity} onPress={() => updatePassword('9')}>
                <Text style={styles.text}>9</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
            <View style={styles.viewText}>
              <TouchableOpacity style={styles.Opacity} onPress={() => handleLogin(password)}>
                <Text style={styles.text1}>Unlock</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.viewText}>
              <TouchableOpacity style={styles.Opacity} onPress={() => updatePassword('0')}>
                <Text style={styles.text}>0</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.viewText}>
              <TouchableOpacity style={styles.Opacity} onPress={() => clearPassword()}>
                <Text style={styles.text1}>Clear</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </View>
      <View style={{ flex: 1 }}>

        <ScrollView style={styles.container}>
          <Modal
            isVisible={modalVisible}
            onBackdropPress={() => setModalVisible(false)}
            animationOut="slideOutUp"
          >
            <View
              style={{
                flex: 1,
                backgroundColor: '#F4F3F8',
                padding: 20,
                paddingTop: 40,
                alignItems: 'center',
              }}
            >
              <TouchableOpacity
                style={{ position: 'absolute', right: 10, top: 10 }}
                onPress={() => setModalVisible(false)}
              >
                <Icon name="closecircleo" type="ant-design" color="#ff0000" />
              </TouchableOpacity>
              {scanLoading && <ActivityIndicator color="#212437" />}
              <ScrollView
                style={{
                  flex: 1,
                  width: '100%',
                  marginTop: 25,
                }}
              >
                {Array.isArray(deviceInfo) &&
                  deviceInfo.length > 0 &&
                  deviceInfo.map((item, id) => (
                    <View
                      key={id}
                      style={{
                        backgroundColor: 'white',
                        borderRadius: 10,
                        padding: 10,
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 10,
                      }}
                    >
                      <View>
                        <View style={styles.deviceInfoRow}>
                          <Icon
                            name="perm-device-information"
                            type="material-icons"
                            color="#212437"
                          />

                          <Text style={[styles.headerText, { fontSize: 13 }]}>
                            {item.id ? `: ${item.id}` : ': Unknown ID'}
                          </Text>
                        </View>
                        <View style={styles.deviceInfoRow}>
                          <Icon name="user" type="ant-design" color="#212437" />
                          <Text
                            style={[styles.headerText, { fontSize: 13 }]}
                            numberOfLines={1}
                          >
                            {item.name
                              ? item.name.length > 10
                                ? `: ${item.name.slice(0, 12)}...`
                                : `: ${item.name}`
                              : ': ???'}
                          </Text>
                        </View>
                        <View style={styles.deviceInfoRow}>
                          <Icon
                            name="signal-cellular-alt"
                            type="material-icons"
                            color="#212437"
                          />
                          <Text style={[styles.headerText, { fontSize: 13 }]}>
                            {item.rssi
                              ? `: ${handleSignal(item.rssi)}`
                              : `: No signal`}
                          </Text>
                        </View>
                      </View>
                      <View>
                        {isConnecting === item.id ? (
                          <ActivityIndicator
                            color="#212437"
                            size={'large'}
                            style={{ marginRight: 40 }}
                          />
                        ) : (
                          <TouchableOpacity
                            style={[
                              styles.connectButton,
                              connectedDevice === item.id
                                ? styles.connectedState
                                : styles.notConnectedState,
                            ]}
                            // Không thể connect nếu đang scan
                            disabled={scanLoading}
                            onPress={async () => {
                              if (connectedDevice === item.id) {
                                disconnectDevice(item.id)
                              } else {
                                connectDevice(item.id)
                              }
                            }}
                          >
                            <Text style={{ color: '#212437', fontSize: 15 }}>
                              {connectedDevice === item.id
                                ? 'Disconnect'
                                : 'Connect'}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  ))}
              </ScrollView>
            </View>
          </Modal>
        </ScrollView>
      </View>
      <View style={{
        height: height / 8,
        justifyContent: 'center', alignItems: 'center', flexDirection:
          'row', justifyContent: 'space-around', marginBottom: 20, borderRadius: 45, borderWidth: 1
      }}>
        <TouchableOpacity
          style={{
            borderRadius: 20,
            width: width / 4,
            height: height / 15,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => {
            navigation.navigate('Notification', {
              device_id: se
            })
          }}
        >
          <Icon name="notifications" type="material" color="black" />
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: '#FFA500',
            borderRadius: 20,
            width: width / 4,
            height: height / 10,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => {
            setModalVisible(true)
            scanDevice()
          }}
        ><Icon name="plus" type="feather" color="#212437" />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            borderRadius: 20,
            width: width / 4,
            height: height / 15,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => setModalVisible1(true)}
        >
          <Icon name="settings" type="material" color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: height,
    width: width,
  },
  headerContainer: {
    flex: 1,
    width: width,
    height: 0.15 * height,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dashboardContainer: {
    width: width,
    height: height,
    backgroundColor: '#F4F3F8',
    // display: 'flex',
    alignItems: 'center',
    flex: 1
  },
  avatarContainer: {
    height: 0.05 * height,
    width: 0.05 * height,
    borderRadius: 100,
  },
  dateText: {
    color: '#212437',
    fontSize: 13,
  },
  headerText: {
    color: '#212437',
    fontSize: 22,
    fontWeight: 'bold',
  },
  currWeek: {
    width: width - 20,
    height: 70,
    marginLeft: 20,
  },
  currWeekBtn: {
    backgroundColor: 'white',
    width: 70,
    height: 70,
    borderRadius: 15,
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 15,
    marginRight: 10,
  },
  btnDayText: {
    color: '#8D91BD',
    fontSize: 12,
  },
  btnDateText: {
    color: '#212437',
    fontSize: 20,
    fontWeight: 'bold',
  },
  overviewContainer: {
    marginTop: 10,
    padding: 20,
  },
  goDetail: {
    marginTop: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    flex: 1,
    flexDirection: 'row',
    padding: 25,
    height: 0.23 * height,
  },
  overviewComponent: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  deviceInfoRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    padding: 20,
  },
  connectedState: {
    backgroundColor: '#ff0000',
  },
  notConnectedState: {
    backgroundColor: '#439DEE',
  },
  input: {
    width: width - 55,
    height: 45,
    borderRadius: 45,
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,1)',
    color: 'rgba(255,255,255,1)',
    marginHorizontal: 25,
    // paddingHorizontal: 50,
    marginTop: 20,
  },
  text: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'black'
  },
  text1: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black'
  },
  viewText: {
    width: width / 4,
    height: height / 4,
    justifyContent: 'center',
    alignItems: 'center'
  },
  Opacity: {
    width: width / 6,
    height: height / 6,
    justifyContent: 'center',
    alignItems: 'center'

  },
  inputIcon3: {
    position: 'absolute',
    right: 15,
    zIndex: 10,
  },
  centeredView: {
    height: height / 1.8,
    flex: 1,
    justifyContent: "center",
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  button: {
    borderRadius: 20,
    padding: 10,
    width: width / 4,
    elevation: 2
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#FFA500",
  },
  textStyle: {
    color: "black",
    textAlign: "center"
  },
  modalText: {
    textAlign: "center",
    fontSize: 16,
    color: 'black'
  },
  deviler: {
    borderBottomColor: '#dddddd',
    borderBottomWidth: 1,
    width: '90%',
    alignSelf: 'center',
},
})
