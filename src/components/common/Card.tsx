import { View, StyleSheet, TextStyle, ImageBackground, Image, ImageStyle, TouchableOpacity } from 'react-native';
import { RowComponent } from './Row';
import { Icon } from './Icon';
import { VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/index';
import { Typography } from './Typography';
import { COLORS } from 'utils/colors';
import { IMAGES } from 'constants/assets';
import { useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { Button } from './Button';
import { COMMON_TEXT, SCREEN } from 'constants/screens';


type Props = {
    type: "1" | "2" | "3" | "4" | "5";
    uri: string;
    title?: string;
    description?: string;
    containerStyle?: ImageStyle | ImageStyle[];
    titleStyle?: TextStyle;
    key?: number;
    currency?: string;
    location?: string;
    rating?: string;
    price?: string;
    onPress?: () => void

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
    rating = '',
    price = '',
    onPress = () => { }
}: Props) => {

    const [loading, setLoading] = useState(false)

    console.log(loading, ' loading')
    if (type === "1") {
        return <>
            {loading ? <View style={[styles.container, { marginHorizontal: 20, justifyContent: 'center', alignItems: 'center' }, containerStyle]}>
                <ActivityIndicator size={"large"} color={COLORS.GREEN} />
            </View> : null}

            <TouchableOpacity onPress={onPress}>
                <ImageBackground
                    onLoadStart={() => setLoading(true)}
                    onPartialLoad={() => setLoading(false)}
                    onLoad={() => setLoading(false)}
                    onLoadEnd={() => setLoading(false)}
                    key={key}
                    style={[styles.container, { marginHorizontal: 20 }, containerStyle]} source={{ uri }}>
                    <View style={styles.overLay}>
                        <Typography style={[styles.title, titleStyle]}>{title}</Typography>
                        <Typography style={styles.description}>{description}</Typography>
                    </View>
                </ImageBackground>
            </TouchableOpacity>
        </>


    }

    if (type === "2") {


        return (
            <>
                {loading ? <View style={[styles.container, { marginHorizontal: 20, justifyContent: 'center', alignItems: 'center' }, containerStyle]}>
                    <ActivityIndicator size={"small"} color={COLORS.GREEN} />
                </View> : null}
                <TouchableOpacity onPress={onPress} key={key}>
                    <Image
                        onLoadStart={() => setLoading(true)}
                        onLoad={() => setLoading(false)}
                        onLoadEnd={() => setLoading(false)}
                        onPartialLoad={() => setLoading(false)}
                        style={[styles.container, containerStyle]} source={{ uri }} />
                    <Typography style={[styles.title, titleStyle]}>{title}</Typography>

                    {rating ? <RowComponent style={{ justifyContent: 'center' }}>
                        <Image style={styles.ratingIcon} source={IMAGES.RATINGS} />
                        <Typography style={styles.ratingText}>{rating}</Typography>
                    </RowComponent> : null}
                </TouchableOpacity>
            </>
        )
    }

    if (type === "3") {
        return (
            <>
                {loading ? <View style={[styles.container, styles.typeThreeContainer, { justifyContent: 'center', alignItems: 'center' }, containerStyle]}>
                    <ActivityIndicator size={"small"} color={COLORS.GREEN} />
                </View> : null}

                <TouchableOpacity onPress={onPress} style={[styles.container, styles.typeThreeContainer, containerStyle]} key={key}>
                    <Image
                        onLoadStart={() => setLoading(true)}
                        onLoad={() => setLoading(false)}
                        onLoadEnd={() => setLoading(false)}
                        onPartialLoad={() => setLoading(false)}

                        style={styles.typeThreeImageStyle} source={{ uri }} />
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

                </TouchableOpacity>
            </>
        )
    }


    if (type === "4") {

        return (
            <>
                <RowComponent style={styles.typeFourContainer} key={key}>
                    <Image
                        onLoadStart={() => setLoading(true)}
                        onLoad={() => setLoading(false)}
                        onLoadEnd={() => setLoading(false)}
                        onPartialLoad={() => setLoading(false)}
                        style={styles.typeFourImage} source={{ uri }} />

                    <View style={styles.typeFourContentContainer}>
                        <RowComponent style={{ alignItems: 'flex-start' }}>
                            <Typography style={styles.typeFourContentTitle}>{title}</Typography>
                            <RowComponent>
                                <Image style={styles.ratingIcon} source={IMAGES.RATINGS} />
                                <Typography style={styles.ratingText}>{rating}</Typography>
                            </RowComponent>
                        </RowComponent>
                        <Typography style={styles.typeFourContentDes}>{description}</Typography>
                        <RowComponent style={styles.typeFourContentLocationContainer}>
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
                            <Typography style={styles.typeFourContentLocation}>{location}</Typography>
                        </RowComponent>

                        <Button
                            textStyle={styles.typeFourButtonText}
                            style={styles.typeFourButton}
                            title={COMMON_TEXT.EXPLORE}
                            onPress={() => { }} />

                    </View>

                </RowComponent>
            </>
        )
    }


    if (type === "5") {

        return (
            <>
                <RowComponent style={styles.typeFourContainer} key={key}>
                    <Image
                        onLoadStart={() => setLoading(true)}
                        onLoad={() => setLoading(false)}
                        onLoadEnd={() => setLoading(false)}
                        onPartialLoad={() => setLoading(false)}
                        style={styles.typeFourImage} source={{ uri }} />

                    <View style={styles.typeFourContentContainer}>
                        <Typography style={styles.typeFourContentTitle}>{title}</Typography>
                        <RowComponent style={{ justifyContent: 'flex-start', marginBottom: 8 }}>
                            <Image style={styles.ratingIcon} source={IMAGES.RATINGS} />
                            <Typography style={styles.ratingText}>{rating}</Typography>
                        </RowComponent>
                        <RowComponent style={[styles.typeFourContentLocationContainer, { marginBottom: 8 }]}>
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
                            <Typography style={styles.typeFourContentLocation}>{location}</Typography>
                        </RowComponent>

                        <RowComponent style={styles.typeFourContentLocationContainer}>
                            <Image style={styles.currencyNoteImage} source={IMAGES.CURRENCY_NOTE} />
                            <Typography style={styles.typeFourContentLocation}>{price}</Typography>
                        </RowComponent>
                    </View>

                    <Button
                        textStyle={styles.typeFourButtonText}
                        style={styles.typeFourButton}
                        title={COMMON_TEXT.BOOK_Now}
                        onPress={onPress} />
                </RowComponent>
            </>
        )
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
    typeFourContainer: {
        overflow: 'hidden',
        marginBottom: 20,
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        width: SCREEN.width,
        paddingHorizontal: 20
    },
    typeFourImage: {
        overflow: 'hidden',
        borderRadius: 10,
        height: '100%',
        width: 120,
        backgroundColor: COLORS.WHITE_OPACITY,
        marginEnd: 16
    },

    typeFourContentContainer: {
        width: SCREEN.width * 0.3,
    },

    typeFourContentTitle: {
        fontSize: FontSize.Medium,
        fontWeight: FontWeight.Bold,
        marginBottom: 8,
    },

    typeFourContentDes: {
        fontSize: FontSize.ExtraSmall,
        fontWeight: FontWeight.Normal,
        color: COLORS.GRAY,
        marginBottom: 8

    },
    typeFourContentLocationContainer: {
        justifyContent: 'flex-start',
    },

    typeFourContentLocation: {
        fontSize: FontSize.ExtraSmall,
        fontWeight: FontWeight.Normal,
        color: COLORS.GRAY,
    },

    typeFourButton: {
        width: 100,
        height: 40,
        marginTop: 16,
        padding: 0,
        justifyContent: 'center',
        alignItems: 'center'
    },

    typeFourButtonText: {
        fontSize: FontSize.Small,
        fontWeight: FontWeight.Normal,
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
