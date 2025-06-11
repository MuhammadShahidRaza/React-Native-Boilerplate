import { View, StyleSheet, Image } from 'react-native';
import { Button, Photo, SvgComponent, Typography, Wrapper } from 'components/common';
import { IMAGES, SVG } from 'constants/assets';
import { FLEX_CENTER } from 'utils/commonStyles';
import { AUTH_TEXT, COMMON_TEXT } from 'constants/screens';
import { FontSize } from 'types/fontTypes';
import { navigate } from 'navigation/Navigators';
import { SCREENS } from 'constants/routes';
import { COLORS } from 'utils/colors';

export const RoleSelection = () => {
  return (
    <Wrapper>
      <View style={styles.container}>
          <Image source={IMAGES.LOGO_WITH_NAME} resizeMode='contain' style={styles.logoContainer} />
                <Typography style={styles.textSize}>{COMMON_TEXT.ROLESHEADIM}</Typography>
       <Typography style={styles.descriptionStyles}>{COMMON_TEXT.AUTH_DESC}</Typography>
          <Button title={COMMON_TEXT.CUSTOMER} onPress={()=>{navigate(SCREENS.LOGIN)}   } style={styles.continueBtn}/>
            <Button title={COMMON_TEXT.SERVICE_PROVIDER } style={styles.providerBtn} onPress={()=>{navigate(SCREENS.LOGIN)}   } />
      </View>
      {/* <View style={{paddingHorizontal:20}}> */}

    {/* </View> */}
          
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...FLEX_CENTER,
  },
  descriptionStyles: { fontSize: FontSize.MediumSmall,paddingHorizontal:20,textAlign:'center',fontWeight:'400', color: COLORS.ICONS },
  textSize:{fontSize:FontSize.ExtraLarge+4,paddingHorizontal:20,textAlign:'center',marginBottom:10,marginTop:20,fontWeight:'500',textTransform:'capitalize'
          },
  logoContainer: {
    alignSelf:'center',
    height:281,
  },
  continueBtn:{alignSelf:'center',marginVertical:20,marginTop:20,fontWeight:'700'},
  providerBtn:{
    backgroundColor:COLORS.PURPLE,
    fontWeight:'700'
  }
});
