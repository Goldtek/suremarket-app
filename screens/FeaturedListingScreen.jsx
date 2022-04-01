/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Dimensions,
  Animated,
  ActivityIndicator,
  Keyboard,
  RefreshControl,
  Platform,
  ImageBackground,
  Image
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { SimpleLineIcons } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { COLORS } from "../variables/color";
import TabScreenHeader from "../components/TabScreenHeader";
import { useStateValue } from "../StateProvider";
import api from "../api/client";
import { Fontisto } from "@expo/vector-icons";
import { Formik } from "formik";
import { decodeString, getPrice } from "../helper/helper";
import FlashNotification from "../components/FlashNotification";
import AppButton from "../components/AppButton";
import Constants from "expo-constants";
import ListingCard from "../components/ListingCard";

const { width: screenWidth, height: screenHeight } = Dimensions.get("screen");
const { height: windowHeight } = Dimensions.get("window");

const seAllButtonText = "See all";
const loadingMessage = "Getting listings from server";
const listingSearchPlaceholder = "Search...";
const noListingsMessage = "Sorry...No Listings were found.";
const selectLocationText = "Location";
const latestAdsText = "Latest Ads";
const topCategoriesText = "Top Categories";

const ios = Platform.OS === "ios";
const FeaturedListingScreen = ({ navigation }) => {
  const [
    { search_locations, config, search_categories, cat_name },
    dispatch,
  ] = useStateValue();
  const [topCategoriesData, setTopCategoriesData] = useState([]);
  const [pagination, setPagination] = useState({});
  const [searchData, setSearchData] = useState(() => {
    return {
      per_page: 20,
      search: "",
      locations: search_locations.length
        ? search_locations.map((location) => location.term_id)
        : "",
      categories: "",
      page: pagination.current_page || 1,
      onScroll: false,
    };
  });
  const [locationsData, setLocationsData] = useState([]);
  const [listingsData, setListingsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moreLoading, setMoreLoading] = useState(false);
  const [initial, setInitial] = useState(true);
  const [flashNotification, setFlashNotification] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [timedOut, setTimedOut] = useState();
  const [timeOutRetry, setTimeOutRetry] = useState(false);

  useEffect(() => {
    if (!search_locations) return;
    setSearchData((prevSearchData) => {
      return {
        ...prevSearchData,
        locations: search_locations.map((location) => location.term_id),
        page: 1,
      };
    });
    setLoading((prevLoading) => true);
  }, [search_locations]);
  useEffect(() => {
    if (!search_categories.length) return;
    setSearchData((prevSearchData) => {
      return {
        ...prevSearchData,
        categories: search_categories[search_categories.length - 1],
        page: 1,
      };
    });
    setLoading((prevLoading) => true);
  }, [search_categories]);

  useEffect(() => {
    topCategoriesData.filter(
      (_topcat) => _topcat.term_id === searchData.categories
    );
  }, [searchData.categories]);

  useEffect(() => {
    if (!initial) return;

    dispatch({
      type: "SET_NEW_LISTING_SCREEN",
      newListingScreen: false,
    });
    handleLoadTopCategories();
    handleLoadLocations();
    handleLoadListingsData();
  }, [initial]);
  useEffect(() => {
    if (!loading) return;
    dispatch({
      type: "SET_NEW_LISTING_SCREEN",
      newListingScreen: false,
    });
    handleLoadListingsData();
  }, [loading]);

  useEffect(() => {
    if (!searchData.onScroll) return;

    handleLoadListingsData(true);
  }, [searchData.onScroll]);

  // Refreshing get listing call
  useEffect(() => {
    if (!refreshing) return;
    setSearchData((prevSearchData) => {
      return {
        ...prevSearchData,
        page: 1,
      };
    });
    setPagination({});
    handleLoadListingsData();
  }, [refreshing]);

  const onRefresh = () => {
    if (moreLoading) return;
    setRefreshing((prevRefreshing) => true);
  };

  const handleLoadLocations = () => {
    api.get("locations").then((res) => {
      if (res.ok) {
        setLocationsData((prevLocationsData) => res.data);
      } else {
        // print error
        // TODO handle error
      }
    });
  };

  const handleLoadListingsData = (onScroll) => {
    api.get("listings", searchData).then((res) => {
      if (res.ok) {
        if (refreshing) {
          setRefreshing((prevRefreshing) => false);
        }
        if (onScroll) {
          setListingsData((prevListingsData) => [
            ...prevListingsData,
            ...res.data.data,
          ]);
          setSearchData((prevSearchData) => {
            return {
              ...prevSearchData,
              onScroll: false,
            };
          });
        } else {
          setListingsData((prevListingData) => res.data.data);
        }
        setPagination(res.data.pagination ? res.data.pagination : {});
        if (initial) {
          setInitial((prevInitial) => false);
        }
        setLoading((prevLoading) => false);
      } else {
        if (refreshing) {
          setRefreshing((prevRefreshing) => false);
        }
        // print error
        // TODO handle error
        if (res.problem === "TIMEOUT_ERROR") {
          setTimedOut(true);
        }
      }
      setMoreLoading((prevMoreLoading) => false);
      setLoading((prevLoading) => false);
    });
  };
  const handleNextPageLoading = () => {
    // if (!searchData.onScroll) return;
    if (pagination && pagination.total_pages > pagination.current_page) {
      setMoreLoading((prevMoreLoading) => true);
      setSearchData((prevSearchData) => {
        return {
          ...prevSearchData,
          page: prevSearchData.page + 1,
          onScroll: true,
        };
      });
    }
  };
  const handleLoadTopCategories = () => {
    api.get("categories").then((res) => {
      if (res.ok) {
        setTopCategoriesData(res.data);
        dispatch({
          type: "SET_CATEGORIES_DATA",
          categories_data: res.data,
        });
      } else {
        // print error
        // TODO handle error
      }
    });
  };
  const handleSelectCategory = (item) => {
    setSearchData((prevSearchData) => {
      return { ...prevSearchData, categories: item.term_id, page: 1 };
    });
    dispatch({
      type: "SET_CAT_NAME",
      cat_name: [item.name],
    });
    setLoading((prevLoading) => true);
  };
  const dotArr = [1, 2, 3, 4, 5];
  const scrollX = new Animated.Value(0);
  const scrollY = new Animated.Value(0);
  const diffClamp = Animated.diffClamp(scrollY, 0, 100);
  const translateY = diffClamp.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -100],
  });
  let position = Animated.divide(scrollX, screenWidth);

  const Category = ({ onPress, item, iconName = "folder" }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        justifyContent: "center",
        alignItems: "center",
        width: screenWidth / 5,
        // height: 80,
        padding: 5,
      }}
    >
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* <FontAwesome
          name={
            item.icon && item.icon.class
              ? ["lifebuoy", "file-archive", "soccer-ball", "food"].includes(
                  item.icon.class
                )
                ? iconName
                : item.icon.class
              : iconName
          }
          size={27}
          color={COLORS.primary}
        /> */}

        <Image source={{uri: item.icon.url}} style={{ height: 27, width: 27}} />
        <Text
          style={{
            marginTop: 5,
            color: COLORS.text_gray,
            fontWeight: "bold",
            fontSize: 13,
          }}
          numberOfLines={1}
        >
          {decodeString(item.name).split(" ")[0]}
        </Text>
      </View>
    </TouchableOpacity>
  );
  const renderCategory = ({ item }) => (
    <Category onPress={() => handleSelectCategory(item)} item={item} />
  );

  const keyExtractor = useCallback((item, index) => `${index}`, []);

  const renderFeaturedItem = useCallback(
    ({ item }) => (
      <ListingCard
        onPress={() =>
          navigation.navigate("Listing Detail", {
            listingId: item.listing_id,
          })
        }
        item={item}
      />
    ),
    [refreshing, config]
  );

  const featuredListFooter = () => {
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

  const handleSearch = (values) => {
    Keyboard.dismiss();
    setSearchData((prevSearchData) => {
      return { ...prevSearchData, search: values.search };
    });
    setLoading((prevLoading) => true);
  };

  const handleReset = () => {
    setSearchData((prevSearchData) => {
      return {
        categories: "",
        locations: "",
        onScroll: false,
        page: 1,
        per_page: 20,
        search: "",
      };
    });
    dispatch({
      type: "SET_SEARCH_LOCATIONS",
      search_locations: [],
    });
    dispatch({
      type: "SET_SEARCH_CATEGORIES",
      search_categories: [],
    });
  };

  const onFeaturedListingScroll = (e) => {
    scrollY.setValue(e.nativeEvent.contentOffset.y);
  };

  const getSelectedCat = (urg) => {
    return decodeString(urg);
  };

  const ListHeader = () => {
    return (
      <View style={styles.featuredListingTop}>
        {/* <View
          style={{
            height: 12,
            width: 3,
            backgroundColor: COLORS.primary,
            borderRadius: 3,
          }}
        /> */}
        <Text
          style={{
            fontSize: 14,
            fontWeight: "bold",
            // paddingHorizontal: 5,
          }}
        >
          {latestAdsText}{" "}
          {searchData.categories && cat_name && (
            <Text style={styles.selectedCat} numberOfLines={1}>
              ({getSelectedCat(cat_name[0])})
            </Text>
          )}
        </Text>
      </View>
    );
  };

  const handleSeeAll = () => {
    navigation.navigate("Select category", {
      data: topCategoriesData,
    });
  };

  return (
    <ImageBackground style={styles.container} source={require('../assets/whitebg.png')}>
      <TabScreenHeader style={{ elevation: 0, zIndex: 2 }} />
      {/* Loading Animation */}
      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.text}>{loadingMessage}</Text>
        </View>
      )}

      {!loading && (
        <>
          {/* Search , Location , Reset button */}
          <View style={styles.listingTop}>
            <TouchableOpacity
              style={styles.locationWrap}
              onPress={() =>
                navigation.navigate("Location", {
                  data: locationsData,
                  type: "search",
                })
              }
            >
              <View style={styles.locationContent}>
                <FontAwesome
                  name="map-marker"
                  size={18}
                  color={COLORS.primary}
                />
                <Text style={styles.locationContentText} numberOfLines={1}>
                  {search_locations === null || !search_locations.length
                    ? selectLocationText
                    : search_locations.map((location) => location.name)[
                        search_locations.length - 1
                      ]}
                </Text>
              </View>
            </TouchableOpacity>
            <Formik initialValues={{ search: "" }} onSubmit={handleSearch}>
              {({ handleChange, handleBlur, handleSubmit, values }) => (
                <View style={styles.ListingSearchContainer}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder={searchData.search || listingSearchPlaceholder}
                    placeholderTextColor={COLORS.textGray}
                    onChangeText={handleChange("search")}
                    onBlur={() => {
                      handleBlur("search");
                    }}
                    value={values.search}
                  />

                  <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={!values.search}
                    style={styles.listingSearchBtnContainer}
                  >
                    <Feather
                      name="search"
                      size={20}
                      color={values.search ? COLORS.primary : COLORS.primary}
                    />
                  </TouchableOpacity>
                </View>
              )}
            </Formik>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <SimpleLineIcons name="refresh" size={18} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          {/* Category Slider */}
          <Animated.View
            style={[
              {
                transform: [{ translateY: translateY }],
              },
              styles.topCatSliderWrap,
            ]}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: "3%",
                paddingVertical: 10,
                width: screenWidth,
                justifyContent: "space-between",
              }}
            >
              <View style={{ alignItems: "center", flexDirection: "row" }}>
                {/* <View
                  style={{
                    height: 12,
                    width: 3,
                    backgroundColor: COLORS.primary,
                    borderRadius: 3,
                  }}
                /> */}
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "bold",
                    // paddingHorizontal: 5,
                  }}
                >
                  {topCategoriesText}
                </Text>
              </View>
              <TouchableOpacity onPress={handleSeeAll}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "bold",
                    color: COLORS.primary,
                  }}
                >
                  {seAllButtonText}
                </Text>
              </TouchableOpacity>
            </View>
            {/* categories flatlist */}
            <FlatList
              data={topCategoriesData}
              renderItem={renderCategory}
              keyExtractor={keyExtractor}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          </Animated.View>

          {/* FlatList */}
          {!!listingsData.length && (
            <>
              {ios ? (
                <Animated.View
                  style={{
                    paddingHorizontal: screenWidth * 0.015,
                    height:
                      screenHeight - Constants.statusBarHeight - 50 - 38 - 50,

                    top: 50 + 45 + JSON.parse(JSON.stringify(translateY)),
                    transform: [{ translateY: translateY }],
                  }}
                >
                  <FlatList
                    data={listingsData}
                    renderItem={renderFeaturedItem}
                    keyExtractor={keyExtractor}
                    horizontal={false}
                    numColumns={2}
                    showsVerticalScrollIndicator={false}
                    onEndReached={handleNextPageLoading}
                    onEndReachedThreshold={1}
                    ListFooterComponent={featuredListFooter}
                    maxToRenderPerBatch={7}
                    windowSize={41}
                    onScroll={onFeaturedListingScroll}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    contentContainerStyle={{
                      paddingBottom: screenHeight - windowHeight,
                    }}
                    ListHeaderComponent={ListHeader}
                    scrollEventThrottle={1}
                  />
                </Animated.View>
              ) : (
                <View
                  style={{
                    paddingHorizontal: screenWidth * 0.015,
                    height:
                      screenHeight - Constants.statusBarHeight - 50 - 45 - 50,
                  }}
                >
                  <Animated.FlatList
                    data={listingsData}
                    renderItem={renderFeaturedItem}
                    keyExtractor={keyExtractor}
                    horizontal={false}
                    numColumns={2}
                    showsVerticalScrollIndicator={false}
                    onEndReached={handleNextPageLoading}
                    onEndReachedThreshold={1}
                    ListFooterComponent={featuredListFooter}
                    maxToRenderPerBatch={7}
                    windowSize={41}
                    onScroll={onFeaturedListingScroll}
                    refreshControl={
                      <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        progressViewOffset={100}
                      />
                    }
                    contentContainerStyle={{
                      paddingBottom: screenHeight - windowHeight,
                      paddingTop: 100,
                    }}
                    ListHeaderComponent={ListHeader}
                    scrollEventThrottle={1}
                    bounces={false}
                  />
                </View>
              )}
            </>
          )}
          {/* No Listing Found */}
          {!listingsData.length && !timedOut && (
            <View style={styles.noListingsWrap}>
              <Fontisto
                name="frowning"
                size={100}
                color={COLORS.primary_soft}
              />
              <Text style={styles.noListingsMessage}>{noListingsMessage}</Text>
            </View>
          )}
          {/* Timeout notice */}
          {!listingsData.length && !!timedOut && (
            <View style={styles.noListingsWrap}>
              <Fontisto
                name="frowning"
                size={100}
                color={COLORS.primary_soft}
              />
              <Text style={styles.noListingsMessage}>Request timed out</Text>
              <View style={styles.retryButton}>
                <AppButton
                  title="Retry"
                  onPress={() => {
                    setLoading(true);
                    setTimedOut(false);
                  }}
                />
              </View>
            </View>
          )}
          {/* Flash notification */}
          <FlashNotification
            falshShow={flashNotification}
            flashMessage="Hello World!"
          />
        </>
      )}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  categoriesRowWrap: {},
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  featuredListingTop: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: screenWidth * 0.015,
    paddingBottom: 15,
    paddingTop: 5,
  },
  itemSeparator: {
    height: "100%",
    width: 1.333,
    backgroundColor: COLORS.bg_dark,
  },
  listingSearchBtnContainer: {
    marginLeft: 7,
  },
  ListingSearchContainer: {
    flex: 1,
    height: 34,
    backgroundColor: COLORS.white,
    borderRadius: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 7,
  },
  listingTop: {
    backgroundColor: COLORS.primary,
    width: "100%",
    marginTop: -1,
    paddingTop: 1,
    zIndex: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: screenWidth * 0.015,
    paddingBottom: 10,
  },
  locationWrap: {
    maxWidth: screenWidth * 0.25,
    marginHorizontal: screenWidth * 0.015,
    backgroundColor: COLORS.white,
    borderRadius: 5,
    padding: 7,
  },
  locationContent: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  locationContentText: {
    paddingHorizontal: 5,
    color: COLORS.text_gray,
  },
  loadMoreWrap: {
    marginBottom: 10,
  },
  loading: {
    justifyContent: "center",
    alignItems: "center",
    height: screenHeight - 120,
  },
  noListingsMessage: {
    fontSize: 18,
    color: COLORS.text_gray,
    marginVertical: 10,
  },
  noListingsWrap: {
    height: screenHeight - 350,
    alignItems: "center",
    justifyContent: "center",
  },
  resetButton: {
    borderRadius: 5,
    borderWidth: 1,
    borderColor: COLORS.white,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginHorizontal: screenWidth * 0.015,
  },
  retryButton: {
    width: "30%",
    alignItems: "center",
    justifyContent: "center",
  },
  searchInput: {
    flex: 1,
  },
  selectedCat: {
    fontSize: 12,
  },
  topCatSliderWrap: {
    position: "absolute",
    top: 94,
    zIndex: 1,
    justifyContent: "center",
    backgroundColor: COLORS.white,
  },
});

export default FeaturedListingScreen;
