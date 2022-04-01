import React, { useState } from "react";
import { View } from "react-native";
import ImageInput from "./ImageInput";
import DraggableFlatList from "react-native-draggable-flatlist";
import AppButton from "./AppButton";

const ImageInputList = ({
  imageUris = [],
  onRemoveImage,
  onAddImage,
  maxCount,
  reorder,
}) => {
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const renderImageItem = ({ item, drag, isActive }) => {
    return (
      <ImageInput
        imageUri={item}
        onChangeImage={() => onRemoveImage(item)}
        drag={drag}
        active={isActive}
        display={true}
      />
    );
  };

  return (
    <>
      <View
        style={{
          paddingHorizontal: "3%",
          marginVertical: !imageUris.length ? 15 / 2 : 15,
        }}
      >
        <DraggableFlatList
          ListHeaderComponent={
            imageUris.length < maxCount && (
              <ImageInput
                onChangeImage={(uri) => {
                  onAddImage(uri);
                  setPhotoModalVisible(false);
                }}
                addingImage={photoModalVisible}
                closePhotoModal={() => setPhotoModalVisible(false)}
                display={false}
              />
            )
          }
          data={imageUris}
          renderItem={renderImageItem}
          keyExtractor={(item, index) => `draggable-item-${index}`}
          onDragEnd={({ data }) => {
            reorder(data);
          }}
          horizontal
        />
      </View>
      <View style={{ alignItems: "center" }}>
        <AppButton
          title="Add Photos"
          style={{ width: "40%" }}
          onPress={() => setPhotoModalVisible(true)}
          disabled={imageUris.length >= maxCount}
        />
      </View>
    </>
  );
};

export default ImageInputList;
