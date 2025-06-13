import { View, StyleSheet, StyleProp, TextStyle, Touchable, TouchableOpacity, ViewStyle, SafeAreaView } from 'react-native';
import { RowComponent } from './Row';
import { Icon } from './Icon';
import { VARIABLES } from 'constants/common';
import { FontSize, FontWeight, ChildrenType } from 'types/index';
import { Typography } from './Typography';
import { COLORS } from 'utils/colors';


type Props = {
    onPress?: () => void;
    title: string;
};



export const HeadingWithViewAll = ({ title, onPress }: Props) => {
    return (
        <RowComponent style={styles.container}>
            <Typography style={styles.title}>{title}</Typography>

            {onPress ? <TouchableOpacity onPress={onPress}>
                <Typography style={styles.viewAllText}>View all</Typography>
            </TouchableOpacity> : null}
        </RowComponent>
    )
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        marginBottom: 10,
        justifyContent: 'space-between'
    },
    title: {
        fontSize: FontSize.Medium,
        fontWeight: FontWeight.Medium,
        marginBottom: 8
    },
    viewAllText: {
        fontSize: FontSize.Small,
        fontWeight: FontWeight.Medium,
        marginBottom: 8,
        color: COLORS.GREEN
    },


});

