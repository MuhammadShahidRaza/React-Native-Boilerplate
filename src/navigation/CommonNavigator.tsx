import { SCREENS } from 'constants/routes';
import {
  CompleteProfile,
  DocumentationUpload,
  ProfessionalDetails,
  Splash,
  VehicleDetails,
} from 'screens/common';

export const commonScreens = {
  [SCREENS.SPLASH]: Splash,
  [SCREENS.COMPLETE_PROFILE]: CompleteProfile,
  [SCREENS.DOCUMENTATION_UPLOAD]: DocumentationUpload,
  [SCREENS.PROFESSIONAL_DETAILS]: ProfessionalDetails,
  [SCREENS.VEHICLE_DETAILS]: VehicleDetails,
};

export const renderCommonScreens = (Stack: any) => {
  return (
    <Stack.Group>
      {Object.entries(commonScreens)
        .filter(([name]) => name !== SCREENS.SPLASH)
        .map(([name, component]: [string, React.ComponentType<any>]) => (
          <Stack.Screen key={name} name={name} component={component} />
        ))}
    </Stack.Group>
  );
};
