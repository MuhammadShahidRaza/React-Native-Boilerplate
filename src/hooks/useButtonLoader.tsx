import { useState, useCallback } from 'react';

/**
 * 🎯 useAsyncButton - Simple hook to manage button loading state
 *
 * WHY USE THIS?
 * - No need to write useState for loading in every component
 * - Automatically shows/hides loader when async operation runs
 * - Prevents double-clicks while loading
 *
 * HOW TO USE:
 *
 * Step 1: Import the hook
 *   import { useAsyncButton } from 'hooks';
 *
 * Step 2: Pass your async function (like formik.handleSubmit or any async function)
 *   const { loading, onPress } = useAsyncButton(formik.handleSubmit);
 *
 * Step 3: Use in Button component
 *   <Button loading={loading} onPress={onPress} title="Login" />
 *
 * THAT'S IT! The button will automatically show loader while your async function runs.
 *
 * @param asyncFn - Your async function (like formik.handleSubmit or any async function)
 * @returns { loading, onPress } - loading state and wrapped press handler
 *
 * @example
 * // Example 1: With Formik (Most Common)
 * const formik = useFormik({...});
 * const { loading, onPress } = useAsyncButton(formik.handleSubmit);
 *
 * <Button loading={loading} onPress={onPress} title="Submit" />
 *
 * @example
 * // Example 2: With Custom Async Function
 * const { loading, onPress } = useAsyncButton(async () => {
 *   await saveData();
 * });
 *
 * <Button loading={loading} onPress={onPress} title="Save" />
 */
export const useAsyncButton = (
  input?: any,
): {
  loading: boolean;
  onPress: () => Promise<void>;
} => {
  const [loading, setLoading] = useState(false);

  // Smart detection: Check if input is a Formik instance
  const isFormik = input && typeof input === 'object' && typeof input.submitForm === 'function';

  const onPress = useCallback(async () => {
    // Don't run if already loading (prevents double-clicks)
    if (loading) return;

    try {
      setLoading(true);

      if (isFormik) {
        // ✅ Formik instance: use submitForm() which returns a promise
        await input.submitForm();
      } else if (typeof input === 'function') {
        // ✅ Regular async function: use it directly
        const result = input();
        if (result instanceof Promise) {
          await result;
        }
      }
      // If input is undefined, do nothing
    } catch (error) {
      // Re-throw error so it can be handled by your error handler
      throw error;
    } finally {
      // Always stop loading, even if there was an error
      setLoading(false);
    }
  }, [input, loading, isFormik]);

  return {
    loading,
    onPress,
  };
};

/**
 * 🎯 useMultipleAsyncButtons - For managing multiple buttons in same screen
 *
 * WHEN TO USE:
 * - When you have 2+ buttons in the same screen (like Approve/Reject, Save/Cancel)
 *
 * HOW TO USE:
 *
 * Step 1: Import the hook
 *   import { useMultipleAsyncButtons } from 'hooks';
 *
 * Step 2: Create the loader
 *   const buttons = useMultipleAsyncButtons();
 *
 * Step 3: Wrap each button's function with a unique name
 *   const handleApprove = buttons.wrap('approve', async () => {
 *     await approveAction();
 *   });
 *
 *   const handleReject = buttons.wrap('reject', async () => {
 *     await rejectAction();
 *   });
 *
 * Step 4: Use in Button components
 *   <Button loading={buttons.isLoading('approve')} onPress={handleApprove} title="Approve" />
 *   <Button loading={buttons.isLoading('reject')} onPress={handleReject} title="Reject" />
 *
 * @example
 * // Example: Approve/Reject buttons
 * const buttons = useMultipleAsyncButtons();
 *
 * const handleApprove = buttons.wrap('approve', async () => {
 *   await approveRequest();
 * });
 *
 * const handleReject = buttons.wrap('reject', async () => {
 *   await rejectRequest();
 * });
 *
 * <Button loading={buttons.isLoading('approve')} onPress={handleApprove} title="Approve" />
 * <Button loading={buttons.isLoading('reject')} onPress={handleReject} title="Reject" />
 */
export const useMultipleAsyncButtons = () => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const setLoading = useCallback((buttonName: string, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [buttonName]: loading }));
  }, []);

  const isLoading = useCallback(
    (buttonName: string) => {
      return loadingStates[buttonName] || false;
    },
    [loadingStates],
  );

  const wrap = useCallback(
    <T extends (...args: any[]) => Promise<any>>(
      buttonName: string,
      asyncFn: T,
    ): ((...args: Parameters<T>) => Promise<void>) => {
      return async (...args: Parameters<T>) => {
        // Don't run if this button is already loading
        if (isLoading(buttonName)) return;

        try {
          setLoading(buttonName, true);
          await asyncFn(...args);
        } catch (error) {
          throw error;
        } finally {
          setLoading(buttonName, false);
        }
      };
    },
    [isLoading, setLoading],
  );

  return {
    isLoading,
    wrap,
  };
};
