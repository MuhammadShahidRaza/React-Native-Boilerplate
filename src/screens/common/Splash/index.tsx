import { VARIANT_ID } from 'config/variant';
import { SnliftSplash } from './SnliftSplash';
import { SengoSplash } from './SengoSplash';

/** Launch splash — Sengo animation for consumer + workers; SN Lift for snlift. */
export const Splash = () => {
  if (VARIANT_ID === 'sengo' || VARIANT_ID === 'sengoWorkers') {
    return <SengoSplash />;
  }
  return <SnliftSplash />;
};
