/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  ScrollView,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Formik } from "formik";
import AppButton from "../components/AppButton";
import api from "../api/client";
import * as Yup from "yup";
import { COLORS } from "../variables/color";
import FlashNotification from "../components/FlashNotification";

const formFieldLabels = {
  first_name: "First Name",
  last_name: "Last Name",
  username: "Username",
  phone: "Phone Number",
  email: "Email",
  password: "Password",
};

const SignupSuccessMessage = "Signup was successful";

const validationSchema = Yup.object().shape({
  first_name: Yup.string().required().label(formFieldLabels.first_name),
  last_name: Yup.string().required().label(formFieldLabels.last_name),
  username: Yup.string().required().min(6).label(formFieldLabels.username),
  phone: Yup.number().required().min(5).label(formFieldLabels.phone),
  email: Yup.string().required().email().label(formFieldLabels.email),
  password: Yup.string().required().min(6).label(formFieldLabels.password),
});

const errorMessage = {
  timeoutError: "Request Timed out",
  serverError: "Server error",
};

const signUpButtonTitle = "Sign Up";

const ios = Platform.OS === "ios";

const SignUpScreen = ({ navigation }) => {
  // const [{ user, token }, dispatch] = useStateValue();
  const [responseErrorMessage, setResponseErrorMessage] = useState();
  const [loading, setLoading] = useState(false);
  const [flashNotification, setFlashNotification] = useState(false);
  const [flashNotificationMessage, setFlashNotificationMessage] = useState();

  const handleSignup = (values) => {
    setResponseErrorMessage();
    setLoading((prevLoading) => true);
    Keyboard.dismiss();
    api.post("register", values).then((res) => {
      if (res.ok) {
        // dispatch({
        //   type: "SET_AUTH_DATA",
        //   data: {
        //     user: res.data.user,
        //     auth_token: res.data.jwt_token,
        //   },
        // });
        // setLoading((loading) => false);
        //   navigation.goBack();
        // navigation.pop(2);
        handleSuccess(SignupSuccessMessage);
      } else {
        if (res.problem === "TIMEOUT_ERROR") {
          setResponseErrorMessage(
            (responseErrorMessage) => errorMessage.timeoutError
          );
          handleError(errorMessage.timeoutError);
        } else {
          setResponseErrorMessage((responseErrorMessage) =>
            res.data.error_message
              ? res.data.error_message
              : errorMessage.serverError
          );
          handleError(
            res.data.error_message
              ? res.data.error_message
              : errorMessage.serverError
          );
        }
      }
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
      setLoading((prevLoading) => false);
    }, 1000);
  };

  return ios ? (
    <KeyboardAvoidingView
      behavior="padding"
      style={{ flex: 1 }}
      keyboardVerticalOffset={80}
    >
      <ScrollView>
        <View style={styles.container}>
          <View style={styles.signUpForm}>
            <Formik
              initialValues={{
                first_name: "",
                last_name: "",
                username: "",
                phone: "",
                email: "",
                password: "",
              }}
              validationSchema={validationSchema}
              onSubmit={handleSignup}
            >
              {({
                handleChange,
                handleSubmit,
                values,
                errors,
                setFieldTouched,
                touched,
              }) => (
                <View style={{ width: "100%", paddingHorizontal: "3%" }}>
                  <View style={{ flexDirection: "row" }}>
                    <View style={{ flex: 1, marginRight: 5 }}>
                      <Text>
                        {formFieldLabels.first_name}
                        <Text style={styles.required}> *</Text>
                      </Text>
                      <TextInput
                        style={[styles.inputCommon, styles.nameInput]}
                        onChangeText={handleChange("first_name")}
                        onBlur={() => setFieldTouched("first_name")}
                        value={values.first_name}
                        placeholder="First Name"
                      />
                      <View style={styles.errorWrap}>
                        {touched.first_name && errors.first_name && (
                          <Text style={styles.errorMessage}>
                            {errors.first_name}
                          </Text>
                        )}
                      </View>
                    </View>
                    <View style={{ flex: 1, marginLeft: 5 }}>
                      <Text>
                        {formFieldLabels.last_name}
                        <Text style={styles.required}> *</Text>
                      </Text>
                      <TextInput
                        style={[styles.inputCommon, styles.nameInput]}
                        onChangeText={handleChange("last_name")}
                        onBlur={() => setFieldTouched("last_name")}
                        value={values.last_name}
                        placeholder="Last Name"
                      />
                      <View style={styles.errorWrap}>
                        {touched.last_name && errors.last_name && (
                          <Text style={styles.errorMessage}>
                            {errors.last_name}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                  <Text>
                    {formFieldLabels.username}
                    <Text style={styles.required}> *</Text>
                  </Text>
                  <TextInput
                    style={[styles.inputCommon, styles.usernameInput]}
                    onChangeText={handleChange("username")}
                    onBlur={() => setFieldTouched("username")}
                    value={values.username}
                    placeholder="username"
                    autoCapitalize="none"
                  />
                  <View style={styles.errorWrap}>
                    {touched.username && errors.username && (
                      <Text style={styles.errorMessage}>{errors.username}</Text>
                    )}
                  </View>
                  <Text>
                    {formFieldLabels.email}
                    <Text style={styles.required}> *</Text>
                  </Text>
                  <TextInput
                    style={[styles.inputCommon, styles.emailImput]}
                    onChangeText={handleChange("email")}
                    onBlur={() => setFieldTouched("email")}
                    value={values.email}
                    placeholder="user@email.com"
                    keyboardType="email-address"
                  />
                  <View style={styles.errorWrap}>
                    {touched.email && errors.email && (
                      <Text style={styles.errorMessage}>{errors.email}</Text>
                    )}
                  </View>
                  <Text>
                    {formFieldLabels.phone}
                    <Text style={styles.required}> *</Text>
                  </Text>
                  <TextInput
                    style={[styles.inputCommon, styles.phoneImput]}
                    onChangeText={handleChange("phone")}
                    onBlur={() => setFieldTouched("phone")}
                    value={values.phone}
                    placeholder="Phone Number"
                    keyboardType="phone-pad"
                  />
                  <View style={styles.errorWrap}>
                    {touched.phone && errors.phone && (
                      <Text style={styles.errorMessage}>{errors.phone}</Text>
                    )}
                  </View>

                  <Text>
                    {formFieldLabels.password}
                    <Text style={styles.required}> *</Text>
                  </Text>
                  <TextInput
                    style={[styles.inputCommon, styles.passwordImput]}
                    onChangeText={handleChange("password")}
                    onBlur={() => setFieldTouched("password")}
                    value={values.password}
                    placeholder="Password"
                    secureTextEntry
                    autoCapitalize="none"
                  />
                  <View style={styles.errorWrap}>
                    {touched.password && <errors className="pass"></errors> && (
                      <Text style={styles.errorMessage}>{errors.password}</Text>
                    )}
                  </View>

                  <AppButton
                    onPress={handleSubmit}
                    title={signUpButtonTitle}
                    style={styles.signUpBtn}
                    textStyle={styles.signUpBtnTxt}
                    disabled={
                      Object.keys(errors).length > 0 ||
                      Object.keys(touched).length === 0
                    }
                    loading={loading}
                  />
                  <View style={styles.responseErrorWrap}>
                    <Text style={styles.responseErrorMessage}>
                      {responseErrorMessage}
                    </Text>
                  </View>
                </View>
              )}
            </Formik>
          </View>

          <FlashNotification
            falshShow={flashNotification}
            flashMessage={flashNotificationMessage}
            containerStyle={styles.flashContainerStyle}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  ) : (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.signUpForm}>
          <Formik
            initialValues={{
              first_name: "",
              last_name: "",
              username: "",
              phone: "",
              email: "",
              password: "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleSignup}
          >
            {({
              handleChange,
              handleSubmit,
              values,
              errors,
              setFieldTouched,
              touched,
            }) => (
              <View style={{ width: "100%", paddingHorizontal: "3%" }}>
                <View style={{ flexDirection: "row" }}>
                  <View style={{ flex: 1, marginRight: 5 }}>
                    <Text>
                      First Name
                      <Text style={styles.required}> *</Text>
                    </Text>
                    <TextInput
                      style={[styles.inputCommon, styles.nameInput]}
                      onChangeText={handleChange("first_name")}
                      onBlur={() => setFieldTouched("first_name")}
                      value={values.first_name}
                      placeholder="First Name"
                    />
                    <View style={styles.errorWrap}>
                      {touched.first_name && errors.first_name && (
                        <Text style={styles.errorMessage}>
                          {errors.first_name}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={{ flex: 1, marginLeft: 5 }}>
                    <Text>
                      Last Name
                      <Text style={styles.required}> *</Text>
                    </Text>
                    <TextInput
                      style={[styles.inputCommon, styles.nameInput]}
                      onChangeText={handleChange("last_name")}
                      onBlur={() => setFieldTouched("last_name")}
                      value={values.last_name}
                      placeholder="Last Name"
                    />
                    <View style={styles.errorWrap}>
                      {touched.last_name && errors.last_name && (
                        <Text style={styles.errorMessage}>
                          {errors.last_name}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
                <Text>
                  Username
                  <Text style={styles.required}> *</Text>
                </Text>
                <TextInput
                  style={[styles.inputCommon, styles.usernameInput]}
                  onChangeText={handleChange("username")}
                  onBlur={() => setFieldTouched("username")}
                  value={values.username}
                  placeholder="username"
                  autoCapitalize="none"
                />
                <View style={styles.errorWrap}>
                  {touched.username && errors.username && (
                    <Text style={styles.errorMessage}>{errors.username}</Text>
                  )}
                </View>
                <Text>
                  Email
                  <Text style={styles.required}> *</Text>
                </Text>
                <TextInput
                  style={[styles.inputCommon, styles.emailImput]}
                  onChangeText={handleChange("email")}
                  onBlur={() => setFieldTouched("email")}
                  value={values.email}
                  placeholder="user@email.com"
                  keyboardType="email-address"
                />
                <View style={styles.errorWrap}>
                  {touched.email && errors.email && (
                    <Text style={styles.errorMessage}>{errors.email}</Text>
                  )}
                </View>
                <Text>
                  Phone
                  <Text style={styles.required}> *</Text>
                </Text>
                <TextInput
                  style={[styles.inputCommon, styles.phoneImput]}
                  onChangeText={handleChange("phone")}
                  onBlur={() => setFieldTouched("phone")}
                  value={values.phone}
                  placeholder="Phone Number"
                  keyboardType="phone-pad"
                />
                <View style={styles.errorWrap}>
                  {touched.phone && errors.phone && (
                    <Text style={styles.errorMessage}>{errors.phone}</Text>
                  )}
                </View>

                <Text>
                  Password
                  <Text style={styles.required}> *</Text>
                </Text>
                <TextInput
                  style={[styles.inputCommon, styles.passwordImput]}
                  onChangeText={handleChange("password")}
                  onBlur={() => setFieldTouched("password")}
                  value={values.password}
                  placeholder="Password"
                  secureTextEntry
                  autoCapitalize="none"
                />
                <View style={styles.errorWrap}>
                  {touched.password && <errors className="pass"></errors> && (
                    <Text style={styles.errorMessage}>{errors.password}</Text>
                  )}
                </View>

                <AppButton
                  onPress={handleSubmit}
                  title="Sign Up"
                  style={styles.signUpBtn}
                  textStyle={styles.signUpBtnTxt}
                  disabled={
                    Object.keys(errors).length > 0 ||
                    Object.keys(touched).length === 0
                  }
                  loading={loading}
                />
                <View style={styles.responseErrorWrap}>
                  <Text style={styles.responseErrorMessage}>
                    {responseErrorMessage}
                  </Text>
                </View>
              </View>
            )}
          </Formik>
        </View>

        <FlashNotification
          falshShow={flashNotification}
          flashMessage={flashNotificationMessage}
          containerStyle={styles.flashContainerStyle}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
    paddingBottom: ios ? 50 : 0,
  },
  errorMessage: {
    color: COLORS.red,
    fontSize: 12,
  },
  errorWrap: {
    height: 20,
  },
  flashContainerStyle: {
    top: "85%",
    bottom: "5%",
  },
  signUpForm: {
    width: "100%",
    paddingTop: 10,
    marginBottom: 40,
  },
  inputCommon: {
    backgroundColor: "#e3e3e3",
    marginVertical: 10,
    justifyContent: "center",
    height: 38,
    borderRadius: 3,
    paddingHorizontal: 10,
  },
  label: {
    alignItems: "flex-start",
  },
  loginPrompt: {
    marginTop: 40,
  },
  required: {
    color: COLORS.red,
  },
  responseErrorWrap: {
    alignItems: "center",
  },
  responseErrorMessage: {
    color: COLORS.red,
    fontSize: 15,
    fontWeight: "bold",
  },
  signUpBtn: {
    height: 40,
    borderRadius: 3,
    marginVertical: 10,
    width: "100%",
  },
});

export default SignUpScreen;
