import React from "react";
import { View, StyleSheet, Text, Image, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../variables/color";
import { getPrice, decodeString } from "../helper/helper";
import { useStateValue } from "../StateProvider";

const fallbackImageUrl = "../assets/200X150.png";

const SimilarAdFlatList = ({
  category,
  price,
  price_type,
  time,
  title,
  url,
  views,
  onClick,
}) => {
  const [{ config }] = useStateValue();
  return (
    <TouchableOpacity style={styles.listAd} onPress={onClick}>
      <View style={styles.imageWrap}>
        <Image
          style={styles.image}
          source={
            url !== null
              ? {
                  uri: url,
                }
              : // eslint-disable-next-line no-undef
                require(fallbackImageUrl)
          }
        />
      </View>
      <View style={styles.details}>
        <View style={styles.detailsLeft}>
          <Text style={styles.title} numberOfLines={1}>
            {decodeString(title)}
          </Text>
          {category && (
            <View style={styles.detailsLeftRow}>
              <View style={styles.iconWrap}>
                <Ionicons
                  name="ios-pricetags"
                  color={COLORS.text_gray}
                  size={12}
                />
              </View>
              <Text style={styles.detailsLeftRowText}>
                {decodeString(category)}
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
            <Text style={styles.detailsLeftRowText}>{time}</Text>
          </View>
          <View style={[styles.detailsLeftRow, { marginBottom: 0 }]}>
            <View style={styles.iconWrap}>
              <FontAwesome5 name="eye" size={12} color={COLORS.text_gray} />
            </View>
            <Text style={styles.detailsLeftRowText}>Visits: {views}</Text>
          </View>
        </View>
        <View style={styles.detailsRight}>
          <Text style={styles.price}>
            {getPrice(config.currency, price_type, price)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
    marginBottom: 3,
  },
  detailsLeftRowText: {
    fontSize: 12,
    color: COLORS.text_gray,
  },
  detailsRight: {
    justifyContent: "center",
    flex: 1,
    alignItems: "flex-end",
  },
  iconButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: COLORS.primary,
    marginHorizontal: 5,
    borderRadius: 3,
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
    width: 80,
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
    borderRadius: 5,
    borderWidth: 1,
    borderColor: COLORS.bg_dark,
    marginVertical: 5,

    padding: "3%",
    alignItems: "center",
  },
  title: {
    fontWeight: "bold",
    fontSize: 13,
    marginBottom: 3,
  },
});

export default SimilarAdFlatList;
