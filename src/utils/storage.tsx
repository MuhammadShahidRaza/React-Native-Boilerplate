import AsyncStorage from '@react-native-async-storage/async-storage';

export const setItem = (key, value) => {
  try {
    AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.log('setItem ' + e);
  }
};
export const getItem = async key => {
  try {
    return JSON.parse(await AsyncStorage.getItem(key));
  } catch (e) {
    console.log('getItem ' + e);
  }
};

export const removeItem = async key => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.log('removeItem ' + e);
  }
};

export const clearAllStorageItems = async () => {
  try {
    await AsyncStorage.clear();
  } catch (e) {
    console.log('clearAllStorageItems ' + e);
  }
};

export const removeMultipleItem = async keys => {
  try {
    await AsyncStorage.multiRemove(keys);
  } catch (e) {
    console.log('clearAllStorageItems ' + e);
  }
};
