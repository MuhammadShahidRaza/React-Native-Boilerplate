import { useRef, useState } from 'react';
import { Button, Card, Dropdown, HeadingWithViewAll, HomeHeader, Icon, Input, RadioButton, RowComponent, Typography, Wrapper } from 'components/index';
import { COLORS } from 'utils/colors';
import { IMAGES } from 'constants/assets';
import { FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { FontSize, FontWeight } from 'types/fontTypes';
import MapView, { Marker } from 'react-native-maps';
import { COMMON_TEXT, LANGUAGES, SCREEN, SCREENS, VARIABLES } from 'constants/index';
import { navigate } from 'navigation/Navigators';
import { BottomSheet } from 'components/common/BottomSheet';


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
  const [selectedCategory, setSelectedCategory] = useState('');

  const refRBSheet = useRef(null);


  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <HomeHeader
          setIsListView={() => setIsListView(!isListView)}
          isListView={isListView}
          onBellPress={() => { }}
          onLocationPress={() => refRBSheet?.current?.open()}
          title="Hey, Jacob 👋"
          location='408, Lorem ipsum set dud emit' />
      </View>


      {
        isListView ? <ListView /> : <Maps />
      }



      {
        <BottomSheet
          height={SCREEN.height * 0.55}
          ref={refRBSheet}
          containerStyles={styles.bottomSheetContainer}>
          <>

            <RadioButton
              containerStyle={styles.radioButtonContainer}
              // optionsContainerStyle={styles.radioButtonOptionsContainer}
              options={languages}
              selectedOption={languages[0] || languages[0]?.name}
              onSelectOption={() => { }}
            />

            <Input
              containerStyle={{ marginEnd: 20, width: '100%' }}
              inputContainerWithTitle={{ flex: 1 }}
              name={COMMON_TEXT.COUNTRY}
              title={COMMON_TEXT.COUNTRY}
              onChangeText={() => { }}
              placeholder={COMMON_TEXT.ENTER_COUNTRY}

              endIcon={{
                componentName: VARIABLES.MaterialIcons,
                iconName: 'my-location',
                size: FontSize.Large,
              }}
            />

            <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
              <Dropdown
                width={'48%'}
                containerStyle={{
                  borderWidth: 0,
                  backgroundColor: COLORS.INPUT_BACKGROUND,
                }}
                options={therapyList}
                selectedValue={selectedCategory}
                onSelect={setSelectedCategory}
              />
              <Dropdown
                width={'48%'}

                containerStyle={{
                  borderWidth: 0,
                  backgroundColor: COLORS.INPUT_BACKGROUND,
                }}
                options={therapyList}
                selectedValue={selectedCategory}
                onSelect={setSelectedCategory}
              />
            </View>

            <Input
              containerStyle={{ marginEnd: 20, width: '100%' }}
              inputContainerWithTitle={{ flex: 1 }}
              name={COMMON_TEXT.ADDRESS}
              title={COMMON_TEXT.ADDRESS}
              onChangeText={() => { }}
              placeholder={COMMON_TEXT.ADDRESS}
            />

            <Button title={COMMON_TEXT.ADD} onPress={() => { }} style={styles.button} />

          </>

        </BottomSheet>
      }
    </View>
  )


};

const therapyList = [
  {
    name: 'Wet Cupping',
    leftIcon: true,
    leftIconColor: COLORS.GREEN,
    leftIconComponentName: VARIABLES.FontAwesome,
    leftIconName: "bars",
    rightArrow: true
  },
  {
    name: 'Wet Cupping',
    leftIcon: true,
    leftIconColor: COLORS.GREEN,
    leftIconComponentName: VARIABLES.FontAwesome,
    leftIconName: "bars",
    rightArrow: true
  },
  {
    name: 'Wet Cupping',
    leftIcon: true,
    leftIconColor: COLORS.GREEN,
    leftIconComponentName: VARIABLES.FontAwesome,
    leftIconName: "bars",
    rightArrow: true
  },
  {
    name: 'Wet Cupping',
    leftIcon: true,
    leftIconColor: COLORS.GREEN,
    leftIconComponentName: VARIABLES.FontAwesome,
    leftIconName: "bars",
    rightArrow: true
  },
  {
    name: 'Wet Cupping',
    leftIcon: true,
    leftIconColor: COLORS.GREEN,
    leftIconComponentName: VARIABLES.FontAwesome,
    leftIconName: "bars",
    rightArrow: true
  },
  {
    name: 'Wet Cupping',
    leftIcon: true,
    leftIconColor: COLORS.GREEN,
    leftIconComponentName: VARIABLES.FontAwesome,
    leftIconName: "bars",
    rightArrow: true
  },
  {
    name: 'Wet Cupping',
    leftIcon: true,
    leftIconColor: COLORS.GREEN,
    leftIconComponentName: VARIABLES.FontAwesome,
    leftIconName: "bars",
    rightArrow: true
  },

];


const Maps = () => {
  const [selectedCategory, setSelectedCategory] = useState('');

  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.dropdownContainer, { zIndex: 5000 }]}>
        <Dropdown
          containerStyle={{ borderWidth: 2, borderColor: COLORS.BLACK }}
          leftIcon
          leftIconColor={COLORS.GREEN}
          leftIconComponentName={VARIABLES.FontAwesome}
          leftIconName='bars'
          options={therapyList}
          selectedValue={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </View>


      <View style={[styles.dropdownContainer, { top: 120 }]}>
        <Dropdown
          containerStyle={{ borderWidth: 2, borderColor: COLORS.BLACK }}
          leftIcon
          leftIconColor={COLORS.GREEN}
          leftIconComponentName={VARIABLES.AntDesign}
          leftIconName='setting'
          options={therapyList}
          selectedValue={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </View>
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
    </View>

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

        <TouchableOpacity onPress={() => navigate(SCREENS.FILTER)}>
          <Image style={styles.filterIcon} source={IMAGES.FILTER} />
        </TouchableOpacity>

      </RowComponent>
      <HeadingWithViewAll onPress={() => navigate(SCREENS.CATEGORIES)} title="Service Categories" />
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
  dropdownContainer: {
    position: 'absolute',
    backgroundColor: COLORS.WHITE,
    zIndex: 2000,
    top: 50,
    left: 20,
    right: 20
  },
  bottomSheetContainer: {
    borderTopEndRadius: 20,
    borderTopStartRadius: 20,
    padding: 20,
  },
  radioButtonContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 20
  },
  subChildLocation: {
    fontSize: FontSize.Small,
    fontWeight: FontWeight.Normal,
  },
  button: {
    alignSelf: 'center'
  }
});



const languages = [
  {
    name: "Current Location",
    subChild: <RowComponent>
      <Icon
        componentName={VARIABLES.Ionicons}
        iconName={'location-outline'}
        size={15}
        onPress={() => { }}
        iconStyle={{
          marginEnd: 10,
          marginVertical: 10,
          color: COLORS.GREEN,
        }}
      />
      <Typography style={styles.subChildLocation}>408, Lorem ipsum set dud emit</Typography>
    </RowComponent>

  },
  "Add New Location"
];
