import React from 'react';
import { RealisticHumanAvatar } from './HumanSignAvatar/RealisticHumanAvatar';

/**
 * Human 2D Sign Language Avatar Component
 * Wrapper around RealisticHumanAvatar for backwards compatibility across pages.
 */
export function HumanSignAvatar(props) {
  return <RealisticHumanAvatar {...props} />;
}

export default HumanSignAvatar;
