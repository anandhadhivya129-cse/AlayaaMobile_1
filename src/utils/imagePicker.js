import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

/**
 * Ask the user whether they want to take a new photo with the camera
 * or pick an existing one from their photo library, then launch the
 * matching picker with the right permission request.
 *
 * @param {object} options
 * @param {boolean} [options.allowsMultipleSelection] - only applies to the library picker
 * @param {number}  [options.selectionLimit] - only applies to the library picker
 * @param {number}  [options.quality] - 0 to 1, defaults to 0.7
 * @param {[number, number]} [options.aspect] - only applies when allowsEditing is true
 * @param {boolean} [options.allowsEditing] - crop/edit after capture, defaults to false
 * @returns {Promise<{canceled: boolean, assets?: Array, error?: string}>}
 */
export function pickImageFromCameraOrLibrary(options = {}) {
  const {
    allowsMultipleSelection = false,
    selectionLimit = 1,
    quality = 0.7,
    aspect,
    allowsEditing = false,
  } = options;

  return new Promise((resolve) => {
    const openCamera = async () => {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        resolve({ canceled: true, error: 'Camera permission is required to take a photo.' });
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality,
        allowsEditing,
        ...(allowsEditing && aspect ? { aspect } : {}),
      });
      resolve(result.canceled ? { canceled: true } : { canceled: false, assets: result.assets });
    };

    const openLibrary = async () => {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        resolve({ canceled: true, error: 'Photo library permission is required to choose a photo.' });
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality,
        allowsEditing,
        allowsMultipleSelection,
        selectionLimit,
        ...(allowsEditing && aspect ? { aspect } : {}),
      });
      resolve(result.canceled ? { canceled: true } : { canceled: false, assets: result.assets });
    };

    Alert.alert(
      'Add Photo',
      'Choose how you want to add a photo',
      [
        { text: 'Take Photo', onPress: openCamera },
        { text: 'Choose from Library', onPress: openLibrary },
        { text: 'Cancel', style: 'cancel', onPress: () => resolve({ canceled: true }) },
      ],
      { cancelable: true, onDismiss: () => resolve({ canceled: true }) }
    );
  });
}