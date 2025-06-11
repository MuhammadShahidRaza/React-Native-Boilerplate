import { View, StyleSheet } from 'react-native';
import { Button, Photo, SvgComponent, Typography, Wrapper } from 'components/common';
import { IMAGES, SVG } from 'constants/assets';
import { FLEX_CENTER } from 'utils/commonStyles';
import { COMMON_TEXT } from 'constants/screens';
import { FontSize } from 'types/fontTypes';
import { navigate } from 'navigation/Navigators';
import { SCREENS } from 'constants/routes';

export const Intro = () => {
  return (
    <Wrapper>
      <View style={styles.container}>
          <Photo source={IMAGES.LOGO} resizeMode='stretch' style={styles.logoContainer} />
          
      </View>
      <Typography style={styles.textSize}>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</Typography>
          <Button title={COMMON_TEXT.CONTINUE} onPress={()=>{navigate(SCREENS.LOGIN)}   } style={styles.continueBtn}/>
    
          
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...FLEX_CENTER,
    marginTop:150
  },
  textSize:{fontSize:FontSize.ExtraLarge,textAlign:'center',marginBottom:20,fontWeight:'500',textTransform:'capitalize'
          },
  logoContainer: {
    alignSelf:'center'
  },
  continueBtn:{alignSelf:'center',marginBottom:100}
});
