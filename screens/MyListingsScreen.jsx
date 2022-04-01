/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Linking,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
} from "react-native";
import MyAdsFlatList from "../components/MyAdsFlatList";
import { useStateValue } from "../StateProvider";
import { COLORS } from "../variables/color";
import { FontAwesome } from "@expo/vector-icons";
import AppButton from "../components/AppButton";
import api, { setAuthToken, removeAuthToken } from "../api/client";
import LoadingIndicator from "../components/LoadingIndicator";
import FlashNotification from "../components/FlashNotification";
import { FontAwesome5 } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { decodeString } from "../helper/helper";
import Constants from "expo-constants";

const { height: windowHeight, width: windowWidth } = Dimensions.get("window");
const extraHeight = 50 + Constants.statusBarHeight;
const deletePromptMessage = "Do You want to delete";
const editPromptMessage = "Do You want to edit";
const promotePromptMessage = "Do You want to promote";
const soldPromptMessage = "Do You want to mark";
const cancelButtonTitle = "Cancel";
const deleteButtonTitle = "Delete";
const editButtonTitle = "Edit";
const promoteButtonTitle = "Promote";
const noAdTitle = "Currently you don't have any ad!";
const postAdButtonTitle = "Create new ad!";
const loadingMessage = "Getting user's ad";
const myListingInitialPagination = { per_page: 20, page: 1 };
const listingDeleteSuccessText = "Successfully deleted";
const listingDeleteErrorText = "Error! Please try again";
const actionMenuButtons = {
  edit: "Edit",
  delete: "Delete",
  promote: "Promote",
  sold: "Mark as sold",
  unsold: "Mark as unsold",
};

const promoteLink = "https://radiustheme.com/";

const MyListingsScreen = ({ navigation }) => {
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState();
  const [actionItem, setActionItem] = useState();
  const [actionPosition, setActionPosition] = useState();
  const [actionMenuVisible, setActionMenuVisible] = useState(false);
  const [{ auth_token, is_connected, config }, dispatch] = useStateValue();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [moreLoading, setMoreLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(
    pagination.page || myListingInitialPagination.page
  );
  const [flashNotification, setFlashNotification] = useState(false);
  const [flashNotificationMessage, setFlashNotificationMessage] = useState();

  // Initial get listing call
  useEffect(() => {
    handleLoadAdsList(myListingInitialPagination);
  }, []);

  // Refreshing get listing call
  useEffect(() => {
    if (!refreshing) return;
    setCurrentPage((prevCurrentPage) => 1);
    setPagination({});
    handleLoadAdsList(myListingInitialPagination);
  }, [refreshing]);

  // next page get listing call
  useEffect(() => {
    if (!moreLoading) return;
    const data = {
      per_page: myListingInitialPagination.per_page,
      page: currentPage,
    };
    handleLoadAdsList(data);
  }, [moreLoading]);

  const handleLoadAdsList = (arg) => {
    setAuthToken(auth_token);
    api.get("my/listings", arg).then((res) => {
      if (res.ok) {
        if (refreshing) {
          setRefreshing(false);
        }
        if (moreLoading) {
          setMyListings((prevMyListings) => [
            ...prevMyListings,
            ...res.data.data,
          ]);
          setMoreLoading(false);
        } else {
          setMyListings(res.data.data);
        }
        setPagination(res.data.pagination ? res.data.pagination : {});
        removeAuthToken();
        if (loading) {
          setLoading(false);
        }
      } else {
        // TODO handle error
        if (refreshing) {
          setRefreshing((prevRefreshing) => false);
        }
        setErrorMessage((errorMessage) => "Error getting data from server");
        if (moreLoading) {
          setMoreLoading((prevMoreLoading) => false);
        }
        if (loading) {
          setLoading((loading) => false);
        }
        removeAuthToken();
      }
    });
  };

  const handleDeleteAlert = (listing) => {
    Alert.alert(
      "",
      `${deletePromptMessage} ${decodeString(listing.title)} ?`,
      [
        {
          text: cancelButtonTitle,
        },
        {
          text: deleteButtonTitle,
          onPress: () => handleDeleteListing(listing),
        },
      ],
      { cancelable: false }
    );
  };

  const handleDeleteListing = (listing) => {
    setActionMenuVisible(false);
    setDeleteLoading((deleteLoading) => true);

    setAuthToken(auth_token);
    api
      .delete("my/listings", { listing_id: listing.listing_id })
      .then((res) => {
        if (res.ok) {
          const filtered = myListings.filter(
            (item) => item.listing_id != listing.listing_id
          );
          setMyListings((prevMyListings) => filtered);
          removeAuthToken();
          setDeleteLoading((deleteLoading) => false);
          handleSuccess(listingDeleteSuccessText);
        } else {
          // TODO handle error
          // setErrorMessage((errorMessage) => res.data.error_message?res.data.error_message:listingDeleteErrorText);
          setDeleteLoading((deleteLoading) => false);
          removeAuthToken();
          handleError(
            res.data.error_message
              ? res.data.error_message
              : listingDeleteErrorText
          );
        }
      });
  };

  const handleEditAlert = (listing) => {
    Alert.alert(
      "",
      `${editPromptMessage} ${decodeString(listing.title)} ?`,
      [
        {
          text: cancelButtonTitle,
        },
        {
          text: editButtonTitle,
          onPress: () => handleEditListing(listing),
        },
      ],
      { cancelable: false }
    );
  };

  const handleEditListing = (listing) => {
    setActionMenuVisible(false);
    navigation.navigate("Edit Listing", {
      item: listing,
    });
  };
  const handlePromoteAlert = (listing) => {
    Alert.alert(
      "",
      `${promotePromptMessage} ${decodeString(listing.title)} ?`,
      [
        {
          text: cancelButtonTitle,
        },
        {
          text: promoteButtonTitle,
        //  onPress: () => handlePromoteListing(listing),
        },
      ],
      { cancelable: false }
    );
  };

  const handlePromoteListing = (listing) => {
    setActionMenuVisible(false);
   // Linking.openURL(promoteLink);
  };

  const handleSoldAlert = (listing) => {
    Alert.alert(
      "",
      `${soldPromptMessage} ${decodeString(listing.title)} ${
        listing.badges.includes("is-sold") ? "as unsold" : "as sold"
      } ?`,
      [
        {
          text: cancelButtonTitle,
        },
        {
          text: "Ok",
          onPress: () => handleSoldMarking(listing),
        },
      ],
      { cancelable: false }
    );
  };

  const handleSoldMarking = (item) => {
    setActionMenuVisible((prevActionMenuVisible) => false);
    setDeleteLoading(true);
    setAuthToken(auth_token);
    //send arg in api call
    api.post("my/mark-as-sold", { listing_id: item.listing_id }).then((res) => {
      if (res.ok) {
        removeAuthToken();
        updateVisualFlatListItemSoldStatus(res.data.action);
        setDeleteLoading(false);
      } else {
        // TODO handle error

        setErrorMessage((errorMessage) => "Error getting data from server");

        removeAuthToken();
        setDeleteLoading(false);
      }
    });
  };

  const updateVisualFlatListItemSoldStatus = (action) => {
    const data = [...myListings];
    const tempMyListings = data.map((_listing) => {
      if (_listing.listing_id == actionItem.listing_id) {
        let _item = { ...actionItem };
        if (action === "unsold") {
          _item.badges = _item.badges.filter((_i) => _i !== "is-sold");
        } else {
          _item.badges.push("is-sold");
        }
        return _item;
      } else {
        return _listing;
      }
    });
    setMyListings(tempMyListings);
    setActionItem();
  };
  const handleViewListing = (listing) => {
    navigation.navigate("Listing Detail", {
      listingId: listing.listing_id,
    });
  };

  const onRefresh = () => {
    if (moreLoading) return;
    setRefreshing((prevRefreshing) => true);
  };

  const handleSetActionPosition = (urg) => {
    setActionPosition({
      actionX: urg.nativeEvent.pageX,
      actionY: urg.nativeEvent.pageY,
    });
  };

  const renderListingItem = useCallback(
    ({ item }) => (
      <MyAdsFlatList
        item={item}
        onClick={() => handleViewListing(item)}
        onAction={() => handleActionButtonPress(item)}
        onActionTouch={handleSetActionPosition}
      />
    ),
    [myListings]
  );

  const keyExtractor = (item) => `${item.listing_id}`;

  const handleNewListing = () => {
    navigation.navigate("New Listing");
    dispatch({
      type: "SET_NEW_LISTING_SCREEN",
      newListingScreen: true,
    });
  };
  const handleMembership = () => {
    //   navigation.navigate('HomeNavigator', {
    //     screen: 'MyMembershipScreen',
    //  });
  
    navigation.navigate('Membership')
  
    };
    
  const listFooter = () => {
    if (pagination && pagination.total_pages > pagination.current_page) {
      return (
        <View style={styles.loadMoreWrap}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      );
    } else {
      return null;
    }
  };

  const handleNextPageLoading = () => {
    if (refreshing) return;
    if (pagination && pagination.total_pages > pagination.current_page) {
      setCurrentPage((prevCurrentPage) => prevCurrentPage + 1);
      setMoreLoading((prevMoreLoading) => true);
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

  const handleActionButtonPress = (listing) => {
    setActionItem(listing);
    setActionMenuVisible(true);
  };

  const handleActionOverlayPress = () => {
    setActionMenuVisible(false);
    setActionItem();
  };

  return is_connected ? (
    <>
      {loading ? (
        <View style={styles.loadingWrap}>
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingMessage}>{loadingMessage}</Text>
          </View>
        </View>
      ) : (
        <>
          {!!deleteLoading && (
            <View style={styles.deleteLoading}>
              <View style={styles.deleteLoadingContentWrap}>
                <LoadingIndicator
                  visible={true}
                  style={{
                    width: "100%",
                    marginLeft: "3.125%",
                  }}
                />
              </View>
            </View>
          )}

          {actionMenuVisible && (
            <TouchableWithoutFeedback onPress={handleActionOverlayPress}>
              <View style={styles.actionLoading}>
                <View
                  style={[
                    styles.actionMenu,
                    windowHeight - actionPosition.actionY >= 130
                      ? {
                          right: "15%",
                          top: actionPosition.actionY - extraHeight,
                        }
                      : {
                          right: "15%",
                          bottom: windowHeight - actionPosition.actionY,
                        },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => handleEditAlert(actionItem)}
                  >
                    <View style={styles.buttonIconWrap}>
                      <FontAwesome
                        name="edit"
                        size={18}
                        color={COLORS.primary}
                      />
                    </View>
                    <Text
                      style={[styles.buttonText, { color: COLORS.primary }]}
                    >
                      {actionMenuButtons.edit}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => handlePromoteAlert(actionItem)}
                  >
                    <View style={styles.buttonIconWrap}>
                      <FontAwesome
                        name="bullhorn"
                        size={18}
                        color={COLORS.dodgerblue}
                      />
                    </View>
                    <Text
                      style={[styles.buttonText, { color: COLORS.dodgerblue }]}
                    >
                      {actionMenuButtons.promote}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.iconButton}
                   // onPress={() => handleDeleteAlert(actionItem)}
                  >
                    <View style={styles.buttonIconWrap}>
                      <FontAwesome
                        name="trash-o"
                        size={18}
                        color={COLORS.red}
                      />
                    </View>
                    <Text style={[styles.buttonText, { color: COLORS.red }]}>
                      {actionMenuButtons.delete}
                    </Text>
                  </TouchableOpacity>
                  {config.mark_as_sold && (
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => handleSoldAlert(actionItem)}
                    >
                      <View style={styles.buttonIconWrap}>
                        <Entypo
                          name="back-in-time"
                          size={18}
                          color={COLORS.primary}
                        />
                      </View>
                      <Text
                        style={[styles.buttonText, { color: COLORS.primary }]}
                      >
                        {actionItem.badges.includes("is-sold")
                          ? actionMenuButtons.unsold
                          : actionMenuButtons.sold}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </TouchableWithoutFeedback>
          )}

          {!!myListings.length && !loading && (
            <View
              style={{
                flex: 1,
                backgroundColor: COLORS.white,
                paddingHorizontal: "3%",
              }}
            >
              <FlatList
                data={myListings}
                renderItem={renderListingItem}
                keyExtractor={keyExtractor}
                horizontal={false}
                onEndReached={handleNextPageLoading}
                onEndReachedThreshold={0.2}
                ListFooterComponent={listFooter}
                maxToRenderPerBatch={14}
                onRefresh={onRefresh}
                refreshing={refreshing}
                contentContainerStyle={{
                  paddingVertical: 5,
                }}
              />
            </View>
          )}

          {!myListings.length && (
            <View style={styles.noAdWrap}>
              <FontAwesome
                name="exclamation-triangle"
                size={100}
                color={COLORS.gray}
              />
              <Text style={styles.noAdTitle}>{noAdTitle}</Text>
              <AppButton
                title={postAdButtonTitle}
                style={styles.postButton}
                onPress={handleNewListing}
              />
            </View>
          )}
          <FlashNotification
            falshShow={flashNotification}
            flashMessage={flashNotificationMessage}
          />
        </>
      )}
    </>
  ) : (
    <View style={styles.noInternet}>
      <FontAwesome5
        name="exclamation-circle"
        size={24}
        color={COLORS.primary}
      />
      <Text style={styles.text}>No internet</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  actionLoading: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    // opacity: 0.8,
    backgroundColor: "rgba(0,0,0,.3)",
    // justifyContent: "center",
    // alignItems: "center",
    zIndex: 5,
    flex: 1,
    height: "100%",
    width: "100%",
  },
  actionMenu: {
    backgroundColor: "#fff",
    borderRadius: 5,
    paddingVertical: 15,
    paddingHorizontal: 15,
    position: "absolute",
  },
  buttonIconWrap: {
    width: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  buttonText: {
    fontWeight: "bold",
  },
  containerNoAds: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {},
  deleteLoading: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    // opacity: 0.8,
    backgroundColor: "rgba(0,0,0,.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
    flex: 1,
    height: "100%",
    width: "100%",
  },
  deleteLoadingContentWrap: {
    // paddingHorizontal: "3%",
    // backgroundColor: COLORS.yellow,
    // flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  iconButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
  },
  loading: {
    // position: "absolute",
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
  loadingWrap: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  noAdTitle: {
    fontSize: 18,
    color: COLORS.text_gray,
  },
  noAdWrap: {
    alignItems: "center",
    marginHorizontal: "3%",
    flex: 1,
    justifyContent: "center",
  },
  noInternet: {
    // marginVertical: 50,
    alignItems: "center",
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  postButton: {
    borderRadius: 3,
    marginTop: 40,
  },
});

export default MyListingsScreen;
