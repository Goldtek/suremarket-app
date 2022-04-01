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

const questionText = "Something wrong with this ad?";
const directionText =
  "Please send us a report if you believe there is a problem with this ad?";

const validationSchema = Yup.object().shape({
  message: Yup.string().required().min(5).label("Message"),
});

const serverResponse = {
  success: "Successfully submitted report",
  fail: "Error subbmitting report, please try again",
};

const ios = Platform.OS === "ios";

const ReportScreen = ({ route, navigation }) => {
  const [loading, setLoading] = useState(false);
  const [{ auth_token }] = useStateValue();
  const [done, setDone] = useState(false);
  const [flashNotification, setFlashNotification] = useState(false);
  const [flashNotificationMessage, setFlashNotificationMessage] = useState();
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

  const submitReport = (values) => {
    setLoading((prevLoading) => true);
    setAuthToken(auth_token);
    api
      .post("listing/report/", {
        listing_id: route.params.listingId,
        message: values.message,
      })
      .then((res) => {
        if (res.ok) {
          setDone((done) => !done);
          removeAuthToken();
          handleSuccess(serverResponse.success);
        } else {
          // TODO handle error
          removeAuthToken();
          handleError(serverResponse.fail);
        }
      });
  };

  return ios ? (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <View style={styles.titleWrap}>
          <Text style={styles.title} numberOfLines={2}>
            {route.params.listingTitle}
          </Text>
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.questionText}>{questionText}</Text>
          <Text style={styles.directionText}>{directionText}</Text>
        </View>
        <View style={styles.formWrap}>
          <Formik
            initialValues={{
              message: "",
            }}
            onSubmit={(values) => submitReport(values)}
            validationSchema={validationSchema}
          >
            {({
              handleChange,
              handleSubmit,
              values,
              errors,
              setFieldTouched,
              touched,
            }) => (
              <View style={styles.formContentWrap}>
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
                  title="Send Report"
                  style={styles.btnStyle}
                  textStyle={styles.btnText}
                  disabled={
                    // Object.keys(touched).length < 1 ||
                    Object.keys(errors).length > 0 || done || !values.message
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
            {route.params.listingTitle}
          </Text>
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.questionText}>{questionText}</Text>
          <Text style={styles.directionText}>{directionText}</Text>
        </View>
        <View style={styles.formWrap}>
          <Formik
            initialValues={{
              message: "",
            }}
            onSubmit={(values) => submitReport(values)}
            validationSchema={validationSchema}
          >
            {({
              handleChange,
              handleSubmit,
              values,
              errors,
              setFieldTouched,
              touched,
            }) => (
              <View style={styles.formContentWrap}>
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
                  title="Send Report"
                  style={styles.btnStyle}
                  textStyle={styles.btnText}
                  disabled={
                    // Object.keys(touched).length < 1 ||
                    Object.keys(errors).length > 0 || done || !values.message
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
    color: COLORS.red,
  },
  errorWrap: {
    height: 14,
  },
  flashMessage: {
    position: "absolute",
    backgroundColor: "green",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    bottom: 0,
    zIndex: 2,
  },
  formContentWrap: {
    marginTop: 20,
  },
  formWrap: {
    paddingHorizontal: "3%",
    backgroundColor: COLORS.white,
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
    minHeight: 40,
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
    fontSize: 30,
    color: COLORS.text_dark,
    paddingVertical: 10,
  },
  titleWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: "3%",
  },
});

export default ReportScreen;
