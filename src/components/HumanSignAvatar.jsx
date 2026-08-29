import React from 'react';
import { Player } from './Player';

/**
 * 3D Human Sign Language Avatar Component
 * Wrapper around 3D Player for backwards compatibility across pages.
 */
export function HumanSignAvatar(props) {
  return <Player {...props} />;
}

export default HumanSignAvatar;

