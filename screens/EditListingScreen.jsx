/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  Image,
  ImageBackground,
} from "react-native";
import AppSeparator from "../components/AppSeparator";
import { FontAwesome5 } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { COLORS } from "../variables/color";
import { useStateValue } from "../StateProvider";
import AppButton from "../components/AppButton";
import DynamicListPicker from "../components/DynamicListPicker";
import * as Progress from "react-native-progress";
import ImageInputList from "../components/ImageInputList";
import api, {
  setAuthToken,
  setMultipartHeader,
  removeMultipartHeader,
  removeAuthToken,
} from "../api/client";
import DynamicRadioButton from "../components/DynamicRadioButton";
import DynamicCheckbox from "../components/DynamicCheckbox";
import { Formik } from "formik";
import * as Yup from "yup";
import DatePicker from "../components/DatePicker";
import DateRangePicker from "../components/DateRangePicker";
import moment from "moment";
import { getCurrencySymbol, decodeString } from "../helper/helper";
import UploadingIndicator from "../components/UploadingIndicator";
import DoneIndicator from "../components/DoneIndicator";
import ErrorIndicator from "../components/ErrorIndicator";

const title = "Listing Edit Form";

const listingTitleLabel = "Title";
const priceTypeLabel = "Price Type";
const priceLabel = "Price";
const listingDescriptionLabel = "Description";
const contactTitle = "Contact Details";

const zipCodeLabel = "Zip Code";
const addressLabel = "Address";
const phoneLabel = "Phone";
const whatsappLabel = "Whatsapp";
const whatsappNote = "Whatsapp number with your country code. Eg.+1xxxxxxxxxx";
const emailLabel = "Email";
const websiteLabel = "Website";
const nameLabel = "Name";
const imageInputLabel = "Images";
const uploadErrorNoticeText = "Error uploading! Please try again.";
const uploadingNoticeText =
  "This may take a while depending on the speed of your internet connection...";
const dragSortText = "Long press to drag and sort images.";
const loadingText = "Getting listing data";
const formTitle = "Product Information";

const validationSchema = Yup.object().shape({
  name: Yup.string().required().label(nameLabel),
  zipcode: Yup.string().min(3).label(zipCodeLabel),
  website: Yup.string()
    .matches(
      /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
      "Enter correct url!"
    )
    .label(websiteLabel),
  address: Yup.string().label(websiteLabel),
  email: Yup.string().required().email().label(emailLabel),
  phone: Yup.string().required().min(5).label(phoneLabel),
  whatsapp_number: Yup.string().min(5).label(whatsappLabel),
  title: Yup.string().required().label(listingTitleLabel),
});

const { width: screenWidth } = Dimensions.get("screen");

const ios = Platform.OS === "ios";
const EditListingScreen = ({ route, navigation }) => {
  const [{ auth_token, user, config }] = useStateValue();
  const [loading, setLoading] = useState(true);
  const [listingData, setListingData] = useState();
  const [imageUris, setImageUris] = useState([]);
  const [imageObjects, setImageObjects] = useState([]);
  const [deletedImageIds, setDeletedImageIds] = useState([]);
  const [sortedImages, setSortedImages] = useState([]);
  const [listingCommonData, setListingCommonData] = useState({});
  const [listingCustomData, setListingCustomData] = useState({});
  const [priceTypePickerVisivle, setPriceTypePickerVisivle] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // const [responseMessage, setResponseMessage] = useState({
  //   success: "Successfully updated",
  //   error: "Error updating. Please try again...",
  // });
  const [customRequiredFields, setCustomRequiredFields] = useState([]);
  const [commonRequiredFields, setCommonRequiredFields] = useState([
    "price_type",
  ]);
  const [touchedFields, setTouchedFields] = useState([]);
  const [customErrorFields, setCustomErrorFields] = useState([]);
  const [commonErrorFields, setCommonErrorFields] = useState([]);
  const [existingImageObjects, setExistingImageObjects] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [success, setSuccess] = useState();
  const [error, setError] = useState();
  const [hasImage, setHasImage] = useState(false);

  //get initial form data call
  useEffect(() => {
    setAuthToken(auth_token);
    api
      .get("/listing/form", { listing_id: route.params.item.listing_id })
      .then((res) => {
        if (res.ok) {
          setListingData((listingData) => res.data);
          if (res.data.custom_fields.length) {
            const required = res.data.custom_fields.filter(
              (field) => field.required
            );
            setCustomRequiredFields(required);
          }
          if (res.data.listing.images.length) {
            const existingImages = res.data.listing.images
              .map((image) => image.sizes.thumbnail.src)
              .reverse();

            const existingImgObjects = res.data.listing.images.map((image) => {
              return {
                uri: image.sizes.thumbnail.src,
                id: image.ID,
              };
            });
            setImageUris(existingImages);
            setExistingImageObjects(existingImgObjects);
          }
          const customData = {};
          res.data.custom_fields.map((_field) => {
            if (_field.type === "date") {
              if (["date", "date_time"].includes(_field.date.type)) {
                customData[_field.meta_key] = _field.value;
              } else {
                customData[_field.meta_key] = [
                  _field.value.start,
                  _field.value.end,
                ];
              }
            } else {
              customData[_field.meta_key] = _field.value;
            }
          });
          setListingCustomData(customData);
          const commonData = {};
          commonData["price_type"] = res.data.listing.price_type;
          commonData["price"] = res.data.listing.price || "";
          setListingCommonData(commonData);
          setLoading(false);
        } else {
          // print error
          setLoading(false);
        }
      });
  }, []);

  // custom field error validation
  useEffect(() => {
    if (loading) return;
    customFieldErrorValidation();
  }, [listingCustomData]);

  // common field error validation
  useEffect(() => {
    if (loading) return;
    commonFieldErrorValidation();
  }, [listingCommonData, commonRequiredFields]);

  const customFieldErrorValidation = () => {
    if (!customRequiredFields.length) return;
    const customErr = customRequiredFields.filter((field) => {
      if (field.type === "checkbox") {
        return listingCustomData[field.meta_key].length < 1;
      } else {
        return !listingCustomData[field.meta_key];
      }
    });
    setCustomErrorFields((prevCustomErrorFields) => customErr);
  };

  const handleAddImage = (uri) => {
    setImageUris([uri, ...imageUris]);
    let localUri = uri;
    let filename = localUri.split("/").pop();
    let match = /\.(\w+)$/.exec(filename);
    let type = match ? `image/${match[1]}` : `image`;
    const image = {
      uri: localUri,
      name: filename,
      type,
    };
    setImageObjects([image, ...imageObjects].reverse());
  };
  const handleRemoveImage = (uri) => {
    setImageUris(imageUris.filter((imageUri) => imageUri !== uri));
    setImageObjects((imageObjects) => [
      ...imageObjects.filter((item) => item.uri !== uri),
    ]);

    const deletedImgId = existingImageObjects.filter(
      (imgObj) => imgObj.uri === uri
    );
    if (deletedImgId.length) {
      setDeletedImageIds((prevDeletedImageIds) => [
        ...prevDeletedImageIds,
        deletedImgId[0].id,
      ]);
    }
  };
  const handleTextData = (key, value) => {
    setListingCustomData((listingCustomData) => {
      return { ...listingCustomData, [key]: value };
    });
  };

  const testLogProgressValue = (value) => {
    setUploadProgress(value.loaded / value.total);
  };
  const handleUpdateListing = (values) => {
    setSubmitting(true);
    setUpdateLoading(true);
    const data = {
      ["custom_fields"]: listingCustomData,
      ...listingCommonData,
      ...values,
      ["category_id"]: listingData.listing.categories[0].term_id,
      ["agree"]: 1,
      ["gallery"]: imageObjects,
      ["listing_id"]: listingData.listing.listing_id,
      ["gallery_delete"]: deletedImageIds,
      ["gallery_sort"]: sortedImages,
    };

    // for (const [key, item] of Object.entries(listingLocation)) {
    //   data.locations.push(item.term_id);
    // }

    setAuthToken(auth_token);
    if (data.gallery.length) {
      setHasImage(true);
      const formData = new FormData();
      Object.keys(data).map((key) => {
        if (key === "custom_fields") {
          Object.keys(data[key]).map((innerKey) => {
            if (Array.isArray(data[key][innerKey])) {
              data[key][innerKey].map((_innerItem) => {
                formData.append(
                  "custom_fields[" + innerKey + "][]",
                  _innerItem
                );
              });
            } else {
              formData.append(
                "custom_fields[" + innerKey + "]",
                data[key][innerKey]
              );
            }
          });
        } else if (Array.isArray(data[key])) {
          // key !== "imageIds" &&
          data[key].length &&
            data[key].map((image) => {
              formData.append(key + "[]", image);
            });
        } else {
          formData.append(key, data[key]);
        }
      });
      setMultipartHeader();

      api
        .post("listing/form", formData, {
          onUploadProgress: (value) => testLogProgressValue(value),
        })
        .then((res) => {
          if (res.ok) {
            removeMultipartHeader();
            removeAuthToken();
            setUpdateLoading(false);
            // flashShow(true);
            setHasImage((prevHasImage) => false);
            setSuccess(true);
            // refresh my ads screen
          } else {
            // flashShow(false);
            // TODO Error handling
            removeMultipartHeader();
            removeAuthToken();
            setUpdateLoading(false);
            setHasImage((prevHasImage) => false);
            setError(true);
          }
        });
    } else {
      delete data.gallery;
      api.post("listing/form", data).then((res) => {
        if (res.ok) {
          removeAuthToken();
          setUpdateLoading(false);
          // flashShow(true);
          setSuccess(true);
          // refresh my ads screen
        } else {
          // TODO Error handling
          removeAuthToken();
          setUpdateLoading(false);
          // flashShow(false);
          setError(true);
        }
      });
    }
  };

  const commonFieldErrorValidation = () => {
    const errorData = commonRequiredFields.filter((item) => {
      if (listingCommonData[item]) {
        return false;
      } else {
        return true;
      }
    });
    setCommonErrorFields(errorData);
  };

  const handleDateTime = (payLoad, field) => {
    setListingCustomData((prevListingCustomData) => {
      return {
        ...prevListingCustomData,
        [field.meta_key]: moment(payLoad).format(field.date.jsFormat),
      };
    });
    setTouchedFields((prevtouchedFields) =>
      Array.from(new Set([...prevtouchedFields, field.meta_key]))
    );
  };

  const handleDateTimeRange = (type, payLoad, field) => {
    if (type === "start") {
      const newRangeStart = [
        moment(payLoad).format(field.date.jsFormat),
        listingCustomData[field.meta_key]
          ? listingCustomData[field.meta_key][1]
            ? listingCustomData[field.meta_key][1]
            : moment(payLoad).format(field.date.jsFormat)
          : moment(payLoad).format(field.date.jsFormat),
      ];
      setListingCustomData((prevListingCustomData) => {
        return { ...prevListingCustomData, [field.meta_key]: newRangeStart };
      });
    } else {
      const newRangeEnd = [
        listingCustomData[field.meta_key]
          ? listingCustomData[field.meta_key][0]
            ? listingCustomData[field.meta_key][0]
            : moment(payLoad).format(field.date.jsFormat)
          : moment(payLoad).format(field.date.jsFormat),
        moment(payLoad).format(field.date.jsFormat),
      ];
      setListingCustomData((prevListingCustomData) => {
        return { ...prevListingCustomData, [field.meta_key]: newRangeEnd };
      });
    }
    setTouchedFields((prevtouchedFields) =>
      Array.from(new Set([...prevtouchedFields, field.meta_key]))
    );
  };

  const handleImageReorder = (data) => {
    setImageUris((prevImageUris) => data);

    const sorted = data.map((uri) => {
      const temp = existingImageObjects.filter((obj) => obj.uri === uri)[0];
      if (temp) {
        return temp.id;
      } else {
        return uri.split("/").pop();
      }
    });
    setSortedImages(sorted.reverse());
  };

  const handleEventOnAnimationDone = () => {
    setSubmitting(false);
    navigation.goBack();
  };

  return (
    <>
      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.text}>{loadingText}</Text>
        </View>
      )}
      {submitting && (
        <View
          style={{ alignItems: "center", justifyContent: "center", flex: 1 }}
        >
          {((!!uploadProgress && !success && !error) ||
            (!uploadProgress && !success && !error)) && (
            <View style={{ height: 150, width: 150 }}>
              <UploadingIndicator />
            </View>
          )}
          {!!success && !error && (
            <View style={{ height: 150, width: 150 }}>
              <DoneIndicator
                visible={true}
                onDone={handleEventOnAnimationDone}
              />
            </View>
          )}
          {!success && !!error && (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                width: screenWidth,
                height: screenWidth,
              }}
            >
              <ErrorIndicator
                visible={true}
                // onDone={handleEventOnAnimationDone}
              />
              <View style={{ position: "absolute", bottom: "30%" }}>
                <Text style={styles.text}>{uploadErrorNoticeText}</Text>
              </View>
            </View>
          )}
          {uploadProgress < 1 && hasImage && !success && !error && (
            // !success &&
            <Progress.Bar
              progress={uploadProgress}
              width={200}
              color={COLORS.primary}
            />
          )}

          {((uploadProgress < 1 && !success && hasImage && !error) ||
            (!success && !hasImage && !error)) && (
            <Text
              style={{
                fontSize: 15,
                color: COLORS.text_gray,
                textAlign: "center",
                marginTop: 25,
              }}
            >
              {uploadingNoticeText}
            </Text>
          )}
          {/* {uploadProgress < 1 && !!hasImage && !error && (
            <View
              style={{
                position: "absolute",
                bottom: 20,
              }}
            >
              <AppButton
                title="Cancel"
                onPress={() => setSubmitLoading((submitLoading) => false)}
              />
            </View>
          )} */}
          {!!error && (
            <View
              style={{
                position: "absolute",
                bottom: 20,
              }}
            >
              <AppButton
                title="Try Again"
                onPress={() => setSubmitting((prevSubmitting) => false)}
              />
            </View>
          )}
        </View>
      )}
      {!loading &&
        !submitting &&
        (ios ? (
          <KeyboardAvoidingView
            behavior="padding"
            style={{ flex: 1 }}
            keyboardVerticalOffset={80}
          >
            <ScrollView>
              <View style={styles.container}>
                <View style={styles.titleWrap}>
                  <Text style={styles.formTitle}>{title}</Text>
                </View>
                <View style={styles.mainWrap}>
                  <View style={styles.formFieldsWrap}>
                    {listingData.config.gallery && (
                      <View style={styles.imageInputWrap}>
                        <View style={styles.imageInputTitleWrap}>
                          <View style={styles.iconWrap}>
                            <Image
                              style={{
                                height: 25,
                                width: 25,
                                resizeMode: "contain",
                              }}
                              source={require("../assets/gallery_icon.png")}
                            />
                          </View>

                          <Text style={styles.imageInputLabel}>
                            {imageInputLabel}
                          </Text>
                        </View>
                        <View style={styles.imageInputNotes}>
                          {listingData.config.gallery.max_image_limit && (
                            <Text
                              style={styles.imageInputNotesText}
                            >{`You can upload up to ${listingData.config.gallery.max_image_limit} images`}</Text>
                          )}
                          {listingData.config.gallery.max_image_limit > 1 && (
                            <Text style={styles.imageInputNotesText}>
                              {dragSortText}
                            </Text>
                          )}
                        </View>
                        <ImageInputList
                          imageUris={imageUris}
                          onAddImage={handleAddImage}
                          onRemoveImage={handleRemoveImage}
                          maxCount={listingData.config.gallery.max_image_limit}
                          reorder={handleImageReorder}
                        />
                      </View>
                    )}

                    <Formik
                      initialValues={{
                        title: listingData.listing.title
                          ? listingData.listing.title
                          : "",

                        description: listingData.listing.description
                          ? listingData.listing.description
                          : "",
                        name: user
                          ? user.first_name || user.last_name
                            ? `${user.first_name} ${user.last_name}`
                            : ""
                          : "",
                        zipcode: listingData.listing.contact.zipcode
                          ? listingData.listing.contact.zipcode
                          : user.zipcode
                          ? user.zipcode
                          : "",
                        address: listingData.listing.contact.address
                          ? listingData.listing.contact.address
                          : user.address
                          ? user.address
                          : "",
                        phone: listingData.listing.contact.phone
                          ? listingData.listing.contact.phone
                          : user.phone
                          ? user.phone
                          : "",
                        whatsapp_number: listingData.listing.contact
                          .whatsapp_number
                          ? listingData.listing.contact.whatsapp_number
                          : user.whatsapp_number
                          ? user.whatsapp_number
                          : "",
                        email: listingData.listing.contact.email
                          ? listingData.listing.contact.email
                          : user.email
                          ? user.email
                          : "",
                        website: listingData.listing.contact.website
                          ? listingData.listing.contact.website
                          : user.website
                          ? user.website
                          : "",
                      }}
                      onSubmit={handleUpdateListing}
                      validationSchema={validationSchema}
                    >
                      {({
                        handleChange,
                        handleBlur,
                        handleSubmit,
                        values,
                        errors,
                        touched,
                        setFieldTouched,
                      }) => (
                        <View>
                          <View style={styles.commonFieldsWrap}>
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                paddingHorizontal: "3%",
                              }}
                            >
                              <View style={styles.iconWrap}>
                                <Image
                                  style={{
                                    height: 25,
                                    width: 25,
                                    resizeMode: "contain",
                                  }}
                                  source={require("../assets/product_info_icon.png")}
                                />
                              </View>
                              <Text style={styles.title}>{formTitle}</Text>
                            </View>
                            <AppSeparator
                              style={{
                                marginVertical: 20,
                                width: "94%",
                                marginHorizontal: "3%",
                              }}
                            />
                            <View style={styles.commonInputWrap}>
                              <Text style={styles.commonInputLabel}>
                                {listingTitleLabel}
                                <Text style={styles.required}> *</Text>
                              </Text>
                              <TextInput
                                style={styles.commonInputField}
                                onChangeText={handleChange("title")}
                                onBlur={() => setFieldTouched("title")}
                                value={values.title}
                              />
                              <View style={styles.inputFieldErrorWrap}>
                                {errors.title && touched.title && (
                                  <Text style={styles.inputFieldErrorMessage}>
                                    {errors.title}
                                  </Text>
                                )}
                              </View>
                            </View>
                            {!listingData.config.hidden_fields.includes(
                              "price_type"
                            ) && (
                              <View style={styles.commonInputWrap}>
                                <Text style={styles.commonInputLabel}>
                                  {priceTypeLabel}
                                  <Text style={styles.required}> *</Text>
                                </Text>
                                <View style={styles.priceTypePickerWrap}>
                                  <TouchableOpacity
                                    style={styles.priceTypePicker}
                                    onPress={() => {
                                      setPriceTypePickerVisivle(
                                        !priceTypePickerVisivle
                                      );
                                      setTouchedFields((prevTouchedFields) =>
                                        Array.from(
                                          new Set([
                                            ...prevTouchedFields,
                                            "price_type",
                                          ])
                                        )
                                      );
                                    }}
                                  >
                                    <Text style={styles.Text}>
                                      {listingCommonData.price_type
                                        ? listingData.config.price_types.filter(
                                            (type) =>
                                              type.id ===
                                              listingCommonData.price_type
                                          )[0].name
                                        : `Select a ${priceTypeLabel}`}
                                    </Text>
                                    <FontAwesome5
                                      name="chevron-down"
                                      size={14}
                                      color={COLORS.text_gray}
                                    />
                                  </TouchableOpacity>
                                  <Modal
                                    animationType="slide"
                                    transparent={true}
                                    visible={priceTypePickerVisivle}
                                  >
                                    <TouchableWithoutFeedback
                                      onPress={() =>
                                        setPriceTypePickerVisivle(false)
                                      }
                                    >
                                      <View style={styles.modalOverlay} />
                                    </TouchableWithoutFeedback>
                                    <View style={styles.centeredView}>
                                      <View style={styles.modalView}>
                                        <Text
                                          style={styles.modalText}
                                        >{`== Select a ${priceTypeLabel} ==`}</Text>
                                        <ScrollView
                                          contentContainerStyle={{
                                            display: "flex",
                                            width: "100%",
                                            alignItems: "flex-start",
                                          }}
                                        >
                                          {listingData.config.price_types.map(
                                            (item) => (
                                              <TouchableOpacity
                                                style={styles.pickerOptions}
                                                key={`${item.id}`}
                                                onPress={() => {
                                                  setPriceTypePickerVisivle(
                                                    false
                                                  );
                                                  setListingCommonData(
                                                    (listingCommonData) => {
                                                      return {
                                                        ...listingCommonData,
                                                        ["price_type"]: item.id,
                                                      };
                                                    }
                                                  );
                                                  if (item.id !== "on_call") {
                                                    setCommonRequiredFields(
                                                      (
                                                        prevCommonRequiredFields
                                                      ) => [
                                                        ...prevCommonRequiredFields,
                                                        "price",
                                                      ]
                                                    );
                                                  } else {
                                                    setCommonRequiredFields(
                                                      (
                                                        prevCommonRequiredFields
                                                      ) =>
                                                        prevCommonRequiredFields.filter(
                                                          (field) =>
                                                            field !== "price"
                                                        )
                                                    );
                                                  }
                                                }}
                                              >
                                                <Text
                                                  style={
                                                    styles.pickerOptionsText
                                                  }
                                                >
                                                  {item.name}
                                                </Text>
                                              </TouchableOpacity>
                                            )
                                          )}
                                        </ScrollView>
                                      </View>
                                    </View>
                                  </Modal>
                                </View>
                                <View style={styles.inputFieldErrorWrap}>
                                  {!listingCommonData.price_type && (
                                    <Text style={styles.inputFieldErrorMessage}>
                                      This field is required
                                    </Text>
                                  )}
                                </View>
                              </View>
                            )}
                            {!listingData.config.hidden_fields.includes(
                              "price"
                            ) &&
                              listingCommonData.price_type !== "on_call" && (
                                <View style={styles.commonInputWrap}>
                                  <Text style={styles.commonInputLabel}>
                                    {`${priceLabel} (${getCurrencySymbol(
                                      config.currency
                                    )})`}
                                    {listingCommonData.price_type !==
                                      "on_call" && (
                                      <Text style={styles.required}> *</Text>
                                    )}
                                  </Text>
                                  <TextInput
                                    style={styles.commonInputField}
                                    onChangeText={(value) => {
                                      setListingCommonData(
                                        (listingCommonData) => {
                                          return {
                                            ...listingCommonData,
                                            ["price"]: value,
                                          };
                                        }
                                      );
                                    }}
                                    onBlur={() => {
                                      setTouchedFields((prevTouchedFields) =>
                                        Array.from(
                                          new Set([
                                            ...prevTouchedFields,
                                            "price",
                                          ])
                                        )
                                      );
                                    }}
                                    value={listingCommonData.price}
                                    keyboardType="decimal-pad"
                                  />
                                  <View style={styles.inputFieldErrorWrap}>
                                    {commonErrorFields.includes("price") && (
                                      <Text
                                        style={styles.inputFieldErrorMessage}
                                      >
                                        Price is required
                                      </Text>
                                    )}
                                  </View>
                                </View>
                              )}
                          </View>
                          {listingData.custom_fields && (
                            <View style={styles.customFieldsWrap}>
                              {listingData.custom_fields.map((field) => (
                                <View
                                  key={field.meta_key}
                                  style={styles.metaField}
                                >
                                  <Text style={styles.label}>
                                    {decodeString(field.label)}
                                    {field.required && (
                                      <Text style={styles.required}> *</Text>
                                    )}
                                  </Text>
                                  {[
                                    "text",
                                    "textarea",
                                    "url",
                                    "number",
                                  ].includes(field.type) && (
                                    <TextInput
                                      style={
                                        field.type === "textarea"
                                          ? styles.metaField_TextArea
                                          : styles.metaField_Text
                                      }
                                      onChangeText={(value) =>
                                        handleTextData(field.meta_key, value)
                                      }
                                      value={
                                        listingCustomData[field.meta_key]
                                          ? listingCustomData[field.meta_key]
                                          : ""
                                      }
                                      textAlignVertical={
                                        field.type === "textarea"
                                          ? "top"
                                          : "auto"
                                      }
                                      multiline={field.type === "textarea"}
                                      keyboardType={
                                        field.type === "number"
                                          ? "decimal-pad"
                                          : "default"
                                      }
                                      contextMenuHidden={
                                        field.type === "number"
                                      }
                                      placeholder={field.placeholder}
                                      onBlur={() =>
                                        setTouchedFields((prevTouchedFields) =>
                                          Array.from(
                                            new Set([
                                              ...prevTouchedFields,
                                              field.meta_key,
                                            ])
                                          )
                                        )
                                      }
                                    />
                                  )}
                                  {field.type === "select" && (
                                    <View style={styles.dynamicPickerWrap}>
                                      <DynamicListPicker
                                        field={field}
                                        onselect={(item) =>
                                          setListingCustomData(
                                            (listingCustomData) => {
                                              return {
                                                ...listingCustomData,
                                                [field.meta_key]: item.id,
                                              };
                                            }
                                          )
                                        }
                                        selected={
                                          field.value ? field.value : undefined
                                        }
                                        handleTouch={() =>
                                          setTouchedFields(
                                            (prevTouchedFields) =>
                                              Array.from(
                                                new Set([
                                                  ...prevTouchedFields,
                                                  field.meta_key,
                                                ])
                                              )
                                          )
                                        }
                                      />
                                    </View>
                                  )}
                                  {field.type === "radio" && (
                                    <View style={styles.dynamicRadioWrap}>
                                      <DynamicRadioButton
                                        field={field}
                                        handleClick={(item) => {
                                          setListingCustomData(
                                            (listingCustomData) => {
                                              return {
                                                ...listingCustomData,
                                                [field.meta_key]: item.id,
                                              };
                                            }
                                          );
                                          setTouchedFields(
                                            (prevTouchedFields) =>
                                              Array.from(
                                                new Set([
                                                  ...prevTouchedFields,
                                                  field.meta_key,
                                                ])
                                              )
                                          );
                                        }}
                                        selected={
                                          listingCustomData[`${field.meta_key}`]
                                        }
                                      />
                                    </View>
                                  )}
                                  {field.type === "checkbox" && (
                                    <View style={styles.dynamicCheckboxWrap}>
                                      <DynamicCheckbox
                                        field={field}
                                        handleClick={(value) => {
                                          setListingCustomData(
                                            (listingCustomData) => {
                                              return {
                                                ...listingCustomData,
                                                [field.meta_key]: value,
                                              };
                                            }
                                          );
                                          setTouchedFields(
                                            (prevTouchedFields) =>
                                              Array.from(
                                                new Set([
                                                  ...prevTouchedFields,
                                                  field.meta_key,
                                                ])
                                              )
                                          );
                                        }}
                                        selected={
                                          field.value.length ? field.value : []
                                        }
                                      />
                                    </View>
                                  )}
                                  {field.type === "date" && (
                                    <View style={styles.dateFieldWrap}>
                                      {["date", "date_time"].includes(
                                        field.date.type
                                      ) && (
                                        <DatePicker
                                          field={field}
                                          onSelect={handleDateTime}
                                          value={
                                            listingCustomData[field.meta_key]
                                              ? listingCustomData[
                                                  field.meta_key
                                                ]
                                              : null
                                          }
                                        />
                                      )}
                                      {[
                                        "date_range",
                                        "date_time_range",
                                      ].includes(field.date.type) && (
                                        <DateRangePicker
                                          field={field}
                                          value={
                                            !!listingCustomData[
                                              field.meta_key
                                            ][0] ||
                                            !!listingCustomData[
                                              field.meta_key
                                            ][1]
                                              ? listingCustomData[
                                                  field.meta_key
                                                ]
                                              : null
                                          }
                                          onSelect={handleDateTimeRange}
                                        />
                                      )}
                                    </View>
                                  )}
                                  <View style={styles.inputFieldErrorWrap}>
                                    {customErrorFields.includes(field) &&
                                      touchedFields.includes(
                                        field.meta_key
                                      ) && (
                                        <Text
                                          style={styles.inputFieldErrorMessage}
                                        >
                                          This field is required
                                        </Text>
                                      )}
                                  </View>
                                </View>
                              ))}
                            </View>
                          )}
                          <View style={styles.commonFieldsWrap}>
                            {!listingData.config.hidden_fields.includes(
                              "description"
                            ) && (
                              <View style={styles.commonInputWrap}>
                                <Text style={styles.commonInputLabel}>
                                  {listingDescriptionLabel}
                                </Text>
                                <TextInput
                                  style={styles.metaField_TextArea}
                                  onChangeText={handleChange("description")}
                                  onBlur={handleBlur("description")}
                                  value={values.description}
                                  textAlignVertical="top"
                                  multiline
                                  placeholder={listingDescriptionLabel}
                                />
                                <View style={styles.inputFieldErrorWrap}>
                                  {errors.description &&
                                    touched.description && (
                                      <Text
                                        style={styles.inputFieldErrorMessage}
                                      >
                                        {errors.price}
                                      </Text>
                                    )}
                                </View>
                              </View>
                            )}
                          </View>
                          <View style={styles.contactSectionWrap}>
                            <View style={styles.contactTitleWrap}>
                              <View style={styles.iconWrap}>
                                <Image
                                  style={{
                                    height: 25,
                                    width: 25,
                                    resizeMode: "contain",
                                  }}
                                  source={require("../assets/my_profile.png")}
                                />
                              </View>
                              <Text style={styles.title}>{contactTitle}</Text>
                            </View>
                            {!listingData.config.hidden_fields.includes(
                              "name"
                            ) && (
                              <View style={styles.commonInputWrap}>
                                <Text style={styles.commonInputLabel}>
                                  {nameLabel}
                                  <Text style={styles.required}> *</Text>
                                </Text>
                                <TextInput
                                  style={styles.commonInputField}
                                  onChangeText={handleChange("name")}
                                  onBlur={handleBlur("name")}
                                  value={values.name}
                                  editable={!values.name}
                                />
                                <View style={styles.inputFieldErrorWrap}>
                                  {errors.name && touched.name && (
                                    <Text style={styles.inputFieldErrorMessage}>
                                      {errors.name}
                                    </Text>
                                  )}
                                </View>
                              </View>
                            )}
                            {!listingData.config.hidden_fields.includes(
                              "zipcode"
                            ) && (
                              <View style={styles.commonInputWrap}>
                                <Text style={styles.commonInputLabel}>
                                  {zipCodeLabel}
                                </Text>
                                <TextInput
                                  style={styles.commonInputField}
                                  onChangeText={handleChange("zipcode")}
                                  onBlur={handleBlur("zipcode")}
                                  value={values.zipcode}
                                />
                                <View style={styles.inputFieldErrorWrap}>
                                  {errors.zipcode && touched.zipcode && (
                                    <Text style={styles.inputFieldErrorMessage}>
                                      {errors.zipcode}
                                    </Text>
                                  )}
                                </View>
                              </View>
                            )}
                            {!listingData.config.hidden_fields.includes(
                              "address"
                            ) && (
                              <View style={styles.commonInputWrap}>
                                <Text style={styles.commonInputLabel}>
                                  {addressLabel}
                                </Text>
                                <TextInput
                                  style={styles.commonInputField}
                                  onChangeText={handleChange("address")}
                                  onBlur={handleBlur("address")}
                                  value={values.address}
                                  placeholder={addressLabel}
                                  multiline
                                />
                                <View style={styles.inputFieldErrorWrap}>
                                  {errors.address && touched.address && (
                                    <Text style={styles.inputFieldErrorMessage}>
                                      {errors.address}
                                    </Text>
                                  )}
                                </View>
                              </View>
                            )}
                            {!listingData.config.hidden_fields.includes(
                              "phone"
                            ) && (
                              <View style={styles.commonInputWrap}>
                                <Text style={styles.commonInputLabel}>
                                  {phoneLabel}
                                  <Text style={styles.required}> *</Text>
                                </Text>
                                <TextInput
                                  style={styles.commonInputField}
                                  onChangeText={handleChange("phone")}
                                  onBlur={handleBlur("phone")}
                                  value={values.phone}
                                />
                                <View style={styles.inputFieldErrorWrap}>
                                  {errors.phone && touched.phone && (
                                    <Text style={styles.inputFieldErrorMessage}>
                                      {errors.phone}
                                    </Text>
                                  )}
                                </View>
                              </View>
                            )}
                            {!listingData.config.hidden_fields.includes(
                              "whatsapp_number"
                            ) && (
                              <View style={styles.commonInputWrap}>
                                <Text style={styles.commonInputLabel}>
                                  {whatsappLabel}
                                </Text>
                                <TextInput
                                  style={styles.commonInputField}
                                  onChangeText={handleChange("whatsapp_number")}
                                  onBlur={handleBlur("whatsapp_number")}
                                  value={values.whatsapp_number}
                                />
                                <Text style={styles.Text}>{whatsappNote}</Text>
                                <View style={styles.inputFieldErrorWrap}>
                                  {errors.whatsapp_number &&
                                    touched.whatsapp_number && (
                                      <Text
                                        style={styles.inputFieldErrorMessage}
                                      >
                                        {errors.whatsapp_number}
                                      </Text>
                                    )}
                                </View>
                              </View>
                            )}
                            {!listingData.config.hidden_fields.includes(
                              "email"
                            ) && (
                              <View style={styles.commonInputWrap}>
                                <Text style={styles.commonInputLabel}>
                                  {emailLabel}
                                  <Text style={styles.required}> *</Text>
                                </Text>
                                <TextInput
                                  style={styles.commonInputField}
                                  onChangeText={handleChange("email")}
                                  onBlur={handleBlur("email")}
                                  value={values.email}
                                  editable={!values.email}
                                />
                                <View style={styles.inputFieldErrorWrap}>
                                  {errors.email && touched.email && (
                                    <Text style={styles.inputFieldErrorMessage}>
                                      {errors.email}
                                    </Text>
                                  )}
                                </View>
                              </View>
                            )}
                            {!listingData.config.hidden_fields.includes(
                              "website"
                            ) && (
                              <View style={styles.commonInputWrap}>
                                <Text style={styles.commonInputLabel}>
                                  {websiteLabel}
                                </Text>
                                <TextInput
                                  style={styles.commonInputField}
                                  onChangeText={handleChange("website")}
                                  onBlur={handleBlur("website")}
                                  value={values.website}
                                />
                                <View style={styles.inputFieldErrorWrap}>
                                  {errors.website && touched.website && (
                                    <Text style={styles.inputFieldErrorMessage}>
                                      {errors.website}
                                    </Text>
                                  )}
                                </View>
                              </View>
                            )}
                          </View>
                          <View style={[styles.noteWrap]}>
                            <Text
                              style={[
                                styles.text,
                                {
                                  color:
                                    Object.keys(errors).length ||
                                    customErrorFields.length ||
                                    commonErrorFields.length
                                      ? COLORS.red
                                      : COLORS.text_gray,
                                },
                              ]}
                            >
                              *** Fields marked with red star are required ***
                            </Text>
                          </View>

                          <View style={{ paddingHorizontal: "3%" }}>
                            <AppButton
                              style={styles.updateButton}
                              title="Update Listing"
                              onPress={handleSubmit}
                              loading={updateLoading}
                              disabled={
                                updateLoading ||
                                Object.keys(errors).length ||
                                customErrorFields.length ||
                                commonErrorFields.length
                              }
                            />
                          </View>
                        </View>
                      )}
                    </Formik>
                  </View>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        ) : (
          <ScrollView>
            <View style={styles.container}>
              <View style={styles.titleWrap}>
                <Text style={styles.formTitle}>{title}</Text>
              </View>
              <View style={styles.mainWrap}>
                <View style={styles.formFieldsWrap}>
                  {listingData.config.gallery && (
                    <View style={styles.imageInputWrap}>
                      <View style={styles.imageInputTitleWrap}>
                        <View style={styles.iconWrap}>
                          <Image
                            style={{
                              height: 25,
                              width: 25,
                              resizeMode: "contain",
                            }}
                            source={require("../assets/gallery_icon.png")}
                          />
                        </View>

                        <Text style={styles.imageInputLabel}>
                          {imageInputLabel}
                        </Text>
                      </View>
                      <View style={styles.imageInputNotes}>
                        {listingData.config.gallery.max_image_limit && (
                          <Text
                            style={styles.imageInputNotesText}
                          >{`You can upload up to ${listingData.config.gallery.max_image_limit} images`}</Text>
                        )}
                        {listingData.config.gallery.max_image_limit > 1 && (
                          <Text style={styles.imageInputNotesText}>
                            {dragSortText}
                          </Text>
                        )}
                      </View>
                      <ImageInputList
                        imageUris={imageUris}
                        onAddImage={handleAddImage}
                        onRemoveImage={handleRemoveImage}
                        maxCount={listingData.config.gallery.max_image_limit}
                        reorder={handleImageReorder}
                      />
                    </View>
                  )}

                  <Formik
                    initialValues={{
                      title: listingData.listing.title
                        ? listingData.listing.title
                        : "",

                      description: listingData.listing.description
                        ? listingData.listing.description
                        : "",
                      name: user
                        ? user.first_name || user.last_name
                          ? `${user.first_name} ${user.last_name}`
                          : ""
                        : "",
                      zipcode: listingData.listing.contact.zipcode
                        ? listingData.listing.contact.zipcode
                        : user.zipcode
                        ? user.zipcode
                        : "",
                      address: listingData.listing.contact.address
                        ? listingData.listing.contact.address
                        : user.address
                        ? user.address
                        : "",
                      phone: listingData.listing.contact.phone
                        ? listingData.listing.contact.phone
                        : user.phone
                        ? user.phone
                        : "",
                      whatsapp_number: listingData.listing.contact
                        .whatsapp_number
                        ? listingData.listing.contact.whatsapp_number
                        : user.whatsapp_number
                        ? user.whatsapp_number
                        : "",
                      email: listingData.listing.contact.email
                        ? listingData.listing.contact.email
                        : user.email
                        ? user.email
                        : "",
                      website: listingData.listing.contact.website
                        ? listingData.listing.contact.website
                        : user.website
                        ? user.website
                        : "",
                    }}
                    onSubmit={handleUpdateListing}
                    validationSchema={validationSchema}
                  >
                    {({
                      handleChange,
                      handleBlur,
                      handleSubmit,
                      values,
                      errors,
                      touched,
                      setFieldTouched,
                    }) => (
                      <View>
                        <View style={styles.commonFieldsWrap}>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              paddingHorizontal: "3%",
                            }}
                          >
                            <View style={styles.iconWrap}>
                              <Image
                                style={{
                                  height: 25,
                                  width: 25,
                                  resizeMode: "contain",
                                }}
                                source={require("../assets/product_info_icon.png")}
                              />
                            </View>
                            <Text style={styles.title}>{formTitle}</Text>
                          </View>
                          <AppSeparator
                            style={{
                              marginVertical: 20,
                              width: "94%",
                              marginHorizontal: "3%",
                            }}
                          />
                          <View style={styles.commonInputWrap}>
                            <Text style={styles.commonInputLabel}>
                              {listingTitleLabel}
                              <Text style={styles.required}> *</Text>
                            </Text>
                            <TextInput
                              style={styles.commonInputField}
                              onChangeText={handleChange("title")}
                              onBlur={() => setFieldTouched("title")}
                              value={values.title}
                            />
                            <View style={styles.inputFieldErrorWrap}>
                              {errors.title && touched.title && (
                                <Text style={styles.inputFieldErrorMessage}>
                                  {errors.title}
                                </Text>
                              )}
                            </View>
                          </View>
                          {!listingData.config.hidden_fields.includes(
                            "price_type"
                          ) && (
                            <View style={styles.commonInputWrap}>
                              <Text style={styles.commonInputLabel}>
                                {priceTypeLabel}
                                <Text style={styles.required}> *</Text>
                              </Text>
                              <View style={styles.priceTypePickerWrap}>
                                <TouchableOpacity
                                  style={styles.priceTypePicker}
                                  onPress={() => {
                                    setPriceTypePickerVisivle(
                                      !priceTypePickerVisivle
                                    );
                                    setTouchedFields((prevTouchedFields) =>
                                      Array.from(
                                        new Set([
                                          ...prevTouchedFields,
                                          "price_type",
                                        ])
                                      )
                                    );
                                  }}
                                >
                                  <Text style={styles.Text}>
                                    {listingCommonData.price_type
                                      ? listingData.config.price_types.filter(
                                          (type) =>
                                            type.id ===
                                            listingCommonData.price_type
                                        )[0].name
                                      : `Select a ${priceTypeLabel}`}
                                  </Text>
                                  <FontAwesome5
                                    name="chevron-down"
                                    size={14}
                                    color={COLORS.text_gray}
                                  />
                                </TouchableOpacity>
                                <Modal
                                  animationType="slide"
                                  transparent={true}
                                  visible={priceTypePickerVisivle}
                                >
                                  <TouchableWithoutFeedback
                                    onPress={() =>
                                      setPriceTypePickerVisivle(false)
                                    }
                                  >
                                    <View style={styles.modalOverlay} />
                                  </TouchableWithoutFeedback>
                                  <View style={styles.centeredView}>
                                    <View style={styles.modalView}>
                                      <Text
                                        style={styles.modalText}
                                      >{`== Select a ${priceTypeLabel} ==`}</Text>
                                      <ScrollView
                                        contentContainerStyle={{
                                          display: "flex",
                                          width: "100%",
                                          alignItems: "flex-start",
                                        }}
                                      >
                                        {listingData.config.price_types.map(
                                          (item) => (
                                            <TouchableOpacity
                                              style={styles.pickerOptions}
                                              key={`${item.id}`}
                                              onPress={() => {
                                                setPriceTypePickerVisivle(
                                                  false
                                                );
                                                setListingCommonData(
                                                  (listingCommonData) => {
                                                    return {
                                                      ...listingCommonData,
                                                      ["price_type"]: item.id,
                                                    };
                                                  }
                                                );
                                                if (item.id !== "on_call") {
                                                  setCommonRequiredFields(
                                                    (
                                                      prevCommonRequiredFields
                                                    ) => [
                                                      ...prevCommonRequiredFields,
                                                      "price",
                                                    ]
                                                  );
                                                } else {
                                                  setCommonRequiredFields(
                                                    (
                                                      prevCommonRequiredFields
                                                    ) =>
                                                      prevCommonRequiredFields.filter(
                                                        (field) =>
                                                          field !== "price"
                                                      )
                                                  );
                                                }
                                              }}
                                            >
                                              <Text
                                                style={styles.pickerOptionsText}
                                              >
                                                {item.name}
                                              </Text>
                                            </TouchableOpacity>
                                          )
                                        )}
                                      </ScrollView>
                                    </View>
                                  </View>
                                </Modal>
                              </View>
                              <View style={styles.inputFieldErrorWrap}>
                                {!listingCommonData.price_type && (
                                  <Text style={styles.inputFieldErrorMessage}>
                                    This field is required
                                  </Text>
                                )}
                              </View>
                            </View>
                          )}
                          {!listingData.config.hidden_fields.includes(
                            "price"
                          ) &&
                            listingCommonData.price_type !== "on_call" && (
                              <View style={styles.commonInputWrap}>
                                <Text style={styles.commonInputLabel}>
                                  {`${priceLabel} (${getCurrencySymbol(
                                    config.currency
                                  )})`}
                                  {listingCommonData.price_type !==
                                    "on_call" && (
                                    <Text style={styles.required}> *</Text>
                                  )}
                                </Text>
                                <TextInput
                                  style={styles.commonInputField}
                                  onChangeText={(value) => {
                                    setListingCommonData(
                                      (listingCommonData) => {
                                        return {
                                          ...listingCommonData,
                                          ["price"]: value,
                                        };
                                      }
                                    );
                                  }}
                                  onBlur={() => {
                                    setTouchedFields((prevTouchedFields) =>
                                      Array.from(
                                        new Set([...prevTouchedFields, "price"])
                                      )
                                    );
                                  }}
                                  value={listingCommonData.price}
                                  keyboardType="decimal-pad"
                                />
                                <View style={styles.inputFieldErrorWrap}>
                                  {commonErrorFields.includes("price") && (
                                    <Text style={styles.inputFieldErrorMessage}>
                                      Price is required
                                    </Text>
                                  )}
                                </View>
                              </View>
                            )}
                        </View>
                        {listingData.custom_fields && (
                          <View style={styles.customFieldsWrap}>
                            {listingData.custom_fields.map((field) => (
                              <View
                                key={field.meta_key}
                                style={styles.metaField}
                              >
                                <Text style={styles.label}>
                                  {decodeString(field.label)}
                                  {field.required && (
                                    <Text style={styles.required}> *</Text>
                                  )}
                                </Text>
                                {["text", "textarea", "url", "number"].includes(
                                  field.type
                                ) && (
                                  <TextInput
                                    style={
                                      field.type === "textarea"
                                        ? styles.metaField_TextArea
                                        : styles.metaField_Text
                                    }
                                    onChangeText={(value) =>
                                      handleTextData(field.meta_key, value)
                                    }
                                    value={
                                      listingCustomData[field.meta_key]
                                        ? listingCustomData[field.meta_key]
                                        : ""
                                    }
                                    textAlignVertical={
                                      field.type === "textarea" ? "top" : "auto"
                                    }
                                    multiline={field.type === "textarea"}
                                    keyboardType={
                                      field.type === "number"
                                        ? "decimal-pad"
                                        : "default"
                                    }
                                    contextMenuHidden={field.type === "number"}
                                    placeholder={field.placeholder}
                                    onBlur={() =>
                                      setTouchedFields((prevTouchedFields) =>
                                        Array.from(
                                          new Set([
                                            ...prevTouchedFields,
                                            field.meta_key,
                                          ])
                                        )
                                      )
                                    }
                                  />
                                )}
                                {field.type === "select" && (
                                  <View style={styles.dynamicPickerWrap}>
                                    <DynamicListPicker
                                      field={field}
                                      onselect={(item) =>
                                        setListingCustomData(
                                          (listingCustomData) => {
                                            return {
                                              ...listingCustomData,
                                              [field.meta_key]: item.id,
                                            };
                                          }
                                        )
                                      }
                                      selected={
                                        field.value ? field.value : undefined
                                      }
                                      handleTouch={() =>
                                        setTouchedFields((prevTouchedFields) =>
                                          Array.from(
                                            new Set([
                                              ...prevTouchedFields,
                                              field.meta_key,
                                            ])
                                          )
                                        )
                                      }
                                    />
                                  </View>
                                )}
                                {field.type === "radio" && (
                                  <View style={styles.dynamicRadioWrap}>
                                    <DynamicRadioButton
                                      field={field}
                                      handleClick={(item) => {
                                        setListingCustomData(
                                          (listingCustomData) => {
                                            return {
                                              ...listingCustomData,
                                              [field.meta_key]: item.id,
                                            };
                                          }
                                        );
                                        setTouchedFields((prevTouchedFields) =>
                                          Array.from(
                                            new Set([
                                              ...prevTouchedFields,
                                              field.meta_key,
                                            ])
                                          )
                                        );
                                      }}
                                      selected={
                                        listingCustomData[`${field.meta_key}`]
                                      }
                                    />
                                  </View>
                                )}
                                {field.type === "checkbox" && (
                                  <View style={styles.dynamicCheckboxWrap}>
                                    <DynamicCheckbox
                                      field={field}
                                      handleClick={(value) => {
                                        setListingCustomData(
                                          (listingCustomData) => {
                                            return {
                                              ...listingCustomData,
                                              [field.meta_key]: value,
                                            };
                                          }
                                        );
                                        setTouchedFields((prevTouchedFields) =>
                                          Array.from(
                                            new Set([
                                              ...prevTouchedFields,
                                              field.meta_key,
                                            ])
                                          )
                                        );
                                      }}
                                      selected={
                                        field.value.length ? field.value : []
                                      }
                                    />
                                  </View>
                                )}
                                {field.type === "date" && (
                                  <View style={styles.dateFieldWrap}>
                                    {["date", "date_time"].includes(
                                      field.date.type
                                    ) && (
                                      <DatePicker
                                        field={field}
                                        onSelect={handleDateTime}
                                        value={
                                          listingCustomData[field.meta_key]
                                            ? listingCustomData[field.meta_key]
                                            : null
                                        }
                                      />
                                    )}
                                    {["date_range", "date_time_range"].includes(
                                      field.date.type
                                    ) && (
                                      <DateRangePicker
                                        field={field}
                                        value={
                                          !!listingCustomData[
                                            field.meta_key
                                          ][0] ||
                                          !!listingCustomData[field.meta_key][1]
                                            ? listingCustomData[field.meta_key]
                                            : null
                                        }
                                        onSelect={handleDateTimeRange}
                                      />
                                    )}
                                  </View>
                                )}
                                <View style={styles.inputFieldErrorWrap}>
                                  {customErrorFields.includes(field) &&
                                    touchedFields.includes(field.meta_key) && (
                                      <Text
                                        style={styles.inputFieldErrorMessage}
                                      >
                                        This field is required
                                      </Text>
                                    )}
                                </View>
                              </View>
                            ))}
                          </View>
                        )}
                        <View style={styles.commonFieldsWrap}>
                          {!listingData.config.hidden_fields.includes(
                            "description"
                          ) && (
                            <View style={styles.commonInputWrap}>
                              <Text style={styles.commonInputLabel}>
                                {listingDescriptionLabel}
                              </Text>
                              <TextInput
                                style={styles.metaField_TextArea}
                                onChangeText={handleChange("description")}
                                onBlur={handleBlur("description")}
                                value={values.description}
                                textAlignVertical="top"
                                multiline
                                placeholder={listingDescriptionLabel}
                              />
                              <View style={styles.inputFieldErrorWrap}>
                                {errors.description && touched.description && (
                                  <Text style={styles.inputFieldErrorMessage}>
                                    {errors.price}
                                  </Text>
                                )}
                              </View>
                            </View>
                          )}
                        </View>
                        <View style={styles.contactSectionWrap}>
                          <View style={styles.contactTitleWrap}>
                            <View style={styles.iconWrap}>
                              <Image
                                style={{
                                  height: 25,
                                  width: 25,
                                  resizeMode: "contain",
                                }}
                                source={require("../assets/my_profile.png")}
                              />
                            </View>
                            <Text style={styles.title}>{contactTitle}</Text>
                          </View>
                          {!listingData.config.hidden_fields.includes(
                            "name"
                          ) && (
                            <View style={styles.commonInputWrap}>
                              <Text style={styles.commonInputLabel}>
                                {nameLabel}
                                <Text style={styles.required}> *</Text>
                              </Text>
                              <TextInput
                                style={styles.commonInputField}
                                onChangeText={handleChange("name")}
                                onBlur={handleBlur("name")}
                                value={values.name}
                                editable={!values.name}
                              />
                              <View style={styles.inputFieldErrorWrap}>
                                {errors.name && touched.name && (
                                  <Text style={styles.inputFieldErrorMessage}>
                                    {errors.name}
                                  </Text>
                                )}
                              </View>
                            </View>
                          )}
                          {!listingData.config.hidden_fields.includes(
                            "zipcode"
                          ) && (
                            <View style={styles.commonInputWrap}>
                              <Text style={styles.commonInputLabel}>
                                {zipCodeLabel}
                              </Text>
                              <TextInput
                                style={styles.commonInputField}
                                onChangeText={handleChange("zipcode")}
                                onBlur={handleBlur("zipcode")}
                                value={values.zipcode}
                              />
                              <View style={styles.inputFieldErrorWrap}>
                                {errors.zipcode && touched.zipcode && (
                                  <Text style={styles.inputFieldErrorMessage}>
                                    {errors.zipcode}
                                  </Text>
                                )}
                              </View>
                            </View>
                          )}
                          {!listingData.config.hidden_fields.includes(
                            "address"
                          ) && (
                            <View style={styles.commonInputWrap}>
                              <Text style={styles.commonInputLabel}>
                                {addressLabel}
                              </Text>
                              <TextInput
                                style={styles.commonInputField}
                                onChangeText={handleChange("address")}
                                onBlur={handleBlur("address")}
                                value={values.address}
                                placeholder={addressLabel}
                                multiline
                              />
                              <View style={styles.inputFieldErrorWrap}>
                                {errors.address && touched.address && (
                                  <Text style={styles.inputFieldErrorMessage}>
                                    {errors.address}
                                  </Text>
                                )}
                              </View>
                            </View>
                          )}
                          {!listingData.config.hidden_fields.includes(
                            "phone"
                          ) && (
                            <View style={styles.commonInputWrap}>
                              <Text style={styles.commonInputLabel}>
                                {phoneLabel}
                                <Text style={styles.required}> *</Text>
                              </Text>
                              <TextInput
                                style={styles.commonInputField}
                                onChangeText={handleChange("phone")}
                                onBlur={handleBlur("phone")}
                                value={values.phone}
                              />
                              <View style={styles.inputFieldErrorWrap}>
                                {errors.phone && touched.phone && (
                                  <Text style={styles.inputFieldErrorMessage}>
                                    {errors.phone}
                                  </Text>
                                )}
                              </View>
                            </View>
                          )}
                          {!listingData.config.hidden_fields.includes(
                            "whatsapp_number"
                          ) && (
                            <View style={styles.commonInputWrap}>
                              <Text style={styles.commonInputLabel}>
                                {whatsappLabel}
                              </Text>
                              <TextInput
                                style={styles.commonInputField}
                                onChangeText={handleChange("whatsapp_number")}
                                onBlur={handleBlur("whatsapp_number")}
                                value={values.whatsapp_number}
                              />
                              <Text style={styles.Text}>{whatsappNote}</Text>
                              <View style={styles.inputFieldErrorWrap}>
                                {errors.whatsapp_number &&
                                  touched.whatsapp_number && (
                                    <Text style={styles.inputFieldErrorMessage}>
                                      {errors.whatsapp_number}
                                    </Text>
                                  )}
                              </View>
                            </View>
                          )}
                          {!listingData.config.hidden_fields.includes(
                            "email"
                          ) && (
                            <View style={styles.commonInputWrap}>
                              <Text style={styles.commonInputLabel}>
                                {emailLabel}
                                <Text style={styles.required}> *</Text>
                              </Text>
                              <TextInput
                                style={styles.commonInputField}
                                onChangeText={handleChange("email")}
                                onBlur={handleBlur("email")}
                                value={values.email}
                                editable={!values.email}
                              />
                              <View style={styles.inputFieldErrorWrap}>
                                {errors.email && touched.email && (
                                  <Text style={styles.inputFieldErrorMessage}>
                                    {errors.email}
                                  </Text>
                                )}
                              </View>
                            </View>
                          )}
                          {!listingData.config.hidden_fields.includes(
                            "website"
                          ) && (
                            <View style={styles.commonInputWrap}>
                              <Text style={styles.commonInputLabel}>
                                {websiteLabel}
                              </Text>
                              <TextInput
                                style={styles.commonInputField}
                                onChangeText={handleChange("website")}
                                onBlur={handleBlur("website")}
                                value={values.website}
                              />
                              <View style={styles.inputFieldErrorWrap}>
                                {errors.website && touched.website && (
                                  <Text style={styles.inputFieldErrorMessage}>
                                    {errors.website}
                                  </Text>
                                )}
                              </View>
                            </View>
                          )}
                        </View>
                        <View style={styles.noteWrap}>
                          <Text
                            style={[
                              styles.text,
                              {
                                color:
                                  Object.keys(errors).length ||
                                  customErrorFields.length ||
                                  commonErrorFields.length
                                    ? COLORS.red
                                    : COLORS.text_gray,
                              },
                            ]}
                          >
                            *** Fields marked with red star are required ***
                          </Text>
                        </View>
                        <View style={{ paddingHorizontal: "3%" }}>
                          <AppButton
                            style={styles.updateButton}
                            title="Update Listing"
                            onPress={handleSubmit}
                            loading={updateLoading}
                            disabled={
                              updateLoading ||
                              Object.keys(errors).length ||
                              customErrorFields.length ||
                              commonErrorFields.length
                            }
                          />
                        </View>
                      </View>
                    )}
                  </Formik>
                </View>
              </View>
            </View>
          </ScrollView>
        ))}
    </>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
    marginBottom: 20,
  },
  commonInputField: {
    borderWidth: 1,
    borderColor: "#b6b6b6",
    borderRadius: 3,
    paddingHorizontal: 5,
    minHeight: 32,
  },
  commonInputLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.text_gray,
    marginBottom: 5,
  },
  commonInputWrap: {
    paddingHorizontal: "3%",
  },
  contactTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: "3%",
  },
  container: {
    // flex: 1,
  },
  flashMessage_success: {
    position: "absolute",
    backgroundColor: "green",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    bottom: 0,
    zIndex: 2,
  },
  flashMessage_error: {
    position: "absolute",
    backgroundColor: "red",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    bottom: 0,
    zIndex: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text_gray,
    marginVertical: 15,
  },
  imageInputLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text_gray,
    marginLeft: 10,
  },
  imageInputNotes: {
    backgroundColor: "#ffe4d2",

    borderRadius: 3,
    marginTop: 10,
    padding: 10,
  },
  imageInputNotesText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#f60",
  },
  imageInputTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: "3%",
  },
  imageInputWrap: {
    marginBottom: 15,
  },
  inputFieldErrorMessage: {
    color: COLORS.red,
    fontSize: 12,
  },
  inputFieldErrorWrap: {
    minHeight: 17,
  },
  iconWrap: {
    height: 25,
    width: 25,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.text_gray,
    marginBottom: 5,
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
  location1Picker: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 3,
    height: 32,
  },
  mainWrap: {
    backgroundColor: COLORS.white,
  },
  metaField: {
    // marginVertical: 10,
    paddingHorizontal: "3%",
  },
  metaField_Text: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#b6b6b6",
    borderRadius: 3,
    paddingHorizontal: 5,
    minHeight: 32,
  },
  metaField_TextArea: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#b6b6b6",
    borderRadius: 3,
    minHeight: 70,
    paddingHorizontal: 5,
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
  noteWrap: {
    alignItems: "center",
    paddingHorizontal: "3%",
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
    textTransform: "capitalize",
    flex: 1,
  },
  priceTypePicker: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 3,
    height: 32,
  },
  required: {
    color: "#ff6600",
  },
  separator: {
    width: "100%",
    backgroundColor: COLORS.bg_dark,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text_gray,
    paddingHorizontal: "3%",
  },
  titleWrap: {
    backgroundColor: COLORS.white,
    alignItems: "center",
  },
  updateButton: {
    borderRadius: 3,
    marginVertical: 20,
  },
});

export default EditListingScreen;
