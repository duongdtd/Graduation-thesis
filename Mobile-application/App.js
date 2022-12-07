import React, { useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { View, Text,Image, TouchableOpacity } from "react-native";
import MainScreen from './Components/main/MainScreen'
import Login from './Components/auth/Login'
import Signup from './Components/auth/Signup'
import Profile from './Components/main/Profile';
import ListFinger from './Components/main/ListFinger';
import Loadding from './Components/auth/Loadding';
import Notification from './Components/main/Notification';
import LocalScreen from './Components/main/LocalScreen';
const Stack = createNativeStackNavigator();
const { Navigator, Screen } = Stack
import OneSignal from 'react-native-onesignal';
const ONESIGNAL_APP_ID = "241418b7-fac3-4a5d-8bf4-0fa45147f723"
// OneSignal Initialization
// OneSignal.setAppId(ONESIGNAL_APP_ID);

// // promptForPushNotificationsWithUserResponse will show the native iOS or Android notification permission prompt.
// // We recommend removing the following code and instead using an In-App Message to prompt for notification permission (See step 8)
// OneSignal.promptForPushNotificationsWithUserResponse();

// //Method for handling notifications received while app in foreground
// OneSignal.setNotificationWillShowInForegroundHandler(notificationReceivedEvent => {
//   console.log("OneSignal: notification will show in foreground:", notificationReceivedEvent);
//   let notification = notificationReceivedEvent.getNotification();
//   console.log("notification: ", notification);
//   const data = notification.additionalData
//   console.log("additionalData: ", data);
//   // Complete with null means don't show a notification.
//   notificationReceivedEvent.complete(notification);
// });

//Method for handling notifications opened
OneSignal.setNotificationOpenedHandler(notification => {
  console.log("OneSignal: notification opened:", notification);
});
export default function App() {
  useEffect(()=>{
    OneSignal.setLogLevel(6,0);
    OneSignal.setAppId(ONESIGNAL_APP_ID);

    OneSignal.setNotificationOpenedHandler(notification => {
      console.log("OneSignal: notification opened:", notification);
    });
  })
  return (
    <NavigationContainer>
      <Navigator
        initialRouteName="Loadding"
        // screenOptions={{ headerShown: false }}
      >
        <Screen name="Profile" component={Profile} />
        <Screen name="Loadding" component={Loadding} options={{headerShown:false}}/>
        <Screen name="ListFinger" component={ListFinger}  />
        <Screen name="Notification" component={Notification} />
        <Screen name="MainScreen" component={MainScreen}  options={{headerShown:false}} />
        <Screen name="LocalScreen" component={LocalScreen} options={{headerShown:false}} />
        <Screen name="Login" component={Login} options={{headerShown:false}} />
        <Screen name="Signup" component={Signup} options={{headerShown:false}} />
      </Navigator>
    </NavigationContainer>
  )
}