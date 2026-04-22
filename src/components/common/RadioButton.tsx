import { View, StyleSheet } from 'react-native';
import { FontSize } from 'types/fontTypes';
import { Typography } from './Typography';
import { RowComponent } from './Row';
import { StyleType } from 'types/common';
import { COLORS } from 'utils/colors';
import { FLEX_CENTER } from '../../utils/commonStyles/index';

interface RadioButtonProps {
  options: string[];
  selectedOption: string;
  containerStyle?: StyleType;
  optionsContainerStyle?: StyleType;
  color?: string;
  onSelectOption: (option: string) => void;
}

export const RadioButton: React.FC<RadioButtonProps> = ({
  options,
  selectedOption,
  onSelectOption,
  containerStyle,
  optionsContainerStyle,
  color = COLORS.PRIMARY,
}) => {
  return (
    <RowComponent style={[styles.container, containerStyle]}>
      {options.map(option => (
        <RowComponent
          hitSlop={10}
          key={option}
          style={[styles.optionContainer, optionsContainerStyle]}
          onPress={() => onSelectOption(option)}
          activeOpacity={0.8}
        >
          <View style={{ ...styles.radioButton, borderColor: color }}>
            {selectedOption === option && (
              <View style={{ ...styles.radioButtonInner, backgroundColor: color }} />
            )}
          </View>
          <Typography style={styles.optionText}>{option}</Typography>
        </RowComponent>
      ))}
    </RowComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  optionContainer: {
    gap: 5,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    ...FLEX_CENTER,
    marginRight: 10,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  optionText: {
    textTransform: 'capitalize',
    fontSize: FontSize.Medium,
  },
});

// const [selectedOption, setSelectedOption] = useState('Option 1');

// const options = ['Option 1', 'Option 2', 'Option 3'];

// const onSelectOption = (option: string) => {
//   setSelectedOption(option);
// };

// return (
//   <View style={styles.container}>
//     <RadioButton options={options} selectedOption={selectedOption} onSelectOption={onSelectOption} />
//   </View>
// );
// };
