/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TouchableWithoutFeedback,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import AppSeparator from "../components/AppSeparator";
import { COLORS } from "../variables/color";
import { FontAwesome } from "@expo/vector-icons";
import AppButton from "../components/AppButton";
import { Formik } from "formik";
import { useStateValue } from "../StateProvider";
import * as Yup from "yup";
import api, {
  setAuthToken,
  setMultipartHeader,
  removeAuthToken,
  removeMultipartHeader,
} from "../api/client";
import AppTextButton from "../components/AppTextButton";
import FlashNotification from "../components/FlashNotification";
import authStorage from "../app/auth/authStorage";

const screenTitle = "Personal Detail";
const changePhotoButtonTitle = "Change Photo";
const updateDetailsButtonTitle = "Update Detail";
const passwordToggleText = "Change Password";
const passwordNotSameMessage = "Password didn't match";
const fieldLabels = {
  firstName: "First Name",
  lastName: "Last Name",
  changePassword: "Change Password",
  newPassword: "New Password",
  confirmPassword: "Confirm Password",
  phone: "Phone Number",
  whatsapp: "Whatsapp Number",
  website: "Website",
  zipcode: "Zip Code",
  address: "Address",
  locations: "Locations",
};
const successText = "Successfully updated";
const errorText = "Error! Please try again";

const validationSchema = Yup.object().shape({
  first_name: Yup.string().required().min(1).label(fieldLabels.firstName),
  last_name: Yup.string().required().min(1).label(fieldLabels.lastName),
  pass1: Yup.string().min(6).label("Password"),
  phone: Yup.string().required().min(5).label(fieldLabels.phone),
  whatsapp_number: Yup.string().min(5).label(fieldLabels.whatsapp),
  website: Yup.string()
    .matches(
      /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
      "Enter correct url!"
    )
    .label(fieldLabels.website),
  zipcode: Yup.string().required().min(4).label(fieldLabels.zipcode),
  address: Yup.string().required().label(fieldLabels.address),
});

const ios = Platform.OS === "ios";

const EditPersonalDetailScreen = ({ route, navigation }) => {
  const [{ auth_token, user }, dispatch] = useStateValue();
  const [{ data }] = useState(route.params);
  const [passwordToggle, setPasswordToggle] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [flashNotification, setFlashNotification] = useState(false);
  const [flashNotificationMessage, setFlashNotificationMessage] = useState();
  const [secureUserData, setSecureUserData] = useState(null);

  // get secureUser
  useEffect(() => {
    getSecureUserData();
  }, []);

  const getSecureUserData = async () => {
    const storedUserData = await authStorage.getUser();
    if (!storedUserData) return;

    setSecureUserData(JSON.parse(storedUserData));
  };

  const requestGalleryParmission = async () => {
    if (Platform.OS !== "web") {
      const {
        status,
      } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("You need to enable permission to access image library ");
      } else handleSelectGalleryImage();
    }
  };
  const requestCameraParmission = async () => {
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        alert("You need to enable permission to access your camera");
      } else handleSelectCameraImage();
    }
  };

  const handleSelectGalleryImage = async () => {
    if (Platform.OS === "android") {
      setModalVisible((prevModalVisible) => false);
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      // aspect: [4, 3],
      quality: 1,
    });
    if (Platform.OS === "ios" && !result.cancelled) {
      setModalVisible((prevModalVisible) => false);
    }
    if (!result.cancelled) {
      setImageLoading((imageLoading) => true);
      setAuthToken(auth_token);
      setMultipartHeader();
      let localUri = result.uri;
      let filename = localUri.split("/").pop();
      let match = /\.(\w+)$/.exec(filename);
      let type = match ? `image/${match[1]}` : `image`;
      const image = {
        uri: localUri,
        name: filename,
        type,
      };
      // Upload the image using the fetch and FormData APIs
      let formData = new FormData();
      // Assume "photo" is the name of the form field the server expects
      formData.append("image", image);
      updateImage(formData);
    }
  };

  const handleSelectCameraImage = async () => {
    if (Platform.OS === "android") {
      setModalVisible((prevModalVisible) => false);
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      // aspect: [4, 3],
      quality: 1,
    });
    if (Platform.OS === "ios" && !result.cancelled) {
      setModalVisible((prevModalVisible) => false);
    }

    if (!result.cancelled) {
      setImageLoading((imageLoading) => true);
      setAuthToken(auth_token);
      setMultipartHeader();
      let localUri = result.uri;
      let filename = localUri.split("/").pop();
      let match = /\.(\w+)$/.exec(filename);
      let type = match ? `image/${match[1]}` : `image`;
      const image = {
        uri: localUri,
        name: filename,
        type,
      };
      // Upload the image using the fetch and FormData APIs
      let formData = new FormData();
      // Assume "photo" is the name of the form field the server expects
      formData.append("image", image);
      updateImage(formData);
    }
    // try {

    // } catch (error) {
    //   setImageLoading((imageLoading) => false);
    //   handleError(`Error : ${error}`);
    // }
  };

  const updateImage = (formData) => {
    api.post("my/profile-image", formData).then((res) => {
      if (res.ok) {
        const userWithUpdatedImage = {
          ...user,
          ["pp_thumb_url"]: res.data.src,
        };
        dispatch({
          type: "SET_AUTH_DATA",
          data: { user: userWithUpdatedImage },
        });
        removeAuthToken();
        removeMultipartHeader();
        setImageLoading((imageLoading) => false);
        handleSuccess(successText);
        const tempuser = { ...user, ["pp_thumb_url"]: res.data.src };
        authStorage.storeUser(
          JSON.stringify({ ...secureUserData, ["user"]: tempuser })
        );
      } else {
        removeAuthToken();
        removeMultipartHeader();
        setImageLoading((imageLoading) => false);
        handleError(
          res.data.error_message ? res.data.error_message : errorText
        );
      }
    });
  };

  const handleUpdate = (values) => {
    if (loading) false;
    setLoading((loading) => true);

    const update = { ...values, ["change_password"]: passwordToggle };

    setAuthToken(auth_token);
    api.post("my", values).then((res) => {
      if (res.ok) {
        dispatch({
          type: "SET_AUTH_DATA",
          data: {
            user: res.data,
          },
        });

        setLoading((loading) => false);
        handleSuccess(successText);

        authStorage.storeUser(
          JSON.stringify({ ...secureUserData, ["user"]: res.data })
        );
      } else {
        setLoading((loading) => false);
        handleError(
          res.data.error_message ? res.data.error_message : errorText
        );
      }
    });

    removeAuthToken();
  };
  const handleButtonDisable = (touched, errors, values) => {
    if (
      !Object.keys(touched).length ||
      !!Object.keys(errors).length ||
      values.pass1 !== values.pass2 ||
      (passwordToggle && !values.pass1)
    ) {
      return true;
    } else {
      return false;
    }
  };

  const handleSuccess = (message) => {
    setFlashNotificationMessage(message);
    setTimeout(() => {
      setFlashNotification((prevFlashNotification) => true);
    }, 10);
    setTimeout(() => {
      setFlashNotification((prevFlashNotification) => false);
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
    }, 1200);
  };
  return ios ? (
    <KeyboardAvoidingView
      behavior="padding"
      style={{ flex: 1 }}
      keyboardVerticalOffset={80}
    >
      <ScrollView>
        <View style={styles.container}>
          <View style={styles.mainWrap}>
            <View style={styles.titleWrap}>
              <Text style={styles.title}>{screenTitle}</Text>
            </View>
            <AppSeparator style={styles.separator} />
            <View style={styles.imagePicker}>
              {imageLoading ? (
                <View style={styles.imageWrap}>
                  <View style={styles.loading}>
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  </View>
                </View>
              ) : (
                <View style={styles.imageWrap}>
                  {!user.pp_thumb_url ? (
                    <FontAwesome
                      name="camera"
                      size={20}
                      color={COLORS.text_gray}
                    />
                  ) : (
                    <Image
                      source={{ uri: user.pp_thumb_url }}
                      style={styles.image}
                    />
                  )}
                </View>
              )}
              <View style={styles.imagePickerButtonWrap}>
                <AppButton
                  title={changePhotoButtonTitle}
                  style={styles.imagePickerButton}
                  // onPress={handleSelectImage}
                  onPress={() =>
                    setModalVisible((modalVisible) => !modalVisible)
                  }
                  disabled={imageLoading}
                />
              </View>
            </View>
            <Formik
              initialValues={{
                first_name: data.first_name || "",
                last_name: data.last_name || "",
                pass1: "",
                pass2: "",
                phone: data.phone || "",
                whatsapp_number: data.whatsapp_number || "",
                website: data.website || "",
                zipcode: data.zipcode || "",
                address: data.address || "",
              }}
              validationSchema={validationSchema}
              onSubmit={handleUpdate}
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
                <View style={styles.formWrap}>
                  <View style={styles.inputRow}>
                    <View style={styles.rowInputWrap}>
                      <Text style={styles.label}>
                        {fieldLabels.firstName}
                        <Text style={styles.required}> *</Text>
                      </Text>
                      <TextInput
                        style={styles.formInput}
                        onChangeText={handleChange("first_name")}
                        onBlur={handleBlur("first_name")}
                        value={values.first_name}
                        placeholder={fieldLabels.firstName}
                        defaultValue={data.first_name || ""}
                      />
                      <AppSeparator style={styles.formSeparator} />
                      <View style={styles.inputErrorWrap}>
                        {errors.first_name && touched.first_name && (
                          <Text style={styles.inputErrorMessage}>
                            {errors.first_name}
                          </Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.rowInputWrap}>
                      <Text style={styles.label}>
                        {fieldLabels.lastName}
                        <Text style={styles.required}> *</Text>
                      </Text>
                      <TextInput
                        style={styles.formInput}
                        onChangeText={handleChange("last_name")}
                        onBlur={handleBlur("last_name")}
                        value={values.last_name}
                        placeholder={fieldLabels.lastName}
                        defaultValue={data.last_name || ""}
                      />
                      <AppSeparator style={styles.formSeparator} />
                      <View style={styles.inputErrorWrap}>
                        {errors.last_name && touched.last_name && (
                          <Text style={styles.inputErrorMessage}>
                            {errors.last_name}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>

                  <View style={styles.inputWrap}>
                    <Text style={styles.label}>
                      {fieldLabels.phone}
                      <Text style={styles.required}> *</Text>
                    </Text>
                    <TextInput
                      style={styles.formInput}
                      onChangeText={handleChange("phone")}
                      onBlur={handleBlur("phone")}
                      value={values.phone}
                      placeholder={fieldLabels.phone}
                      defaultValue={data.phone || ""}
                    />
                    <AppSeparator style={styles.formSeparator} />
                    <View style={styles.inputErrorWrap}>
                      {errors.phone && touched.phone && (
                        <Text style={styles.inputErrorMessage}>
                          {errors.phone}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.inputWrap}>
                    <Text style={styles.label}>{fieldLabels.whatsapp}</Text>
                    <TextInput
                      style={styles.formInput}
                      onChangeText={handleChange("whatsapp_number")}
                      onBlur={handleBlur("whatsapp_number")}
                      value={values.whatsapp_number}
                      placeholder={fieldLabels.whatsapp_number}
                      defaultValue={data.whatsapp_number || ""}
                    />
                    <AppSeparator style={styles.formSeparator} />
                    <View style={styles.inputErrorWrap}>
                      {errors.whatsapp_number && touched.whatsapp_number && (
                        <Text style={styles.inputErrorMessage}>
                          {errors.whatsapp_number}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.inputWrap}>
                    <Text style={styles.label}>{fieldLabels.website}</Text>
                    <TextInput
                      style={styles.formInput}
                      onChangeText={handleChange("website")}
                      onBlur={handleBlur("website")}
                      value={values.website}
                      placeholder={fieldLabels.website}
                      defaultValue={data.website || ""}
                    />
                    <AppSeparator style={styles.formSeparator} />
                    <View style={styles.inputErrorWrap}>
                      {errors.website && touched.website && (
                        <Text style={styles.inputErrorMessage}>
                          {errors.website}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.inputWrap}>
                    <Text style={styles.label}>
                      {fieldLabels.zipcode}
                      <Text style={styles.required}> *</Text>
                    </Text>
                    <TextInput
                      style={styles.formInput}
                      onChangeText={handleChange("zipcode")}
                      onBlur={handleBlur("zipcode")}
                      value={values.zipcode}
                      placeholder={fieldLabels.zipcode}
                      defaultValue={data.zipcode || ""}
                    />
                    <AppSeparator style={styles.formSeparator} />
                    <View style={styles.inputErrorWrap}>
                      {errors.zipcode && touched.zipcode && (
                        <Text style={styles.inputErrorMessage}>
                          {errors.zipcode}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.inputWrap}>
                    <Text style={styles.label}>
                      {fieldLabels.address}
                      <Text style={styles.required}> *</Text>
                    </Text>
                    <TextInput
                      style={styles.formInput}
                      onChangeText={handleChange("address")}
                      onBlur={handleBlur("address")}
                      value={values.address}
                      placeholder={fieldLabels.address}
                      defaultValue={data.address || ""}
                    />
                    <AppSeparator style={styles.formSeparator} />
                    <View style={styles.inputErrorWrap}>
                      {errors.address && touched.address && (
                        <Text style={styles.inputErrorMessage}>
                          {errors.address}
                        </Text>
                      )}
                    </View>
                  </View>
                  {passwordToggle && (
                    <>
                      <View style={styles.inputWrap}>
                        <Text style={styles.label}>
                          {fieldLabels.newPassword}
                        </Text>
                        <TextInput
                          style={styles.formInput}
                          onChangeText={handleChange("pass1")}
                          onBlur={handleBlur("pass1")}
                          value={values.pass1}
                          placeholder="Enter new Password"
                          defaultValue={data.pass1}
                          secureTextEntry
                        />
                        <AppSeparator style={styles.formSeparator} />
                        <View style={styles.inputErrorWrap}>
                          {errors.pass1 && touched.pass1 && (
                            <Text style={styles.inputErrorMessage}>
                              {errors.pass1}
                            </Text>
                          )}
                        </View>
                      </View>
                      <View style={styles.inputWrap}>
                        <Text style={styles.label}>
                          {fieldLabels.confirmPassword}
                        </Text>
                        <TextInput
                          style={styles.formInput}
                          onChangeText={handleChange("pass2")}
                          onBlur={() => setFieldTouched("pass2")}
                          value={values.pass2}
                          placeholder="Re-enter Password"
                          defaultValue={data.pass2}
                          secureTextEntry
                        />
                        <AppSeparator style={styles.formSeparator} />
                        <View style={styles.inputErrorWrap}>
                          {touched.pass2 && values.pass1 !== values.pass2 && (
                            <Text style={styles.inputErrorMessage}>
                              {passwordNotSameMessage}
                            </Text>
                          )}
                        </View>
                      </View>
                    </>
                  )}
                  <View style={styles.passwordToggleWrap}>
                    <TouchableOpacity
                      style={styles.passwordToggle}
                      onPress={() => setPasswordToggle(!passwordToggle)}
                    >
                      <MaterialCommunityIcons
                        name={
                          passwordToggle
                            ? "checkbox-marked"
                            : "checkbox-blank-outline"
                        }
                        size={24}
                        color={COLORS.primary}
                      />
                      <Text style={styles.passwordToggleText}>
                        {passwordToggleText}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <AppButton
                    onPress={handleSubmit}
                    title={updateDetailsButtonTitle}
                    style={styles.updateButton}
                    textStyle={styles.loginBtnTxt}
                    loading={loading}
                    disabled={handleButtonDisable(touched, errors, values)}
                  />
                </View>
              )}
            </Formik>
            <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
            >
              <TouchableWithoutFeedback
                onPress={() => setModalVisible((modalVisible) => !modalVisible)}
              >
                <View style={styles.modalOverlay} />
              </TouchableWithoutFeedback>
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <View style={styles.modalTitleWrap}>
                    <Text style={styles.modalTitle}>Add Photo</Text>
                  </View>
                  <View style={styles.contentWrap}>
                    <TouchableOpacity
                      style={styles.libraryWrap}
                      onPress={() => requestCameraParmission()}
                    >
                      <FontAwesome
                        name="camera-retro"
                        size={40}
                        color={COLORS.primary}
                      />
                      <Text style={styles.libraryText}>Take Photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.libraryWrap}
                      onPress={() => requestGalleryParmission()}
                    >
                      <Ionicons
                        name="md-images"
                        size={40}
                        color={COLORS.primary}
                      />
                      <Text style={styles.libraryText}>From Gallery</Text>
                    </TouchableOpacity>
                  </View>
                  <AppTextButton
                    style={styles.cancelButton}
                    title="Cancel"
                    onPress={() =>
                      setModalVisible((modalVisible) => !modalVisible)
                    }
                  />
                </View>
              </View>
            </Modal>
          </View>
        </View>
      </ScrollView>
      <FlashNotification
        falshShow={flashNotification}
        flashMessage={flashNotificationMessage}
      />
    </KeyboardAvoidingView>
  ) : (
    <>
      <ScrollView>
        <View style={styles.container}>
          <View style={styles.mainWrap}>
            <View style={styles.titleWrap}>
              <Text style={styles.title}>{screenTitle}</Text>
            </View>
            <AppSeparator style={styles.separator} />
            <View style={styles.imagePicker}>
              {imageLoading ? (
                <View style={styles.imageWrap}>
                  <View style={styles.loading}>
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  </View>
                </View>
              ) : (
                <View style={styles.imageWrap}>
                  {!user.pp_thumb_url ? (
                    <FontAwesome
                      name="camera"
                      size={20}
                      color={COLORS.text_gray}
                    />
                  ) : (
                    <Image
                      source={{ uri: user.pp_thumb_url }}
                      style={styles.image}
                    />
                  )}
                </View>
              )}
              <View style={styles.imagePickerButtonWrap}>
                <AppButton
                  title={changePhotoButtonTitle}
                  style={styles.imagePickerButton}
                  // onPress={handleSelectImage}
                  onPress={() =>
                    setModalVisible((modalVisible) => !modalVisible)
                  }
                  disabled={imageLoading}
                />
              </View>
            </View>
            <Formik
              initialValues={{
                first_name: data.first_name || "",
                last_name: data.last_name || "",
                pass1: "",
                pass2: "",
                phone: data.phone || "",
                whatsapp_number: data.whatsapp_number || "",
                website: data.website || "",
                zipcode: data.zipcode || "",
                address: data.address || "",
              }}
              validationSchema={validationSchema}
              onSubmit={handleUpdate}
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
                <View style={styles.formWrap}>
                  <View style={styles.inputRow}>
                    <View style={styles.rowInputWrap}>
                      <Text style={styles.label}>
                        {fieldLabels.firstName}
                        <Text style={styles.required}> *</Text>
                      </Text>
                      <TextInput
                        style={styles.formInput}
                        onChangeText={handleChange("first_name")}
                        onBlur={handleBlur("first_name")}
                        value={values.first_name}
                        placeholder={fieldLabels.firstName}
                        defaultValue={data.first_name || ""}
                      />
                      <AppSeparator style={styles.formSeparator} />
                      <View style={styles.inputErrorWrap}>
                        {errors.first_name && touched.first_name && (
                          <Text style={styles.inputErrorMessage}>
                            {errors.first_name}
                          </Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.rowInputWrap}>
                      <Text style={styles.label}>
                        {fieldLabels.lastName}
                        <Text style={styles.required}> *</Text>
                      </Text>
                      <TextInput
                        style={styles.formInput}
                        onChangeText={handleChange("last_name")}
                        onBlur={handleBlur("last_name")}
                        value={values.last_name}
                        placeholder={fieldLabels.lastName}
                        defaultValue={data.last_name || ""}
                      />
                      <AppSeparator style={styles.formSeparator} />
                      <View style={styles.inputErrorWrap}>
                        {errors.last_name && touched.last_name && (
                          <Text style={styles.inputErrorMessage}>
                            {errors.last_name}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>

                  <View style={styles.inputWrap}>
                    <Text style={styles.label}>
                      {fieldLabels.phone}
                      <Text style={styles.required}> *</Text>
                    </Text>
                    <TextInput
                      style={styles.formInput}
                      onChangeText={handleChange("phone")}
                      onBlur={handleBlur("phone")}
                      value={values.phone}
                      placeholder={fieldLabels.phone}
                      defaultValue={data.phone || ""}
                    />
                    <AppSeparator style={styles.formSeparator} />
                    <View style={styles.inputErrorWrap}>
                      {errors.phone && touched.phone && (
                        <Text style={styles.inputErrorMessage}>
                          {errors.phone}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.inputWrap}>
                    <Text style={styles.label}>{fieldLabels.whatsapp}</Text>
                    <TextInput
                      style={styles.formInput}
                      onChangeText={handleChange("whatsapp_number")}
                      onBlur={handleBlur("whatsapp_number")}
                      value={values.whatsapp_number}
                      placeholder={fieldLabels.whatsapp_number}
                      defaultValue={data.whatsapp_number || ""}
                    />
                    <AppSeparator style={styles.formSeparator} />
                    <View style={styles.inputErrorWrap}>
                      {errors.whatsapp_number && touched.whatsapp_number && (
                        <Text style={styles.inputErrorMessage}>
                          {errors.whatsapp_number}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.inputWrap}>
                    <Text style={styles.label}>{fieldLabels.website}</Text>
                    <TextInput
                      style={styles.formInput}
                      onChangeText={handleChange("website")}
                      onBlur={handleBlur("website")}
                      value={values.website}
                      placeholder={fieldLabels.website}
                      defaultValue={data.website || ""}
                    />
                    <AppSeparator style={styles.formSeparator} />
                    <View style={styles.inputErrorWrap}>
                      {errors.website && touched.website && (
                        <Text style={styles.inputErrorMessage}>
                          {errors.website}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.inputWrap}>
                    <Text style={styles.label}>
                      {fieldLabels.zipcode}
                      <Text style={styles.required}> *</Text>
                    </Text>
                    <TextInput
                      style={styles.formInput}
                      onChangeText={handleChange("zipcode")}
                      onBlur={handleBlur("zipcode")}
                      value={values.zipcode}
                      placeholder={fieldLabels.zipcode}
                      defaultValue={data.zipcode || ""}
                    />
                    <AppSeparator style={styles.formSeparator} />
                    <View style={styles.inputErrorWrap}>
                      {errors.zipcode && touched.zipcode && (
                        <Text style={styles.inputErrorMessage}>
                          {errors.zipcode}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.inputWrap}>
                    <Text style={styles.label}>
                      {fieldLabels.address}
                      <Text style={styles.required}> *</Text>
                    </Text>
                    <TextInput
                      style={styles.formInput}
                      onChangeText={handleChange("address")}
                      onBlur={handleBlur("address")}
                      value={values.address}
                      placeholder={fieldLabels.address}
                      defaultValue={data.address || ""}
                    />
                    <AppSeparator style={styles.formSeparator} />
                    <View style={styles.inputErrorWrap}>
                      {errors.address && touched.address && (
                        <Text style={styles.inputErrorMessage}>
                          {errors.address}
                        </Text>
                      )}
                    </View>
                  </View>
                  {passwordToggle && (
                    <>
                      <View style={styles.inputWrap}>
                        <Text style={styles.label}>
                          {fieldLabels.newPassword}
                        </Text>
                        <TextInput
                          style={styles.formInput}
                          onChangeText={handleChange("pass1")}
                          onBlur={handleBlur("pass1")}
                          value={values.pass1}
                          placeholder="Enter new Password"
                          defaultValue={data.pass1}
                          secureTextEntry
                        />
                        <AppSeparator style={styles.formSeparator} />
                        <View style={styles.inputErrorWrap}>
                          {errors.pass1 && touched.pass1 && (
                            <Text style={styles.inputErrorMessage}>
                              {errors.pass1}
                            </Text>
                          )}
                        </View>
                      </View>
                      <View style={styles.inputWrap}>
                        <Text style={styles.label}>
                          {fieldLabels.confirmPassword}
                        </Text>
                        <TextInput
                          style={styles.formInput}
                          onChangeText={handleChange("pass2")}
                          onBlur={() => setFieldTouched("pass2")}
                          value={values.pass2}
                          placeholder="Re-enter Password"
                          defaultValue={data.pass2}
                          secureTextEntry
                        />
                        <AppSeparator style={styles.formSeparator} />
                        <View style={styles.inputErrorWrap}>
                          {touched.pass2 && values.pass1 !== values.pass2 && (
                            <Text style={styles.inputErrorMessage}>
                              {passwordNotSameMessage}
                            </Text>
                          )}
                        </View>
                      </View>
                    </>
                  )}
                  <View style={styles.passwordToggleWrap}>
                    <TouchableOpacity
                      style={styles.passwordToggle}
                      onPress={() => setPasswordToggle(!passwordToggle)}
                    >
                      <MaterialCommunityIcons
                        name={
                          passwordToggle
                            ? "checkbox-marked"
                            : "checkbox-blank-outline"
                        }
                        size={24}
                        color={COLORS.primary}
                      />
                      <Text style={styles.passwordToggleText}>
                        {passwordToggleText}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <AppButton
                    onPress={handleSubmit}
                    title={updateDetailsButtonTitle}
                    style={styles.updateButton}
                    textStyle={styles.loginBtnTxt}
                    loading={loading}
                    disabled={handleButtonDisable(touched, errors, values)}
                  />
                </View>
              )}
            </Formik>
            <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
            >
              <TouchableWithoutFeedback
                onPress={() => setModalVisible((modalVisible) => !modalVisible)}
              >
                <View style={styles.modalOverlay} />
              </TouchableWithoutFeedback>
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <View style={styles.modalTitleWrap}>
                    <Text style={styles.modalTitle}>Add Photo</Text>
                  </View>
                  <View style={styles.contentWrap}>
                    <TouchableOpacity
                      style={styles.libraryWrap}
                      onPress={() => requestCameraParmission()}
                    >
                      <FontAwesome
                        name="camera-retro"
                        size={40}
                        color={COLORS.primary}
                      />
                      <Text style={styles.libraryText}>Take Photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.libraryWrap}
                      onPress={() => requestGalleryParmission()}
                    >
                      <Ionicons
                        name="md-images"
                        size={40}
                        color={COLORS.primary}
                      />
                      <Text style={styles.libraryText}>From Gallery</Text>
                    </TouchableOpacity>
                  </View>
                  <AppTextButton
                    style={styles.cancelButton}
                    title="Cancel"
                    onPress={() =>
                      setModalVisible((modalVisible) => !modalVisible)
                    }
                  />
                </View>
              </View>
            </Modal>
          </View>
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
  cancelButton: {
    marginTop: 20,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: COLORS.bg_dark,
    flex: 1,
    paddingTop: 15,
    paddingBottom: ios ? 50 : 15,
  },
  contentWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputErrorMessage: {
    color: COLORS.red,
    fontSize: 12,
  },
  formInput: {
    fontSize: 16,
    color: COLORS.text_dark,
    minHeight: 32,
  },
  formSeparator: {
    width: "100%",
    color: COLORS.gray,
    marginTop: 0,
  },
  formWrap: {
    paddingHorizontal: "3%",
  },
  image: {
    height: 60,
    width: 60,
    resizeMode: "cover",
  },
  imagePicker: {
    flexDirection: "row",
    paddingHorizontal: "3%",
    marginVertical: 10,
    alignItems: "center",
  },
  imagePickerButton: {
    paddingVertical: 10,
    borderRadius: 3,
  },
  imagePickerButtonWrap: {
    flex: 1,
    alignItems: "flex-end",
  },
  imageWrap: {
    height: 60,
    width: 60,
    borderRadius: 30,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.bg_dark,
    marginRight: 10,
  },
  inputErrorWrap: {
    minHeight: 17,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  inputWrap: {
    marginBottom: 5,
  },
  label: {
    fontSize: 14,
    color: COLORS.text_gray,
  },
  libraryText: {
    fontSize: 16,
    color: COLORS.text_gray,
    marginVertical: 10,
  },
  libraryWrap: {
    alignItems: "center",
    marginHorizontal: 15,
  },
  loading: {
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
  mainWrap: {
    backgroundColor: COLORS.white,
    paddingVertical: 10,
    elevation: 2,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text_gray,
    marginBottom: 25,
  },
  modalView: {
    // margin: 20,
    backgroundColor: "white",
    borderRadius: 5,
    paddingVertical: 30,
    paddingHorizontal: 15,
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
  passwordToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  passwordToggleText: {
    marginLeft: 5,
  },
  passwordToggleWrap: {
    marginBottom: 10,
  },
  required: {
    color: COLORS.red,
  },
  rowInputWrap: {
    width: "48%",
  },
  separator: {
    width: "100%",
    backgroundColor: COLORS.bg_dark,
  },
  title: {
    fontWeight: "bold",
    color: COLORS.text_gray,
  },
  titleWrap: {
    paddingHorizontal: "3%",
    marginBottom: 10,
  },
  updateButton: {
    width: "100%",
    paddingVertical: 10,
    borderRadius: 3,
    marginVertical: 15,
  },
});

export default EditPersonalDetailScreen;
