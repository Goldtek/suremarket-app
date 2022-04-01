/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TouchableWithoutFeedback,
  ImageBackground
} from "react-native";
import TabScreenHeader from "../components/TabScreenHeader";
import { FontAwesome } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { COLORS } from "../variables/color";
import AppButton from "../components/AppButton";
import { useStateValue } from "../StateProvider";
import api, { setAuthToken, removeAuthToken } from "../api/client";
import moment from "moment";
import LoadingIndicator from "../components/LoadingIndicator";
import FlashNotification from "../components/FlashNotification";

const { height: screenHeight } = Dimensions.get("screen");

const noChatTitleMessage = "Currently you have no chats";
const noChatMessage = "Start buying and selling!";
const deletePromptMessage = "Do you really want to delete this conversation?";
const cancelButtonTitle = "Cancel";
const deleteButtonTitle = "Delete";
const noUserMessage =
  "Currently you're not logged in\nPlease login to get your chat data";
const loadingMessage = "Getting conversation list from server";

const chatDeleteSuccessText = "Successfully deleted";
const chatDeleteErrorText = "Error! Please try again";
const offlineNoticeText = "You are offline";

const fallbackImageUrl = "../assets/200X150.png";

const ChatListScreen = ({ navigation }) => {
  const [
    { user, auth_token, is_connected, newListingScreen },
    dispatch,
  ] = useStateValue();
  const [chatListData, setChatListData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoload, setAutoload] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [flashNotification, setFlashNotification] = useState(false);
  const [flashNotificationMessage, setFlashNotificationMessage] = useState();

  // initial for externel event
  useEffect(() => {
    if (newListingScreen) {
      dispatch({
        type: "SET_NEW_LISTING_SCREEN",
        newListingScreen: false,
      });
    }
    dispatch({
      type: "SET_CHAT_BADGE",
      chat_badge: null,
    });
  }, []);

  // initial load conversation
  useEffect(() => {
    if (!user) return;
    handleLoadConversations();
  }, [user]);

  // refreshing load conversation
  useEffect(() => {
    if (!refreshing) return;
    handleLoadConversations();
  }, [refreshing]);
  const handleLoadConversations = () => {
    if (autoload) return;
    setAutoload(true);
    setAuthToken(auth_token);
    api.get("my/chat").then((res) => {
      if (res.ok) {
        setChatListData((chatListData) => res.data);
        removeAuthToken();
        setLoading(false);
        setAutoload(false);
        if (refreshing) {
          setRefreshing(false);
        }
      } else {
        // print error
        removeAuthToken();
        setLoading(false);
        setAutoload(false);
        setRefreshing(false);
      }
    });
  };
  const handleDeleteAlert = (item) => {
    Alert.alert(
      "",
      `${deletePromptMessage}`,
      [
        {
          text: cancelButtonTitle,
        },
        {
          text: deleteButtonTitle,
          onPress: () => handleDeleteConversation(item),
        },
      ],
      { cancelable: false }
    );
  };
  const handleDeleteConversation = (item) => {
    setDeleteLoading((deleteLoading) => true);
    setAuthToken(auth_token);
    api.delete("my/chat/conversation", { con_id: item.con_id }).then((res) => {
      if (res.ok) {
        setChatListData(chatListData.filter((message) => message != item));
        removeAuthToken();
        setDeleteLoading((deleteLoading) => false);
        handleSuccess(chatDeleteSuccessText);
      } else {
        // setErrorMessage((errorMessage) => "Error Removing Conversation");
        setDeleteLoading((deleteLoading) => false);
        removeAuthToken();
        handleError(
          res.data.error_message ? res.data.error_message : chatDeleteErrorText
        );
      }
    });
  };
  const Chat = ({
    thumb,
    chatTitle,
    addTitle,
    lastmessage,
    onPress,
    time,
    onLongPress,
    is_read,
    source_id,
  }) => (
    <TouchableWithoutFeedback onPress={onPress} onLongPress={onLongPress}>
      <View style={styles.message}>
        <View style={styles.chatImageContainer}>
          <Image
            style={styles.chatImage}
            source={
              thumb === null
                ? require(fallbackImageUrl)
                : {
                    uri: thumb,
                  }
            }
          />
        </View>
        <View style={styles.chatDetails}>
          <View style={styles.titleRow}>
            <Text style={styles.chatTitle} numberOfLines={1}>
              {chatTitle}
            </Text>
            <Text>{time}</Text>
          </View>
          <Text style={styles.addTitle} numberOfLines={1}>
            {addTitle}
          </Text>
          <Text
            numberOfLines={1}
            style={
              is_read == 0 && user.id != source_id ? { fontWeight: "bold" } : {}
            }
          >
            {lastmessage}{" "}
          </Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );

  const renderChats = ({ item }) => (
    <Chat
      onPress={() => navigation.navigate("Chat", { ...item, from: "list" })}
      thumb={
        item.listing.images.length > 0
          ? item.listing.images[0].sizes.thumbnail.src
          : null
      }
      chatTitle={item.display_name}
      addTitle={item.listing.title}
      lastmessage={item.last_message}
      time={moment(item.last_message_created_at).fromNow()}
      onLongPress={() => handleDeleteAlert(item)}
      is_read={item.is_read}
      source_id={item.source_id}
    />
  );

  const onRefresh = () => {
    setRefreshing(true);
  };

  const keyExtractor = useCallback((item, index) => `${index}`, []);

  const itemSeparator = () => <View style={styles.itemSeparator} />;
  const handleSuccess = (message) => {
    setFlashNotificationMessage(message);
    setTimeout(() => {
      setFlashNotification((prevFlashNotification) => true);
    }, 10);
    setTimeout(() => {
      setFlashNotification((prevFlashNotification) => false);
      setFlashNotificationMessage();
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
    }, 1200);
  };

  return (
    <>
      <TabScreenHeader />

      {is_connected ? (
        <ImageBackground  source={require('../assets/whitebg.png')} style={{ width: '100%', height: '100%'}}>
          {user && loading && (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingMessage}>{loadingMessage}</Text>
            </View>
          )}
          {(!loading || user === null) && (
            <ImageBackground
              style={
                user && !chatListData.length ? styles.bgWhite : styles.bgDark
              } source={require('../assets/whitebg.png')}
            >
              {/* user not logged in; */}
              {!user && (
                <ImageBackground  source={require('../assets/whitebg.png')}  style={styles.noUserWrap}>
                  <FontAwesome
                    name="user-times"
                    size={100}
                    color={COLORS.bg_dark}
                  />
                  <Text style={styles.noUserMessage}>{noUserMessage}</Text>

                  <AppButton
                    title="Log in now"
                    style={styles.chatLogIn}
                    onPress={() => navigation.navigate("Log In")}
                  />
                </ImageBackground>
              )}
              {/* user logged in but no chat data; */}
              {user && !chatListData.length && (
                <ImageBackground  source={require('../assets/whitebg.png')}  style={styles.noChatWrap}>
                  <Text style={styles.noChatTitle}>{noChatTitleMessage}</Text>
                  <View style={styles.noChatIcon}>
                    <FontAwesome
                      name="wechat"
                      size={100}
                      color={COLORS.primary_soft}
                    />
                    <Image
                      style={styles.shadow}
                      source={require("../assets/NoChat.png")}
                    />
                  </View>
                  <Text style={styles.noChatMessage}>{noChatMessage}</Text>
                </ImageBackground>
              )}
              {/*user logged in and has chat data */}

              {user && chatListData.length > 0 && !loading && (
                <ImageBackground  source={require('../assets/whitebg.png')}  style={styles.chatListWrap}>
                  {!!deleteLoading && (
                    <View style={styles.deleteLoading}>
                      <View style={styles.deleteLoadingContentWrap}>
                        <LoadingIndicator
                          visible={true}
                          style={{
                            width: "100%",
                            // backgroundColor: "green",
                            marginLeft: "3.125%",
                          }}
                        />
                      </View>
                    </View>
                  )}
                  <FlatList
                    ItemSeparatorComponent={itemSeparator}
                    data={chatListData}
                    renderItem={renderChats}
                    keyExtractor={keyExtractor}
                    refreshControl={
                      <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                      />
                    }
                  />
                </ImageBackground>
              )}
            </ImageBackground>
          )}
          <FlashNotification
            falshShow={flashNotification}
            flashMessage={flashNotificationMessage}
          />
        </ImageBackground>
      ) : (
        <ImageBackground style={[styles.noInternet]}  source={require('../assets/whitebg.png')}>
          <FontAwesome5
            name="exclamation-circle"
            size={35}
            color={COLORS.primary}
          />
          <Text style={styles.text}>{offlineNoticeText}</Text>
        </ImageBackground>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  addTitle: {
    color: COLORS.text_gray,
    fontWeight: "bold",
    marginRight: "30%",
  },
  bgWhite: {
    backgroundColor: COLORS.white,
    flex: 1,
  },
  bgDark: {
    backgroundColor: COLORS.bg_dark,
    flex: 1,
  },
  chatDetails: {
    marginLeft: 10,
    display: "flex",
    flex: 1,
  },
  chatImage: {
    height: 60,
    width: 60,
    resizeMode: "cover",
  },
  chatImageContainer: {
    height: 60,
    width: 60,
    borderRadius: 30,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  chatListWrap: {
    height: screenHeight - 50 - 73,
  },
  chatLogIn: {
    width: "60%",
    paddingVertical: 10,
    borderRadius: 3,
    marginVertical: 40,
  },
  chatTitle: {
    fontSize: 15,
    color: COLORS.text_dark,
    fontWeight: "bold",
  },
  deleteLoading: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    // opacity: 0.8,
    backgroundColor: "rgba(255,255,255,.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
    flex: 1,
    height: "100%",
    width: "100%",
  },
  deleteLoadingContentWrap: {
    paddingHorizontal: "3%",
    // backgroundColor: COLORS.blue,
    // flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  itemSeparator: {
    height: 1,
    width: "100%",
    backgroundColor: COLORS.bg_dark,
  },
  loading: {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 1,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
    flex: 1,
  },
  message: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: 5,
  },
  noChatIcon: {
    marginVertical: 30,
    alignItems: "center",
  },
  noChatMessage: {
    color: COLORS.text_gray,
  },
  noChatTitle: {
    fontSize: 16,
    color: COLORS.text_dark,
  },
  noChatWrap: {
    paddingVertical: 40,
    backgroundColor: COLORS.white,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  noUserMessage: {
    textAlign: "center",
    fontSize: 17,
    color: COLORS.text_gray,
    marginTop: 20,
  },
  noUserWrap: {
    paddingTop: 40,
    alignItems: "center",
    flex: 1,
    backgroundColor: "white",
  },
  noInternet: {
    alignItems: "center",
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
  },
  shadow: {
    width: 110,
    resizeMode: "contain",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    flex: 1,
    alignItems: "center",
  },
});

export default ChatListScreen;
