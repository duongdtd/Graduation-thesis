import AsyncStorage from '@react-native-async-storage/async-storage'
import React from 'react'
import { Dimensions, Image, StyleSheet, View,Text } from 'react-native'
import { ActivityIndicator } from 'react-native'
import { fetchMe } from '../api/auth/authAPI'
import { Icon, Avatar } from 'react-native-elements'
import { useNetInfo, NetInfoState } from "@react-native-community/netinfo";
export default function Loadding({ navigation }) {
  const internetState  = useNetInfo();
  console.log(internetState.isConnected)
  const handleFetchMe = async () => {
    try {
      const token = await AsyncStorage.getItem('token')
      if (!token) {
        if(internetState.isConnected == true)
        {
        navigation.navigate('Login')
        return null
        }
        else{
        navigation.navigate('LocalScreen')
        return null
        }
      }
      const accessToken = `Bearer ${token}`
      const res = await fetchMe(accessToken)
      if (res && res.data && res.data.success) {
        await AsyncStorage.setItem('token', token)
        await AsyncStorage.setItem('email', res.data.user.username)
        console.log(res.data.user.device_id)
        navigation.navigate('MainScreen', {
          email: res.data.user.username,
          token: token,
          deviceId:res.data.user.device_id
        })
        return null
      }
      throw new Error('Unauthorized')
    } catch (error) {
      console.log(error)
      await AsyncStorage.clear()
      navigation.navigate('Login')
    }
  }
  React.useEffect(() => {
    const focusListener = navigation.addListener('focus', () => handleFetchMe())
    return focusListener;
  }, [handleFetchMe, navigation, internetState.isConnected])
return (
    <View style={{flex :1 ,backgroundColor:'white', justifyContent: 'center', alignItems :'center'}}>
        <Icon name="lock" size={200} type="material" color="black" />
        <Text style={{fontSize:30, color:'black'}}>Smartlock</Text>
    </View>
)
}
