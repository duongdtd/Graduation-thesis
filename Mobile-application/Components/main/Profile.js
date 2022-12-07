import React, { useEffect } from 'react';
import { useState } from 'react';
import Modal from 'react-native-modal'
import {
  ImageBackground, StyleSheet, Text, View, Image, TextInput, Dimensions, TouchableWithoutFeedback, Alert, Keyboard, TouchableOpacity, SafeAreaView
} from 'react-native';
import { Avatar } from 'react-native-elements';
const { width, height } = Dimensions.get('window')
import { changePassword, open, login } from '../api/auth/authAPI';
import AsyncStorage from '@react-native-async-storage/async-storage'
export default function Profile({ navigation ,route }) {

  const [isShow, setIs] = useState(true)
  const [email, setemail] = useState("")
  const [curentPassword, setCurentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [modalVisible, setModalVisible] = useState(false)
  const [modalVisible1, setModalVisible1] = useState(false)
  const updatePassword = async (text) => {
    setPassword(password => password + text )
  }
  const clearPassword = async() =>{
    setPassword("")
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
  const handleLogin = async (pass) => {
    try {
        const mail = await AsyncStorage.getItem('email')
        const res = await login({ username: mail, password: pass })
        if (res && res.data && res.data.success) {
          setModalVisible(false),setModalVisible1(true), setPassword("")
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

  const handleChangePassword = async () => {
    try {
      const token = await AsyncStorage.getItem('token')
      if (!token) {
        navigation.navigate('Login')
        return null
      }
      const accessToken = `Bearer ${token}`
      const res = await changePassword(accessToken, {
        currentPassword: curentPassword,
        newPassword: newPassword,
      })

      if (res && res.data && res.data.success) {
        Alert.alert('Success', `${res.data.message}`, [
          { text: 'OK', onPress: () => navigation.navigate('MainScreen') },
        ])
        return null
      }
      throw new Error(res.data.message || 'Error')
    } catch (error) {
      console.log(error)
      Alert.alert('Failure', `${error.toString()}`, [
        { text: 'OK', onPress: () => navigation.navigate('MainScreen') },
      ])
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'white',alignItems:'center'}}>
      {modalVisible ?
        <Modal
          isVisible={modalVisible}
          onBackdropPress={() => setModalVisible(false)}
          animationOut="slideOutUp"
          transparent={true}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>Insert current email's password</Text>
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
                value={curentPassword}
                onChangeText={(text) => setCurentPassword(text)}
              />
              <Text style={styles.modalText}>Insert new email's password</Text>
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
                value={newPassword}
                onChangeText={(text) => setNewPassword(text)}
              />
              <View style={{
                marginTop: 10, width: width / 1.5, justifyContent: 'center', alignItems: 'center', flexDirection:
                  'row', justifyContent: 'space-between'
              }}>

                
                <TouchableOpacity
                  style={[styles.button, styles.buttonClose]}
                  onPress={() => { handleChangePassword()}}
                  // onPress={() => {setModalVisible1(true),setModalVisible(false), setPassword("")}}
                >
                  <Text style={styles.textStyle}>OK</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.buttonClose]}
                  onPress={() => { setModalVisible1(false), setCurentPassword(""),setNewPassword("") }}
                >
                  <Text style={styles.textStyle}>Cancel</Text>
                </TouchableOpacity>
              </View>

            </View>
          </View>
        </Modal> : null}
      <View >
          <Avatar 
          rounded
          size="xlarge"
          containerStyle={{marginTop: 20}}
          source={{
            uri:
              'https://png.pngtree.com/png-clipart/20190924/original/pngtree-user-vector-avatar-png-image_4830521.jpg',
          }}></Avatar>
      </View>
      <View style={{marginTop :15}}><Text style={{fontSize :20,color:'black'}}>Email: {route?.params?.email}</Text></View>
      <View></View>
      <View style ={styles.panelButton}>
          <TouchableOpacity onPress={() =>setModalVisible(true)}>
          <Text style={styles.text}>Change Password</Text>
          </TouchableOpacity>
      </View>
      <View style ={styles.panelButton}>
         <Text style={styles.text}>Change Avatar</Text>
      </View>
      <View style ={styles.panelButton}>
        <TouchableOpacity onPress={() => handleLogout()}>
        <Text style={styles.text}>Logout</Text>

        </TouchableOpacity>
              </View>
    </View>
  );
};

const styles = StyleSheet.create({
  buton: {
    width: width / 3,
    height: height / 10,
    borderWidth: 1,
    borderRadius: 25, 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#FFA500'
  },
  text :{
    fontSize :18,
    color:'black'
  },
  viewText:{ 
    width:width/10,
    height:height/10,
    justifyContent:'center',
    alignItems:'center'
  },
  Opacity :{
    width:width/11,
    height:height/11,
    justifyContent:'center',
    alignItems:'center'
    
  },
  panelButton: {
    borderRadius: 14,
    alignItems:'center',
    justifyContent:'center',
    width:300,
    height:50,
    backgroundColor: '#ffb412',
    alignItems: 'center',
    marginVertical: 7,
    borderWidth: 2,
    borderColor: 'black',
    marginTop: 20
  },  centeredView: {
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

