/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import {
  Keyboard,
  Modal,
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";

import AppButton from "../components/AppButton";
import AppTextButton from "../components/AppTextButton";
import AppSeparator from "../components/AppSeparator";

import { useStateValue } from "../StateProvider";
import api from "../api/client";
import { COLORS } from "../variables/color";
import authStorage from "../app/auth/authStorage";
import FlashNotification from "../components/FlashNotification";

const signUpPrompt = "Don't have an account?";
const loginTitle = "Log in to your account";
const usernamePlacrholder = "Username / Email";
const passwordPlaceholder = "Password";
const forgotPassword = "Forgot your password?";
const passwordReset =
  "You will receive an email with a link to reset your password.";
const passwordResetCancelButton = "Cancel";
const passwordResetButton = "Send me a link";
const resetSuccessMessage =
  "A Link to reset your password was sent to your email";
const signUpButton = "Sign up now";
const loginButton = "Login";
const loginSuccessMessage = "Successfully loged in";
const errorFieldLabel = {
  username: "Username",
  password: "Password",
  reset: "This",
};
const validationSchema = Yup.object().shape({
  username: Yup.string().required().min(1).label(errorFieldLabel.username),
  password: Yup.string().required().min(1).label(errorFieldLabel.password),
});
const validationSchema_reset = Yup.object().shape({
  user_login: Yup.string().required().min(3).label(errorFieldLabel.reset),
});

const ios = Platform.OS === "ios";

const LoginScreen = ({ navigation }) => {
  const [, dispatch] = useStateValue();
  const [responseErrorMessage, setResponseErrorMessage] = useState();
  const [passResetErrorMessage, setPassResetResponseErrorMessage] = useState();
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reset_Loading, setReset_Loading] = useState(false);
  const [flashNotification, setFlashNotification] = useState(false);
  const [flashNotificationMessage, setFlashNotificationMessage] = useState();

  const handleLogin = (values) => {
    setResponseErrorMessage();
    setLoading((prevLoading) => true);
    Keyboard.dismiss();
    api
      .post("login", {
        username: values.username,
        password: values.password,
      })
      .then((res) => {
        if (res.ok) {
          dispatch({
            type: "SET_AUTH_DATA",
            data: {
              user: res.data.user,
              auth_token: res.data.jwt_token,
            },
          });
          authStorage.storeUser(JSON.stringify(res.data));
          // setLoading((prevLoading) => false);
          // navigation.goBack();
          handleSuccess(loginSuccessMessage);
        } else {
          setResponseErrorMessage((responseErrorMessage) =>
            res.data.error_message ? res.data.error_message : "Server Error"
          );
          handleError(
            res.data.error_message ? res.data.error_message : "Server Error"
          );
          // setLoading((prevLoading) => false);
        }
      });
    // .catch((error) => {
    //   setResponseErrorMessage((responseErrorMessage) => "Server Error");
    // });
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
      navigation.navigate('Account');
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

  const handleResetSuccess = (message) => {
    setFlashNotificationMessage((prevFlashNotificationMessage) => message);
    setTimeout(() => {
      setFlashNotification((prevFlashNotification) => true);
    }, 10);
    setTimeout(() => {
      setFlashNotification((prevFlashNotification) => false);
    }, 2000);
  };

  const handlePassReset = (values) => {
    setPassResetResponseErrorMessage();
    setReset_Loading((reset_Loading) => true);
    Keyboard.dismiss();
    api
      .post("reset-password", {
        user_login: values.user_login,
      })
      .then((res) => {
        if (res.ok) {
          setReset_Loading((reset_Loading) => false);
          setModalVisible(false);
          handleResetSuccess(resetSuccessMessage);
        } else {
          setPassResetResponseErrorMessage(
            (passResetResponseErrorMessage) => res.data.error_message
          );
          setReset_Loading((reset_Loading) => false);
        }
      })
      .catch((error) => {
        alert("Error");
      });
  };
  return ios ? (
    <KeyboardAvoidingView
      behavior="padding"
      style={{ flex: 1 }}
      keyboardVerticalOffset={80}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.loginNotice}>{loginTitle}</Text>
        <View style={styles.loginForm}>
          <Formik
            initialValues={{ username: "", password: "" }}
            onSubmit={handleLogin}
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
              <View style={{ width: "100%", alignItems: "center" }}>
                <View style={styles.inputWrap}>
                  <TextInput
                    style={styles.input}
                    onChangeText={handleChange("username")}
                    onBlur={() => setFieldTouched("username")}
                    value={values.username}
                    placeholder={usernamePlacrholder}
                    autoCorrect={false}
                    onFocus={() => setFieldTouched("username")}
                  />
                  <View style={styles.errorFieldWrap}>
                    {touched.username && errors.username && (
                      <Text style={styles.errorMessage}>{errors.username}</Text>
                    )}
                  </View>
                </View>
                <View style={styles.inputWrap}>
                  <TextInput
                    style={styles.input}
                    onChangeText={handleChange("password")}
                    onBlur={() => setFieldTouched("password")}
                    value={values.password}
                    placeholder={passwordPlaceholder}
                    type="password"
                    autoCorrect={false}
                    autoCapitalize="none"
                    onFocus={() => setFieldTouched("username")}
                    secureTextEntry={true}
                  />
                  <View style={styles.errorFieldWrap}>
                    {touched.password && errors.password && (
                      <Text style={styles.errorMessage}>{errors.password}</Text>
                    )}
                  </View>
                </View>
                <View style={styles.loginBtnWrap}>
                  <AppButton
                    onPress={handleSubmit}
                    title={loginButton}
                    style={styles.loginBtn}
                    textStyle={styles.loginBtnTxt}
                    disabled={
                      errors.username || errors.password || !touched.username
                    }
                    loading={loading}
                  />
                </View>
                {responseErrorMessage && (
                  <View style={styles.responseErrorWrap}>
                    <Text style={styles.responseErrorMessage}>
                      {responseErrorMessage}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </Formik>
          <AppTextButton
            title={forgotPassword}
            style
            textStyle
            onPress={() => {
              setModalVisible(true);
            }}
          />
        </View>
        <AppSeparator />
        <View style={styles.signUpPrompt}>
          <Text style={styles.signUpPromptText}>{signUpPrompt}</Text>
          <AppTextButton
            title={signUpButton}
            style
            textStyle
            onPress={() => navigation.navigate("Sign Up")}
          />
        </View>
        <View style={styles.centeredView}>
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Text style={styles.modalText}>{forgotPassword}</Text>
                <Text style={styles.modalText}>{passwordReset}</Text>

                <Formik
                  initialValues={{ user_login: "" }}
                  validationSchema={validationSchema_reset}
                  onSubmit={handlePassReset}
                >
                  {({
                    handleChange,

                    handleSubmit,
                    values,
                    errors,
                    setFieldTouched,
                    touched,
                  }) => (
                    <View
                      style={{
                        width: "100%",
                        alignItems: "center",
                      }}
                    >
                      <TextInput
                        style={styles.modalEmail}
                        onChangeText={handleChange("user_login")}
                        onBlur={() => setFieldTouched("user_login")}
                        value={values.user_login}
                        placeholder={usernamePlacrholder}
                        autoCorrect={false}
                        autoCapitalize="none"
                      />
                      <View style={styles.errorFieldWrap}>
                        {touched.user_login && errors.user_login && (
                          <Text style={styles.errorMessage}>
                            {errors.user_login}
                          </Text>
                        )}
                      </View>
                      <AppButton
                        title={passwordResetButton}
                        style={styles.resetLink}
                        onPress={handleSubmit}
                        loading={reset_Loading}
                        disabled={
                          errors.user_login || values.user_login.length < 1
                        }
                      />
                      {passResetErrorMessage && (
                        <View style={styles.responseErrorWrap}>
                          <Text style={styles.responseErrorMessage}>
                            {passResetErrorMessage}
                          </Text>
                        </View>
                      )}
                      <AppTextButton
                        title={passwordResetCancelButton}
                        onPress={() => {
                          setModalVisible(!modalVisible);
                        }}
                        textStyle={styles.cancelResetBtn}
                      />
                    </View>
                  )}
                </Formik>
              </View>
            </View>
          </Modal>
        </View>
        <FlashNotification
          falshShow={flashNotification}
          flashMessage={flashNotificationMessage}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  ) : (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.loginNotice}>{loginTitle}</Text>
      <View style={styles.loginForm}>
        <Formik
          initialValues={{ username: "", password: "" }}
          onSubmit={handleLogin}
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
            <View style={{ width: "100%", alignItems: "center" }}>
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input}
                  onChangeText={handleChange("username")}
                  onBlur={() => setFieldTouched("username")}
                  value={values.username}
                  placeholder={usernamePlacrholder}
                  autoCorrect={false}
                  onFocus={() => setFieldTouched("username")}
                />
                <View style={styles.errorFieldWrap}>
                  {touched.username && errors.username && (
                    <Text style={styles.errorMessage}>{errors.username}</Text>
                  )}
                </View>
              </View>
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input}
                  onChangeText={handleChange("password")}
                  onBlur={() => setFieldTouched("password")}
                  value={values.password}
                  placeholder={passwordPlaceholder}
                  type="password"
                  autoCorrect={false}
                  autoCapitalize="none"
                  onFocus={() => setFieldTouched("username")}
                  secureTextEntry={true}
                />
                <View style={styles.errorFieldWrap}>
                  {touched.password && errors.password && (
                    <Text style={styles.errorMessage}>{errors.password}</Text>
                  )}
                </View>
              </View>
              <View style={styles.loginBtnWrap}>
                <AppButton
                  onPress={handleSubmit}
                  title={loginButton}
                  style={styles.loginBtn}
                  textStyle={styles.loginBtnTxt}
                  disabled={
                    errors.username || errors.password || !touched.username
                  }
                  loading={loading}
                />
              </View>
              {responseErrorMessage && (
                <View style={styles.responseErrorWrap}>
                  <Text style={styles.responseErrorMessage}>
                    {responseErrorMessage}
                  </Text>
                </View>
              )}
            </View>
          )}
        </Formik>
        <AppTextButton
          title={forgotPassword}
          style
          textStyle
          onPress={() => {
            setModalVisible(true);
          }}
        />
      </View>
      <AppSeparator />
      <View style={styles.signUpPrompt}>
        <Text style={styles.signUpPromptText}>{signUpPrompt}</Text>
        <AppTextButton
          title={signUpButton}
          style
          textStyle
          onPress={() => navigation.navigate("Sign Up")}
        />
      </View>
      <View style={styles.centeredView}>
        <Modal animationType="slide" transparent={true} visible={modalVisible}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>{forgotPassword}</Text>
              <Text style={styles.modalText}>{passwordReset}</Text>

              <Formik
                initialValues={{ user_login: "" }}
                validationSchema={validationSchema_reset}
                onSubmit={handlePassReset}
              >
                {({
                  handleChange,

                  handleSubmit,
                  values,
                  errors,
                  setFieldTouched,
                  touched,
                }) => (
                  <View
                    style={{
                      width: "100%",
                      alignItems: "center",
                    }}
                  >
                    <TextInput
                      style={styles.modalEmail}
                      onChangeText={handleChange("user_login")}
                      onBlur={() => setFieldTouched("user_login")}
                      value={values.user_login}
                      placeholder={usernamePlacrholder}
                      autoCorrect={false}
                      autoCapitalize="none"
                    />
                    <View style={styles.errorFieldWrap}>
                      {touched.user_login && errors.user_login && (
                        <Text style={styles.errorMessage}>
                          {errors.user_login}
                        </Text>
                      )}
                    </View>
                    <AppButton
                      title={passwordResetButton}
                      style={styles.resetLink}
                      onPress={handleSubmit}
                      loading={reset_Loading}
                      disabled={
                        errors.user_login || values.user_login.length < 1
                      }
                    />
                    {passResetErrorMessage && (
                      <View style={styles.responseErrorWrap}>
                        <Text style={styles.responseErrorMessage}>
                          {passResetErrorMessage}
                        </Text>
                      </View>
                    )}
                    <AppTextButton
                      title={passwordResetCancelButton}
                      onPress={() => {
                        setModalVisible(!modalVisible);
                      }}
                      textStyle={styles.cancelResetBtn}
                    />
                  </View>
                )}
              </Formik>
            </View>
          </View>
        </Modal>
      </View>
      <FlashNotification
        falshShow={flashNotification}
        flashMessage={flashNotificationMessage}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  cancelResetBtn: {
    color: "gray",
  },
  container: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: ios ? 80 : 0,
    backgroundColor: '#FBFBFB',
  },
  errorFieldWrap: {
    height: 15,
    justifyContent: "center",
  },
  errorMessage: {
    fontSize: 12,
    color: COLORS.red,
  },
  inputWrap: {
    width: "100%",
    alignItems: "center",
  },
  loginBtn: {
    height: 40,
    borderRadius: 3,
    marginVertical: 10,
  },
  loginBtnWrap: {
    width: "100%",
    paddingHorizontal: "3%",
  },
  loginForm: {
    width: "100%",
    marginBottom: 40,
  },
  loginNotice: {
    fontSize: 16,
    color: "#111",
    marginVertical: 20,
  },
  modalEmail: {
    backgroundColor: "#e3e3e3",
    width: "95%",
    marginVertical: 10,
    height: 38,
    justifyContent: "center",
    borderRadius: 3,
    paddingHorizontal: 10,
  },
  input: {
    backgroundColor: "#e3e3e3",
    width: "95%",
    marginVertical: 10,
    height: 38,
    justifyContent: "center",
    borderRadius: 3,
    paddingHorizontal: 10,
  },
  resetLink: {
    height: 40,
    borderRadius: 3,
    marginVertical: 10,
  },
  responseErrorMessage: {
    color: COLORS.red,
    fontWeight: "bold",
    fontSize: 15,
  },
  responseErrorWrap: {
    marginVertical: 10,
    alignItems: "center",
  },
  signUpPrompt: {
    marginTop: 40,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
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
    width: "90%",
  },

  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
});

export default LoginScreen;
