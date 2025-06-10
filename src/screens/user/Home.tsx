import { useState } from 'react';
import { Card, HeadingWithViewAll, HomeHeader, Wrapper } from 'components/index';
import { COLORS } from 'utils/colors';
import { IMAGES } from 'constants/assets';
import { FlatList, StyleSheet, View } from 'react-native';
import { FontSize, FontWeight } from 'types/fontTypes';


const services = [
  {
    title: "Lorem Ipsum",
    currency: "$10/Hour",
    location: "Abu Dhabi"
  },
  {
    title: "Lorem Ipsum",
    currency: "$10/Hour",
    location: "Abu Dhabi"
  },
  {
    title: "Lorem Ipsum",
    currency: "$10/Hour",
    location: "Abu Dhabi"
  },
  {
    title: "Lorem Ipsum",
    currency: "$10/Hour",
    location: "Abu Dhabi"
  },
  {
    title: "Lorem Ipsum",
    currency: "$10/Hour",
    location: "Abu Dhabi"
  },
  {
    title: "Lorem Ipsum",
    currency: "$10/Hour",
    location: "Abu Dhabi"
  },
  {
    title: "Lorem Ipsum",
    currency: "$10/Hour",
    location: "Abu Dhabi"
  },
]

export const Home = () => {
  const [isListView, setIsListView] = useState(false)



  const renderItem = ({ item, index }: any) => {
    return (
      <Card
        titleStyle={styles.servicesTitle}
        containerStyle={styles.servicesCard}
        key={index}
        uri={IMAGES.DEFAULT_IMAGE}
        title={item.title}
        description={item.description}
        type="2" />
    )
  }


  const renderItemTopRated = ({ item, index }: any) => {
    return (
      <Card
        titleStyle={styles.topRatedTitle}
        key={index}
        containerStyle={styles.topRatedCard}
        uri={IMAGES.DEFAULT_IMAGE}
        title={item.title}
        currency={item?.currency}
        location={item?.location}
        type="3" />
    )
  }


  return (
    <>
      <HomeHeader
        setIsListView={() => setIsListView(!isListView)}
        isListView={isListView}
        onBellPress={() => { }}
        onLocationPress={() => { }}
        title="Hey, Jacob 👋"
        location='408, Lorem ipsum set dud emit' />
      <Wrapper useScrollView>


        <HeadingWithViewAll onPress={() => { }} title="Service Categories" />
        <Card
          containerStyle={{ marginBottom: 20 }}
          uri={IMAGES.DEFAULT_IMAGE}
          title="Category 1"
          description='Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.'
          type="1" />


        <HeadingWithViewAll onPress={() => { }} title="Services" />


        <FlatList
          showsHorizontalScrollIndicator={false}
          data={services}
          renderItem={renderItem}
          keyExtractor={(_, i) => i.toString()}
          horizontal
        />

        <HeadingWithViewAll onPress={() => { }} title="Top rated service provider" />



        <FlatList
          style={{ marginBottom: 20 }}
          showsHorizontalScrollIndicator={false}
          data={services}
          renderItem={renderItemTopRated}
          keyExtractor={(_, i) => i.toString()}
          horizontal
        />

        <Card
          containerStyle={{ marginBottom: 20 }}
          uri={IMAGES.DEFAULT_IMAGE}
          title="Category 1"
          description='Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.'
          type="1" />




        <HeadingWithViewAll onPress={() => { }} title="Services" />


        <FlatList
          showsHorizontalScrollIndicator={false}
          data={services}
          renderItem={renderItem}
          keyExtractor={(_, i) => i.toString()}
          horizontal
        />


        <HeadingWithViewAll onPress={() => { }} title="Top rated service provider" />



        <FlatList
          style={{ marginBottom: 20 }}
          showsHorizontalScrollIndicator={false}
          data={services}
          renderItem={renderItemTopRated}
          keyExtractor={(_, i) => i.toString()}
          horizontal
        />



      </Wrapper>
    </>

  );
};




const styles = StyleSheet.create({
  servicesCard: {
    width: 110,
    height: 90,
    marginBottom: 8,
  },
  servicesTitle: {
    fontSize: FontSize.Small,
    fontWeight: FontWeight.Normal,
    color: COLORS.BLACK,
    textAlign: 'center',
    marginBottom: 20,
  },
  topRatedCard: {
    marginBottom: 20,
    height: 'auto',
  },
  topRatedTitle: {
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.Medium,
    color: COLORS.BLACK,
    paddingHorizontal: 20,
    marginTop: 10
  }
});
