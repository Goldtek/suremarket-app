import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList, 
  Dimensions,
  ImageBackground
} from "react-native";
import { Divider } from 'react-native-paper';
import { FontAwesome5 } from "@expo/vector-icons";
import { COLORS } from "../variables/color";


const { width } = Dimensions.get('screen');

const MyMembershipScreen = ({navigation}) => {
  const data = [{
    title: 'Basic Plan',
    desc1: 'Upload 5 items per month',
    desc2: '3 Featured items in front page',
    price: 2000,
    ads: 3
  },
  {
    title: 'Advance Plan',
    desc1: 'Upload 10 items per month',
    desc2: '6 Featured items in front page',
    price: 3000,
    ads: 6
  },
  {
    title: 'Enterprise Plan',
    desc1: 'Upload 20 items per month',
    desc2: '15 Featured items in front page',
    price: 5000,
    ads: 15
  },
]
  const membershipItem = ({item}) => (
    <View style={{ marginTop: 40}}>
      <View style={styles.header}>
        <Text style={{color: '#ff8e00', fontWeight: 'bold', fontSize: 18}}>{item.title}</Text>
        <Text style={{ fontWeight: 'bold'}}>#{item.price}</Text>
      </View>
      <View style={{ flexDirection: 'row', marginLeft: 10}}>
        <FontAwesome5 name="check" size={14} color={COLORS.text_dark} style={{ marginTop: 10}} />
        <Text style={styles.text}>{item.desc1}</Text>
      </View>
      <View style={{ flexDirection: 'row', marginLeft: 10}}>
        <FontAwesome5 name="check" size={14} color={COLORS.text_dark} style={{ marginTop: 10}} />
        <Text style={styles.text}>{item.desc2}</Text>
      </View>
      <TouchableOpacity style={styles.buttonContainer} activeOpacity={0.8} onPress={() => navigation.navigate('Pay',{price: item.price, ads: item.ads})}>
          <Text style={{ color: '#fff', fontWeight: '600'}}>Subscribe</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View   style={styles.container}>
     <FlatList
     data={data}
     ItemSeparatorComponent={() => (
         <Divider
           style={{height: 1.5, backgroundColor: '#F8F8F8'}}
         />
       )}
     renderItem={membershipItem}
     />
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    width: "100%",
    paddingVertical: 6,
    borderRadius: 3,
    marginTop: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "500",
  },
  container: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    flex: 1,
  },
  mainWrap: {
    backgroundColor: COLORS.bg_dark,
    paddingHorizontal: "3%",
    paddingVertical: 25,
    width: "100%",
  },
  membershipText: {
    fontSize: 16,
    color: COLORS.text_gray,
    marginBottom: 5,
    textAlign: "justify",
    lineHeight: 22,
  },
  separator: {
    width: "100%",
    marginVertical: 20,
  },
  title: {
    fontSize: 18,
    color: COLORS.text_dark,
    paddingLeft: 10,
  },
  titleWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonContainer: {
    backgroundColor: '#ff0000', 
    height: 45, 
    width: width - 30  , 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingLeft: 5, 
    marginHorizontal: 10,
    borderRadius: 5,
  },
  header: {
  //  backgroundColor: '#fff', 
    height: 40, 
    width, 
    alignItems: 'flex-start', 
    paddingHorizontal: 10,
    paddingLeft: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  text: { 
    fontSize: 14, 
    marginVertical: 10, 
    marginHorizontal: 10 
  }
});

export default MyMembershipScreen;
