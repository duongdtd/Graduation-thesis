import React, { useEffect } from 'react';
import { useState } from 'react';
import {
  ImageBackground, StyleSheet, Text, View, Image, TextInput, Dimensions, TouchableWithoutFeedback, Alert, Keyboard, TouchableOpacity, SafeAreaView
} from 'react-native';
import { Icon } from 'react-native-elements';
const { width: WIDTH } = Dimensions.get('window')
import { login } from '../api/auth/authAPI';
import AsyncStorage from '@react-native-async-storage/async-storage'  
export default function Login({ navigation }) {

  const [isShow, setIs] = useState(true)
  const [email, setemail] = useState("")
  const [password, setpassword] = useState("")
  const [uid, setUID] = useState("");

  const handleLogin = async () => {
    try {
      const res = await login({ username: email, password: password })
      if (res && res.data && res.data.success) {
        await AsyncStorage.setItem('token', res.data.accessToken)
        await AsyncStorage.setItem('email', email)
        navigation.navigate('MainScreen', { email: email })
        return null
      }
      throw new Error(res.data.message || 'Unknown error!!!')
    } catch (error) {
      console.log(error)
    }
    return null
  }
  return (
    <View style={{ flex: 1, backgroundColor: 'white', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
      <TouchableWithoutFeedback style={styles.container} onPress={Keyboard.dismiss}>
        <View>
          <View style = {{justifyContent :'center', alignItems:'center'}}>
          <Text style={{    fontSize: 30,
    color: 'rgba(0,0,0,1)',
    fontWeight: '900',marginBottom:50}}>LOGIN</Text>
          </View>
          <View>
          <TextInput
            style={styles.input1}
            placeholder="Enter username" placeholderTextColor='rgba(255,255,255,1)'
            keyboardType='email-address'
            returnKeyType="next"
            type='text'
            value={email}
            onChangeText={(text) => setemail(text)}
          >
          </TextInput>
          <TextInput
            style={styles.input2} placeholder="Password" placeholderTextColor='rgba(255,255,255,1)'
            returnKeyType="go"
            secureTextEntry={isShow}
            type='text'
            value={password}
            onChangeText={(text) => setpassword(text)}
          >
          </TextInput>
          <TouchableOpacity  style={styles.inputIcon3} onPress ={() => {setIs((x)=>!x)}} >
          <Icon  name={isShow ? "visibility" : "visibility-off" } type="material" color="#FFA500" />
          </TouchableOpacity>
          </View>
          <View alignItems='center'>
            <TouchableOpacity
              style={styles.login}
              onPress ={() => handleLogin()}
            >
              <Text style={styles.textlogin} >Login</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.action}>
            <TouchableOpacity style={styles.login2}
            onPress = {() => navigation.navigate('Signup')}
            >
              <Text style={styles.textlogin2}>Sign up</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.login2}
            >
              <Text style={styles.textlogin2}>Forget password</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row'
  },
  logocontainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 30,
    //marginBottom:10,
  },
  logo: {
    width: 48 * 2,
    height: 48 * 2,
  },
  logotext: {
    color: 'black',
    fontSize: 20,
    fontWeight: '500',
    marginTop: 10,

  },
  input1: {
    width: WIDTH - 55,
    height: 45,
    borderRadius: 45,
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,1)',
    color: 'rgba(255,255,255,1)',
    marginHorizontal: 25,
    paddingHorizontal: 50,
    marginTop: 20,
  }, input2: {
    width: WIDTH - 55,
    height: 45,
    borderRadius: 45,
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,1)',
    color: 'rgba(255,255,255,1)',
    marginHorizontal: 25,
    paddingHorizontal: 50,
    marginTop: 5,
  },
  inputIcon1: {
    position: 'absolute',
    top: 25,
    left: 37,
    zIndex: 10,
  },
  inputIcon2: {
    position: 'absolute',
    top: 75,
    left: 37,
    zIndex: 10,
  },
  inputIcon3: {
    position: 'absolute',
    top: 80,
    right: 37,
    zIndex: 10,
  },
  login: {
    width: WIDTH/5,
    height: 45,
    borderRadius: 45,
    backgroundColor: `#FFA500`,
    marginTop: 70,
    marginHorizontal: 25,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.8,
    borderWidth: 1,
    borderColor: 'black'
  },
  login2: {
    marginTop: 30,
    marginHorizontal: 60 / 2,
  },
  textlogin: {
    fontSize: 16,
    color: 'rgba(0,0,0,1)',
    fontWeight: '900',
  },
  textlogin2: {
    fontSize: 16,
    color: 'rgba(0,0,0,1)',
    fontWeight: '900',
  },
  action: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  }
});