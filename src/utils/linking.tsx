import {Linking} from 'react-native';

export async function openUrl(url) {
  await Linking.openURL(`https://${url}`)
    .then(() => {
      // URL opened successfully
    })
    .catch(err => {
      console.error('Error opening URL: ', err);
    });
}

export async function openEmail(email) {
  await Linking.openURL(`mailto:${email}`)
    .then(() => {
      // URL opened successfully
    })
    .catch(err => {
      console.error('Error opening URL: ', err);
    });
}

export async function openPhoneNumber(phoneNumber) {
  await Linking.openURL(`tel:${phoneNumber}`)
    .then(() => {
      // URL opened successfully
    })
    .catch(err => {
      console.error('Error opening URL: ', err);
    });
}

export async function openMessage(phoneNumber) {
  const messageUrl = `sms:${phoneNumber}`;

  try {
    await Linking.openURL(messageUrl);
    console.log('Message app opened successfully');
  } catch (error) {
    console.error('Error opening message app:', error);
  }
}

export async function openSetting() {
  await Linking.openSettings()
    .then(() => {
      // URL opened successfully
    })
    .catch(err => {
      console.error('Error opening URL: ', err);
    });
}
