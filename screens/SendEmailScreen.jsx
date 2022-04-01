/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Formik } from "formik";
import { COLORS } from "../variables/color";
import AppButton from "../components/AppButton";
import * as Yup from "yup";
import api, { setAuthToken, removeAuthToken } from "../api/client";
import { useStateValue } from "../StateProvider";
import FlashNotification from "../components/FlashNotification";

const validationSchema = Yup.object().shape({
  message: Yup.string().required().min(3).label("Message"),
  name: Yup.string().required().label("Name"),
  email: Yup.string().required().email().label("Email"),
});

const serverResponse = {
  success: "Successfully sent email",
  fail: "Error sending email, Please try again",
  timeOut: "Request Timed out! Please try again",
};

const ios = Platform.OS === "ios";

const SendEmailScreen = ({ navigation, route }) => {
  const [loading, setLoading] = useState(false);
  const [{ auth_token, user }] = useStateValue();
  const [done, setDone] = useState(false);
  const [flashNotification, setFlashNotification] = useState(false);
  const [flashNotificationMessage, setFlashNotificationMessage] = useState();

  const sendEmail = (values) => {
    setLoading((prevLoading) => true);
    const mailData = {
      listing_id: route.params.listing.id,
      message: values.message,
      name: values.name,
      email: values.email,
    };
    setAuthToken(auth_token);
    api.post("listing/email-seller", mailData).then((res) => {
      if (res.ok) {
        setDone((done) => !done);
        setLoading((prevLoading) => false);
        removeAuthToken();
        handleSuccess(serverResponse.success);
      } else {
        setLoading((prevLoading) => false);
        removeAuthToken();
        if (res.problem === "TIMEOUT_ERROR") {
          handleError(serverResponse.timeOut);
        } else {
          handleError(
            res.data.error_message
              ? res.data.error_message
              : serverResponse.fail
          );
        }
      }
    });
  };

  const getUserName = () => {
    if (!user.first_name && !user.last_name) {
      return user.username;
    } else {
      return (user.first_name || "") + " " + (user.last_name || "");
    }
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
    }, 800);
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
    }, 1500);
  };
  return ios ? (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <View style={styles.titleWrap}>
          <Text style={styles.title} numberOfLines={2}>
            {route.params.listing.title}
          </Text>
        </View>
        <View style={styles.formWrap}>
          <Formik
            initialValues={{
              message: "",
              name: getUserName() || "",
              email: user.email || "",
            }}
            onSubmit={(values) => sendEmail(values)}
            validationSchema={validationSchema}
          >
            {({
              handleChange,
              handleSubmit,
              values,
              errors,
              setFieldTouched,
              touched,
              // setFieldValue,
            }) => (
              <View style={styles.formContentWrap}>
                <TextInput
                  blurOnSubmit={false}
                  style={styles.textInput}
                  onChangeText={handleChange("name")}
                  onBlur={() => setFieldTouched("name")}
                  value={values.name}
                  placeholder="Your Name"
                  editable={!getUserName()}
                />
                <View style={styles.errorWrap}>
                  {touched.name && errors.name && (
                    <Text style={styles.errorMessage}>{errors.name}</Text>
                  )}
                </View>
                <TextInput
                  blurOnSubmit={false}
                  style={styles.textInput}
                  onChangeText={handleChange("email")}
                  onBlur={() => setFieldTouched("email")}
                  value={values.email}
                  placeholder="Your email"
                  editable={!user.email}
                />
                <View style={styles.errorWrap}>
                  {touched.email && errors.email && (
                    <Text style={styles.errorMessage}>{errors.email}</Text>
                  )}
                </View>
                <TextInput
                  multiline={true}
                  blurOnSubmit={false}
                  style={[styles.textInput, styles.textAreaInput]}
                  onChangeText={handleChange("message")}
                  onBlur={() => setFieldTouched("message")}
                  value={values.message}
                  placeholder="Your Message"
                  textAlignVertical="top"
                  onFocus={() => setFieldTouched("message")}
                />
                <View style={styles.errorWrap}>
                  {touched.message && errors.message && (
                    <Text style={styles.errorMessage}>{errors.message}</Text>
                  )}
                </View>

                <AppButton
                  onPress={handleSubmit}
                  title="Send Email"
                  style={styles.btnStyle}
                  textStyle={styles.btnText}
                  disabled={
                    Object.keys(touched).length < 1 ||
                    Object.keys(values).length < 1 ||
                    Object.keys(errors).length > 0 ||
                    done
                  }
                  loading={loading}
                />
              </View>
            )}
          </Formik>
        </View>
      </ScrollView>

      <FlashNotification
        falshShow={flashNotification}
        flashMessage={flashNotificationMessage}
      />
    </KeyboardAvoidingView>
  ) : (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.titleWrap}>
          <Text style={styles.title} numberOfLines={2}>
            {route.params.listing.title}
          </Text>
        </View>
        <View style={styles.formWrap}>
          <Formik
            initialValues={{
              message: "",
              name: getUserName() || "",
              email: user.email || "",
            }}
            onSubmit={(values) => sendEmail(values)}
            validationSchema={validationSchema}
          >
            {({
              handleChange,
              handleSubmit,
              values,
              errors,
              setFieldTouched,
              touched,
              // setFieldValue,
            }) => (
              <View style={styles.formContentWrap}>
                <TextInput
                  blurOnSubmit={false}
                  style={styles.textInput}
                  onChangeText={handleChange("name")}
                  onBlur={() => setFieldTouched("name")}
                  value={values.name}
                  placeholder="Your Name"
                  editable={!values.name}
                />
                <View style={styles.errorWrap}>
                  {touched.name && errors.name && (
                    <Text style={styles.errorMessage}>{errors.name}</Text>
                  )}
                </View>
                <TextInput
                  blurOnSubmit={false}
                  style={styles.textInput}
                  onChangeText={handleChange("email")}
                  onBlur={() => setFieldTouched("email")}
                  value={values.email}
                  placeholder="Your email"
                  editable={!user.email}
                />
                <View style={styles.errorWrap}>
                  {touched.email && errors.email && (
                    <Text style={styles.errorMessage}>{errors.email}</Text>
                  )}
                </View>
                <TextInput
                  multiline={true}
                  blurOnSubmit={false}
                  style={[styles.textInput, styles.textAreaInput]}
                  onChangeText={handleChange("message")}
                  onBlur={() => setFieldTouched("message")}
                  value={values.message}
                  placeholder="Your Message"
                  textAlignVertical="top"
                  onFocus={() => setFieldTouched("message")}
                />
                <View style={styles.errorWrap}>
                  {touched.message && errors.message && (
                    <Text style={styles.errorMessage}>{errors.message}</Text>
                  )}
                </View>

                <AppButton
                  onPress={handleSubmit}
                  title="Send Email"
                  style={styles.btnStyle}
                  textStyle={styles.btnText}
                  disabled={
                    Object.keys(touched).length < 1 ||
                    Object.keys(values).length < 1 ||
                    Object.keys(errors).length > 0 ||
                    done
                  }
                  loading={loading}
                />
              </View>
            )}
          </Formik>
        </View>
      </ScrollView>

      <FlashNotification
        falshShow={flashNotification}
        flashMessage={flashNotificationMessage}
      />
    </>
  );
};

const styles = StyleSheet.create({
  btnStyle: {
    width: "100%",
    paddingVertical: 10,
    borderRadius: 3,
    marginVertical: 20,
  },
  btnText: {
    fontSize: 17,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.bg_dark,
  },
  directionText: {
    textAlign: "center",
    fontSize: 17,
    color: COLORS.text_gray,
  },
  errorMessage: {
    fontSize: 12,
    color: COLORS.primary,
  },
  errorWrap: {
    height: 14,
  },

  formContentWrap: {
    marginTop: 20,
  },
  formWrap: {
    paddingHorizontal: "3%",
    // backgroundColor: COLORS.white,
    paddingBottom: ios ? 50 : 0,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  modalText: {
    fontSize: 17,
    paddingBottom: 12,
  },
  modalView: {
    width: "94%",
    backgroundColor: "white",
    borderRadius: 3,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  picker: {
    flexDirection: "row",
    height: 40,
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pickerOptions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 10,
  },
  pickerOptionsText: {
    fontSize: 16,
    color: COLORS.text_dark,
  },
  pickerText: {
    fontSize: 16,
    justifyContent: "center",
    color: COLORS.text_gray,
  },
  reasonPicker: {},
  questionText: {
    textAlign: "center",
    fontSize: 22,
    color: COLORS.text_dark,
    paddingVertical: 20,
  },
  formSeparator: {
    width: "100%",
    height: 1,
  },
  textAreaInput: {
    minHeight: 80,
  },
  textInput: {
    fontSize: 16,
    minHeight: 35,
    borderWidth: 1,
    borderColor: COLORS.gray,
    marginTop: 10,
    borderRadius: 3,
    paddingHorizontal: 5,
  },
  textWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: "3%",
    backgroundColor: COLORS.white,
  },
  title: {
    textAlign: "center",
    fontSize: 25,
    color: COLORS.text_dark,
    paddingVertical: 10,
  },
  titleWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: "3%",
  },
});

export default SendEmailScreen;
