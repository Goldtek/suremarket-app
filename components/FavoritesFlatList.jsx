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
import { COLORS } from "../variables/color";
import { FontAwesome } from "@expo/vector-icons";
import { getPrice, decodeString } from "../helper/helper";
import moment from "moment";
import { useStateValue } from "../StateProvider";

const fallbackImageUrl = "../assets/200X150.png";
const viewsText = "Views :";

const FavoritesFlatList = ({ onDelete, item, onClick }) => {
  const [{ config }] = useStateValue();
  const getTaxonomy = (data) => {
    if (data) {
      return decodeString(data);
    } else {
      return "";
    }
  };
  const getImageURL = () => {
    if (item.images.length) {
      return item.images[0].sizes.thumbnail.src;
    }
  };
  return (
    <View style={styles.listAd}>
      <TouchableWithoutFeedback onPress={onClick}>
        <View style={styles.imageWrap}>
          <Image
            style={styles.image}
            source={
              item.images.length
                ? {
                    uri: getImageURL(),
                  }
                : // eslint-disable-next-line no-undef
                  require(fallbackImageUrl)
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
              {!!item.categories.length && (
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
              alignItems: "flex-end",
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity style={styles.iconButton} onPress={onDelete}>
              <FontAwesome name="trash-o" size={20} color={COLORS.red} />
            </TouchableOpacity>

            <Text style={styles.price} numberOfLines={1}>
              {getPrice(config.currency, item.price_type, item.price)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.green,
    borderRadius: 0,
    paddingVertical: 5,
    paddingHorizontal: 20,
    width: "auto",
  },
  buttonText: {
    fontSize: 12,
  },
  buttonWrap: {
    alignItems: "center",
  },
  details: {
    flexDirection: "row",
    justifyContent: "space-between",
    flex: 3,
    alignItems: "center",
  },
  detailsLeft: {
    paddingLeft: "4%",
    flex: 1,
  },
  detailsLeftRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailsLeftRowText: {
    fontSize: 12,
    color: COLORS.text_gray,
  },
  detailsRight: {
    justifyContent: "space-around",
    alignItems: "flex-end",
  },
  iconButton: {
    flex: 1,
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
    padding: "3%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.bg_dark,
    borderRadius: 5,
    marginVertical: 5,
  },
  title: {
    fontWeight: "bold",
    fontSize: 13,
  },
});

export default FavoritesFlatList;
