import React, { useEffect } from 'react';
import { useState } from 'react';
import {
  ImageBackground,FlatList, StyleSheet, Text, View, Image, TextInput, Dimensions, TouchableWithoutFeedback, Alert, Keyboard, TouchableOpacity, SafeAreaView
} from 'react-native';
import { Avatar } from 'react-native-elements';
import { getDataNotification } from '../api/auth/notificationAPI';
import AsyncStorage from '@react-native-async-storage/async-storage'
const { width, height } = Dimensions.get('window')

export default function Notification({ navigation,route }) {

  const [isShow, setIs] = useState(true)
  const [email, setemail] = useState("")
  const [password, setPassword] = useState("")
  const [notifications, setNotifications] = useState([])
  const [notifications1, setNotifications1] = useState([])
  const fetchData = async () => {
    try {
      const device_id = {device_id :"123456789"}
      const res = await getDataNotification(device_id)
      if (res && res.data && res.data.success) {
        // res.data.notifications.soft((a,b) =>{
        //   // return b.createdAt -a.createdAt
        // })
        const numAscending = [...res.data.notifications].sort((a, b) => new Date(b.createdAt) 
        -new Date(a.createdAt))
        setNotifications(numAscending)
        console.log(res.data)
          return null
      }
  } catch (error) {
      console.log(error)
  }
}
useEffect(() => {
    fetchData()
}, [])
console.log(notifications1)
function convetTime(date)
{
  var time = new Date(`${date}`)
  return time.toLocaleString()  
}
const renderItem = ({ item }) => (
  <TouchableOpacity>
  <View style={styles.item}>
      <View>
          <Text style={styles.title}>ID: {item.ID}</Text>
          <Text style={styles.title}>Type: {item.Type}</Text>
          <Text style={styles.title}>Time: {convetTime(item.createdAt)}</Text>
      </View>
  </View>
</TouchableOpacity>
);

  return (
    <SafeAreaView style={styles.container}>
    <FlatList
      data={notifications}
      renderItem={renderItem}
      keyExtractor={item => item.id}
    />
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
    color:'black'
  },
});