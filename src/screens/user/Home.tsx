import { useState } from 'react';
import { Card, HeadingWithViewAll, HomeHeader, Input, RowComponent, Wrapper } from 'components/index';
import { COLORS } from 'utils/colors';
import { IMAGES } from 'constants/assets';
import { FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { FontSize, FontWeight } from 'types/fontTypes';
import MapView, { Marker } from 'react-native-maps';
import { COMMON_TEXT, SCREENS, VARIABLES } from 'constants/index';
import { navigate } from 'navigation/Navigators';


const services = [
  {
    title: "Lorem Ipsum",
    currency: "$10/Hour",
    location: "Abu Dhabi",
    rating: "2.5"
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


const region = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: 0.015,
  longitudeDelta: 0.0121,
}

export const Home = () => {
  const [isListView, setIsListView] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <HomeHeader
          setIsListView={() => setIsListView(!isListView)}
          isListView={isListView}
          onBellPress={() => { }}
          onLocationPress={() => { }}
          title="Hey, Jacob 👋"
          location='408, Lorem ipsum set dud emit' />
      </View>


      {
        isListView ? <ListView /> : <Maps />
      }
    </View>
  )


};


const Maps = () => {
  return (
    <MapView
      style={styles.map}
      region={region}
    >

      <Marker
        coordinate={region}
        pinColor={COLORS.RED}
        draggable
      />
    </MapView>

  )
}

const ListView = () => {

  const renderItem = ({ item, index }: any) => {
    return (
      <Card
        titleStyle={styles.servicesTitle}
        containerStyle={[styles.servicesCard, { marginEnd: index === services.length - 1 ? 12 : 0 }]}
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
        containerStyle={[styles.topRatedCard, { marginEnd: index === services.length - 1 ? 12 : 0 }]}
        uri={IMAGES.DEFAULT_IMAGE}
        title={item.title}
        currency={item?.currency}
        location={item?.location}
        rating={item?.rating}
        type="3" />
    )
  }


  return (

    <Wrapper useScrollView>
      <RowComponent style={styles.searchContainer}>


        <Input
          onPress={() => navigate(SCREENS.SEARCH)}
          editable={false}
          onChangeText={() => { }}
          containerStyle={{ marginBottom: 0, flex: 1, marginEnd: 20 }}
          inputContainerWithTitle={{ flex: 1 }}
          name={COMMON_TEXT.SEARCH}
          returnKeyType='done'
          placeholder={COMMON_TEXT.SEARCH}

          endIcon={{
            componentName: VARIABLES.AntDesign,
            iconName: 'search1',
            color: COLORS.GREEN,
            size: FontSize.MediumLarge,
          }} />

        <TouchableOpacity onPress={navigate(SCREENS.FILTER)}>
          <Image style={styles.filterIcon} source={IMAGES.FILTER} />
        </TouchableOpacity>

      </RowComponent>
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


  );
}







const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  headerContainer: {
    backgroundColor: COLORS.WHITE,
    zIndex: 2000
  },
  searchContainer: {
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20
  },
  filterIcon: {
    width: 20,
    height: 20,
  },
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
    marginTop: 10
  },
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    flex: 1
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    marginTop: 20

  },
});
