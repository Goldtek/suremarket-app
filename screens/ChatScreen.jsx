/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useRef, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { COLORS } from "../variables/color";
import { useStateValue } from "../StateProvider";
import api, { setAuthToken, removeAuthToken } from "../api/client";
import { Formik } from "formik";
import * as Yup from "yup";
import moment from "moment";
import { decodeString } from "../helper/helper";

const fallbackImageUrl = "../assets/200X150.png";
const loadingMessage = "Getting conversation data from server";
const dactivatedMessage = "Receiver has deleted the conversation";
const validationSchema = Yup.object().shape({
  message: Yup.string().required().min(1),
});

const ChatScreen = ({ navigation, route }) => {
  const [{ user, auth_token }] = useStateValue();
  const [listingData] = useState(route.params.listing);
  const [conversationData, setConversationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoload, setAutoload] = useState(false);
  const [con_id, setConId] = useState(route.params.con_id);
  const [isConDeleted, setIsConDeleted] = useState({
    sendr_id: parseInt(route.params.sender_id) || 0,
    recipient_delete: parseInt(route.params.recipient_delete) || 0,
    sender_delete: parseInt(route.params.sender_delete) || 0,
    recipient_id: parseInt(route.params.recipient_id) || 0,
  });
  const scrollView = useRef();

  // scroll to end effect
  useEffect(() => {
    if (loading) return;
    scrollView.current.scrollToEnd();
  }, [loading]);

  // auto refresh effect
  useEffect(() => {
    handleLoadMessages();
    const interval = setInterval(handleLoadMessages, 5000);
    if (
      isConDeleted.recipient_delete === 1 ||
      isConDeleted.sender_delete === 1
    ) {
      clearInterval(interval);
      return;
    }
    handleCheckHasConversation();
    return () => clearInterval(interval);
  }, [con_id]);

  const handleCheckHasConversation = () => {
    if (con_id) return;
    setAuthToken(auth_token);

    api
      .get("my/chat/check", { listing_id: route.params.listing.id })
      .then((res) => {
        if (res.ok) {
          if (res.data && res.data.con_id) {
            setConversationData((conversationData) => res.data.messages || []);
            setConId(res.data.con_id);
          } else {
            setConversationData([]);
          }
          removeAuthToken();
          setLoading(false);
        } else {
          // print error
          // TODO Error handling
          removeAuthToken();
          setLoading(false);
        }
      });
  };

  const handleLoadMessages = () => {
    if (autoload || !con_id) return;

    setAutoload(true);
    setAuthToken(auth_token);
    api.get("my/chat/conversation", { con_id: con_id }).then((res) => {
      if (res.ok) {
        setConversationData((conversationData) => res.data.messages);
        setIsConDeleted((isConDeleted) => {
          return {
            ...isConDeleted,
            ["sender_id"]: res.data.sender_id,
            ["sender_delete"]: res.data.sender_delete,
            ["recipient_delete"]: res.data.recipient_delete,
          };
        });
        removeAuthToken();
        setLoading(false);
        setAutoload(false);
      } else {
        // print error
        // TODO Error handling
        removeAuthToken();
        setLoading(false);
        setAutoload(false);
      }
    });
  };

  const handleLocationNCategoryData = () => {
    let result = "";
    if (listingData.location.length) {
      if (listingData.category.length) {
        return decodeString(
          listingData.location[listingData.location.length - 1].name +
            ", " +
            listingData.category[listingData.category.length - 1].name
        );
      } else {
        return decodeString(
          listingData.location[listingData.location.length - 1].name
        );
      }
    } else {
      return decodeString(
        listingData.category[listingData.category.length - 1].name
      );
    }
  };

  //TODO need to check
  const handleMessageReadStatus = (item) => {
    setAuthToken(auth_token);
    api
      .put("my/chat/message", {
        con_id: item.con_id,
        message_id: item.message_id,
      })
      .then((res) => {
        if (res.ok) {
          removeAuthToken();
        } else {
          removeAuthToken();
        }
      });
  };

  const handleMessageSending = (values, { resetForm }) => {
    const newMessage = {
      message_id: new Date().getTime(),
      source_id: user.id.toString(),
      message: values.message,
      created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
      con_id: route.params.con_id,
      is_read: 0,
    };
    setConversationData((conversationData) => [
      ...conversationData,
      newMessage,
    ]);
    resetForm({ values: "" });
    setAuthToken(auth_token);
    const url = con_id ? "my/chat/message" : "my/chat/conversation";
    api
      .post(url, {
        listing_id: listingData.id,
        text: values.message,
        con_id: con_id || 0,
      })
      .then((res) => {
        if (res.ok) {
          removeAuthToken();
          if (!con_id && res.data.con_id) {
            setConId(res.data.con_id);
          }
        } else {
          removeAuthToken();
          const previousConversation = [...conversationData];
          previousConversation.filter(
            (message) => message.message_id !== newMessage.message_id
          );
          setConversationData(previousConversation);
        }
      });
  };

  const Message = ({ text, time, sender, is_read }) => (
    <View
      style={{
        width: "100%",
        marginVertical: 15,
        alignItems: sender ? "flex-end" : "flex-start",
      }}
    >
      <View style={styles.messageBubble}>
        <Text>{decodeString(text)}</Text>
      </View>
      <View
        style={{
          flexDirection: "row",
        }}
      >
        <Text style={{ fontSize: 12, color: COLORS.text_gray }}>{time}</Text>
        {sender && (
          <MaterialCommunityIcons
            name={is_read ? "check-all" : "check"}
            size={15}
            color={is_read ? COLORS.green : COLORS.gray}
          />
        )}
      </View>
    </View>
  );

  return Platform.OS === "android" ? (
    <>
      <TouchableOpacity
        onPress={() =>
          navigation.push("Listing Detail", { listingId: listingData.id })
        }
        style={{
          flexDirection: "row",
          backgroundColor: COLORS.white,
          alignItems: "center",
          height: 50,
          paddingHorizontal: "3%",
        }}
        disabled={route.params.from === "listing"}
      >
        <View
          style={{
            height: 50,
            width: 70,
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <Image
            style={{
              height: 50,
              width: 70,
              resizeMode: "cover",
            }}
            source={
              listingData.images.length
                ? {
                    uri: listingData.images[0].sizes.medium.src,
                  }
                : require(fallbackImageUrl)
            }
          />
        </View>
        <View style={{ marginLeft: 10, flex: 1 }}>
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 16,
              color: COLORS.text_dark,
            }}
            numberOfLines={1}
          >
            {decodeString(listingData.title)}
          </Text>
          <View>
            <Text style={{ color: COLORS.text_gray }} numberOfLines={1}>
              {handleLocationNCategoryData()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.text}>{loadingMessage}</Text>
        </View>
      )}
      {!loading && (
        <ScrollView
          ref={scrollView}
          onContentSizeChange={() => scrollView.current.scrollToEnd()}
          contentContainerStyle={{ paddingHorizontal: "2%" }}
        >
          {conversationData.map((item) => {
            const is_read = !!parseInt(item.is_read);
            if (!is_read && item.source_id != user.id) {
              handleMessageReadStatus(item);
            }

            return (
              <Message
                key={item.message_id}
                text={item.message}
                time={item.created_at}
                sender={item.source_id === user.id.toString()}
                is_read={is_read}
              />
            );
          })}
        </ScrollView>
      )}
      {(user.id === isConDeleted.sender_id &&
        isConDeleted.recipient_delete == 0) ||
      (user.id !== isConDeleted.sender_id &&
        isConDeleted.sender_delete == 0) ? (
        <Formik
          initialValues={{ message: "" }}
          onSubmit={handleMessageSending}
          validationSchema={validationSchema}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors }) => (
            <View style={styles.chatBoxWrap}>
              <TextInput
                onChangeText={handleChange("message")}
                onBlur={handleBlur("message")}
                value={values.message}
                multiline={true}
                placeholder="Type a message"
                style={styles.chatInput}
                textAlignVertical="center"
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSubmit}
                disabled={!!errors.message || !values.message.trim().length}
              >
                <FontAwesome
                  name="send-o"
                  size={25}
                  color={
                    errors.message || !values.message.trim().length
                      ? COLORS.gray
                      : COLORS.primary
                  }
                />
              </TouchableOpacity>
            </View>
          )}
        </Formik>
      ) : (
        <View style={styles.deletedMessageWrap}>
          <Text style={styles.deletedMessage}>{dactivatedMessage} </Text>
        </View>
      )}
    </>
  ) : (
    <>
      <TouchableOpacity
        onPress={() =>
          navigation.push("Listing Detail", { listingId: listingData.id })
        }
        style={{
          flexDirection: "row",
          backgroundColor: COLORS.white,
          alignItems: "center",
          height: 50,
          paddingHorizontal: "3%",
        }}
        disabled={route.params.from === "listing"}
      >
        <View
          style={{
            height: 50,
            width: 70,
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <Image
            style={{
              height: 50,
              width: 70,
              resizeMode: "cover",
            }}
            source={
              listingData.images.length
                ? {
                    uri: listingData.images[0].sizes.medium.src,
                  }
                : require(fallbackImageUrl)
            }
          />
        </View>
        <View style={{ marginLeft: 10, flex: 1 }}>
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 16,
              color: COLORS.text_dark,
            }}
            numberOfLines={1}
          >
            {decodeString(listingData.title)}
          </Text>
          <View>
            <Text style={{ color: COLORS.text_gray }} numberOfLines={1}>
              {handleLocationNCategoryData()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.text}>{loadingMessage}</Text>
        </View>
      )}
      {!loading && (
        <KeyboardAvoidingView
          style={styles.container}
          behavior="padding"
          keyboardVerticalOffset={70}
        >
          <ScrollView
            ref={scrollView}
            onContentSizeChange={() => scrollView.current.scrollToEnd()}
            contentContainerStyle={{ paddingHorizontal: "2%" }}
            // style={{ flex: 1 }}
          >
            {conversationData.map((item) => {
              const is_read = !!parseInt(item.is_read);
              if (!is_read && item.source_id != user.id) {
                handleMessageReadStatus(item);
              }

              return (
                <Message
                  key={item.message_id}
                  text={item.message}
                  time={item.created_at}
                  sender={item.source_id === user.id.toString()}
                  is_read={is_read}
                />
              );
            })}
          </ScrollView>

          {(user.id === isConDeleted.sender_id &&
            isConDeleted.recipient_delete == 0) ||
          (user.id !== isConDeleted.sender_id &&
            isConDeleted.sender_delete == 0) ? (
            <Formik
              initialValues={{ message: "" }}
              onSubmit={handleMessageSending}
              validationSchema={validationSchema}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors }) => (
                <View style={styles.chatBoxWrap}>
                  <TextInput
                    onChangeText={handleChange("message")}
                    onBlur={handleBlur("message")}
                    value={values.message}
                    multiline={true}
                    placeholder="Type a message"
                    style={styles.chatInput}
                    textAlignVertical="center"
                  />
                  <TouchableOpacity
                    style={styles.sendButton}
                    onPress={handleSubmit}
                    disabled={!!errors.message || !values.message.trim().length}
                  >
                    <FontAwesome
                      name="send-o"
                      size={25}
                      color={
                        errors.message || !values.message.trim().length
                          ? COLORS.gray
                          : COLORS.primary
                      }
                    />
                  </TouchableOpacity>
                </View>
              )}
            </Formik>
          ) : (
            <View style={styles.deletedMessageWrap}>
              <Text style={styles.deletedMessage}>{dactivatedMessage} </Text>
            </View>
          )}
        </KeyboardAvoidingView>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  chatBoxWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    marginHorizontal: "2%",
    marginVertical: 5,
  },
  chatInput: {
    minHeight: 40,
    backgroundColor: COLORS.white,
    paddingHorizontal: 5,
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 11 : 0,
  },

  container: {
    backgroundColor: COLORS.bg_dark,
    flex: 1,
  },
  deletedMessageWrap: {
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "yellow",
  },
  deletedMessage: {
    color: COLORS.text_dark,
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
  mainWrap: {
    backgroundColor: COLORS.bg_dark,
    paddingVertical: 10,
    elevation: 2,
  },
  messageBubble: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    flex: 1,
  },
  sendButton: {
    paddingHorizontal: 10,
  },
});

export default ChatScreen;
