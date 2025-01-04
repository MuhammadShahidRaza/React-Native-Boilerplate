import {useFormik, FormikHelpers, FormikValues} from 'formik';
import {Schema} from 'yup';

interface UseFormikFormProps<T> {
  initialValues: T;
  validationSchema: Schema<object>;
  onSubmit: (values: T, formikHelpers: FormikHelpers<T>) => void;
}

export const useFormikForm = <T extends FormikValues>({
  initialValues,
  validationSchema,
  onSubmit,
}: UseFormikFormProps<T>) => {
  return useFormik<T>({
    initialValues,
    validationSchema,
    onSubmit,
  });
};
