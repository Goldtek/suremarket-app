/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";
import { COLORS } from "../variables/color";
import { FontAwesome } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import ProfileData from "../components/ProfileData";
import { useStateValue } from "../StateProvider";
import api, { setAuthToken, removeAuthToken } from "../api/client";
import ReactNativeZoomableView from '@openspacelabs/react-native-zoomable-view/src/ReactNativeZoomableView';
import AppSeparator from "../components/AppSeparator";

const loadingMessage = "Getting user information";

const { width: deviceWidth, height: deviceHeight } = Dimensions.get("window");
const MyProfileScreen = ({ navigation }) => {
  const [{ auth_token, user, is_connected }, dispatch] = useStateValue();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState();
  const [imageViewer, setImageViewer] = useState(false);
  const [member, setMember] = useState(null);

  useEffect(() => {
    setAuthToken(auth_token);
    api.get("my").then((res) => {
      if (res.ok) {
        dispatch({
          type: "SET_AUTH_DATA",
          data: { user: res.data },
        });
        fetchMembership();
      } else {
        // TODO handle error
        setErrorMessage((errorMessage) => "Error getting data from server");
        setLoading((loading) => false);
        removeAuthToken();
      }
    });
  }, []);

  const fetchMembership = () => {
    api.get("membership").then((res) => {
      if (res.ok) {
        console.log()
        setMember(res.data);
        setLoading((loading) => false);
        removeAuthToken();
      }
    });
  }


  const handleLocationTaxonomy = (locations) => {
    if (!locations) return;
    let result = "";
    for (let i = 0; i < locations.length; i++) {
      if (result.length < 1) {
        result = locations[i].name;
      } else {
        result = result + `, ${locations[i].name}`;
      }
    }
    return result;
  };

  const handleImageViewer = () => {
    if (!user.pp_thumb_url) return;
    setImageViewer(!imageViewer);
  };

  const renderMembership = () => {
    if(member.eligible) {
      return (
        <>
         <Text style={{fontSize: 20, fontWeight: '600', marginTop: 30, marginBottom: 10}}>Membership Report</Text>
          <ProfileData label="Status" value={member.isExpired} />
          <ProfileData label="Validity" value={member.validity} />
          <ProfileData label="Remaining" value={member.remaining} />
          <ProfileData label="Posted" value={member.posted} />
        </>
      )
    } else if(member.eligible === false && member.remaining !== null) {
      return (
       <>
        <Text style={{fontSize: 20, fontWeight: '600',  marginTop: 30, marginBottom: 10}}>Membership Report</Text>
         <ProfileData label="Status" value={member.isExpired} />
          <ProfileData label="Remaining" value={member.remaining} />
          <ProfileData label="Posted" value={member.posted} />
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
        <>
          {!imageViewer && (
            <View style={styles.container}>
              <ScrollView>
                <View style={styles.mainWrap}>
                  <View style={styles.titleRow}>
                    <TouchableWithoutFeedback onPress={handleImageViewer}>
                      <View>
                        <View style={styles.imageWrap}>
                          {user.pp_thumb_url ? (
                            <Image
                              source={{ uri: user.pp_thumb_url }}
                              style={styles.image}
                            />
                          ) : (
                            <FontAwesome
                              name="camera"
                              size={20}
                              color={COLORS.text_gray}
                            />
                          )}
                        </View>
                        <View
                          style={{
                            height: 26,
                            width: 26,
                            backgroundColor: COLORS.bg_light,
                            alignItems: "center",
                            justifyContent: "center",
                            position: "absolute",
                            bottom: 0,
                            right: 0,
                            borderRadius: 13,
                          }}
                        >
                          <View
                            style={{
                              height: 22,
                              width: 22,
                              backgroundColor: COLORS.bg_dark,
                              alignItems: "center",
                              justifyContent: "center",

                              borderRadius: 11,
                            }}
                          >
                            <FontAwesome
                              name="camera"
                              size={12}
                              color={COLORS.text_gray}
                            />
                          </View>
                        </View>
                      </View>
                    </TouchableWithoutFeedback>
                    <View style={styles.titleRight}>
                      {!!user.username && (
                        <View style={styles.phoneWrap}>
                          <FontAwesome
                            name="user"
                            size={24}
                            color={COLORS.gray}
                          />

                          <Text style={styles.name} numberOfLines={1}>
                            {user.username}
                          </Text>
                        </View>
                      )}
                      {!!user.phone && (
                        <View style={styles.phoneWrap}>
                          <FontAwesome
                            name="phone"
                            size={24}
                            color={COLORS.gray}
                          />
                          <Text style={styles.phone} numberOfLines={1}>
                            {user.phone}
                          </Text>
                        </View>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate("Edit Personal Detail", {
                          data: user,
                        })
                      }
                      style={{ position: "absolute", top: "25%", right: 0 }}
                    >
                      <FontAwesome
                        name="edit"
                        size={24}
                        color={COLORS.primary}
                      />
                    </TouchableOpacity>
                  </View>
                  <AppSeparator style={styles.separator} />
                  <View style={styles.detail}>
                    {(!!user.first_name || !!user.last_name) && (
                      <ProfileData
                        label="Name"
                        value={`${user.first_name} ${user.last_name}`}
                      />
                    )}
                    {!!user.email && (
                      <ProfileData label="email" value={user.email} />
                    )}
                    {!!user.phone && (
                      <ProfileData label="phone" value={user.phone} />
                    )}
                    {!!user.whatsapp_number && (
                      <ProfileData
                        label="whatsapp"
                        value={user.whatsapp_number}
                      />
                    )}
                    {!!user.website && (
                      <ProfileData label="website" value={user.website} />
                    )}
                    {(!!user.locations.length || !!user.address) && (
                      <ProfileData
                        label="Address"
                        value={
                          handleLocationTaxonomy(user.locations)
                            ? `${handleLocationTaxonomy(user.locations)}, ${
                                user.zipcode ? user.zipcode + "," : ""
                              } ${user.address}`
                            : `${user.zipcode ? user.zipcode + "," : ""} ${
                                user.address
                              }`
                        }
                      />
                    )}
                    {member !== null ? renderMembership(): null}
                  </View>
                </View>
              </ScrollView>
            </View>
          )}
          {imageViewer && !!user.pp_thumb_url && (
            <View style={styles.imageViewerWrap}>
              <TouchableOpacity
                style={styles.imageViewerCloseButton}
                onPress={handleImageViewer}
              >
                <FontAwesome5 name="times" size={24} color={COLORS.primary} />
              </TouchableOpacity>

              <View style={styles.imageViewer}>
                <ReactNativeZoomableView
                  maxZoom={1.5}
                  minZoom={1}
                  zoomStep={0.5}
                  initialZoom={1}
                  bindToBorders={true}
                  style={{
                    padding: 10,
                    backgroundColor: COLORS.bg_dark,
                  }}
                >
                  <Image
                    style={{
                      width: deviceWidth,
                      height: deviceHeight,
                      resizeMode: "contain",
                    }}
                    source={{
                      uri: user.pp_thumb_url,
                    }}
                  />
                </ReactNativeZoomableView>
              </View>
            </View>
          )}
        </>
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
});

export default MyProfileScreen;
