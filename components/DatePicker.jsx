import React, { useState } from "react";
import { View, Platform, StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import AppButton from "./AppButton";

const DatePicker = ({ field, onSelect, value }) => {
  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState("date");
  const [show, setShow] = useState(false);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === "ios");
    setDate(currentDate);
    onSelect(currentDate, field);
  };

  const showMode = (currentMode) => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode("date");
  };

  const showTimepicker = () => {
    showMode("time");
  };

  return (
    <View style={styles.mainWrap}>
      <View style={styles.dateTimeWrap}>
        <AppButton
          onPress={showDatepicker}
          title={value ? value.split(" ")[0] : "Select Date"}
          style={styles.button}
        />
        {field.date.type === "date_time" && (
          <AppButton
            onPress={showTimepicker}
            title={value ? value.split(" ")[1] : "Select Time"}
            style={styles.button}
          />
        )}
      </View>
      {show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode={mode}
          display="default"
          onChange={onChange}
          is24Hour={true}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    width: "auto",
  },
  container: {},
  dateTimeWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    width: "100%",
  },
  mainWrap: {
    width: "100%",
  },
});

export default DatePicker;
