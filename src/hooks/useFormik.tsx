import { useFormik, FormikHelpers, FormikValues } from 'formik';
import { Schema } from 'yup';

interface UseFormikFormProps<T> {
  initialValues: T;
  enableReinitialize?: boolean;
  validationSchema: Schema<object>;
  onSubmit: (values: T, formikHelpers: FormikHelpers<T>) => void;
}

export const useFormikForm = <T extends FormikValues>({
  initialValues,
  validationSchema,
  onSubmit,
  enableReinitialize,
}: UseFormikFormProps<T>) => {
  return useFormik<T>({
    initialValues,
    enableReinitialize,
    validationSchema,
    onSubmit,
  });
};
