import { createContext, useContext, useRef, useState, ReactNode } from 'react';
import { TextInput } from 'react-native';

interface FocusContextType {
  setActiveInput: (inputKey: string) => void;
  focusNextInput: () => void;
  textInput: (key: string, ref: TextInput | null) => void;
  activeInput: string; // Add this to provide activeInput to consumers
}

const FocusContext = createContext<FocusContextType>({
  setActiveInput: () => {},
  focusNextInput: () => {},
  textInput: () => {},
  activeInput: '',
});

export const FocusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeInput, setActiveInput] = useState<string>('');
  const inputRefs = useRef<{ [key: string]: TextInput | null }>({});

  const textInput = (key: string, ref: TextInput | null) => {
    inputRefs.current[key] = ref;
  };

  const focusNextInput = () => {
    const keys = Object.keys(inputRefs.current);
    const currentIndex = keys.indexOf(activeInput);
    const nextIndex = currentIndex + 1;

    if (nextIndex < keys.length) {
      inputRefs.current[keys[nextIndex]]?.focus();
    }
  };

  return (
    <FocusContext.Provider value={{ setActiveInput, focusNextInput, textInput, activeInput }}>
      {children}
    </FocusContext.Provider>
  );
};

export const useFocus = () => useContext(FocusContext);
