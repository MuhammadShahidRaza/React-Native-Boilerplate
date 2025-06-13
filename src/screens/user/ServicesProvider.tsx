import { useRef, useState } from 'react';
import { Button, Card, Dropdown, Header, HeadingWithViewAll, HomeHeader, Icon, Input, RadioButton, RowComponent, Typography, Wrapper } from 'components/index';
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
        title: "Lorem Ipsum ",
        description: "Lorem ipsum dolor sit amet, cons ectetur adipiscing elit",
        location: "JBR Dubai",
        rating: "4.5",
        image: IMAGES.DEFAULT_IMAGE,
        price: "$10/Hour"
    },
    {
        title: "Lorem Ipsum ",
        description: "Lorem ipsum dolor sit amet, cons ectetur adipiscing elit",
        location: "JBR Dubai",
        rating: "4.5",
        image: IMAGES.DEFAULT_IMAGE,
        price: "$10/Hour"
    },
    {
        title: "Lorem Ipsum ",
        description: "Lorem ipsum dolor sit amet, cons ectetur adipiscing elit",
        location: "JBR Dubai",
        rating: "4.5",
        image: IMAGES.DEFAULT_IMAGE
    },
    {
        title: "Lorem Ipsum ",
        description: "Lorem ipsum dolor sit amet, cons ectetur adipiscing elit",
        location: "JBR Dubai",
        rating: "4.5",
        image: IMAGES.DEFAULT_IMAGE
    },
    {
        title: "Lorem Ipsum ",
        description: "Lorem ipsum dolor sit amet, cons ectetur adipiscing elit",
        location: "JBR Dubai",
        rating: "4.5",
        image: IMAGES.DEFAULT_IMAGE
    },
    {
        title: "Lorem Ipsum ",
        description: "Lorem ipsum dolor sit amet, cons ectetur adipiscing elit",
        location: "JBR Dubai",
        rating: "4.5",
        image: IMAGES.DEFAULT_IMAGE
    },
    {
        title: "Lorem Ipsum ",
        description: "Lorem ipsum dolor sit amet, cons ectetur adipiscing elit",
        location: "JBR Dubai",
        rating: "4.5",
        image: IMAGES.DEFAULT_IMAGE
    },


];


export const ServicesProvider = () => {
    const [searchText, setSearchText] = useState<string>('');

    const renderItem = ({ item, index }: any) => {
        return <Card
            onPress={() => navigate(SCREENS.PROVIDER_DETAILS)}
            titleStyle={styles.servicesTitle}
            containerStyle={[styles.servicesCard, { marginEnd: index === services.length - 1 ? 12 : 0 }]}
            key={index}
            uri={item?.image}
            title={item.title}
            description={item.description}
            rating={item?.rating}
            location={item?.location}
            price={item?.price}
            type="5" />
    }
    return (
        <Wrapper useScrollView backgroundColor={COLORS.HEADER}>
            <Header title={"Services Provider"} />

            <Input
                onChangeText={setSearchText}
                containerStyle={styles.inputContainer}
                inputContainerWithTitle={{ flex: 1 }}
                name={COMMON_TEXT.SEARCH}
                returnKeyType='done'
                placeholder={"Enter Keyword"}
                value={searchText}
                endIcon={{
                    componentName: VARIABLES.AntDesign,
                    iconName: 'search1',
                    color: COLORS.GREEN,
                    size: FontSize.MediumLarge,
                }} />
            <FlatList
                key={'#'}
                keyExtractor={item => "#" + item.title}
                renderItem={renderItem}
                data={services}
                numColumns={2} />


        </Wrapper>
    )
}

const styles = StyleSheet.create({
    servicesCard: {
        width: 170,
        height: 120,
        marginBottom: 8,
    },
    servicesTitle: {
        fontSize: FontSize.Small,
        fontWeight: FontWeight.Normal,
        color: COLORS.BLACK,
        textAlign: 'center',
        marginBottom: 20,
    },
    inputContainer: {
        flex: 1,
        paddingHorizontal: 20,
    }
});
