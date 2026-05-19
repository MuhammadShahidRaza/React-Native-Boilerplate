import { useAppSelector } from 'types/reduxTypes';
import { isWorkerRole } from 'config/app';
import { AppScreenProps } from 'types/navigation';
import { SCREENS } from 'constants/index';
import { WorkerDocumentsUpload } from './WorkerDocumentsUpload';
import { LegacyDocumentationUpload } from './LegacyDocumentationUpload';

/** Routes workers to document uploads; legacy providers keep the old form. */
export const DocumentationUpload = (props: AppScreenProps<typeof SCREENS.DOCUMENTATION_UPLOAD>) => {
  const role = useAppSelector(state => state.user?.role);
  if (isWorkerRole(role)) {
    return <WorkerDocumentsUpload {...props} />;
  }
  return <LegacyDocumentationUpload {...props} />;
};
