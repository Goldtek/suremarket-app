/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useStateValue } from "../StateProvider";
import { FontAwesome } from "@expo/vector-icons";
import FavoritesFlatList from "../components/FavoritesFlatList";
import AppButton from "../components/AppButton";
import { COLORS } from "../variables/color";
import api, { setAuthToken, removeAuthToken } from "../api/client";
import FlashNotification from "../components/FlashNotification";
import LoadingIndicator from "../components/LoadingIndicator";
import { FontAwesome5 } from "@expo/vector-icons";

const removePromptMessage =
  "Do You want to remove this ad from your favorites?";
const cancelButtonTitle = "Cancel";
const removeButtonTitle = "Remove";
const noFavTitle = "Currently you don't have any favorite ad!";
const postAdButtonTitle = "Post an ad now!";
const loadingMessage = "Getting favorite listings";

const favRemoveSuccessText = "Successfully removed";
const favRemoveErrorText = "Error! Please try again";

const myFavsInitialPagination = { per_page: 20, page: 1 };

const FavoritesScreen = ({ navigation }) => {
  const [{ auth_token, is_connected }, dispatch] = useStateValue();

  const [myFavs, setMyFavs] = useState();
  const [loading, setLoading] = useState(true);
  const [initial, setInitial] = useState(true);
  const [errorMessage, setErrorMessage] = useState();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [moreLoading, setMoreLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(
    pagination.current_page || myFavsInitialPagination.page
  );
  const [flashNotification, setFlashNotification] = useState(false);
  const [flashNotificationMessage, setFlashNotificationMessage] = useState();

  // Initial get listing call
  useEffect(() => {
    if (!initial) return;
    handleLoadFavsList(myFavsInitialPagination);
    setInitial(false);
  }, [initial]);

  // Refresh get listing call
  useEffect(() => {
    if (!refreshing) return;
    setCurrentPage((prevCurrentPage) => 1);
    setPagination({});
    handleLoadFavsList(myFavsInitialPagination);
  }, [refreshing]);

  // next page get listing call
  useEffect(() => {
    if (!moreLoading) return;
    const data = {
      per_page: myFavsInitialPagination.per_page,
      page: currentPage,
    };
    handleLoadFavsList(data);
  }, [moreLoading]);

  const handleLoadFavsList = (data) => {
    setAuthToken(auth_token);
    api.get("my/favourites", data).then((res) => {
      if (res.ok) {
        if (refreshing) {
          setRefreshing((prevRefreshing) => false);
        }
        if (moreLoading) {
          setMyFavs((prevMyFavs) => [...prevMyFavs, ...res.data.data]);
          setMoreLoading((prevMoreLoading) => false);
        } else {
          setMyFavs((prevMyFavs) => res.data.data);
        }
        setPagination(res.data.pagination ? res.data.pagination : {});

        removeAuthToken();
        if (loading) {
          setLoading((loading) => false);
        }
      } else {
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

  const handleRemoveFavAlert = (listing) => {
    Alert.alert(
      "",
      `${removePromptMessage}`,
      [
        {
          text: cancelButtonTitle,

          style: "cancel",
        },
        {
          text: removeButtonTitle,
          onPress: () => handleRemoveFromFavorites(listing),
        },
      ],
      { cancelable: false }
    );
  };
  const handleRemoveFromFavorites = (listing) => {
    setDeleteLoading((deleteLoading) => true);
    setAuthToken(auth_token);
    api
      .post("my/favourites", { listing_id: listing.listing_id })
      .then((res) => {
        if (res.ok) {
          setMyFavs(myFavs.filter((fav) => fav != listing));
          removeAuthToken();
          setDeleteLoading((deleteLoading) => false);
          handleSuccess(favRemoveSuccessText);
        } else {
          setErrorMessage((errorMessage) => "Error getting data from server");
          removeAuthToken();
          setDeleteLoading((deleteLoading) => false);
          handleError(
            res.data.error_message ? res.data.error_message : favRemoveErrorText
          );
        }
      });
  };

  const handleNewListing = () => {
    navigation.navigate("New Listing");
    dispatch({
      type: "SET_NEW_LISTING_SCREEN",
      newListingScreen: true,
    });
  };

  const renderFavsItem = ({ item }) => (
    <FavoritesFlatList
      item={item}
      onDelete={() => handleRemoveFavAlert(item)}
      onClick={() => handleViewListing(item)}
    />
  );

  const handleViewListing = (item) => {
    navigation.navigate("Listing Detail", {
      listingId: item.listing_id,
    });
  };

  const keyExtractor = useCallback((item, index) => `${index}`, []);

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

  const onRefresh = () => {
    if (moreLoading) return;
    setRefreshing((prevRefreshing) => true);
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

          {!!myFavs.length && (
            <View
              style={{
                backgroundColor: COLORS.white,
                flex: 1,
                paddingVertical: 5,
                paddingHorizontal: "3%",
              }}
            >
              <FlatList
                data={myFavs}
                renderItem={renderFavsItem}
                keyExtractor={keyExtractor}
                horizontal={false}
                // showsVerticalScrollIndicator={false}
                onEndReached={handleNextPageLoading}
                onEndReachedThreshold={0.2}
                ListFooterComponent={listFooter}
                // maxToRenderPerBatch={14}
                onRefresh={onRefresh}
                refreshing={refreshing}
              />
            </View>
          )}
          {!myFavs.length && (
            <View style={styles.noFavWrap}>
              <FontAwesome
                name="exclamation-triangle"
                size={100}
                color={COLORS.gray}
              />
              <Text style={styles.noFavTitle}>{noFavTitle}</Text>
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
  container: {},
  containerNoFavs: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  deleteLoading: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.8,
    backgroundColor: "rgba(255,255,255,.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
    flex: 1,
    height: "100%",
    width: "100%",
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
  noFavTitle: {
    fontSize: 18,
    color: COLORS.text_gray,
    marginTop: 10,
  },
  noFavWrap: {
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
    // paddingVertical: 10,
    borderRadius: 3,
    marginTop: 40,
  },
});

export default FavoritesScreen;
