/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
  Linking,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import ListingHeader from "../components/ListingHeader";
import { COLORS } from "../variables/color";
import AppSeparator from "../components/AppSeparator";
import SimilarAdFlatList from "../components/SimilarAdFlatList";
import SellerContact from "../components/SellerContact";
import Constants from "expo-constants";
import { useStateValue } from "../StateProvider";
import api, { setAuthToken, removeAuthToken } from "../api/client";
import moment from "moment";
import ReadMore from "react-native-read-more-text";
import { getPrice, decodeString } from "../helper/helper";
import ReactNativeZoomableView from '@openspacelabs/react-native-zoomable-view/src/ReactNativeZoomableView';
import Badge from "../components/Badge";

const { width: windowWidth, height: windowHeight } = Dimensions.get("window");
const { height: screenHeight } = Dimensions.get("screen");

const loadingText = "Getting listing data";
const soldOutMessage = "Sold out";

const ios = Platform.OS === "ios";
const ListingDetailScreen = ({ route, navigation }) => {
  const [{ user, auth_token, config }] = useStateValue();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [listingData, setListingData] = useState();
  const [loading, setLoading] = useState(true);
  const [favoriteDisabled, setFavoriteDisabled] = useState(false);
  const [imageViewer, setImageViewer] = useState(false);
  const [viewingImage, setViewingImage] = useState();
  const [mapType, setMapType] = useState("standard");

  // get listing data
  useEffect(() => {
    setAuthToken(auth_token);
    api.get(`/listings/${route.params.listingId}`).then((res) => {
      if (res.ok) {
        setListingData(res.data);
        removeAuthToken();
        setLoading(false);
      } else {
        // print error
        // TODO handle error
        removeAuthToken();
        setLoading(false);
      }
    });
  }, []);

  const handleCall = (number) => {
    setModalVisible(false);
    let phoneNumber = "";
    if (ios) {
      phoneNumber = `telprompt:${number}`;
    } else {
      phoneNumber = `tel:${number}`;
    }
    Linking.openURL(phoneNumber);
  };
  const handleScroll = (e) => {
    setCurrentSlide(Math.round(e.nativeEvent.contentOffset.x / windowWidth));
  };
  const handleChatLoginAlert = () => {
    Alert.alert(
      "",
      "Please login to chat with this seller",
      [
        {
          text: "Cancel",
        },
        { text: "Log in", onPress: () => navigation.navigate("Log In") },
      ],
      { cancelable: false }
    );
  };
  const handleEmailLoginAlert = () => {
    Alert.alert(
      "",
      "Please login to send mail to seller",
      [
        {
          text: "Cancel",
        },
        { text: "Log in", onPress: () => navigation.navigate("Log In") },
      ],
      { cancelable: false }
    );
  };
  const getLocation = (locations) => {
    return decodeString(locations.map((item) => item.name).join(", "));
  };
  const getPriceType = (priceType) => {
    if (priceType === "fixed") {
      return "Fixed";
    } else if (priceType === "on_call") {
      return "On Call";
    } else {
      return "Negotiable";
    }
  };
  const handleFavourite = () => {
    setFavoriteDisabled((favoriteDisabled) => true);
    setAuthToken(auth_token);
    api
      .post("my/favourites", { listing_id: listingData.listing_id })
      .then((res) => {
        if (res.ok) {
          const newListingData = { ...listingData };
          newListingData.is_favourite = res.data.includes(
            listingData.listing_id
          );
          setListingData(newListingData);
          setFavoriteDisabled((favoriteDisabled) => false);
          removeAuthToken();
        } else {
          // print error
          // TODO handle error
          setFavoriteDisabled((favoriteDisabled) => false);
          removeAuthToken();
          // setLoading(false);
        }
      });
  };
  const renderTruncatedFooter = (handleDescriptionToggle) => {
    return (
      <Text
        style={{
          color: COLORS.text_gray,
          marginTop: 10,
          fontWeight: "bold",
          textAlign: "center",
        }}
        onPress={handleDescriptionToggle}
      >
        Show more
      </Text>
    );
  };
  const renderRevealedFooter = (handleDescriptionToggle) => {
    return (
      <Text
        style={{
          color: COLORS.text_gray,
          marginTop: 10,
          fontWeight: "bold",
          textAlign: "center",
        }}
        onPress={handleDescriptionToggle}
      >
        Show less
      </Text>
    );
  };
  const handleChat = () => {
    const data = {
      id: listingData.listing_id,
      title: listingData.title,
      images: listingData.images,
      category: listingData.categories,
      location: listingData.contact.locations,
    };
    user !== null && user.id !== listingData.author_id
      ? navigation.navigate("Chat", { listing: data, from: "listing" })
      : handleChatLoginAlert();
  };

  const handleEmail = () => {
    const data = {
      id: listingData.listing_id,
      title: listingData.title,
      images: listingData.images,
      category: listingData.categories,
      location: listingData.contact.locations,
    };
    user !== null && user.id !== listingData.author_id
      ? navigation.navigate("Email Seller", { listing: data })
      : handleEmailLoginAlert();
  };

  const getCheckboxValue = (field) => {
    let checkBoxValue = "";

    field.value.map((value) => {
      if (checkBoxValue.length) {
        checkBoxValue =
          checkBoxValue +
          ", " +
          field.options.choices.filter((choice) => choice.id === value)[0].name;
      } else {
        checkBoxValue =
          checkBoxValue +
          field.options.choices.filter((choice) => choice.id === value)[0].name;
      }
    });
    return decodeString(checkBoxValue);
  };

  const getSellerName = () => {
    if (!!listingData.author.first_name || !!listingData.author.last_name) {
      return listingData.author.first_name + " " + listingData.author.last_name;
    } else {
      return listingData.author.username;
    }
  };

  const handleImageZoomView = (image) => {
    setViewingImage(image);
    setTimeout(() => {
      setImageViewer(true);
    }, 20);
  };

  const handleImageViewerClose = () => {
    setImageViewer((prevImageViewer) => false);
  };

  const getRangeField = (field) => {
    if (!!field.value.start || !!field.value.end) {
      return true;
    } else return false;
  };

  return (
    <>
      {!imageViewer && (
        <ListingHeader
          title="Details"
          onBack={() => navigation.goBack()}
          onFavorite={handleFavourite}
          author={listingData ? listingData.author_id : null}
          is_favourite={listingData ? listingData.is_favourite : null}
          favoriteDisabled={favoriteDisabled}
          style={{ position: "relative" }}
        />
      )}
      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.text}>{loadingText}</Text>
        </View>
      )}
      {!loading && (
        <>
          <View
            style={{
              backgroundColor: COLORS.white,
              height:
                (user === null || user.id !== listingData.author_id) &&
                listingData.contact
                  ? screenHeight - 50 - 60 - Constants.statusBarHeight
                  : screenHeight - 50 - Constants.statusBarHeight,
            }}
          >
            {/* main scrollview */}
            <ScrollView contentContainerStyle={styles.container}>
              {!!listingData.images.length && (
                //image slider
                <View style={styles.imageSlider}>
                  <ScrollView
                    horizontal
                    pagingEnabled
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    showsHorizontalScrollIndicator={false}
                  >
                    {listingData.images.map((image) => (
                      <TouchableWithoutFeedback
                        style={styles.to}
                        key={image.ID}
                        onPress={() => handleImageZoomView(image)}
                      >
                        <Image
                          style={{
                            width: windowWidth,
                            height: 300,
                            resizeMode: "contain",
                          }}
                          source={{
                            uri: image.sizes.full.src,
                          }}
                        />
                      </TouchableWithoutFeedback>
                    ))}
                  </ScrollView>

                  {listingData.images.length > 1 && (
                    <Text style={styles.scrollProgress}>
                      {currentSlide + 1}/ {listingData.images.length}
                    </Text>
                  )}
                </View>
              )}

              {/* title, location, date */}
              <View style={[styles.bgWhite_W100_PH3, { overflow: "hidden" }]}>
                <Text style={styles.listingTitle}>
                  {decodeString(listingData.title)}
                </Text>
                {listingData.badges.includes("is-sold") && (
                  <View
                    style={[
                      styles.soldOutBadge,
                      listingData.badges.length == 1 &&
                      listingData.badges.includes("is-sold")
                        ? {
                            top: ios ? "20%" : "20%",
                            left: ios ? "84%" : "84%",
                            width: ios ? "30%" : "30%",
                          }
                        : {
                            top: ios ? "21%" : "15%",
                            left: ios ? "77%" : "78%",
                            width: ios ? "40%" : "40%",
                          },
                    ]}
                  >
                    <Text style={styles.soldOutMessage}>{soldOutMessage}</Text>
                  </View>
                )}
                {listingData.badges.length > 0 && (
                  <View style={styles.badgeSection}>
                    {listingData.badges.map((_badge) => (
                      <Badge badgeName={_badge} key={_badge} />
                    ))}
                  </View>
                )}
                {/*TODO location type check and render geo or locallocation conditionally */}
                {!!listingData.contact.locations.length && (
                  <View style={[styles.locationData, styles.flexRow]}>
                    <View style={styles.listingLocationAndTimeIconContainer}>
                      <FontAwesome5
                        name="map-marker-alt"
                        size={15}
                        color={COLORS.text_gray}
                      />
                    </View>
                    <Text style={styles.listingLocationAndTimeText}>
                      {getLocation(listingData.contact.locations)}
                    </Text>
                  </View>
                )}
                <View style={[styles.listingTimeData, styles.flexRow]}>
                  <View style={styles.listingLocationAndTimeIconContainer}>
                    <FontAwesome5
                      name="clock"
                      size={15}
                      color={COLORS.text_gray}
                    />
                  </View>
                  <Text style={styles.listingLocationAndTimeText}>
                    Posted on {listingData.created_at}
                  </Text>
                </View>
              </View>
              <View style={styles.screenSeparatorWrap}>
                <AppSeparator style={styles.screenSeparator} />
              </View>
              {/* price & seller */}
              <View style={styles.bgWhite_W100_PH3}>
                <View style={styles.sellerInfo}>
                  <View style={styles.sellerIcon}>
                    <FontAwesome name="user" size={18} color={COLORS.gray} />
                  </View>
                  <Text style={styles.sellerWrap}>
                    For Sale by{"  "}
                    <Text style={styles.sellerName}>{getSellerName()}</Text>
                  </Text>
                </View>
                <View style={styles.listingPriceWrap}>
                  <View style={styles.priceTag}>
                    <Text style={styles.listingPrice}>
                      {getPrice(
                        config.currency,
                        listingData.price_type,
                        listingData.price
                      )}
                    </Text>
                    <View
                      style={{
                        height: 0,
                        width: 0,
                        borderTopWidth: 30,
                        borderTopColor: "transparent",
                        borderBottomWidth: 30,
                        borderBottomColor: "transparent",
                        borderRightWidth: 30,
                        borderRightColor: COLORS.white,
                        position: "absolute",
                        right: -5,
                      }}
                    />
                  </View>

                  {listingData.price_type !== "on_call" && (
                    <Text style={styles.listingPricenegotiable}>
                      {getPriceType(listingData.price_type)}
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.screenSeparatorWrap}>
                <AppSeparator style={styles.screenSeparator} />
              </View>
              {/* custom fields & description */}
              {(!!listingData.custom_fields.length ||
                !!listingData.description) && (
                <>
                  <View style={styles.bgWhite_W100_PH3}>
                    {!!listingData.custom_fields.length && (
                      <View
                        style={[
                          styles.listingCustomInfoWrap,
                          { marginTop: -3 },
                        ]}
                      >
                        {listingData.custom_fields.map((field, index) => (
                          <View key={index}>
                            {["text", "textarea"].includes(field.type) &&
                              !!field.value && (
                                <View style={styles.customfield}>
                                  <Text style={styles.customfieldName}>
                                    {decodeString(field.label)}
                                  </Text>
                                  <Text style={styles.customfieldValue}>
                                    {decodeString(field.value)}
                                  </Text>
                                </View>
                              )}
                            {["url", "number"].includes(field.type) &&
                              !!field.value && (
                                <View style={styles.customfield}>
                                  <Text style={styles.customfieldName}>
                                    {decodeString(field.label)}
                                  </Text>
                                  <Text style={styles.customfieldValue}>
                                    {field.value}
                                  </Text>
                                </View>
                              )}
                            {["radio", "select"].includes(field.type) &&
                              !!field.value &&
                              !!field.options.choices.filter(
                                (choice) => choice.id === field.value
                              ).length && (
                                <View style={styles.customfield}>
                                  <Text style={styles.customfieldName}>
                                    {decodeString(field.label)}
                                  </Text>
                                  <Text style={styles.customfieldValue}>
                                    {decodeString(
                                      field.options.choices.filter(
                                        (choice) => choice.id === field.value
                                      )[0].name
                                    )}
                                  </Text>
                                </View>
                              )}
                            {field.type === "checkbox" && !!field.value.length && (
                              <View style={styles.customfield}>
                                <Text style={styles.customfieldName}>
                                  {decodeString(field.label)}
                                </Text>
                                <Text style={styles.customfieldValue}>
                                  {getCheckboxValue(field)}
                                </Text>
                              </View>
                            )}
                            {field.type === "date" && !!field.value && (
                              <View style={styles.customfield}>
                                {["date", "date_time"].includes(
                                  field.date.type
                                ) && (
                                  <Text style={styles.customfieldName}>
                                    {decodeString(field.label)}
                                  </Text>
                                )}
                                {["date_range", "date_time_range"].includes(
                                  field.date.type
                                ) &&
                                  getRangeField(field) && (
                                    <Text style={styles.customfieldName}>
                                      {decodeString(field.label)}
                                    </Text>
                                  )}
                                {field.date.type === "date" && (
                                  <Text style={styles.customfieldValue}>
                                    {field.value}
                                  </Text>
                                )}
                                {field.date.type === "date_time" && (
                                  <Text style={styles.customfieldValue}>
                                    {field.value}
                                  </Text>
                                )}
                                {field.date.type === "date_range" &&
                                  getRangeField(field) && (
                                    <Text style={styles.customfieldValue}>
                                      {"Start : " +
                                        field.value.start +
                                        "\n" +
                                        "End : " +
                                        field.value.end}
                                    </Text>
                                  )}
                                {field.date.type === "date_time_range" &&
                                  getRangeField(field) && (
                                    <Text style={styles.customfieldValue}>
                                      {"Start : " +
                                        field.value.start +
                                        "\n" +
                                        "End : " +
                                        field.value.end}
                                    </Text>
                                  )}
                              </View>
                            )}
                          </View>
                        ))}
                      </View>
                    )}
                    {!!listingData.custom_fields.length &&
                      !!listingData.description && (
                        <View
                          style={{
                            width: "100%",
                            height: 10,
                          }}
                        ></View>
                      )}
                    {!!listingData.description && (
                      <View
                        style={[
                          styles.listingDescriptionWrap,
                          {
                            marginTop: !listingData.custom_fields.length
                              ? -7
                              : 0,
                          },
                        ]}
                      >
                        <Text style={styles.descriptionTitle}>Description</Text>
                        <View
                          style={{
                            backgroundColor: COLORS.bg_light,
                            borderRadius: 5,
                            paddingHorizontal: 10,
                            borderWidth: 1,
                            borderColor: COLORS.bg_dark,
                            paddingVertical: 5,
                          }}
                        >
                          <ReadMore
                            numberOfLines={3}
                            renderTruncatedFooter={renderTruncatedFooter}
                            renderRevealedFooter={renderRevealedFooter}
                          >
                            <Text style={styles.cardText}>
                              {decodeString(listingData.description).trim()}
                            </Text>
                          </ReadMore>
                        </View>
                      </View>
                    )}
                  </View>
                  <View style={styles.screenSeparatorWrap}>
                    <AppSeparator style={styles.screenSeparator} />
                  </View>
                </>
              )}

              {/* Report ad */}
              {user !== null && user.id !== listingData.author_id && (
                <View
                  style={[styles.bgWhite_W100_PH3, { alignItems: "center" }]}
                >
                  <TouchableWithoutFeedback
                    onPress={() =>
                      navigation.navigate("Report", {
                        listingId: listingData.listing_id,
                        listingTitle: listingData.title,
                      })
                    }
                  >
                    <View style={styles.reportWrap}>
                      <FontAwesome5
                        name="ban"
                        size={16}
                        color={COLORS.text_gray}
                      />
                      <Text style={styles.reportText}>Report This Ad</Text>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              )}
              {/* Similar Ads */}
              {(user === null || user.id !== listingData.author_id) &&
                listingData.related.length > 0 && (
                  <View style={styles.similarAddWrap}>
                    <View
                      style={[
                        styles.similarAddTitleWrap,
                        { paddingTop: user === null ? 15 : 0 },
                      ]}
                    >
                      <Text style={styles.similarAddTitle}>Similar Ads</Text>
                    </View>
                    <View
                      style={{
                        paddingHorizontal: "3%",
                        width: "100%",
                        marginVertical: 5,
                      }}
                    >
                      {listingData.related.map((similar) => (
                        <SimilarAdFlatList
                          key={similar.listing_id}
                          category={
                            similar.categories.length
                              ? similar.categories[0].name
                              : null
                          }
                          time={moment(similar.created_at).fromNow()}
                          title={similar.title}
                          url={
                            similar.images.length
                              ? similar.images[0].sizes.thumbnail.src
                              : null
                          }
                          views={similar.view_count}
                          id={similar.listing_id}
                          price={similar.price}
                          price_type={similar.price_type}
                          onClick={() => {
                            navigation.push("Listing Detail", {
                              listingId: similar.listing_id,
                            });
                          }}
                        />
                      ))}
                    </View>
                  </View>
                )}

              {/* Call prompt */}
              <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
              >
                <TouchableWithoutFeedback
                  onPress={() => setModalVisible(false)}
                >
                  <View style={styles.modalOverlay} />
                </TouchableWithoutFeedback>
                <View
                  style={{
                    flex: 1,
                    justifyContent: "flex-end",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      paddingHorizontal: "3%",
                      padding: 20,
                      backgroundColor: COLORS.white,
                      width: "100%",
                    }}
                  >
                    <Text style={styles.callText}>
                      Call {listingData.author.first_name}{" "}
                      {listingData.author.last_name}?
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleCall(listingData.contact.phone)}
                      style={styles.phone}
                    >
                      <Text style={styles.phoneText}>
                        {listingData.contact.phone}
                      </Text>
                      <FontAwesome5
                        name="phone"
                        size={18}
                        color={COLORS.primary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </ScrollView>
          </View>
          {/*  Seller contact  */}
          {(user === null || user.id !== listingData.author_id) &&
            listingData.contact && (
              <SellerContact
                phone={
                  !!listingData.contact.phone &&
                  listingData.contact.phone.length > 0
                }
                email={
                  !!listingData.contact.email &&
                  listingData.contact.email.length > 0
                }
                onCall={() => setModalVisible(true)}
                onChat={handleChat}
                onEmail={handleEmail}
              />
            )}
        </>
      )}
      {imageViewer && (
        <View style={styles.imageViewerWrap}>
          <TouchableOpacity
            style={styles.imageViewerCloseButton}
            onPress={handleImageViewerClose}
          >
            <FontAwesome5 name="times" size={24} color="black" />
          </TouchableOpacity>

          <View style={styles.imageViewer}>
            <ReactNativeZoomableView
              maxZoom={2}
              minZoom={1}
              zoomStep={0.5}
              initialZoom={1}
              bindToBorders={true}
              style={{
                padding: 10,
                backgroundColor: COLORS.black,
              }}
            >
              <Image
                style={{
                  width: windowWidth,
                  height: windowHeight,
                  resizeMode: "contain",
                }}
                source={{
                  uri: viewingImage.sizes.full.src,
                }}
              />
            </ReactNativeZoomableView>
          </View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  badgeSection: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  bgWhite_W100_PH3: {
    backgroundColor: COLORS.white,
    paddingHorizontal: "3%",
    width: "100%",
    paddingVertical: 20,
  },
  callText: {
    fontSize: 20,
    color: COLORS.text_dark,
    textAlign: "center",
  },
  cardText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: "justify",
    color: COLORS.gray,
  },
  container: {
    alignItems: "center",
    backgroundColor: COLORS.bg_dark,
  },
  customfield: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 10,
  },
  customfieldName: {
    width: "37%",
    fontWeight: "bold",
    fontSize: 13,
  },
  customfieldValue: {
    width: "57%",
    fontWeight: "bold",
    fontSize: 13,
    color: COLORS.text_gray,
  },
  descriptionText: {
    color: COLORS.text_gray,
    textAlign: "justify",
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text_dark,
    paddingBottom: 10,
  },
  flexRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  imageSlider: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 15,
  },
  imageViewer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageViewerCloseButton: {
    position: "absolute",
    right: 15,
    top: 15,
    zIndex: 10,
    height: 25,
    width: 25,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
  },
  imageViewerWrap: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    width: "100%",
    height: "100%",
    flex: 1,
  },
  locationData: {
    marginBottom: 10,
  },

  listingDescriptionWrap: {},
  listingLocationAndTimeText: {
    fontSize: 15,
    color: COLORS.text_gray,
  },
  listingLocationAndTimeIconContainer: {
    alignItems: "flex-start",
    width: 25,
  },
  listingPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.white,
  },
  listingPricenegotiable: {
    color: COLORS.text_gray,
    fontSize: 15,
    fontWeight: "bold",
  },
  listingPriceWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    paddingVertical: 5,
  },
  listingTitle: {
    color: COLORS.text_dark,
    fontSize: 20,
    fontWeight: "bold",
    paddingBottom: 10,
    marginTop: -5,
  },

  listingPriceAndOwnerWrap: {},
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
  mapViewButtonsWrap: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    top: 5,
    right: 10,
    zIndex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 5,
  },
  mapViewButton: {
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 5,
  },
  mapViewButtonTitle: {
    textTransform: "capitalize",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  phone: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  phoneText: {
    color: COLORS.primary,
    fontWeight: "bold",
    fontSize: 18,
  },
  priceTag: {
    backgroundColor: COLORS.primary,
    left: -(windowWidth * 0.031),
    paddingLeft: windowWidth * 0.031,
    paddingVertical: 10,
    paddingRight: 30,
    flexDirection: "row",
    alignItems: "center",
  },
  reportText: {
    fontSize: 16,
    color: COLORS.text_gray,
    paddingLeft: 5,
  },
  reportWrap: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#d4cfcf",
    borderRadius: 5,
    paddingHorizontal: 20,
  },
  screenSeparator: {
    width: "94%",
  },
  screenSeparatorWrap: {
    width: "100%",
    alignItems: "center",
    backgroundColor: COLORS.white,
  },
  scrollProgress: {
    padding: 5,
    borderRadius: 3,
    backgroundColor: "rgba(0, 0, 0, .3)",
    fontWeight: "bold",
    color: COLORS.white,
    position: "absolute",
    right: "3%",
    bottom: "3%",
  },
  sellerIcon: {
    height: 16,
    width: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    overflow: "hidden",
  },
  sellerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  sellerName: {
    fontWeight: "bold",
    color: COLORS.text_dark,
  },
  sellerWrap: {
    color: COLORS.text_gray,
    marginLeft: 5,
  },
  showMore: {
    color: COLORS.text_gray,
    paddingRight: 5,
  },
  showMoreWrap: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 10,
  },
  similarAddTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  similarAddTitleWrap: {
    paddingHorizontal: "3%",
    backgroundColor: COLORS.white,

    paddingBottom: 10,
  },
  similarAddWrap: {
    backgroundColor: COLORS.white,
  },
  soldOutBadge: {
    position: "absolute",
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,

    transform: [{ rotate: "45deg" }],
  },
  soldOutMessage: {
    color: COLORS.white,
    textTransform: "uppercase",
    fontWeight: "bold",
  },
});

export default ListingDetailScreen;
