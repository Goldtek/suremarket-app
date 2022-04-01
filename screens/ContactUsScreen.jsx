/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
  ImageBackground
} from "react-native";
import { COLORS } from "../variables/color";
import AppButton from "../components/AppButton";
import { Formik } from "formik";
import * as Yup from "yup";
import AppSeparator from "../components/AppSeparator";
import { useStateValue } from "../StateProvider";
import api from "../api/client"; //  setAuthToken, removeAuthToken
import FlashNotification from "../components/FlashNotification";

const pageTitle = "Contact us";
const sendmessageButtontitle = "Send message";
const successMessage = "Successfully sent your message";
const formData = {
  name: {
    label: "Your Name",
    placeholder: "Enter Your Name...",
    errorLabel: "Name",
  },
  phone: {
    label: "Phone Number",
    placeholder: "Enter Phone Number...",
    errorLabel: "Phone Number",
  },
  email: {
    label: "Email",
    placeholder: "example@email.com",
    errorLabel: "Email",
  },
  message: {
    label: "Message",
    placeholder: "Your Message...",
    errorLabel: "Message",
  },
};
const validationSchema = Yup.object().shape({
  name: Yup.string().required().min(3).label(formData.name.errorLabel),
  phone: Yup.string().min(5).label(formData.phone.errorLabel),
  email: Yup.string().email().required().label(formData.email.errorLabel),
  message: Yup.string().required().min(3).label(formData.message.errorLabel),
});
const ios = Platform.OS === "ios";
const ContactUsScreen = ({ navigation }) => {
  const [{ user }] = useStateValue();
  const [formErrorMessage, setFormErrorMessage] = useState();
  const [loading, setLoading] = useState(false);
  const [flashNotification, setFlashNotification] = useState(false);
  const [flashNotificationMessage, setFlashNotificationMessage] = useState();

  const handleMessageSubmission = (values) => {
    setFormErrorMessage();
    setLoading((loading) => true);
    Keyboard.dismiss();

    api
      .post("contact", {
        name: values.name,
        phone: values.phone,
        email: values.email,
        message: values.message,
      })
      .then((res) => {
        if (res.ok) {
          setFlashNotificationMessage(
            (prevFlashNotificationMessage) => successMessage
          );
          handleSuccess();
          // setLoading((loading) => false);
          // navigation.goBack();
        } else {
          setFormErrorMessage((formErrorMessage) =>
            res.data.error_message ? res.data.error_message : "Server Error"
          );
          setFlashNotificationMessage((prevFlashNotificationMessage) =>
            res.data.error_message ? res.data.error_message : "Server Error"
          );
          // setLoading((loading) => false);
          handleError();
        }
      });
  };

  const handleSuccess = () => {
    setFlashNotification((prevFlashNotification) => true);

    setTimeout(() => {
      setFlashNotification((prevFlashNotification) => false);
      setLoading((prevLoading) => false);
      navigation.goBack();
    }, 1000);
  };
  const handleError = () => {
    setFlashNotification((prevFlashNotification) => true);

    setTimeout(() => {
      setFlashNotification((prevFlashNotification) => false);
      setLoading((prevLoading) => false);
    }, 1000);
  };

  return ios ? (
    <KeyboardAvoidingView
      behavior="padding"
      style={{ flex: 1 }}
      keyboardVerticalOffset={70}
    >
      <ScrollView>
        <ImageBackground style={styles.container}  source={require('../assets/whitebg.png')}>
          <View style={styles.formWrap}>
            <Formik
              initialValues={{
                name: user
                  ? !!user.first_name || !!user.last_name
                    ? `${user.first_name} ${user.last_name}`
                    : ""
                  : "",
                phone: user ? (user.phone ? user.phone : "") : "",
                email: user ? (user.email ? user.email : "") : "",
                message: "",
              }}
              onSubmit={handleMessageSubmission}
              validationSchema={validationSchema}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                setFieldTouched,
                touched,
              }) => (
                <View>
                  <View style={styles.inputWrap}>
                    <Text style={styles.inputLabel}>
                      {formData.name.label}
                      {` `}
                      <Text style={styles.required}> *</Text>
                    </Text>
                    <TextInput
                      style={styles.formInput}
                      onChangeText={handleChange("name")}
                      onBlur={() => setFieldTouched("name")}
                      value={values.name}
                      placeholder={formData.name.placeholder}
                      editable={
                        user === null || (!user.first_name && !user.last_name)
                      }
                    />
                    <AppSeparator style={styles.separator} />
                    <View style={styles.inputErrorWrap}>
                      {touched.name && errors.name && (
                        <Text style={styles.inputErrorMessage}>
                          {errors.name}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.inputWrap}>
                    <Text style={styles.inputLabel}>
                      {formData.phone.label}
                    </Text>
                    <TextInput
                      style={styles.formInput}
                      onChangeText={handleChange("phone")}
                      onBlur={() => setFieldTouched("phone")}
                      value={values.phone}
                      placeholder={formData.phone.placeholder}
                      editable={user === null || !user.phone}
                      keyboardType="phone-pad"
                    />
                    <AppSeparator style={styles.separator} />
                    <View style={styles.inputErrorWrap}>
                      {touched.phone && errors.phone && (
                        <Text style={styles.inputErrorMessage}>
                          {errors.phone}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.inputWrap}>
                    <Text style={styles.inputLabel}>
                      {formData.email.label}
                      {` `}
                      <Text style={styles.required}> *</Text>
                    </Text>
                    <TextInput
                      style={styles.formInput}
                      onChangeText={handleChange("email")}
                      onBlur={() => setFieldTouched("email")}
                      value={values.email}
                      placeholder={formData.email.placeholder}
                      editable={user === null || !user.email}
                      keyboardType="email-address"
                    />
                    <AppSeparator style={styles.separator} />
                    <View style={styles.inputErrorWrap}>
                      {touched.email && errors.email && (
                        <Text style={styles.inputErrorMessage}>
                          {errors.email}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.inputWrap}>
                    <Text style={styles.inputLabel}>
                      {formData.message.label}
                      {` `}
                      <Text style={styles.required}> *</Text>
                    </Text>
                    <TextInput
                      style={[styles.formInput, { minHeight: 100 }]}
                      onChangeText={handleChange("message")}
                      onBlur={() => setFieldTouched("message")}
                      value={values.message}
                      placeholder={formData.message.placeholder}
                      multiline={true}
                      blurOnSubmit={false}
                    />

                    <AppSeparator style={styles.separator} />
                    <View style={styles.inputErrorWrap}>
                      {touched.message && errors.message && (
                        <Text style={styles.inputErrorMessage}>
                          {errors.message}
                        </Text>
                      )}
                    </View>
                  </View>
                  {/* <View style={styles.inputWrap}>
                    <Text style={styles.inputLabel}>
                      {formData.message.label}
                      {` `}
                      <Text style={styles.required}> *</Text>
                    </Text>
                    <TextInput
                      style={[styles.formInput, { minHeight: 100 }]}
                      onChangeText={handleChange("message")}
                      onBlur={() => setFieldTouched("message")}
                      value={values.message}
                      placeholder={formData.message.placeholder}
                      multiline={true}
                      blurOnSubmit={false}
                    />

                    <AppSeparator style={styles.separator} />
                    <View style={styles.inputErrorWrap}>
                      {touched.message && errors.message && (
                        <Text style={styles.inputErrorMessage}>
                          {errors.message}
                        </Text>
                      )}
                    </View>
                  </View> */}
                  <AppButton
                    onPress={handleSubmit}
                    title={sendmessageButtontitle}
                    style={styles.button}
                    textStyle={styles.buttonText}
                    // disabled={Object.keys(errors).length > 0 || !touched.message}
                    // disabled={
                    //   Object.keys(errors).length > 0 ||
                    //   Object.keys(touched).length < 1 ||
                    //   !values.message
                    // }
                    disabled={
                      user
                        ? Object.keys(errors).length > 0 ||
                          !values.message ||
                          !values.name ||
                          !values.email
                        : Object.keys(errors).length > 0 ||
                          Object.keys(touched).length < 1
                    }
                    loading={loading}
                  />
                  <View style={styles.formErrorWrap}>
                    {formErrorMessage && (
                      <Text style={styles.formErrorMessage}>
                        {formErrorMessage}
                      </Text>
                    )}
                  </View>
                </View>
              )}
            </Formik>
          </View>
        </ImageBackground>
      </ScrollView>
      <FlashNotification
        falshShow={flashNotification}
        flashMessage={flashNotificationMessage}
      />
    </KeyboardAvoidingView>
  ) : (
    <ScrollView style={styles.scrollContainer}>
      <ImageBackground style={styles.container} source={require('../assets/whitebg.png')}>
        <Text style={styles.pageTitle}>{pageTitle}</Text>
        <View style={styles.formWrap}>
          <Formik
            initialValues={{
              name: user
                ? !!user.first_name || !!user.last_name
                  ? `${user.first_name} ${user.last_name}`
                  : ""
                : "",
              phone: user ? (user.phone ? user.phone : "") : "",
              email: user ? (user.email ? user.email : "") : "",
              message: "",
            }}
            onSubmit={handleMessageSubmission}
            validationSchema={validationSchema}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              setFieldTouched,
              touched,
            }) => (
              <View>
                <View style={styles.inputWrap}>
                  <Text style={styles.inputLabel}>
                    {formData.name.label}
                    {` `}
                    <Text style={styles.required}> *</Text>
                  </Text>
                  <TextInput
                    style={styles.formInput}
                    onChangeText={handleChange("name")}
                    onBlur={() => setFieldTouched("name")}
                    value={values.name}
                    placeholder={formData.name.placeholder}
                    editable={
                      user === null || (!user.first_name && !user.last_name)
                    }
                  />
                  <AppSeparator style={styles.separator} />
                  <View style={styles.inputErrorWrap}>
                    {touched.name && errors.name && (
                      <Text style={styles.inputErrorMessage}>
                        {errors.name}
                      </Text>
                    )}
                  </View>
                </View>
                <View style={styles.inputWrap}>
                  <Text style={styles.inputLabel}>{formData.phone.label}</Text>
                  <TextInput
                    style={styles.formInput}
                    onChangeText={handleChange("phone")}
                    onBlur={() => setFieldTouched("phone")}
                    value={values.phone}
                    placeholder={formData.phone.placeholder}
                    editable={user === null || !user.phone}
                    keyboardType="phone-pad"
                  />
                  <AppSeparator style={styles.separator} />
                  <View style={styles.inputErrorWrap}>
                    {touched.phone && errors.phone && (
                      <Text style={styles.inputErrorMessage}>
                        {errors.phone}
                      </Text>
                    )}
                  </View>
                </View>
                <View style={styles.inputWrap}>
                  <Text style={styles.inputLabel}>
                    {formData.email.label}
                    {` `}
                    <Text style={styles.required}> *</Text>
                  </Text>
                  <TextInput
                    style={styles.formInput}
                    onChangeText={handleChange("email")}
                    onBlur={() => setFieldTouched("email")}
                    value={values.email}
                    placeholder={formData.email.placeholder}
                    editable={user === null || !user.email}
                    keyboardType="email-address"
                  />
                  <AppSeparator style={styles.separator} />
                  <View style={styles.inputErrorWrap}>
                    {touched.email && errors.email && (
                      <Text style={styles.inputErrorMessage}>
                        {errors.email}
                      </Text>
                    )}
                  </View>
                </View>
                <View style={styles.inputWrap}>
                  <Text style={styles.inputLabel}>
                    {formData.message.label}
                    {` `}
                    <Text style={styles.required}> *</Text>
                  </Text>
                  <TextInput
                    style={[styles.formInput, { minHeight: 100 }]}
                    onChangeText={handleChange("message")}
                    onBlur={() => setFieldTouched("message")}
                    value={values.message}
                    placeholder={formData.message.placeholder}
                    multiline={true}
                    blurOnSubmit={false}
                  />
                  <AppSeparator style={styles.separator} />
                  <View style={styles.inputErrorWrap}>
                    {touched.message && errors.message && (
                      <Text style={styles.inputErrorMessage}>
                        {errors.message}
                      </Text>
                    )}
                  </View>
                </View>
                <AppButton
                  onPress={handleSubmit}
                  title={sendmessageButtontitle}
                  style={styles.button}
                  textStyle={styles.buttonText}
                  // disabled={Object.keys(errors).length > 0 || !touched.message}
                  // disabled={
                  //   Object.keys(errors).length > 0 ||
                  //   Object.keys(touched).length < 1 ||
                  //   !values.message
                  // }
                  disabled={
                    user
                      ? Object.keys(errors).length > 0 ||
                        !values.message ||
                        !values.name ||
                        !values.email
                      : Object.keys(errors).length > 0 ||
                        Object.keys(touched).length < 1
                  }
                  loading={loading}
                />
                <View style={styles.formErrorWrap}>
                  {formErrorMessage && (
                    <Text style={styles.formErrorMessage}>
                      {formErrorMessage}
                    </Text>
                  )}
                </View>
              </View>
            )}
          </Formik>
        </View>
      </ImageBackground>
      <FlashNotification
        falshShow={flashNotification}
        flashMessage={flashNotificationMessage}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  button: {
    width: "100%",
    paddingVertical: 10,
    borderRadius: 3,
    marginTop: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "500",
  },
  container: {
    backgroundColor: COLORS.white,
    paddingHorizontal: "3%",
    paddingTop: 20,
    width: "100%",
    paddingBottom: ios ? 50 : 0,
    flex: 1,
  },
  scrollContainer: {
    backgroundColor: COLORS.white,
    flex: 1,
    // paddingVertical: 15,
  },
  formErrorMessage: {
    fontSize: 15,
    color: COLORS.red,
    fontWeight: "bold",
  },
  formErrorWrap: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  formInput: {
    color: COLORS.text_dark,
    fontSize: 16,
    minHeight: 32,
  },
  formWrap: {
    marginTop: 20,
  },
  inputErrorWrap: {
    minHeight: 20,
  },
  inputErrorMessage: {
    fontSize: 12,
    color: COLORS.red,
  },
  inputLabel: {
    fontSize: 14,
    color: COLORS.text_gray,
  },

  pageTitle: {
    fontSize: 20,
    color: COLORS.text_dark,
  },
  required: {
    color: COLORS.red,
  },
  separator: {
    width: "100%",
    backgroundColor: COLORS.gray,
  },
});

export default ContactUsScreen;
