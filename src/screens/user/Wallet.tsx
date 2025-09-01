import { View, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import {
  FlatListComponent,
  Icon,
  Photo,
  RowComponent,
  Typography,
  Wrapper,
} from 'components/common';
import { STYLES } from 'utils/commonStyles';
import { IMAGES, VARIABLES } from 'constants/index';
import { FontSize } from 'types/fontTypes';
import { FontWeight } from 'types/fontTypes';
import { COLORS } from 'utils/colors';

export const Wallet = () => {
  const [balance, _] = useState<string>('50');
  const users = [
    {
      name: 'John Doe',
    },
    {
      name: 'Jane Doe',
    },
    {
      name: 'Jim Doe',
    },
  ];
  const renderItem = ({ item }: { item: { name: string } }) => {
    return (
      <View style={styles.userContainer}>
        <RowComponent style={styles.userRow}>
          <RowComponent style={{ justifyContent: 'flex-start', ...STYLES.GAP_20 }}>
            <Photo source={IMAGES.USER} imageStyle={styles.userImage} />
            <Typography style={styles.userName}>{item.name}</Typography>
          </RowComponent>
          <Icon
            componentName={VARIABLES.AntDesign}
            iconName='checkcircle'
            size={FontSize.ExtraLarge}
            color={COLORS.GREEN_STATUS}
          />
        </RowComponent>
      </View>
    );
  };
  return (
    <Wrapper useScrollView={true} useSafeArea={false}>
      <View style={STYLES.CONTAINER}>
        <View style={styles.balanceContainer}>
          <Typography style={styles.balanceTitle}>Balance</Typography>
          <Typography style={styles.balanceText}>{'£' + balance}</Typography>
        </View>

        <FlatListComponent data={users} renderItem={renderItem} keyExtractor={item => item.name} />

        <View style={styles.balanceContainer}>
          <Typography style={styles.leftInviteText}>
            Two More Left Invite Left To Get Your Next Reward
          </Typography>
        </View>
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  balanceContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  balanceTitle: {
    fontSize: FontSize.ExtraLarge,
    fontWeight: FontWeight.Medium,
  },
  balanceText: {
    fontSize: FontSize.XXXL,
    fontWeight: FontWeight.Bold,
  },
  userRow: { ...STYLES.SHADOW, padding: 10, borderRadius: 10 },
  userContainer: {
    padding: 10,
  },
  userName: {
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.Medium,
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  leftInviteText: { color: COLORS.BORDER, textAlign: 'center', paddingHorizontal: 30 },
});
