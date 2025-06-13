import { Header, MessageBox, RowComponent, Typography, Wrapper } from 'components/common';
import { COMMON_TEXT, SCREEN } from 'constants/screens';
import { IMAGES } from 'constants/assets';
import { navigate } from 'navigation/Navigators';
import { SCREENS } from 'constants/routes';
import { screenHeight, screenWidth } from 'utils/helpers';
import { FontSize, FontWeight } from 'types/fontTypes';
import { FlatList, StyleSheet, View } from 'react-native';
import { COLORS } from 'utils/colors';
import { Image } from 'react-native';
import { ScrollView } from 'react-native';


const notifications = [
  {
    title: "Lorem Ipsum ",
    description: "Lorem ipsum dolor sit amet, cons ectetur adipiscing elit",
    image: IMAGES.DEFAULT_IMAGE,
  },
  {
    title: "Lorem Ipsum ",
    description: "Lorem ipsum dolor sit amet, cons ectetur adipiscing elit",
    image: IMAGES.DEFAULT_IMAGE,
  },
  {
    title: "Lorem Ipsum ",
    description: "Lorem ipsum dolor sit amet, cons ectetur adipiscing elit",
    image: IMAGES.DEFAULT_IMAGE,
  },
  {
    title: "Lorem Ipsum ",
    description: "Lorem ipsum dolor sit amet, cons ectetur adipiscing elit",
    image: IMAGES.DEFAULT_IMAGE,
  },
  {
    title: "Lorem Ipsum ",
    description: "Lorem ipsum dolor sit amet, cons ectetur adipiscing elit",
    image: IMAGES.DEFAULT_IMAGE,
  },
  {
    title: "Lorem Ipsum ",
    description: "Lorem ipsum dolor sit amet, cons ectetur adipiscing elit",
    image: IMAGES.DEFAULT_IMAGE,
  },


];

export const Notification = () => {


  const renderItem = ({ item, index }) => {
    return (
      <RowComponent style={styles.notificationsItemContainer} key={index}>
        <Image source={{ uri: item?.image }} style={styles.notificationsImage} />
        <View style={styles.notificationsContentContainer}>
          <Typography style={styles.notificationsTitle}>
            {item.title}
          </Typography>
          <Typography style={styles.notificationsDes}>
            {item.description}
          </Typography>
        </View>
      </RowComponent>
    )
  }


  return (
    <Wrapper useScrollView>
      <Header title={COMMON_TEXT.NOTIFICATIONS} />

      <Typography style={styles.headings}>Today</Typography>

      <FlatList
        scrollEnabled={false}
        data={notifications}
        renderItem={renderItem} />


      <Typography style={styles.headings}>Yesterday</Typography>
      <FlatList
        scrollEnabled={false}
        data={notifications}
        renderItem={renderItem} />

    </Wrapper>
  );
};



const styles = StyleSheet.create({

  headings: {
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.Normal,
    color: COLORS.BLACK,
    marginStart: 20,
    marginBottom: 20
  },
  notificationsItemContainer: {
    width: SCREEN.width,
    paddingHorizontal: 20,
    marginBottom: 16
  },
  notificationsImage: {
    width: 80,
    height: 80,
    borderRadius: 60,
    overflow: 'hidden',
    marginEnd: 16
  },
  notificationsContentContainer: {
    width: SCREEN.width - (100 + 16),
    justifyContent: 'center'
  },
  notificationsTitle: {
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.Bold,
    color: COLORS.BLACK,
    marginBottom: 2
  },
  notificationsDes: {
    fontSize: FontSize.Small,
    fontWeight: FontWeight.Normal,
    color: COLORS.GRAY,
  },
});
