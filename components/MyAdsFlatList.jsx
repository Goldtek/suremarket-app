import React from "react";
import {
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { COLORS } from "../variables/color";
import { getPrice, decodeString } from "../helper/helper";
import moment from "moment";
import { useStateValue } from "../StateProvider";

const fallbackImageUrl = "../assets/200X150.png";
const viewsText = "Views : ";

const MyAdsFlatList = ({ onClick, item, onAction, onActionTouch }) => {
  const [{ config }] = useStateValue();

  const getImageURL = () => {
    if (item.images && !!item.images.length) {
      return item.images[0].sizes.thumbnail.src;
    }
  };
  const getTaxonomy = (data) => {
    if (data) {
      return decodeString(data);
    } else {
      return "";
    }
  };
  return (
    <View style={styles.listAd}>
      <TouchableWithoutFeedback onPress={onClick}>
        <View style={styles.imageWrap}>
          <Image
            style={styles.image}
            source={
              item.images && !!item.images.length
                ? {
                    uri: getImageURL(),
                  }
                : require(fallbackImageUrl)
            }
          />
        </View>
      </TouchableWithoutFeedback>
      <View style={styles.details}>
        <View style={styles.detailsLeft}>
          <TouchableWithoutFeedback onPress={onClick}>
            <View style={{ flex: 1, justifyContent: "flex-start" }}>
              <Text style={styles.title} numberOfLines={1}>
                {getTaxonomy(item.title)}
              </Text>
              {item.categories && !!item.categories.length && (
                <View style={styles.detailsLeftRow}>
                  <View style={styles.iconWrap}>
                    <Ionicons
                      name="ios-pricetags"
                      color={COLORS.text_gray}
                      size={12}
                    />
                  </View>
                  <Text style={styles.detailsLeftRowText}>
                    {getTaxonomy(item.categories[0].name)}
                  </Text>
                </View>
              )}
              <View style={styles.detailsLeftRow}>
                <View style={styles.iconWrap}>
                  <MaterialCommunityIcons
                    name="clock"
                    size={12}
                    color={COLORS.text_gray}
                  />
                </View>
                <Text style={styles.detailsLeftRowText}>
                  {moment(item.created_at).fromNow()}
                </Text>
              </View>
              <View style={styles.detailsLeftRow}>
                <View style={styles.iconWrap}>
                  <FontAwesome5 name="eye" size={12} color={COLORS.text_gray} />
                </View>
                <Text style={styles.detailsLeftRowText}>
                  {viewsText} {item.view_count}
                </Text>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
        <View style={styles.detailsRight}>
          <View
            style={{
              flex: 1,
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <View style={styles.buttonWrap}>
              <TouchableOpacity
                onPress={(e) => {
                  onActionTouch(e);
                  onAction();
                }}
              >
                <Entypo name="dots-three-horizontal" size={20} color="black" />
              </TouchableOpacity>
            </View>
            {item.badges.includes("is-sold") && (
              <View
                style={{
                  backgroundColor: COLORS.primary,
                  paddingVertical: 3,
                  paddingHorizontal: 6,
                  borderRadius: 3,
                }}
              >
                <Text
                  style={{
                    textTransform: "uppercase",
                    fontSize: 10,
                    color: COLORS.white,
                  }}
                >
                  Sold out
                </Text>
              </View>
            )}
            <Text style={styles.price}>
              {getPrice(config.currency, item.price_type, item.price)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonText: {},
  buttonWrap: {},
  details: {
    flexDirection: "row",
    justifyContent: "space-between",
    flex: 3,
    alignItems: "center",
  },
  detailsLeft: {
    paddingLeft: "4%",
    flex: 1,
    width: "100%",
  },
  detailsLeftRow: {
    flexDirection: "row",
    alignItems: "center",
    // flex: 1,
    marginVertical: 2,
  },
  detailsLeftRowText: {
    fontSize: 12,
    color: COLORS.text_gray,
  },
  detailsRight: {
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },

  iconWrap: {
    width: 20,
    alignItems: "center",
    paddingRight: 5,
  },
  image: {
    height: 80,
    width: "100%",
    resizeMode: "cover",
  },
  imageWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    height: 80,
    // width: 70,
    overflow: "hidden",
  },
  price: {
    fontWeight: "bold",
    color: COLORS.primary,
  },
  listAd: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: COLORS.bg_light,
    padding: 10,
    alignItems: "center",
    borderColor: COLORS.bg_dark,
    borderWidth: 1,
    borderRadius: 5,
    marginVertical: 5,
  },
  title: {
    fontWeight: "bold",
    fontSize: 13,
  },
});

export default MyAdsFlatList;
