import React, { useState, useEffect } from "react";
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
  SafeAreaView,
  Image,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../variables/color";
import AppSeparator from "./AppSeparator";
import AppButton from "./AppButton";
import DynamicListPicker from "./DynamicListPicker";
import ImageInputList from "./ImageInputList";
// import { CommonActions,  useNavigation } from "@react-navigation/native";
import api, {
  setAuthToken,
  setMultipartHeader,
  removeMultipartHeader,
  removeAuthToken,
} from "../api/client";
import DynamicRadioButton from "./DynamicRadioButton";
import DynamicCheckbox from "./DynamicCheckbox";
import { useStateValue } from "../StateProvider";
import { Formik } from "formik";
import * as Yup from "yup";
import { getCurrencySymbol, decodeString } from "../helper/helper";
import DatePicker from "./DatePicker";
import DateRangePicker from "./DateRangePicker";
import moment from "moment";
import * as Progress from "react-native-progress";
import DoneIndicator from "./DoneIndicator";
import UploadingIndicator from "./UploadingIndicator";
import ErrorIndicator from "./ErrorIndicator";
import { getTnC } from "../app/services/termsAndConditions";
import AppRadioButton from "./AppRadioButton";

const formTitle = "Product Information";
const fieldRequiredErrorMessage = "This field is required";

const tnCToggleText = "I have read and agree to the website";
const tncText = " Terms and Conditions";
const tncTitleText = "Terms and Conditions";
const tnCData = getTnC();
const listingTitleLabel = "Title";
const priceTypeLabel = "Price Type";
const priceLabel = "Price";
const priceUnitLabel = "Price Unit";
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
const imagesLabel = "Images";
const dragSortText = "Long press to drag and sort images.";
const uploadingNoticeText =
  "This may take a while depending on the speed of your internet connection...";
const uploadErrorNoticeText = "Error uploading! Please try again.";
const submitButtonTitle = "SUBMIT";
const tryAgainButtonTitle = "Try again";
const addPhotoButtonTitle = "Add Photos";

const validationSchema_contact = Yup.object().shape({
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
});

const { width: screenWidth, height: screenHeight } = Dimensions.get("screen");
const ListingForm = ({ catId, type, goBack }) => {
  const [imageUris, setImageUris] = useState([]);
  const [imageObjects, setImageObjects] = useState([]);
  const [{ auth_token, user, listing_locations, config }] = useStateValue();
  const [listingData, setListingData] = useState({});
  const [listingCommonData, setListingCommonData] = useState({});
  const [loading, setLoading] = useState(true);
  const [priceTypePickerVisivle, setPriceTypePickerVisivle] = useState(false);
  const [priceUnitPickerVisivle, setPriceUnitPickerVisivle] = useState(false);
  const [formData, setFormData] = useState();
  const [customFieldsErrors, setCustomFieldsError] = useState({});
  const [commonFieldsErrors, setCommonFieldsError] = useState(false);
  const [commonRequiredFields, setCommonRequiredFields] = useState([
    "title",
    "price_type",
  ]);
  const [touchedFields, setTouchedFields] = useState([]);
  const [tnCToggle, setTnCToggle] = useState(false);
  const [tnCVisible, setTnCVisible] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [hasImage, setHasImage] = useState();

  const [uploadProgress, setUploadProgress] = useState(0);
  const [success, setSuccess] = useState();
  const [error, setError] = useState();

  // Load listing form
  useEffect(() => {
    if (formData) return;

    setAuthToken(auth_token);
    api.get("listing/form", { category_id: catId }).then((res) => {
      if (res.ok) {
        setFormData(res.data);
        setListingCommonData({ price_type: res.data.config.price_types[0].id });
        if (res.data.config.hidden_fields) {
          setCommonRequiredFields((prevCommonRequiredFields) =>
            prevCommonRequiredFields.filter(
              (common) => !res.data.config.hidden_fields.includes(common)
            )
          );
        }
        setLoading(false);
        removeAuthToken();
      } else {
        // TODO add error storing
        removeAuthToken();
      }
    });
  }, [formData]);

  //  custom fields validation
  useEffect(() => {
    if (!formData) return;
    custom_fieldsValidation(listingData, formData);
  }, [listingData, tnCToggle]);

  //  common fields validation
  useEffect(() => {
    if (!formData) return;
    commonFieldsValidation();
  }, [listingCommonData, touchedFields, tnCToggle]);

  const handleTextData = (key, value) => {
    setListingData((listingData) => {
      return { ...listingData, [key]: value };
    });
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
    setImageObjects([...imageObjects, image]);
  };
  const handleRemoveImage = (uri) => {
    setImageUris(imageUris.filter((imageUri) => imageUri !== uri));
    setImageObjects((imageObjects) => [
      ...imageObjects.filter((item) => item.uri !== uri),
    ]);
  };

  const handleListingFormSubmit = (contact) => {
    setUploadProgress(0);
    setSubmitLoading(true);
    const data = {
      ["custom_fields"]: listingData,
      ...listingCommonData,
      ...contact,
      ["locations"]: [],
      ["category_id"]: catId,
      ["agree"]: 1,
      ["gallery"]: imageObjects,
      ["listing_type"]: type.id,
    };

    for (const item of listing_locations) {
      data.locations.push(item.term_id);
    }

    setAuthToken(auth_token);
    if (data.gallery.length) {
      setHasImage(true);
      const formData = new FormData();
      Object.keys(data).map((key) => {
        if (key === "custom_fields") {
          Object.keys(data[key]).map((innerKey) => {
            formData.append(
              "custom_fields[" + innerKey + "]",
              Array.isArray(data[key][innerKey])
                ? JSON.stringify(data[key][innerKey])
                : data[key][innerKey]
            );
          });
        } else if (Array.isArray(data[key])) {
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
          onUploadProgress: (value) => progressValue(value),
        })
        .then((res) => {
          if (res.ok) {
            removeMultipartHeader();
            removeAuthToken();
            setHasImage(false);
            setSuccess(true);
          } else {
            // TODO add error storing

            removeMultipartHeader();
            removeAuthToken();
            setHasImage(false);
            setError(true);
            // setSubmitLoading((submitLoading) => false);
          }
        });
    } else {
      delete data.gallery;
      api.post("listing/form", data).then((res) => {
        if (res.ok) {
          removeAuthToken();
          setSuccess(true);
        } else {
          // TODO add error storing
          removeAuthToken();
          setError(true);
          // setSubmitLoading((submitLoading) => false);
        }
      });
    }
  };

  const progressValue = (value) => {
    setUploadProgress(value.loaded / value.total);
  };

  const getPriceTypeLabel = (array, data) => {
    return array.find((item) => item.id === data).name;
  };
  const custom_fieldsValidation = (listingData, formData) => {
    const requiredFields = formData.custom_fields.filter(
      (field) => field.required
    );

    const errorData = requiredFields.filter((item) => {
      if (item.type === "checkbox") {
        if (listingData[item.meta_key]) {
          return listingData[item.meta_key].length < 1;
        } else {
          return true;
        }
      } else {
        return !listingData[item.meta_key];
      }
    });
    const errorsObject = {};
    errorData.map((err) => {
      const val = `${err.label} is required`;
      errorsObject[err.meta_key] = val;
    });
    setCustomFieldsError(errorsObject);
  };
  const commonFieldsValidation = () => {
    const errorData = commonRequiredFields.filter((item) => {
      if (listingCommonData[item]) {
        return false;
      } else {
        return true;
      }
    });
    setCommonFieldsError(errorData);
  };

  const handleDateTime = (payLoad, field) => {
    setListingData((prevListingData) => {
      return {
        ...prevListingData,
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
        listingData[field.meta_key]
          ? listingData[field.meta_key][1]
            ? listingData[field.meta_key][1]
            : moment(payLoad).format(field.date.jsFormat)
          : moment(payLoad).format(field.date.jsFormat),
      ];
      setListingData((prevListingData) => {
        return { ...prevListingData, [field.meta_key]: newRangeStart };
      });
    } else {
      const newRangeEnd = [
        listingData[field.meta_key]
          ? listingData[field.meta_key][0]
            ? listingData[field.meta_key][0]
            : moment(payLoad).format(field.date.jsFormat)
          : moment(payLoad).format(field.date.jsFormat),
        moment(payLoad).format(field.date.jsFormat),
      ];
      setListingData((prevListingData) => {
        return { ...prevListingData, [field.meta_key]: newRangeEnd };
      });
    }
    setTouchedFields((prevtouchedFields) =>
      Array.from(new Set([...prevtouchedFields, field.meta_key]))
    );
  };

  const handleTnCShow = () => {
    setTnCVisible(!tnCVisible);
  };

  const handleImageReorder = (data) => {
    setImageUris(data);

    const reorderedImageData = data.map((_uri) => {
      let localUri = _uri;
      let filename = localUri.split("/").pop();
      let match = /\.(\w+)$/.exec(filename);
      let type = match ? `image/${match[1]}` : `image`;

      return {
        uri: localUri,
        name: filename,
        type,
      };
    });
    setImageObjects(reorderedImageData);
  };

  const handleEventOnAnimationDone = () => {
    setSuccess(false);
    if (success) {
      // eslint-disable-next-line no-unused-vars
      setSubmitLoading((prevSubmitLoading) => false);
      goBack();
    }
  };

  const updatePriceType = (item) => {
    setListingCommonData((prevListingCommonData) => {
      return {
        ...prevListingCommonData,
        ["price_type"]: item.id,
      };
    });
    if (item.id !== "on_call") {
      setCommonRequiredFields((prevCommonRequiredFields) => [
        ...prevCommonRequiredFields,
        "price",
      ]);
    } else {
      setCommonRequiredFields((prevCommonRequiredFields) =>
        prevCommonRequiredFields.filter((field) => field !== "price")
      );
    }
  };

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}

      {!loading && (
        <>
          <View style={styles.commonFieldsWrap}>
            {formData.config.gallery && (
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

                  <Text style={styles.imageInputLabel}>{imagesLabel}</Text>
                </View>
                <View style={styles.imageInputNotes}>
                  {!!formData.config.gallery.max_image_limit && (
                    <Text
                      style={styles.imageInputNotesText}
                    >{`You can upload up to ${formData.config.gallery.max_image_limit} images.`}</Text>
                  )}
                  {(!formData.config.gallery.max_image_limit ||
                    formData.config.gallery.max_image_limit > 1) && (
                    <Text style={styles.imageInputNotesText}>
                      {dragSortText}
                    </Text>
                  )}
                </View>
                <ImageInputList
                  imageUris={imageUris}
                  onAddImage={handleAddImage}
                  onRemoveImage={handleRemoveImage}
                  maxCount={formData.config.gallery.max_image_limit}
                  reorder={handleImageReorder}
                />
              </View>
            )}
            <View style={styles.titleWrap}>
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
            <AppSeparator style={styles.separator} />
            <View style={styles.inputWrap}>
              <Text style={styles.label}>
                {listingTitleLabel}
                <Text style={styles.required}> *</Text>
              </Text>
              <TextInput
                style={styles.commonField_Text}
                onChangeText={(value) => {
                  setListingCommonData((listingCommonData) => {
                    return { ...listingCommonData, ["title"]: value };
                  });
                }}
                onBlur={() =>
                  setTouchedFields((prevTouchedFields) =>
                    Array.from(new Set([...prevTouchedFields, "title"]))
                  )
                }
                value={listingCommonData.title}
              />
              <View style={styles.errorWrap}>
                {touchedFields.includes("title") &&
                  !listingCommonData.title && (
                    <Text style={styles.errorMessage}>
                      {fieldRequiredErrorMessage}
                    </Text>
                  )}
              </View>
            </View>
            {!formData.config.hidden_fields.includes("price_type") && (
              <View style={styles.inputWrap}>
                {/* <Text style={styles.label}>
                  {priceTypeLabel}
                  <Text style={styles.required}> *</Text>
                </Text>
                <View style={styles.priceTypePickerWrap}>
                  <TouchableOpacity
                    style={styles.priceTypePicker}
                    onPress={() => {
                      setPriceTypePickerVisivle(!priceTypePickerVisivle);
                      setTouchedFields((prevTouchedFields) =>
                        Array.from(
                          new Set([...prevTouchedFields, "price_type"])
                        )
                      );
                    }}
                  >
                    <Text style={styles.Text}>
                      {listingCommonData.price_type === undefined
                        ? `Select a ${priceTypeLabel}`
                        : getPriceTypeLabel(
                            formData.config.price_types,
                            listingCommonData.price_type
                          )}
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
                      onPress={() => setPriceTypePickerVisivle(false)}
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
                          {formData.config.price_types.map((item) => (
                            <TouchableOpacity
                              style={styles.pickerOptions}
                              key={`${item.id}`}
                              onPress={() => {
                                setListingCommonData(
                                  (prevListingCommonData) => {
                                    return {
                                      ...prevListingCommonData,
                                      ["price_type"]: item.id,
                                    };
                                  }
                                );
                                setPriceTypePickerVisivle(false);
                                if (item.id !== "on_call") {
                                  setCommonRequiredFields(
                                    (prevCommonRequiredFields) => [
                                      ...prevCommonRequiredFields,
                                      "price",
                                    ]
                                  );
                                } else {
                                  setCommonRequiredFields(
                                    (prevCommonRequiredFields) =>
                                      prevCommonRequiredFields.filter(
                                        (field) => field !== "price"
                                      )
                                  );
                                }
                              }}
                            >
                              <Text style={styles.pickerOptionsText}>
                                {item.name}
                              </Text>
                              {listingCommonData.price_type &&
                                listingCommonData.price_type === item.id && (
                                  <FontAwesome5
                                    name="check"
                                    size={14}
                                    color="black"
                                  />
                                )}
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    </View>
                  </Modal>
                </View>
                <View style={styles.errorWrap}>
                  {touchedFields.includes("price_type") &&
                    !listingCommonData.price_type && (
                      <Text style={styles.errorMessage}>
                        {fieldRequiredErrorMessage}
                      </Text>
                    )}
                </View> */}
              </View>
            )}
            {!formData.config.hidden_fields.includes("price_type") && (
              <View style={styles.inputWrap}>
                <Text style={styles.label}>
                  {priceTypeLabel}
                  <Text style={styles.required}> *</Text>
                </Text>
                <View style={styles.priceTypePickerWrap}>
                  <AppRadioButton
                    field={formData.config.price_types}
                    handleClick={updatePriceType}
                    selected={listingCommonData.price_type}
                  />
                </View>
                <View style={styles.errorWrap}>
                  {touchedFields.includes("price_type") &&
                    !listingCommonData.price_type && (
                      <Text style={styles.errorMessage}>
                        {fieldRequiredErrorMessage}
                      </Text>
                    )}
                </View>
              </View>
            )}
            {formData.config.price_units.length > 0 && (
              <View style={styles.inputWrap}>
                <Text style={styles.label}>
                  {priceUnitLabel}
                  <Text style={styles.required}> *</Text>
                </Text>
                <View style={styles.priceTypePickerWrap}>
                  <TouchableOpacity
                    style={styles.priceTypePicker}
                    onPress={() => {
                      setPriceUnitPickerVisivle(!priceUnitPickerVisivle);
                      setListingCommonData((listingCommonData) => {
                        return { ...listingCommonData, ["price_unit"]: null };
                      });
                    }}
                  >
                    <Text style={styles.Text}>
                      {listingCommonData.price_unit
                        ? `${listingCommonData.price_unit.name} (${listingCommonData.price_unit.short})`
                        : `Select a ${priceUnitLabel}`}
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
                    visible={priceUnitPickerVisivle}
                  >
                    <TouchableWithoutFeedback
                      onPress={() => setPriceUnitPickerVisivle(false)}
                    >
                      <View style={styles.modalOverlay} />
                    </TouchableWithoutFeedback>
                    <View style={styles.centeredView}>
                      <View style={styles.modalView}>
                        <Text
                          style={styles.modalText}
                        >{`== Select a ${priceUnitLabel} ==`}</Text>
                        <ScrollView
                          contentContainerStyle={{
                            display: "flex",
                            width: "100%",
                            alignItems: "flex-start",
                          }}
                        >
                          {formData.config.price_units.map((item) => (
                            <TouchableOpacity
                              style={styles.pickerOptions}
                              key={`${item.id}`}
                              onPress={() => {
                                setPriceUnitPickerVisivle(false);
                                setListingCommonData((listingCommonData) => {
                                  return {
                                    ...listingCommonData,
                                    ["price_unit"]: item,
                                  };
                                });
                              }}
                            >
                              <Text style={styles.pickerOptionsText}>
                                {item.name} ({item.short})
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    </View>
                  </Modal>
                </View>
              </View>
            )}
            {!formData.config.hidden_fields.includes("price") &&
              listingCommonData.price_type !== "on_call" && (
                <View style={styles.inputWrap}>
                  <Text style={styles.label}>
                    {`${priceLabel} (${getCurrencySymbol(config.currency)})`}
                    {listingCommonData.price_type !== "on_call" && (
                      <Text style={styles.required}> *</Text>
                    )}
                  </Text>
                  <TextInput
                    style={styles.commonField_Text}
                    onChangeText={(value) => {
                      setListingCommonData((listingCommonData) => {
                        return { ...listingCommonData, ["price"]: value };
                      });
                    }}
                    value={listingCommonData.price}
                    keyboardType="decimal-pad"
                    onBlur={() =>
                      setTouchedFields((prevTouchedFields) =>
                        Array.from(new Set([...prevTouchedFields, "price"]))
                      )
                    }
                  />
                  <View style={styles.errorWrap}>
                    {touchedFields.includes("price") &&
                      listingCommonData.price_type !== "on_call" &&
                      !listingCommonData.price && (
                        <Text style={styles.errorMessage}>
                          {fieldRequiredErrorMessage}
                        </Text>
                      )}
                  </View>
                </View>
              )}
          </View>
          <View style={styles.customFieldsWrap}>
            {formData.custom_fields.map((field) => (
              <View key={field.meta_key} style={styles.metaField}>
                <Text style={styles.label}>
                  {decodeString(field.label)}
                  {field.required && <Text style={styles.required}> *</Text>}
                </Text>
                {(field.type === "text" ||
                  field.type === "textarea" ||
                  field.type === "url" ||
                  field.type === "number") && (
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
                      listingData[field.meta_key]
                        ? listingData[field.meta_key]
                        : ""
                    }
                    textAlignVertical={
                      field.type === "textarea" ? "top" : "auto"
                    }
                    multiline={field.type === "textarea"}
                    keyboardType={
                      field.type === "number" ? "decimal-pad" : "default"
                    }
                    contextMenuHidden={field.type === "number"}
                    placeholder={field.placeholder}
                    onBlur={() =>
                      setTouchedFields((prevtouchedFields) =>
                        Array.from(
                          new Set([...prevtouchedFields, field.meta_key])
                        )
                      )
                    }
                  />
                )}
                {field.type === "select" && (
                  <View style={styles.dynamicPickerWrap}>
                    <DynamicListPicker
                      field={field}
                      handleTouch={() =>
                        setTouchedFields((prevtouchedFields) =>
                          Array.from(
                            new Set([...prevtouchedFields, field.meta_key])
                          )
                        )
                      }
                      onselect={(item) => {
                        setListingData((listingData) => {
                          return {
                            ...listingData,
                            [field.meta_key]: item.id,
                          };
                        });
                      }}
                    />
                  </View>
                )}
                {field.type === "radio" && (
                  <View style={styles.dynamicRadioWrap}>
                    <DynamicRadioButton
                      field={field}
                      handleClick={(item) => {
                        setListingData((listingData) => {
                          return {
                            ...listingData,
                            [field.meta_key]: item.id,
                          };
                        });
                        setTouchedFields((prevtouchedFields) =>
                          Array.from(
                            new Set([...prevtouchedFields, field.meta_key])
                          )
                        );
                      }}
                    />
                  </View>
                )}
                {field.type === "checkbox" && (
                  <View style={styles.dynamicCheckboxWrap}>
                    <DynamicCheckbox
                      field={field}
                      handleClick={(value) => {
                        setListingData((listingData) => {
                          return { ...listingData, [field.meta_key]: value };
                        });
                        setTouchedFields((prevtouchedFields) =>
                          Array.from(
                            new Set([...prevtouchedFields, field.meta_key])
                          )
                        );
                      }}
                    />
                  </View>
                )}
                {field.type === "date" && (
                  <View style={styles.dateFieldWrap}>
                    {["date", "date_time"].includes(field.date.type) && (
                      <DatePicker
                        field={field}
                        onSelect={handleDateTime}
                        value={
                          listingData[field.meta_key]
                            ? listingData[field.meta_key]
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
                          listingData[field.meta_key]
                            ? listingData[field.meta_key]
                            : null
                        }
                        onSelect={handleDateTimeRange}
                      />
                    )}
                  </View>
                )}
                <View style={styles.errorWrap}>
                  {customFieldsErrors[field.meta_key] &&
                    touchedFields.includes(field.meta_key) && (
                      <Text style={styles.errorMessage}>
                        {customFieldsErrors[field.meta_key]}
                      </Text>
                    )}
                </View>
              </View>
            ))}
          </View>
          <View style={styles.commonFieldsWrap}>
            {!formData.config.hidden_fields.includes("description") && (
              <View style={styles.inputWrap}>
                <Text style={styles.label}>{listingDescriptionLabel}</Text>
                <TextInput
                  style={styles.metaField_TextArea}
                  onChangeText={(value) => {
                    setListingCommonData((listingCommonData) => {
                      return { ...listingCommonData, ["description"]: value };
                    });
                  }}
                  value={listingCommonData.description}
                  textAlignVertical="top"
                  multiline
                  placeholder={listingDescriptionLabel}
                />
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
            <AppSeparator style={styles.separator} />
            <Formik
              initialValues={{
                zipcode: user.zipcode ? user.zipcode : "",
                address: user.address ? user.address : "",
                phone: user ? user.phone : "",
                whatsapp_number: user.whatsapp_number
                  ? user.whatsapp_number
                  : "",
                website: user.website ? user.website : "",
                email: user ? user.email : "",
                name: user ? `${user.first_name} ${user.last_name}` : "",
              }}
              onSubmit={handleListingFormSubmit}
              validationSchema={validationSchema_contact}
            >
              {({
                handleChange,
                handleSubmit,
                values,
                errors,
                setFieldTouched,
                touched,
              }) => (
                <View style={{}}>
                  {!formData.config.hidden_fields.includes("name") && (
                    <View style={styles.inputWrap}>
                      <Text style={styles.label}>
                        {nameLabel}
                        <Text style={styles.required}> *</Text>
                      </Text>
                      <TextInput
                        style={styles.commonField_Text}
                        onChangeText={handleChange("name")}
                        onBlur={() => setFieldTouched("name")}
                        value={values.name}
                        placeholder={nameLabel}
                        editable={false}
                      />
                      <View style={styles.errorWrap}>
                        {errors.name && touched.name && (
                          <Text style={styles.errorMessage}>{errors.name}</Text>
                        )}
                      </View>
                    </View>
                  )}
                  {!formData.config.hidden_fields.includes("zipcode") && (
                    <View style={styles.inputWrap}>
                      <Text style={styles.label}>{zipCodeLabel}</Text>
                      <TextInput
                        style={styles.commonField_Text}
                        onChangeText={handleChange("zipcode")}
                        onBlur={() => setFieldTouched("zipcode")}
                        value={values.zipcode}
                        placeholder={zipCodeLabel}
                      />
                      <View style={styles.errorWrap}>
                        {errors.zipcode && touched.zipcode && (
                          <Text style={styles.errorMessage}>
                            {errors.zipcode}
                          </Text>
                        )}
                      </View>
                    </View>
                  )}
                  {!formData.config.hidden_fields.includes("address") && (
                    <View style={styles.inputWrap}>
                      <Text style={styles.label}>{addressLabel}</Text>
                      <TextInput
                        style={styles.commonField_Text}
                        onChangeText={handleChange("address")}
                        onBlur={() => setFieldTouched("address")}
                        value={values.address}
                        placeholder={addressLabel}
                        multiline
                      />
                      <View style={styles.errorWrap}>
                        {errors.address && touched.address && (
                          <Text style={styles.errorMessage}>
                            {errors.address}
                          </Text>
                        )}
                      </View>
                    </View>
                  )}
                  {!formData.config.hidden_fields.includes("phone") && (
                    <View style={styles.inputWrap}>
                      <Text style={styles.label}>
                        {phoneLabel}
                        <Text style={styles.required}> *</Text>
                      </Text>
                      <TextInput
                        style={styles.commonField_Text}
                        onChangeText={handleChange("phone")}
                        onBlur={() => setFieldTouched("phone")}
                        value={values.phone}
                        placeholder={phoneLabel}
                        keyboardType="phone-pad"
                      />
                      <View style={styles.errorWrap}>
                        {errors.phone && touched.phone && (
                          <Text style={styles.errorMessage}>
                            {errors.phone}
                          </Text>
                        )}
                      </View>
                    </View>
                  )}
                  {!formData.config.hidden_fields.includes(
                    "whatsapp_number"
                  ) && (
                    <View style={styles.inputWrap}>
                      <Text style={styles.label}>{whatsappLabel}</Text>
                      <TextInput
                        style={styles.commonField_Text}
                        onChangeText={handleChange("whatsapp_number")}
                        onBlur={() => setFieldTouched("whatsapp_number")}
                        value={values.whatsapp_number}
                        placeholder={whatsappLabel}
                        keyboardType="phone-pad"
                      />
                      <Text style={styles.Text}>{whatsappNote}</Text>
                      <View style={styles.errorWrap}>
                        {errors.whatsapp_number && touched.whatsapp_number && (
                          <Text style={styles.errorMessage}>
                            {errors.whatsapp_number}
                          </Text>
                        )}
                      </View>
                    </View>
                  )}
                  {!formData.config.hidden_fields.includes("email") && (
                    <View style={styles.inputWrap}>
                      <Text style={styles.label}>
                        {emailLabel}
                        <Text style={styles.required}> *</Text>
                      </Text>
                      <TextInput
                        style={styles.commonField_Text}
                        onChangeText={handleChange("email")}
                        onBlur={() => setFieldTouched("email")}
                        value={values.email}
                        placeholder={emailLabel}
                        keyboardType="email-address"
                      />
                      <View style={styles.errorWrap}>
                        {errors.email && touched.email && (
                          <Text style={styles.errorMessage}>
                            {errors.email}
                          </Text>
                        )}
                      </View>
                    </View>
                  )}
                  {!formData.config.hidden_fields.includes("website") && (
                    <View style={styles.inputWrap}>
                      <Text style={styles.label}>{websiteLabel}</Text>
                      <TextInput
                        style={styles.commonField_Text}
                        onChangeText={handleChange("website")}
                        onBlur={() => setFieldTouched("website")}
                        value={values.website}
                        placeholder={websiteLabel}
                      />
                      <View style={styles.errorWrap}>
                        {errors.website && touched.website && (
                          <Text style={styles.errorMessage}>
                            {errors.website}{" "}
                          </Text>
                        )}
                      </View>
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.tnCToggle}
                    onPress={() => setTnCToggle(!tnCToggle)}
                  >
                    <MaterialCommunityIcons
                      name={
                        tnCToggle ? "checkbox-marked" : "checkbox-blank-outline"
                      }
                      size={24}
                      color={COLORS.primary}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.tnCToggleText}>
                        {tnCToggleText}
                        <Text style={styles.tncText} onPress={handleTnCShow}>
                          {tncText}
                        </Text>
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <AppSeparator style={styles.separator} />
                  <View style={{ paddingHorizontal: "3%" }}>
                    <AppButton
                      title={submitButtonTitle}
                      style={styles.submitButton}
                      onPress={handleSubmit}
                      loading={submitLoading}
                      disabled={
                        !!Object.keys(errors).length ||
                        !!Object.keys(customFieldsErrors).length ||
                        commonFieldsErrors.length ||
                        !tnCToggle
                      }
                      textStyle={{ textTransform: "capitalize" }}
                    />
                  </View>
                </View>
              )}
            </Formik>
          </View>
        </>
      )}
      <Modal animationType="slide" transparent={true} visible={tnCVisible}>
        <SafeAreaView style={styles.tncModal}>
          <ScrollView contentContainerStyle={styles.tnCModalContent}>
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                marginTop: 10,
                fontSize: 17,
              }}
            >
              {tncTitleText}
            </Text>
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
                paddingVertical: 10,
                paddingHorizontal: 10,
              }}
            >
              {tnCData.map((_tnc, index) => (
                <View style={styles.tncParaWrap} key={index}>
                  {!!_tnc.paraTitle && (
                    <Text style={styles.paraTitle}>{_tnc.paraTitle}</Text>
                  )}
                  <Text style={styles.paraData}>{_tnc.paraData}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
          <TouchableOpacity style={styles.tnCClose} onPress={handleTnCShow}>
            <Text style={styles.tnCCloseText}>Close</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>

      <Modal animationType="slide" transparent={false} visible={submitLoading}>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
            paddingBottom: 50,
          }}
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
                onDone={handleEventOnAnimationDone}
              />
              <View style={{ position: "absolute", bottom: "30%" }}>
                <Text style={styles.text}>{uploadErrorNoticeText}</Text>
              </View>
            </View>
          )}

          {uploadProgress < 1 && hasImage && !success && !error && (
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
                title={tryAgainButtonTitle}
                // eslint-disable-next-line no-unused-vars
                onPress={() => setSubmitLoading((submitLoading) => false)}
              />
            </View>
          )}
        </View>
      </Modal>
    </View>
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
  commonField_Text: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#b6b6b6",
    borderRadius: 3,
    paddingHorizontal: 5,
    minHeight: 32,
  },

  contactTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    paddingHorizontal: "3%",
  },
  container: {
    marginBottom: screenHeight * 0.1,
    backgroundColor: COLORS.white,
  },
  errorMessage: {
    color: COLORS.red,
    fontSize: 12,
  },
  errorWrap: {
    minHeight: 17,
  },
  iconWrap: {
    height: 25,
    width: 25,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
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
  imageInputLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text_dark,
    marginLeft: 10,
  },
  imageInputTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: "3%",
  },
  imageInputWrap: {
    marginBottom: 15,
  },
  inputWrap: {
    paddingHorizontal: "3%",
    width: "100%",
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
  locationPrimaryPicker: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 3,
    height: 32,
  },
  metaField: {
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
    minHeight: screenHeight / 6.5,
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
  paraTitle: {
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 5,
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
    borderColor: "#b6b6b6",
    borderRadius: 3,
    height: 32,
  },
  required: {
    color: "#ff6600",
  },
  separator: {
    width: "94%",
    marginVertical: 20,
    marginHorizontal: "3%",
  },
  submitButton: {
    width: "100%",
    borderRadius: 3,
    marginTop: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text_dark,
    marginLeft: 10,
  },
  titleWrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: "3%",
  },
  tnCClose: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    height: screenHeight / 20,
  },
  tnCCloseText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "bold",
  },
  tncModal: {
    backgroundColor: COLORS.white,
    flex: 1,
    alignItems: "center",
  },
  tnCModalContent: {
    marginHorizontal: "3%",
    marginBottom: screenHeight / 20,
  },
  tnCModalText: {
    color: COLORS.text_dark,
    fontSize: 15,
  },
  tncParaWrap: {
    marginBottom: 20,
  },
  tncText: {
    color: "#ff6600",
  },
  tnCToggle: {
    flexDirection: "row",
    paddingHorizontal: screenWidth * 0.03,
    alignItems: "center",
    marginVertical: 10,
  },
  tnCToggleText: {
    paddingLeft: 5,
  },
});

export default ListingForm;
