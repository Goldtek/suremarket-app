/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  Dimensions,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Modal,
  Image,
  TouchableWithoutFeedback,
  Platform,
  ImageBackground
} from "react-native";
import Constants from "expo-constants";
import { FontAwesome5 } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { Fontisto } from "@expo/vector-icons";
import { COLORS } from "../variables/color";
import TabScreenHeader from "../components/TabScreenHeader";
import api from "../api/client";
import { Entypo } from "@expo/vector-icons";
import { useStateValue } from "../StateProvider";
import { getCurrencySymbol, getPrice, decodeString } from "../helper/helper";
import AppSeparator from "../components/AppSeparator";
import DynamicFilterListPicker from "../components/DynamicFilterListPicker";
import DynamicCheckbox from "../components/DynamicCheckbox";
import ListingCard from "../components/ListingCard";

const loadingDataMessage = "Getting data from server";
const loadingListingMessage = "Getting listings from server";
const noListingFoundMessage = "Sorry! No listing found.";
const priceRangeLabel = "Price Range";

const loadingFiltersMessage = "Loading filters";

const fallbackImageUrl = "../assets/200X150.png";
const initialSearchData = {
  per_page: 20,
  categories: [],
  page: 1,
  onScroll: false,
};
const { width: screenWidth, height: windowHeight } = Dimensions.get("window");

const ios = Platform.OS === "ios";

const AllCategoryScreen = ({ navigation }) => {
  const [{ search_locations, config }, dispatch] = useStateValue();
  const [allCategoriesData, setAllCategoriesData] = useState({});
  const [locationsData, setLocationsData] = useState([]);
  const [pagination, setPagination] = useState({});
  const [searchData, setSearchData] = useState({ ...initialSearchData });
  const [currentCategory, setCurrentCategory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hideTopBar, setHideTopbBar] = useState(false);
  const [initial, setInitial] = useState(true);
  const [bottomLevel, setBottomLevel] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);
  const [applyFilter, setApplyFilter] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [filterData, setFilterData] = useState({});
  const [filterSearchData, setFilterSearchData] = useState({});
  const [filterCustomData, setFilterCustomData] = useState({});
  const [filterPriceRange, setFilterPriceRange] = useState([]);
  const [filterLoading, setFilterLoading] = useState(true);
  const [listingsData, setListingsData] = useState([]);
  // const [loadingErrorMessage, setLoadingErrorMessage] = useState();
  // const [moreloading, setMoreLoading] = useState(false);
  const [noListingFound, setNoListingFound] = useState(false);

  // initial category load
  useEffect(() => {
    if (!initial) return;
    handleLoadCategories();
  }, [initial]);

  // filter data load
  useEffect(() => {
    if (!filterVisible) return;
    handleFilterLoad();
  }, [filterVisible]);

  /**
   * Call when location or category changed
   */
  useEffect(() => {
    if (!bottomLevel) return;
    handleListingDataLoad(true);
  }, [bottomLevel, search_locations]);

  /**
   * Clicked at Apply filter button
   */
  useEffect(() => {
    if (!applyFilter) return;
    handleListingDataLoad();
  }, [applyFilter]);

  /**
   * Call onscroll pagination
   */
  useEffect(() => {
    if (!searchData.onScroll) return;
    handleListingDataLoad(false, true);
  }, [searchData.onScroll]);

  const handleClearFilterOnChnageCatLoc = () => {
    setFilterSearchData({});
    setFilterCustomData({});
    setFilterPriceRange([]);
    setIsFiltered(false);
  };

  const handleFilterLoad = () => {
    const cat_id = currentCategory[currentCategory.length - 1];
    api
      .get("search-fields", { category_id: cat_id })
      .then((res) => {
        if (res.ok) {
          setFilterData(res.data);
        } else {
          // TODO Error handling
        }
      })
      .then(() => setFilterLoading(false));
  };

  const handleNextPageLoading = () => {
    // if (!searchData.onScroll) return;
    if (pagination && pagination.total_pages > pagination.current_page) {
      // setMoreLoading((prevMoreLoading) => true);
      setSearchData((prevSearchData) => {
        return {
          ...prevSearchData,
          page: prevSearchData.page + 1,
          onScroll: true,
        };
      });
    }
  };

  /**
   *
   * @param {booll} isLocCatChanged
   * @param {booll} onScroll
   */
  const handleListingDataLoad = (isLocCatChanged, onScroll) => {
    if (onScroll) {
      // setMoreLoading(true);
    } else {
      setLoading(true);
    }
    let newSearchData = {
      ...searchData,
      locations: search_locations.length
        ? search_locations
            .map((loc) => loc.term_id)
            .splice(search_locations.length - 1)
        : [],
    };
    if (isLocCatChanged) {
      if (isFiltered) {
        handleClearFilterOnChnageCatLoc();
      }
      newSearchData = {
        ...initialSearchData,
        locations: newSearchData.locations,
        categories: newSearchData.categories,
      };
    }
    api.get("listings", newSearchData).then((res) => {
      if (res.ok) {
        if (res.data.data.length) {
          if (noListingFound) {
            setNoListingFound(false);
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
            // eslint-disable-next-line no-unused-vars
            setListingsData((prevListingData) => res.data.data);
          }
        } else {
          setListingsData([]);
          setNoListingFound(true);
        }
        // eslint-disable-next-line no-unused-vars
        setLoading((prevLoading) => false);
        setPagination(res.data.pagination ? res.data.pagination : {});
      } else {
        // print error
        // TODO Error handling
        // setLoadingErrorMessage("Server Error");
        // eslint-disable-next-line no-unused-vars
        setLoading((prevLoading) => false);
      }
      setApplyFilter(false);
    });
  };

  const handleLoadCategories = () => {
    api.get("categories").then((res) => {
      if (res.ok) {
        setAllCategoriesData((prevAllCategoriesData) => {
          return { 0: res.data };
        });
        handleLoadLocations();
        // setInitial(false);
        setLoading(false);
      } else {
        // print error
        // TODO Error handling
        setLoading(false);
      }
    });
  };
  const handleSelectCategory = (item) => {
    setLoading(true);
    setHideTopbBar(true);
    setCurrentCategory((prevCurrentCategory) => [
      ...prevCurrentCategory,
      item.term_id,
    ]);
    setSearchData((prevSearchData) => {
      return {
        ...prevSearchData,
        categories: [item.term_id],
      };
    });
    getSubCategoryData(item);
  };
  const getSubCategoryData = (item) => {
    api.get("categories", { parent_id: item.term_id }).then((res) => {
      if (res.ok) {
        if (res.data.length) {
          setAllCategoriesData((prevAllCategoriesData) => {
            const index = Object.keys(prevAllCategoriesData).length;
            const newData = { ...prevAllCategoriesData };
            newData[index] = [...res.data];
            return newData;
          });
          setLoading(false);
        } else {
          setBottomLevel(true);
          setHideTopbBar(false);
          setLoading(false);
        }
      } else {
        // print error
        // TODO Error handling
        setLoading(false);
      }
    });
  };
  const handleSelectSubCategory = (item) => {
    setLoading(true);
    setCurrentCategory((prevCurrentCategory) => [
      ...prevCurrentCategory,
      item.term_id,
    ]);
    setSearchData((prevSearchData) => {
      return {
        ...prevSearchData,
        categories: [item.term_id],
      };
    });
    getSubCategoryData(item);
  };
  const handleSelectedCatagoryTouch = (cat, index) => {
    setCurrentCategory((prevCurrentCategory) =>
      prevCurrentCategory.slice(0, index)
    );
    const selectedData = {};
    for (let i = 0; i <= index; i++) {
      selectedData[i] = allCategoriesData[i];
    }
    setAllCategoriesData(selectedData);
  };
  const getTexonomy = (arg) => {
    if (arg === "category") {
      return decodeString(
        allCategoriesData[currentCategory.length - 1].filter(
          (data) => data.term_id === currentCategory[currentCategory.length - 1]
        )[0].name
      );
    } else {
      return decodeString(search_locations[search_locations.length - 1].name);
    }
  };

  const getListingTexonomy = (arg) => {
    if (arg && arg.length < 1) return;
    return decodeString(arg[arg.length - 1].name);
  };

  const handleLoadLocations = () => {
    api.get("locations").then((res) => {
      if (res.ok) {
        setLocationsData((prevLocationsData) => res.data);

        setInitial(false);
        setLoading(false);
      } else {
        // print error
        // TODO Error handling
      }
    });
  };

  const handleClear = () => {
    setFilterLoading((filterLoading) => true);
    setFilterSearchData({});
    setFilterCustomData({});
    setFilterPriceRange([]);
    setTimeout(() => {
      setFilterLoading((filterLoading) => false);
    }, 10);
  };

  const handleClose = () => {
    setFilterVisible(!filterVisible); //TODO : need to check filter data if dirty then need to escape to reset filter data
    setFilterSearchData({});
    setFilterCustomData({});
    setFilterPriceRange([]);
  };

  const handleApplyFilter = () => {
    setFilterVisible(!filterVisible);
    setLoading((prevLoading) => true);
    if (noListingFound) {
      setNoListingFound((prevNoListingFound) => false);
    }
    setSearchData((prevSearchData) => {
      return {
        ...prevSearchData,
        ...filterSearchData,
        ["price_range"]: filterPriceRange,
        ["custom_fields"]: filterCustomData,
        page: 1,
      };
    });
    setApplyFilter(true);
    setIsFiltered(true);
  };

  const keyExtractor = useCallback((item, index) => `${index}`, []);

  const Category = ({ iconName = "folder", index, onPress, item }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[
        {
          justifyContent: "flex-start",
          alignItems: "center",
          width: screenWidth / 4,
          minHeight: windowHeight / 7,
          paddingVertical: 10,
          paddingHorizontal: 5,
          borderColor: COLORS.bg_dark,
        },
        index % 4 !== 0 && {
          borderLeftWidth: 1,
        },
        allCategoriesData.length - 1 === index && {
          borderRightWidth: 1,
        },
      ]}
    >
      <View
        style={{
          height: screenWidth / 8,
          width: screenWidth / 8,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: currentCategory.includes(item.term_id)
            ? COLORS.primary
            : COLORS.white,
          borderRadius: screenWidth / 16,
          elevation: 2,
        }}
      >
        {/* <FontAwesome
          //["lifebuoy","file-archive","soccer-ball","food"]
          name={
            item.icon && item.icon.class
              ? ["lifebuoy", "file-archive", "soccer-ball", "food"].includes(
                  item.icon.class
                )
                ? iconName
                : item.icon.class
              : iconName
          }
          size={screenWidth / 20}
          color={
            currentCategory.includes(item.term_id)
              ? COLORS.white
              : COLORS.primary
          }
        /> */}

        <Image source={{ uri: item.icon.url}} style={{ height: 27, width: 27}} />
      </View>

      <Text style={{ textAlign: "center" }}>{decodeString(item.name)}</Text>
    </TouchableOpacity>
  );
  const renderCategory = useCallback(
    ({ item, index }) => (
      <Category
        index={index}
        onPress={() => handleSelectCategory(item)}
        item={item}
      />
    ),
    []
  );

  const Picker = () => (
    <View style={styles.pickerWrap}>
      {allCategoriesData[Object.keys(allCategoriesData).length - 1].map(
        (data) => (
          <TouchableOpacity
            key={data.term_id}
            style={styles.subCategoryWrap}
            onPress={() => handleSelectSubCategory(data)}
          >
            <Text style={styles.catPickerOptions} numberOfLines={1}>
              {decodeString(data.name)}
            </Text>
          </TouchableOpacity>
        )
      )}
    </View>
  );

  const renderFeaturedItem = useCallback(
    ({ item }) => (
      <ListingCard onPress={() => handleSingleListingPress(item)} item={item} />
    ),
    [noListingFound, config]
  );

  const handleSingleListingPress = (item) => {
    navigation.navigate("Listing Detail", {
      listingId: item.listing_id,
    });
  };

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

  const handleFilterOpen = () => {
    if (noListingFound) {
      setNoListingFound((prevNoListingFound) => false);
    }
    setFilterVisible(true);
  };

  const handleResetAll = () => {
    setListingsData([]);
    // clear location
    dispatch({
      type: "SET_SEARCH_LOCATIONS",
      search_locations: [],
    });
    //clear current category
    setCurrentCategory([]);
    // remove all categories data to certain level
    setAllCategoriesData((prevAllCategoriesData) => {
      return {
        0: prevAllCategoriesData[0],
      };
    });
    // bottom level
    setBottomLevel(false);
    // pagination
    setPagination({});
    // filters
    setFilterSearchData({});
    setFilterCustomData({});
    setFilterPriceRange([]);
    setIsFiltered(false);
    setApplyFilter(false);
    //searchData
    setSearchData({ ...initialSearchData });
  };

  return (
    <ImageBackground  source={require('../assets/whitebg.png')}  style={styles.container}>
      <TabScreenHeader
        style={{ elevation: 0 }}
        right={bottomLevel}
        onRightClick={handleResetAll}
      />
      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.text}>
            {bottomLevel ? loadingListingMessage : loadingDataMessage}
          </Text>
        </View>
      )}
      {/* Topbar */}
      {!hideTopBar && (
        <View style={styles.listingTop}>
          <View style={styles.combinedContainer}>
            <TouchableOpacity
              style={styles.flex2}
              onPress={() => {
                navigation.navigate("Location", {
                  data: locationsData,
                  type: "search",
                });
                if (noListingFound) {
                  setNoListingFound((prevNoListingFound) => false);
                }
              }}
            >
              <FontAwesome5
                name="map-marker-alt"
                size={15}
                color={COLORS.primary}
              />
              <Text style={styles.combinedTexonomy} numberOfLines={1}>
                {!!search_locations && !!search_locations.length
                  ? getTexonomy("location")
                  : "Location"}
              </Text>
            </TouchableOpacity>
            {!!currentCategory.length && (
              <>
                <View style={styles.separetor} />
                <TouchableOpacity
                  style={styles.flex2}
                  onPress={() => {
                    setCurrentCategory([]);
                    setAllCategoriesData((prevAllCategoriesData) => {
                      return {
                        0: prevAllCategoriesData[0],
                      };
                    });
                    setBottomLevel(false);
                  }}
                >
                  <FontAwesome name="tags" size={15} color={COLORS.primary} />
                  <Text style={styles.combinedTexonomy} numberOfLines={1}>
                    {currentCategory.length
                      ? getTexonomy("category")
                      : "Category"}
                  </Text>
                </TouchableOpacity>
                <View style={styles.separetor} />
              </>
            )}
            {bottomLevel && (
              <TouchableOpacity style={styles.flex1} onPress={handleFilterOpen}>
                <FontAwesome name="sliders" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
      {/* Main category flatlist */}
      {!currentCategory.length && (
        <View
          style={{
            backgroundColor: COLORS.bg_light,
          }}
        >
          <View
            style={{
              backgroundColor: COLORS.bg_light,
              paddingHorizontal: "3%",
              flexDirection: "row",
              alignItems: "center",
              height: 37,
            }}
          >
            <View
              style={{
                height: 10,
                width: 3,
                backgroundColor: COLORS.primary,
                borderRadius: 3,
              }}
            ></View>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "bold",
                paddingHorizontal: 5,
              }}
            >
              All Catagories
            </Text>
          </View>

          <View
            style={{
              height: windowHeight - 73 - 37 - 50,
            }}
          >
            <FlatList
              data={allCategoriesData[0]}
              renderItem={renderCategory}
              keyExtractor={keyExtractor}
              numColumns={4}
              ItemSeparatorComponent={({ highlighted }) => (
                <View style={styles.itemSeparator} />
              )}
              contentContainerStyle={{
                borderTopWidth: 1,
                borderBottomWidth: 1,
                borderColor: COLORS.bg_dark,
              }}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      )}
      {/* Listing flatlist */}
      {!!currentCategory.length &&
        bottomLevel &&
        !loading &&
        !!listingsData.length && (
          <View
            style={[
              styles.ListingsList,
              {
                // height: windowHeight - 85 - 73 - 5,
                height: windowHeight - 50,

                paddingHorizontal: screenWidth * 0.015,
              },
            ]}
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
              maxToRenderPerBatch={12}
              windowSize={41}
              contentContainerStyle={{
                paddingBottom: 110,
                paddingTop: screenWidth * 0.03,
              }}
            />
          </View>
        )}
      {/* No listing found */}
      {noListingFound && !loading && !!bottomLevel && (
        <View style={styles.noListingsWrap}>
          <Fontisto name="frowning" size={100} color={COLORS.primary_soft} />
          <Text style={styles.noListingsMessage}>{noListingFoundMessage}</Text>
        </View>
      )}
      {/* Sub category picker */}
      <ImageBackground  source={require('../assets/whitebg.png')}  style={styles.catPickerWrap}>
        <ScrollView>
          {!loading &&
            Object.keys(allCategoriesData).length > 1 &&
            !bottomLevel && (
              <>
                {!!currentCategory.length &&
                  currentCategory.map((cat, index) => (
                    <TouchableOpacity
                      key={cat}
                      style={styles.selected}
                      onPress={() => handleSelectedCatagoryTouch(cat, index)}
                    >
                      <Text style={styles.selectedText}>
                        {decodeString(
                          allCategoriesData[index].find(
                            (i) => i.term_id === cat
                          ).name
                        )}
                      </Text>
                      <Entypo name="cross" size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                  ))}
                <Picker />
              </>
            )}
        </ScrollView>
      </ImageBackground>
      {/* Filter */}
      <Modal animationType="slide" transparent={false} visible={filterVisible}>
        <View style={styles.filterWrap}>
          <View style={styles.filterTopWrap}>
            <Text style={styles.filterTitle}>Filters</Text>
            <TouchableOpacity onPress={handleClose}>
              <FontAwesome5 name="times" size={22} color={COLORS.text_dark} />
            </TouchableOpacity>
          </View>
          {!filterLoading && (
            <View style={styles.filterMainContentWrap}>
              <ScrollView contentContainerStyle={styles.filterContentWrap}>
                {(!!filterData.order_by || !!filterData.listing_type) && (
                  <>
                    <View
                      style={[styles.commonFiltersWrap, styles.filtersWrap]}
                    >
                      {!!filterData.order_by && (
                        <View style={styles.filterField}>
                          <Text style={styles.filterLabel}>Sort by</Text>
                          <DynamicFilterListPicker
                            onselect={(item) => {
                              setFilterSearchData((prevFilterSearchData) => {
                                return {
                                  ...prevFilterSearchData,
                                  ["order_by"]: item.id,
                                };
                              });
                            }}
                            selected={
                              filterSearchData.order_by
                                ? filterData.order_by.filter(
                                    (_data) =>
                                      _data.id === filterSearchData.order_by
                                  )[0].name
                                : null
                            }
                            data={filterData.order_by}
                          />
                        </View>
                      )}
                    </View>
                    <View
                      style={[styles.commonFiltersWrap, styles.filtersWrap]}
                    >
                      {!!filterData.listing_type && (
                        <View style={styles.filterField}>
                          <Text style={styles.filterLabel}>Ad type</Text>

                          <DynamicFilterListPicker
                            onselect={(item) => {
                              setFilterSearchData((prevFilterSearchData) => {
                                return {
                                  ...prevFilterSearchData,
                                  ["listing_type"]: item.id,
                                };
                              });
                            }}
                            selected={
                              filterSearchData.listing_type
                                ? filterData.listing_type.filter(
                                    (_data) =>
                                      _data.id === filterSearchData.listing_type
                                  )[0].name
                                : null
                            }
                            data={filterData.listing_type}
                          />
                        </View>
                      )}
                    </View>
                    <AppSeparator style={styles.screenSeparetor} />
                  </>
                )}
                <View style={[styles.priceFiltersWrap, styles.filtersWrap]}>
                  <View style={styles.filterField}>
                    <Text style={styles.filterLabel}>
                      {priceRangeLabel}{" "}
                      {` (${getCurrencySymbol(config.currency)})`}
                    </Text>
                    <View style={styles.rangeWrap}>
                      <View
                        style={[styles.filterInputField, { marginRight: 5 }]}
                      >
                        <Text style={styles.text}>From</Text>
                        <TextInput
                          style={styles.numRangeInput}
                          value={filterPriceRange[0] ? filterPriceRange[0] : ""}
                          onChangeText={(value) => {
                            const newRange = [
                              value,
                              filterPriceRange[1] ? filterPriceRange[1] : "",
                            ];
                            setFilterPriceRange(newRange);
                          }}
                          keyboardType="decimal-pad"
                        />
                      </View>
                      <View
                        style={[styles.filterInputField, { marginLeft: 5 }]}
                      >
                        <Text style={styles.text}>To</Text>
                        <TextInput
                          style={styles.numRangeInput}
                          value={filterPriceRange[1] ? filterPriceRange[1] : ""}
                          onChangeText={(value) => {
                            const newRange = [
                              filterPriceRange[0] ? filterPriceRange[0] : "",
                              value,
                            ];
                            setFilterPriceRange(newRange);
                          }}
                          keyboardType="decimal-pad"
                        />
                      </View>
                    </View>
                  </View>
                </View>
                <AppSeparator style={styles.screenSeparetor} />
                {!!filterData.custom_fields.length && (
                  <View style={[styles.customFiltersWrap, styles.filtersWrap]}>
                    {filterData.custom_fields.map((field) => (
                      <View style={styles.view} key={field.id}>
                        {["radio", "select", "checkbox"].includes(
                          field.type
                        ) && (
                          <View style={styles.view}>
                            <Text style={styles.filterLabel}>
                              {decodeString(field.label)}
                            </Text>
                            <DynamicCheckbox
                              field={field}
                              handleClick={(value) => {
                                setFilterCustomData((prevFilterCustomData) => {
                                  return {
                                    ...prevFilterCustomData,
                                    [field.meta_key]: value,
                                  };
                                });
                              }}
                              selected={
                                filterCustomData[field.meta_key]
                                  ? filterCustomData[field.meta_key]
                                  : []
                              }
                            />
                          </View>
                        )}
                        {field.type === "number" && (
                          <>
                            <Text style={styles.filterLabel}>
                              {decodeString(field.label)}
                            </Text>
                            <View style={styles.rangeWrap}>
                              <View
                                style={[
                                  styles.filterInputField,
                                  { marginRight: 5 },
                                ]}
                              >
                                <Text style={styles.text}>From</Text>
                                <TextInput
                                  style={styles.numRangeInput}
                                  keyboardType="decimal-pad"
                                  value={
                                    filterCustomData[field.meta_key]
                                      ? filterCustomData[field.meta_key][0]
                                        ? filterCustomData[field.meta_key][0]
                                        : ""
                                      : ""
                                  }
                                  onChangeText={(value) => {
                                    const newRange = [
                                      value,
                                      filterCustomData[field.meta_key]
                                        ? filterCustomData[field.meta_key][1]
                                          ? filterCustomData[field.meta_key][1]
                                          : ""
                                        : "",
                                    ];
                                    setFilterCustomData(
                                      (prevFilterCustomData) => {
                                        return {
                                          ...prevFilterCustomData,
                                          [field.meta_key]: newRange,
                                        };
                                      }
                                    );
                                  }}
                                />
                              </View>
                              <View
                                style={[
                                  styles.filterInputField,
                                  { marginLeft: 5 },
                                ]}
                              >
                                <Text style={styles.text}>To</Text>
                                <TextInput
                                  style={styles.numRangeInput}
                                  keyboardType="decimal-pad"
                                  value={
                                    filterCustomData[field.meta_key]
                                      ? filterCustomData[field.meta_key][1]
                                        ? filterCustomData[field.meta_key][1]
                                        : ""
                                      : ""
                                  }
                                  onChangeText={(value) => {
                                    const newRange = [
                                      filterCustomData[field.meta_key][0]
                                        ? filterCustomData[field.meta_key][0]
                                          ? filterCustomData[field.meta_key][0]
                                          : ""
                                        : "",
                                      value,
                                    ];
                                    setFilterCustomData(
                                      (prevFilterCustomData) => {
                                        return {
                                          ...prevFilterCustomData,
                                          [field.meta_key]: newRange,
                                        };
                                      }
                                    );
                                  }}
                                />
                              </View>
                            </View>
                          </>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </ScrollView>
            </View>
          )}
          {filterLoading && (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.text}>{loadingFiltersMessage}</Text>
            </View>
          )}
          <View style={styles.filterBottomWrap}>
            <TouchableOpacity
              style={styles.filterButton_clear}
              onPress={handleClear}
              disabled={filterLoading}
            >
              <Text style={styles.filterButton_clearText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.filterButton_apply}
              onPress={handleApplyFilter}
              disabled={filterLoading}
            >
              <Text style={styles.filterButton_applyText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  catPickerOptions: {
    fontSize: 14,
  },
  catPickerWrap: {
    height: windowHeight - 50 - 73,
  },
  combinedContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    marginHorizontal: "3%",
    borderRadius: 3,
    height: 35,
    marginBottom: 5,
  },
  combinedTexonomy: {
    marginLeft: 5,
  },
  container: {},
  featuredItemLocation: {
    color: COLORS.text_gray,
    fontSize: 10,
    paddingHorizontal: 5,
  },
  featuredItemLocationWrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 2,
  },
  featuredItemPrice: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "bold",
  },
  featuredItemTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.text_dark,
  },
  featuredItemWrap: {
    backgroundColor: COLORS.white,
    marginHorizontal: screenWidth * 0.015,
    marginBottom: screenWidth * 0.03,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    overflow: "hidden",
  },
  featuredItemCategory: {
    fontSize: 10,
    color: COLORS.text_gray,
  },
  featuredItemDetailWrap: {
    alignItems: "flex-start",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  featuredItemImage: {
    height: 150,
    width: "100%",
    resizeMode: "cover",
  },
  featuredItemImageWrap: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    width: "100%",
  },
  filterWrap: {
    paddingTop: ios ? 15 : 0,
    flex: 1,
  },
  filterBottomWrap: {
    flexDirection: "row",
    bottom: 0,
    position: "absolute",
    alignItems: "center",
    backgroundColor: COLORS.white,
  },
  filterButton_apply: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: windowHeight * 0.06,
    backgroundColor: COLORS.primary,
  },
  filterButton_applyText: {
    color: COLORS.white,
    fontWeight: "bold",
  },
  filterButton_clear: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: windowHeight * 0.06,
    borderColor: COLORS.bg_dark,
    borderTopWidth: 1,
    backgroundColor: COLORS.white,
  },
  filterButton_clearText: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
  filterContentWrap: {
    paddingBottom: windowHeight * 0.11 + Constants.statusBarHeight,
  },
  filterField: {
    marginTop: 10,
  },
  filterInputField: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 16,
    color: COLORS.text_gray,
    marginBottom: 5,
  },
  filterMainContentWrap: {},
  filterPickerWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text_dark,
  },
  filterTopWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: "3%",
    marginTop: windowHeight * 0.01,
    height: windowHeight * 0.04,
  },
  filtersWrap: {
    marginHorizontal: "3%",
  },
  flex1: {
    flex: 1,
    alignItems: "center",
  },
  flex2: {
    flex: 2,
    alignItems: "center",
    paddingHorizontal: 10,
    flexDirection: "row",
    justifyContent: "center",
  },
  itemSeparator: {
    height: 1,
    backgroundColor: COLORS.bg_dark,
  },
  listingSearchBtnContainer: {
    position: "absolute",
    top: "60%",
    right: "3%",
  },
  ListingSearchContainer: {
    paddingVertical: 10,
    width: "94%",
  },
  listingTop: {
    backgroundColor: COLORS.primary,
    display: "flex",
    width: "100%",
    alignItems: "center",
    // zIndex: 1,
    justifyContent: "center",
    marginTop: -1,
    paddingTop: 1,
  },
  listingsWrap: {
    paddingTop: 10,
  },
  loadMoreWrap: {
    marginBottom: 20,
  },
  locationContainer: {
    width: "94%",
  },
  locationContent: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  locationContentText: {
    paddingLeft: 10,
    color: COLORS.white,
  },
  loading: {
    justifyContent: "center",
    alignItems: "center",
    height: windowHeight - 50,
  },
  noListingsMessage: {
    fontSize: 18,
    color: COLORS.text_gray,
  },
  noListingsWrap: {
    height: windowHeight - 285,
    alignItems: "center",
    justifyContent: "center",
  },
  numRangeInput: {
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: COLORS.gray,
  },
  pickerWrap: {
    backgroundColor: COLORS.bg_dark,
    marginHorizontal: "3%",
    marginVertical: 10,
  },
  rangeWrap: {
    flexDirection: "row",
  },
  screenSeparetor: {
    width: "100%",
    marginVertical: 20,
  },
  searchIconWrap: {
    height: windowHeight - 120,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: screenWidth / 2.5,
  },
  searchInput: {
    height: 35,
    backgroundColor: "white",
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  selected: {
    marginHorizontal: "3%",
    marginVertical: 10,
    // backgroundColor: COLORS.primary,
    backgroundColor: COLORS.white,
    borderRadius: 3,
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // elevation: 5,
  },
  selectedText: {
    fontWeight: "bold",
    // color: COLORS.white,
    color: COLORS.primary,
    // elevation: -5,
    fontSize: 15,
  },
  separetor: {
    height: "100%",
    width: 1,
    backgroundColor: COLORS.primary,
  },
  subCategoryWrap: {
    paddingVertical: 8,
    // borderColor: COLORS.white,
    backgroundColor: COLORS.white,
    // elevation: 1,
    marginVertical: 5,
    paddingHorizontal: 8,
  },
});

export default AllCategoryScreen;
