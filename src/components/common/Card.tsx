import { View, StyleSheet, StyleProp, TextStyle, Touchable, TouchableOpacity, ViewStyle, SafeAreaView, ImageBackground, Image, ImageStyle } from 'react-native';
import { RowComponent } from './Row';
import { Icon } from './Icon';
import { VARIABLES } from 'constants/common';
import { FontSize, FontWeight, ChildrenType } from 'types/index';
import { Typography } from './Typography';
import { onBack } from 'navigation/index';
import { Photo } from './Photo';
import { COLORS } from 'utils/colors';
import { useTranslation } from 'hooks/useTranslation';
import { IMAGES } from 'constants/assets';


type Props = {
    type: "1" | "2" | "3";
    uri: string;
    title?: string;
    description?: string;
    containerStyle?: ImageStyle | ImageStyle[];
    titleStyle?: TextStyle;
    key?: number;
    currency?: string;
    location?: string;
    rating?: string;

};



export const Card = ({
    type,
    uri,
    title = '',
    description = '',
    containerStyle,
    titleStyle,
    key,
    currency = '',
    location = '',
    rating = ''
}: Props) => {

    if (type === "1") {
        return (
            <ImageBackground key={key} style={[styles.container, { marginHorizontal: 20 }, containerStyle]} source={{ uri }}>
                <View style={styles.overLay}>
                    <Typography style={[styles.title, titleStyle]}>{title}</Typography>
                    <Typography style={styles.description}>{description}</Typography>
                </View>
            </ImageBackground>
        );
    }

    if (type === "2") {
        return (
            <View key={key}>
                <Image style={[styles.container, containerStyle]} source={{ uri }} />
                <Typography style={[styles.title, titleStyle]}>{title}</Typography>
            </View>
        );
    }

    if (type === "3") {
        return (
            <View style={[styles.container, styles.typeThreeContainer, containerStyle]} key={key}>
                <Image style={styles.typeThreeImageStyle} source={{ uri }} />
                <RowComponent style={{ paddingHorizontal: 20 }}>
                    <Typography style={[styles.title, titleStyle]}>{title}</Typography>
                    <RowComponent>
                        <Image style={styles.ratingIcon} source={IMAGES.RATINGS} />
                        <Typography style={styles.ratingText}>{rating}</Typography>
                    </RowComponent>

                </RowComponent>

                <RowComponent style={styles.currencyAndLocationContainer}>
                    <Icon
                        componentName={VARIABLES.Entypo}
                        iconName={'location'}
                        size={15}
                        onPress={() => { }}
                        iconStyle={{
                            marginEnd: 10,
                            color: COLORS.GREEN,
                        }}
                    />
                    <Typography style={styles.location}>{location}</Typography>
                </RowComponent>


                <RowComponent style={styles.currencyAndLocationContainer}>
                    <Image style={styles.currencyNoteImage} source={IMAGES.CURRENCY_NOTE} />
                    <Typography style={styles.currency}>{currency}</Typography>
                </RowComponent>

            </View>
        );
    }


};

const styles = StyleSheet.create({
    container: {
        marginStart: 20,
        overflow: 'hidden',
        borderRadius: 10,
        height: 250,
    },
    typeThreeContainer: {
        marginStart: 20,
        overflow: 'hidden',
        borderRadius: 10,
        height: 260,
        width: 190,
        backgroundColor: COLORS.WHITE_OPACITY,

    },
    overLay: {
        width: '100%',
        height: '100%',
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.3)',
        padding: 30,

    },
    currencyAndLocationContainer: {
        paddingHorizontal: 20,
        justifyContent: 'flex-start',
        marginBottom: 8
    },
    title: {
        fontSize: FontSize.ExtraLarge,
        fontWeight: FontWeight.Bold,
        color: COLORS.GREEN,
        marginBottom: 12,
    },
    ratingIcon: {
        width: 12,
        height: 12,
        marginEnd: 4
    },
    ratingText: {
        fontSize: FontSize.Small,
        fontWeight: FontWeight.Normal,
    },
    currency: {
        fontSize: FontSize.Small,
        fontWeight: FontWeight.Normal,
        color: COLORS.GREEN
    },
    currencyNoteImage: {
        width: 18,
        height: 10,
        marginEnd: 12
    },
    location: {
        fontSize: FontSize.Small,
        fontWeight: FontWeight.Normal,
        color: COLORS.GREEN
    },
    description: {
        fontSize: FontSize.Small,
        fontWeight: FontWeight.Normal,
        marginBottom: 8,
        color: COLORS.WHITE
    },
    typeThreeImageStyle: {
        height: 190
    }

});
