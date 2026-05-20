import { useMemo, useState } from 'react';
import { useAppSelector } from 'types/reduxTypes';
import { isWorkerDocumentsComplete, isWorkerVehicleComplete } from 'utils/workerOnboarding';
import { onBack } from 'navigation/index';

export function useWorkerProfileGate() {
  const user = useAppSelector(state => state.user.userDetails);
  const workerFlags = useAppSelector(state => state.worker);
  const [detailsRequiredVisible, setDetailsRequiredVisible] = useState(false);

  const vehicleComplete = useMemo(
    () => workerFlags.vehicleDetailsComplete || isWorkerVehicleComplete(user),
    [workerFlags.vehicleDetailsComplete, user],
  );

  const documentsComplete = useMemo(
    () => workerFlags.documentsComplete || isWorkerDocumentsComplete(user),
    [workerFlags.documentsComplete, user],
  );

  const isComplete = vehicleComplete && documentsComplete;

  const requireCompleteProfile = (onAllowed: () => void) => {
    if (isComplete) {
      onAllowed();
      return;
    }
    setDetailsRequiredVisible(true);
  };

  return {
    isComplete,
    vehicleComplete,
    documentsComplete,
    detailsRequiredVisible,
    setDetailsRequiredVisible,
    requireCompleteProfile,
    closeDetailsRequired: () => {
      setDetailsRequiredVisible(false);
      onBack();
    },
  };
}
