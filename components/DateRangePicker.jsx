import React, { useState } from "react";
import { View, Platform, StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import AppButton from "./AppButton";
import AppSeparator from "./AppSeparator";

const DatePicker = ({ value, onSelect, field }) => {
  const [date, setDate] = useState(new Date());
  const [dateEnd, setDateEnd] = useState(new Date());
  const [mode, setMode] = useState("date");
  const [modeEnd, setModeEnd] = useState("date");
  const [show, setShow] = useState(false);
  const [showEnd, setShowEnd] = useState(false);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === "ios");
    setDate(currentDate);
    onSelect("start", currentDate, field);
  };
  const onChangeEnd = (event, selectedDate) => {
    const currentDate = selectedDate || dateEnd;
    setShowEnd(Platform.OS === "ios");
    setDateEnd(currentDate);
    onSelect("end", currentDate, field);
  };

  const showMode = (currentMode) => {
    setShow(true);
    setMode(currentMode);
  };
  const showModeEnd = (currentMode) => {
    setShowEnd(true);
    setModeEnd(currentMode);
  };

  const showDatepicker = () => {
    showMode("date");
  };
  const showDatepickerEnd = () => {
    showModeEnd("date");
  };

  const showTimepicker = () => {
    showMode("time");
  };
  const showTimepickerEnd = () => {
    showModeEnd("time");
  };

  return (
    <View style={styles.mainWrap}>
      <View style={styles.dateTimeWrap}>
        <AppButton
          style={styles.button}
          onPress={showDatepicker}
          title={value ? value[0].split(" ")[0] : "Select Start Date"}
        />
        <AppButton
          style={styles.button}
          onPress={showDatepickerEnd}
          title={value ? value[1].split(" ")[0] : "Select End Date"}
        />
      </View>
      {field.date.type === "date_time_range" && (
        <>
          <AppSeparator style={styles.separator} />
          <View style={styles.dateTimeWrap}>
            <AppButton
              style={styles.button}
              onPress={showTimepicker}
              title={value ? value[0].split(" ")[1] : "Select Start Time"}
            />
            <AppButton
              style={styles.button}
              onPress={showTimepickerEnd}
              title={value ? value[1].split(" ")[1] : "Select End Time"}
            />
          </View>
        </>
      )}
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
      {showEnd && (
        <DateTimePicker
          testID="dateTimePicker"
          value={dateEnd}
          mode={modeEnd}
          display="default"
          onChange={onChangeEnd}
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
  separator: {
    width: "100%",
    marginVertical: 10,
  },
});

export default DatePicker;
