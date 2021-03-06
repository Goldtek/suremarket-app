import React from "react";
import {
  Dimensions,
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Image,
  Platform,
} from "react-native";
import { decodeString, getPrice } from "../helper/helper";
import { FontAwesome5 } from "@expo/vector-icons";
import { COLORS } from "../variables/color";
import { useStateValue } from "../StateProvider";
import Badge from "./Badge";

const { width: screenWidth, height: screenHeight } = Dimensions.get("screen");
const { height: windowHeight } = Dimensions.get("window");

const fallbackImageUrl = "../assets/200X150.png";
const soldOutBadgeMessage = "Sold out";

const ios = Platform.OS === "ios";
const ListingCard = ({ onPress, item }) => {
  const [{ config }] = useStateValue();

  const getTexonomy = (items) => {
    if (!items.length) return false;
    return decodeString(items[items.length - 1].name);
  };
  const getBackgroundColor = () => {
    if (!item.badges.length > 0) {
      return null;
    } else {
      if (item.badges.includes("as-top")) {
        return COLORS.cardBg["is-top"];
      } else if (item.badges.includes("is-featured")) {
        return COLORS.cardBg["is-featured"];
      }
    }
  };

  return (
    <View
      style={{
        shadowColor: "#000",
        shadowRadius: 4,
        shadowOpacity: 0.2,
        shadowOffset: {
          height: 2,
          width: 2,
        },
      }}
    >
      <TouchableWithoutFeedback onPress={onPress}>
        <View
          style={[
            styles.featuredItemWrap,
            {
              backgroundColor: getBackgroundColor()
                ? getBackgroundColor()
                : COLORS.white,
              flex: 1,
            },
          ]}
        >
          {item.badges.includes("is-bump-up") && (
            <View style={styles.badgeSection}>
              <Badge badgeName="is-bump-up" type="card" />
            </View>
          )}
          {item.badges.includes("is-sold") && (
            <View style={styles.soldOutBadge}>
              <Text style={styles.soldOutBadgeMessage}>
                {soldOutBadgeMessage}
              </Text>
            </View>
          )}
          {item.badges.includes("is-bump-up") && (
            <View style={styles.bumpUpBadge}></View>
          )}

          <View style={styles.featuredItemImageWrap}>
            <Image
              style={styles.featuredItemImage}
              source={
                item.images.length
                  ? {
                      uri: item.images[0].sizes.medium.src,
                    }
                  : require(fallbackImageUrl)
              }
            />
          </View>
          <View style={styles.featuredItemDetailWrap}>
            <Text style={styles.featuredItemCategory} numberOfLines={1}>
              {getTexonomy(item.categories)}
            </Text>
            <Text style={styles.featuredItemTitle} numberOfLines={1}>
              {decodeString(item.title)}
            </Text>
            {(!!item.contact.locations.length ||
              !!item.contact.geo_address) && (
              <>
                {config.location_type === "local" ? (
                  <>
                    {!!item.contact.locations.length && (
                      <View style={styles.featuredItemLocationWrap}>
                        <FontAwesome5
                          name="map-marker-alt"
                          size={10}
                          color={COLORS.text_gray}
                        />
                        <Text style={styles.featuredItemLocation}>
                          {getTexonomy(item.contact.locations)}
                        </Text>
                      </View>
                    )}
                  </>
                ) : (
                  <>
                    {!!item.contact.geo_address && (
                      <View style={styles.featuredItemLocationWrap}>
                        <FontAwesome5
                          name="map-marker-alt"
                          size={10}
                          color={COLORS.text_gray}
                        />
                        <Text
                          style={styles.featuredItemLocation}
                          numberOfLines={1}
                        >
                          {decodeString(item.contact.geo_address)}
                        </Text>
                      </View>
                    )}
                  </>
                )}
              </>
            )}
            <Text style={styles.featuredItemPrice} numberOfLines={1}>
              {getPrice(config.currency, item.price_type, item.price)}
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};
const styles = StyleSheet.create({
  badgeSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 1,
    margin: 2,
  },
  badgeStyle: {
    padding: 3,
    elevation: 5,
  },
  badgeTextStyle: {
    color: COLORS.white,
    fontSize: 12,
  },
  bumpUpBadge: {
    height: 20,
    width: 20,
    backgroundColor: COLORS.badges["is-bump-up"],
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
  },
  container: {},
  featuredListingTop: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: "3%",

    marginVertical: 10,
  },
  featuredItemCategory: {
    fontSize: 12,
    color: COLORS.text_gray,
    paddingBottom: ios ? 3 : 1,
  },
  featuredItemDetailWrap: {
    alignItems: "flex-start",
    paddingHorizontal: 15,
    paddingVertical: 10,
    overflow: "hidden",
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
  featuredItemLocation: {
    color: COLORS.text_gray,
    fontSize: 12,
    paddingHorizontal: 5,
  },
  featuredItemLocationWrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 2,
    paddingBottom: ios ? 5 : 3,
  },
  featuredItemPrice: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "bold",
  },
  featuredItemTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.text_dark,
    paddingBottom: ios ? 3 : 1,
  },
  featuredItemWrap: {
    marginHorizontal: screenWidth * 0.015,
    overflow: "hidden",
    borderRadius: 3,
    marginBottom: screenWidth * 0.03,
    width: screenWidth * 0.455,
    elevation: 4,
  },
  soldOutBadge: {
    position: "absolute",
    backgroundColor: COLORS.primary,
    // backgroundColor: COLORS.badges["is-sold"],
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 3,
    top: ios ? "8%" : "6%",
    left: ios ? "54%" : "56%",
    transform: [{ rotate: "45deg" }],
    width: ios ? "60%" : "60%",
    flex: 1,
    elevation: 7,
    zIndex: 20,
    shadowColor: "#000",
    shadowRadius: 4,
    shadowOpacity: 0.2,
    shadowOffset: {
      height: 2,
      width: 2,
    },
  },
  soldOutBadgeMessage: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
});

export default ListingCard;
