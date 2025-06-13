import { Button, Card, Header, HeadingWithViewAll, MessageBox, RowComponent, Typography, Wrapper } from 'components/common';
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


const services = [
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

const awards = [
  {
    image: IMAGES.DEFAULT_IMAGE,
  },
  {
    image: IMAGES.DEFAULT_IMAGE,
  },
];

const reviews = [
  {
    rating: '2.5',
    message: "Awesome Service",
    userName: "Jenny Wilson",
    date: "21 Jan"
  },
  {
    rating: '2.5',
    message: "Awesome Service",
    userName: "Jenny Wilson",
    date: "21 Jan"
  },
  {
    rating: '2.5',
    message: "Awesome Service",
    userName: "Jenny Wilson",
    date: "21 Jan"
  },
  {
    rating: '2.5',
    message: "Awesome Service",
    userName: "Jenny Wilson",
    date: "21 Jan"
  },
  {
    rating: '2.5',
    message: "Awesome Service",
    userName: "Jenny Wilson",
    date: "21 Jan"
  },

];


interface reviewCardProp {
  userName?: string;
  rating?: string;
  date?: string;
  message?: string;
  key?: number | string
}


export const ReviewCard = ({ userName, rating, date, message, key }: reviewCardProp) => {
  return (
    <View key={key} style={reviewStyles.reviewsContainer}>
      <RowComponent style={reviewStyles.topContainer}>
        <RowComponent style={{ justifyContent: 'center' }}>
          <Image style={reviewStyles.ratingIcon} source={IMAGES.RATINGS} />
          <Typography style={reviewStyles.ratingText}>{rating}</Typography>

          <Typography style={reviewStyles.userName}>{userName}</Typography>

        </RowComponent>
        <Typography style={reviewStyles.date}>{date}</Typography>

      </RowComponent>
      <Typography style={reviewStyles.message}>{message}</Typography>

    </View>
  )
}

export const ProviderDetails = () => {


  const renderItem = ({ item, index }: any) => {
    return (
      <Card
        titleStyle={styles.servicesTitle}
        containerStyle={[styles.servicesCard, { marginEnd: index === services.length - 1 ? 12 : 0 }]}
        uri={IMAGES.DEFAULT_IMAGE}
        title={item?.title}
        type="2"
      />
    )
  }


  const renderReviews = ({ item, index }: any) => {
    return (
      <ReviewCard
        key={index}
        userName={item.userName}
        rating={item.rating}
        date={item.date}
        message={item.message}

      />
    )
  }


  return (
    <Wrapper useScrollView>
      <Header title={"Provider"} />


      <View style={styles.headerContainer}>
        <Card
          titleStyle={styles.headerTitle}
          containerStyle={styles.headerCard}
          uri={IMAGES.DEFAULT_IMAGE}
          title={"Lorem Ipsum"}
          type="2"
          rating='5.0'
        />
      </View>

      <HeadingWithViewAll title="Other Services" />


      <FlatList
        data={services}
        horizontal
        renderItem={renderItem}
        style={{ marginBottom: 20 }}
      />

      <HeadingWithViewAll title="Profile Summary" />

      <Typography style={styles.summary}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </Typography>


      <HeadingWithViewAll title="Qualifications & Awards" />

      <FlatList
        data={awards}
        horizontal
        renderItem={renderItem}
      />

      <HeadingWithViewAll title="Completed Projects" />

      <FlatList
        data={awards}
        horizontal
        renderItem={renderItem}
      />


      <HeadingWithViewAll title="Reviews & Feedback" />


      <FlatList
        pagingEnabled
        data={reviews}
        horizontal
        renderItem={renderReviews}
        style={{ marginBottom: 20 }}
        showsHorizontalScrollIndicator={false}
      />

      <HeadingWithViewAll title="Location" />
      <Typography style={[styles.summary, { lineHeight: undefined, fontSize: FontSize.Medium }]}>
        Abu Dhabi
      </Typography>


      <HeadingWithViewAll title="Per Hour Charges" />
      <Typography style={[styles.summary, { lineHeight: undefined, fontSize: FontSize.Medium }]}>
        $10/Hour
      </Typography>


      <Button title={COMMON_TEXT.BOOK_Now} onPress={() => { }} style={styles.button} />


    </Wrapper>
  );
};




const reviewStyles = StyleSheet.create({
  reviewsContainer: {
    marginBottom: 20,
    backgroundColor: COLORS.WHITE_OPACITY,
    marginStart: 20,
    borderRadius: 20,
    width: SCREEN.width - 40,
    padding: 12
  },
  topContainer: {
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 20,
    alignItems: 'center'
  },
  ratingIcon: {
    width: 12,
    height: 12,
    marginEnd: 4
  },
  ratingText: {
    fontSize: FontSize.Small,
    fontWeight: FontWeight.Normal,
    marginEnd: 16
  },
  userName: {
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.SemiBold,
  },
  date: {
    fontSize: FontSize.Small,
    fontWeight: FontWeight.Normal,
    color: COLORS.GRAY
  },
  message: {
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.Normal,
    color: COLORS.GRAY
  },
});




const styles = StyleSheet.create({
  headerContainer: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  headerCard: {
    width: 170,
    height: 170,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: FontSize.Small,
    fontWeight: FontWeight.Normal,
    color: COLORS.BLACK,
    textAlign: 'center',
  },
  servicesCard: {
    width: 130,
    height: 100,
    marginBottom: 8,
  },
  servicesTitle: {
    fontSize: FontSize.Small,
    fontWeight: FontWeight.Normal,
    color: COLORS.BLACK,
    textAlign: 'center',
  },
  summary: {
    fontSize: FontSize.Small,
    fontWeight: FontWeight.Normal,
    color: COLORS.GRAY,
    paddingHorizontal: 20,
    lineHeight: 20,
    marginBottom: 20
  },
  button: {
    alignSelf: 'center',
    marginBottom: 40
  }
});
