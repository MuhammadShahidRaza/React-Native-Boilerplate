# Testing & Performance Guide – Line-by-Line Explanation

---

## Part 1: FlatList Performance Props (Lines 123–126)

### What These Props Do

| Prop | Default | Kya Karta Hai | Faida |
|------|---------|---------------|-------|
| **initialNumToRender** | 10 | Pehli baar list load hote waqt kitne items render hone chahiye | Kam items = fast initial load. 1000 items ho toh sab ek saath render nahi honge |
| **maxToRenderPerBatch** | 10 | Scroll karte waqt ek batch mein kitne naye items add hon | Smooth scrolling – thoda thoda render hota hai, lag nahi hota |
| **windowSize** | 5 | Screen ke upar/neeche kitne “screens” ka content memory mein rahe | Memory bachti hai – bahut zyada items RAM mein nahi rehte |
| **removeClippedSubviews** | true | Jo items screen se bahar hain unhe DOM se hata do (Android) | Memory aur CPU dono kam use hote hain |

### Benefits (Faida)

1. **Fast startup** – Sirf 10 items pehle render hote hain, baaki lazily
2. **Smooth scroll** – Batch mein render hone se scroll jaldi feel hota hai
3. **Less memory** – Sirf visible + nearby items hi memory mein rehte hain
4. **Better battery** – Kam CPU = kam battery use

---

## Part 2: jest.config.js – Line by Line

```javascript
module.exports = {
  preset: 'react-native',           // React Native ke liye pre-configured Babel, mocks
  setupFilesAfterEnv: ['<rootDir>/jest-setup.js'],  // Har test se pehle jest-setup run hota hai
  moduleNameMapper: {              // Import paths ko resolve karta hai
    '^components/(.*)$': '<rootDir>/src/components/$1',   // components/X -> src/components/X
    '^config/(.*)$': '<rootDir>/src/config/$1',
    '^types/(.*)$': '<rootDir>/src/types/$1',
    '^utils/(.*)$': '<rootDir>/src/utils/$1',
    '^hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^navigation/(.*)$': '<rootDir>/src/navigation/$1',
    '^context/(.*)$': '<rootDir>/src/context/$1',
    '^constants/(.*)$': '<rootDir>/src/constants/$1',
    '^store/(.*)$': '<rootDir>/src/redux/$1',
    '^theme/(.*)$': '<rootDir>/src/theme/$1',
    '^i18n/(.*)$': '<rootDir>/src/i18n/$1',
    '^api/(.*)$': '<rootDir>/src/api/$1',
  },
  transformIgnorePatterns: [...],   // Kaunse node_modules transform hone chahiye (ESM support)
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],  // Ye folders test nahi honge
  maxWorkers: 1,                    // Parallel tests band – React Native ke liye stable
};
```

**Faida:** Jest ko pata hota hai ki `components/Button` = `src/components/Button`, aur native/third-party code ko sahi tarah handle karta hai.

---

## Part 3: jest-setup.js – Line by Line

### redux-persist (Lines 1–14)
```javascript
jest.mock('redux-persist', () => {
  const actual = jest.requireActual('redux-persist');
  return {
    ...actual,
    persistStore: () => ({ ... }),  // Real persistStore setTimeout use karta hai – Jest exit nahi hota
  };
});
```
**Kya karta hai:** `persistStore` ko fake object se replace karta hai jo koi timer nahi chalata.  
**Faida:** Tests ke baad Jest clean exit ho jata hai, “open handles” warning nahi aati.

---

### Stripe (Lines 16–21)
```javascript
jest.mock('@stripe/stripe-react-native', () => ({
  StripeProvider: ({ children }) => children,  // Sirf children return – no real Stripe
  useStripe: () => ({}),
  useConfirmPayment: () => ({}),
}));
```
**Kya karta hai:** Stripe SDK ko mock karta hai.  
**Faida:** Test environment mein Stripe API key ya network ki zaroorat nahi.

---

### Firebase Firestore (Lines 23–36)
```javascript
jest.mock('@react-native-firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  // ... saare Firestore functions
}));
```
**Kya karta hai:** Firestore ko fake functions se replace karta hai.  
**Faida:** Firebase project, internet, ya real database ki zaroorat nahi.

---

### Google Sign-In & Apple Auth (Lines 38–47)
```javascript
jest.mock('@react-native-google-signin/google-signin', () => ({ ... }));
jest.mock('@invertase/react-native-apple-authentication', () => ({ ... }));
jest.mock('base-64', () => ({ decode: (s) => Buffer.from(s, 'base64').toString('utf8') }));
```
**Kya karta hai:** Social login packages ESM use karte hain, Jest unhe parse nahi kar pata. Mock se ye load nahi hote.  
**Faida:** Tests run ho jaate hain bina syntax error ke.

---

### Firebase Messaging & useMessaging (Lines 49–57)
```javascript
jest.mock('@react-native-firebase/messaging', () => ({ ... }));
jest.mock('hooks/useMessaging', () => ({
  __esModule: true,
  default: jest.fn(),  // useFirebaseMessaging = jest.fn()
}));
```
**Kya karta hai:** FCM aur `useFirebaseMessaging` ko mock karta hai.  
**Faida:** App test mein `useFirebaseMessaging()` call hone par koi real notification setup nahi chahiye.

---

### Native Modules (Lines 59–102)
```javascript
jest.mock('react-native-blob-util', () => ({ default: {} }));
jest.mock('@react-native-community/netinfo', () => ({ ... }));
jest.mock('@react-native-community/geolocation', () => ({ ... }));
jest.mock('react-native-permissions', () => ({ ... }));
jest.mock('utils/location', () => ({ ... }));
jest.mock('@notifee/react-native', () => ({ ... }));
jest.mock('utils/notifications', () => ({ ... }));
jest.mock('react-native-device-info', () => ({ ... }));
```
**Kya karta hai:** Device-specific modules (blob, network, location, permissions, notifications) ko mock karta hai.  
**Faida:** Tests simulator/emulator ya real device ke bina bhi chal sakte hain.

---

### Helpers & Fonts (Lines 104–177)
```javascript
jest.mock('utils/helpers/functions', () => ({
  isIOS: () => false,
  screenWidth: () => 375,
  screenHeight: () => 667,
  ...
}));
jest.mock('constants/assets/fonts', () => ({ ... }));
jest.mock('hooks/useTranslation', () => ({ ... }));
jest.mock('hooks/index', () => ({ ... }));
```
**Kya karta hai:** Platform helpers, fonts, i18n, aur hooks ko predictable values deta hai.  
**Faida:** Tests consistent chalte hain, platform-specific behavior test environment mein fail nahi karta.

---

### UI Libraries (Lines 117–213)
```javascript
jest.mock('react-native-skeleton-placeholder', () => { ... });
jest.mock('@react-native-masked-view/masked-view', () => { ... });
jest.mock('react-native-image-crop-picker', () => ({ ... }));
jest.mock('react-native-webview', () => ({ WebView: View }));
jest.mock('react-native-maps', () => ({ ... }));
jest.mock('@react-native-async-storage/async-storage', () => ({ ... }));
jest.mock('react-native-vector-icons/...', () => 'Icon');
```
**Kya karta hai:** Native UI libraries ko simple `View` ya mock functions se replace karta hai.  
**Faida:** Image picker, maps, WebView, icons, etc. bina native setup ke test mein kaam karte hain.

---

## Part 4: Button.test.tsx – Line by Line

```javascript
import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Button } from '../../src/components/common/Button';

describe('Button', () => {                    // Test suite – saare Button tests yahan
  it('renders with title', () => {            // Test 1: Basic render
    let tree = null;
    act(() => {                               // act() = state updates ko flush karta hai
      tree = ReactTestRenderer.create(<Button title="Submit" />);
    });
    const json = tree!.toJSON();               // Component ka JSON output
    expect(json).toBeTruthy();                 // Kuch render hua hai ya nahi
  });

  it('renders disabled when disabled prop is true', () => { ... });
  it('renders loading state', () => { ... });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();                 // Mock function – track karega calls
    tree = ReactTestRenderer.create(<Button title="Submit" onPress={onPress} />);
    const touchable = tree!.root.findByType(require('react-native').TouchableOpacity);
    act(() => {
      touchable.props.onPress();               // Simulate press
    });
    expect(onPress).toHaveBeenCalledTimes(1);  // onPress exactly 1 baar call hua
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    tree = ReactTestRenderer.create(<Button title="Submit" onPress={onPress} disabled />);
    const touchable = tree!.root.findByType(require('react-native').TouchableOpacity);
    if (touchable.props.onPress) {
      act(() => touchable.props.onPress());
    }
    expect(onPress).not.toHaveBeenCalled();    // disabled hone par onPress call nahi hona chahiye
  });
});
```

**Faida:**
- Button sahi render hota hai
- Disabled state sahi kaam karta hai
- Loading state dikh raha hai
- Press par `onPress` call hota hai
- Disabled par `onPress` call nahi hota

---

## Part 5: Input.test.tsx – Line by Line

```javascript
const wrapper = (children) => (
  <FocusProvider>{children}</FocusProvider>   // Input ko FocusProvider chahiye
);

describe('Input', () => {
  it('renders with value and placeholder', () => { ... });
  it('renders with title', () => { ... });

  it('displays error when touched and error provided', () => {
    tree = ReactTestRenderer.create(
      wrapper(
        <Input touched error="Invalid email" ... />
      )
    );
    expect(JSON.stringify(json)).toContain('Invalid email');  // Error text dikh raha hai
  });

  it('calls onChangeText when text changes', () => {
    const onChangeText = jest.fn();
    tree = ReactTestRenderer.create(wrapper(<Input onChangeText={onChangeText} ... />));
    const textInput = tree!.root.findByType(require('react-native').TextInput);
    act(() => {
      textInput.props.onChangeText('test@example.com');       // Simulate typing
    });
    expect(onChangeText).toHaveBeenCalledWith('test@example.com');
  });

  it('removes spaces when allowSpacing is false', () => {
    // User types "abc 123" -> onChangeText should receive "abc123"
    expect(onChangeText).toHaveBeenCalledWith('abc123');
  });
});
```

**Faida:**
- Input sahi render hota hai
- Error message dikh raha hai
- `onChangeText` sahi value ke saath call hota hai
- `allowSpacing={false}` spaces hata deta hai

---

## Part 6: App.test.tsx – Line by Line

```javascript
import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);   // Pura App mount karo
  });
});
```

**Kya karta hai:** Pura App component render karta hai – Stripe, Redux, Navigation, sab.  
**Faida:** App crash nahi karta, basic integration check ho jata hai.  
**Note:** Iske liye jest-setup.js mein saare mocks zaroori hain, warna native modules fail kar denge.

---

## Summary: Testing Ka Overall Faida

| Cheez | Faida |
|-------|-------|
| **Regression prevention** | Naya code likhne par purana break nahi hoga |
| **Documentation** | Tests se pata chalta hai component kya karta hai |
| **Fast feedback** | App run kiye bina hi basic checks ho jaate hain |
| **CI/CD** | Merge/deploy se pehle automated checks |
| **Confidence** | Refactor karte waqt dar kam hota hai |
