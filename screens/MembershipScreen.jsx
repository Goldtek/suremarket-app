import React, { useEffect, useState} from "react";
import { COLORS } from "../variables/color";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import ProfileData from "../components/ProfileData";
import { useStateValue } from "../StateProvider";
import api, { setAuthToken, removeAuthToken } from "../api/client";


const loadingMessage = "Getting user information";

const { width } = Dimensions.get('screen');

const MembershipScreen = ({ navigation }) => {
  const [{ auth_token, is_connected }] = useStateValue();
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState(null);

  useEffect(() => {
    setAuthToken(auth_token);
    fetchMembership();
  }, []);

  const fetchMembership = () => {
    api.get("membership").then((res) => {
      if (res.ok) {
        console.log()
        setMember(res.data);
        setLoading(false);
        removeAuthToken();
      }
    });
  }

 

  const renderMembership = () => {
    if(member.isExpired !== 'Expired') {
      return (
        <>
         <Text style={{fontSize: 20, fontWeight: '600', marginTop: 30, marginBottom: 10}}>Membership Report</Text>
         <View style={{flexDirection: 'row', marginVertical: 10}}>
          <Text style={{ fontWeight: 'bold'}}>Status: </Text>
          <Text >{member.isExpired}</Text>
         </View>
         
         <View style={{flexDirection: 'row', marginVertical: 10}}>
          <Text style={{ fontWeight: 'bold'}}>Validity: </Text>
          <Text >{member.validity}</Text>
        </View>
       
         <View style={{flexDirection: 'row', marginVertical: 10}}>
          <Text style={{ fontWeight: 'bold'}}>Remaining: </Text>
          <Text >{member.remaining}</Text>
        </View>

        <View style={{flexDirection: 'row', marginVertical: 10}}>
          <Text style={{ fontWeight: 'bold'}}>Posted: </Text>
          <Text >{member.posted}</Text>
        </View>
    
        </>
      )
    } else if(member.isExpired === 'Expired') {
      return (
       <>
        <Text style={{fontSize: 20, fontWeight: '600',  marginTop: 30, marginBottom: 10}}>Membership Report</Text>
        <View style={{flexDirection: 'row', marginVertical: 10}}>
          <Text style={{ fontWeight: 'bold'}}>Status: </Text>
          <Text >{member.isExpired}</Text>
         </View>
    
       
         <View style={{flexDirection: 'row', marginVertical: 10}}>
          <Text style={{ fontWeight: 'bold'}}>Remaining: </Text>
          <Text >{member.remaining}</Text>
        </View>

        <View style={{flexDirection: 'row', marginVertical: 10}}>
          <Text style={{ fontWeight: 'bold'}}>Posted: </Text>
          <Text >{member.posted}</Text>
         </View>

          <TouchableOpacity style={styles.buttonContainer} activeOpacity={0.8} onPress={() => navigation.navigate('My Membership')}>
            <Text style={{ color: '#fff', fontWeight: '600'}}>Renew Subscribe</Text>
         </TouchableOpacity>
       </>
      )
    }

    else if(member.isExpired === undefined || member.isExpired === null) {
      return (
        <>
         <Text style={{fontSize: 20, fontWeight: '600',  marginTop: 30, marginBottom: 10}}>Membership Report</Text>
          <View style={{flexDirection: 'row', marginVertical: 10}}>
          <Text style={{ fontWeight: 'bold'}}>Status: </Text>
          <Text >you dont have a valid membership</Text>
         </View>
          <TouchableOpacity style={styles.buttonContainer} activeOpacity={0.8} onPress={() => navigation.navigate('My Membership')}>
            <Text style={{ color: '#fff', fontWeight: '600'}}>Subscribe</Text>
         </TouchableOpacity>
        </>
       )
    }
  
  }

  return is_connected ? (
    <>
      {loading ? (
        <View style={styles.loadingWrap}>
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingMessage}>{loadingMessage}</Text>
          </View>
        </View>
      ) : (
        <View style={{ width, alignItems: "center"}}>
        {renderMembership()}
        </View>
      )}
    </>
  ) : (
    <View style={styles.noInternet}>
      <FontAwesome5
        name="exclamation-circle"
        size={24}
        color={COLORS.primary}
      />
      <Text style={styles.text}>No internet</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    flex: 1,
  },
  image: {
    height: 60,
    width: 60,
    resizeMode: "cover",
  },
  imageViewer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageViewerCloseButton: {
    position: "absolute",
    right: 15,
    top: 15,
    zIndex: 10,
    height: 25,
    width: 25,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
  },
  imageViewerWrap: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    width: "100%",
    height: "100%",
    flex: 1,
  },
  imageWrap: {
    height: 60,
    width: 60,
    borderRadius: 30,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.bg_dark,
  },
  loading: {
    // position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.8,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
    flex: 1,
  },
  loadingWrap: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  mainWrap: {
    backgroundColor: COLORS.bg_light,
    paddingVertical: 15,
    paddingHorizontal: "3%",
  },
  name: {
    fontSize: 18,
    color: COLORS.text_dark,
    marginLeft: 10,
  },
  noInternet: {
    // marginVertical: 50,
    alignItems: "center",
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  phone: {
    marginLeft: 10,
    fontSize: 16,
    color: COLORS.text_gray,
  },
  phoneWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  separator: {
    width: "100%",
    backgroundColor: COLORS.bg_dark,
    marginVertical: 15,
  },
  titleRight: {
    marginLeft: 15,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonContainer: {
    backgroundColor: '#ff0000', 
    height: 45, 
    width: width - 30  , 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingLeft: 5, 
    marginHorizontal: 10,
    borderRadius: 5,
  },
});


export default MembershipScreen;
