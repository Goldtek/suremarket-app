import React from 'react';
import { View } from 'react-native';
import  { Paystack }  from 'react-native-paystack-webview';
import api, { setAuthToken, removeAuthToken } from "../api/client";
import { useStateValue } from "../StateProvider";

export default function App({ route, navigation }) {
    const [loading, setLoading] = React.useState(false);
    const [{ user, auth_token }] = useStateValue();
    const [done, setDone] = React.useState(false);
    const [flashNotification, setFlashNotification] = React.useState(false);
    const [flashNotificationMessage, setFlashNotificationMessage] = React.useState();

    console.log('auth_token', auth_token)
    console.log('user', user);
    const serverResponse = {
        success: "Successfully subscribed",
        fail: "Error  Subscribing to the membership package, please try again",
      };

    const submitReport = (values) => {
        setLoading((prevLoading) => true);
        setAuthToken(auth_token);
        api
          .post("membership/create/", {
            email: user.email,
            message: values.message,
            ads: route.params.ads,
            ...values,
            user: user,
          })
          .then((res) => {
            if (res.ok) {
              setDone((done) => !done);
              removeAuthToken();
              handleSuccess(serverResponse.success);
            } else {
              // TODO handle error
              console.log('serverResponse.fail: ', serverResponse.fail)
              removeAuthToken();
              handleError(serverResponse.fail);
            }
          }).catch((error) => {
            console.log('error -->', error);
          });
      };

      const handleSuccess = (message) => {
        setFlashNotificationMessage((prevFlashNotificationMessage) => message);
        setTimeout(() => {
          setFlashNotification((prevFlashNotification) => true);
        }, 10);
        setTimeout(() => {
          setFlashNotification((prevFlashNotification) => false);
          setLoading((prevLoading) => false);
          setFlashNotificationMessage();
          navigation.goBack();
        }, 1000);
      };

      const handleError = (message) => {
        setFlashNotificationMessage((prevFlashNotificationMessage) => message);
        setTimeout(() => {
          setFlashNotification((prevFlashNotification) => true);
        }, 10);
        setTimeout(() => {
          setFlashNotification((prevFlashNotification) => false);
          setFlashNotificationMessage();
          setLoading((prevLoading) => false);
        }, 1000);
      };

      
  return (
    <View style={{ flex: 1}}>
    <Paystack  
      paystackKey="pk_live_ad1d0456e363bf712ac0e4d7507efb03957d8bd5"
      amount={`${route.params.price}`}
      billingEmail={user.email}
      activityIndicatorColor="green"
      onCancel={(e) => {
        navigation.navigate('My Membership');
      }}
      onSuccess={(res) => {
          if(res.status)
        submitReport(res);
        navigation.navigate('Home');
      }}
      autoStart={true}
    />
  </View>
);

}
