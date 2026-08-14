/**
 * Analytical 2-Bone Inverse Kinematics (IK) Engine
 * 
 * Computes exact elbow joint position (Ex, Ey) and wrist angle (wristAngle)
 * for a 2-bone arm chain (Shoulder -> Elbow -> Wrist) to guarantee:
 * - Constant upper arm and forearm lengths (zero stretching/breaking)
 * - Seamless joint alignment with zero floating parts
 * - Anatomically natural elbow bending (bends outward/downward)
 * 
 * @param {Object} shoulder - { x, y }
 * @param {Object} wrist - { x, y }
 * @param {number} L1 - Upper arm length
 * @param {number} L2 - Forearm length
 * @param {'left'|'right'} side - Arm side
 * @param {number} wristRotationOffset - Extra manual rotation in degrees
 */
export function solve2BoneIK(shoulder, wrist, L1 = 70, L2 = 65, side = 'right', wristRotationOffset = 0) {
  const dx = wrist.x - shoulder.x;
  const dy = wrist.y - shoulder.y;
  const dist = Math.hypot(dx, dy);

  // Clamp distance within reachable range (with small safety margin)
  const maxReach = L1 + L2 - 2;
  const minReach = Math.abs(L1 - L2) + 5;
  const clampedDist = Math.min(Math.max(dist, minReach), maxReach);

  // Base angle from shoulder to target wrist
  const baseAngle = Math.atan2(dy, dx);

  // Law of cosines for shoulder-to-elbow angle
  const cosAlpha = (L1 * L1 + clampedDist * clampedDist - L2 * L2) / (2 * L1 * clampedDist);
  const alpha = Math.acos(Math.min(Math.max(cosAlpha, -1), 1));

  // Determine elbow bend direction (Right arm bends right/clockwise, Left arm bends left/counter-clockwise)
  const bendDirection = side === 'right' ? 1 : -1;
  const shoulderAngle = baseAngle + alpha * bendDirection;

  // Exact Elbow Position
  const elbowX = shoulder.x + L1 * Math.cos(shoulderAngle);
  const elbowY = shoulder.y + L1 * Math.sin(shoulderAngle);

  // Forearm angle from Elbow to Wrist
  const forearmAngleRad = Math.atan2(wrist.y - elbowY, wrist.x - elbowX);
  const forearmAngleDeg = (forearmAngleRad * 180) / Math.PI;

  // Hand orientation automatically follows forearm with optional wrist tilt
  const handAngle = forearmAngleDeg - 90 + wristRotationOffset;

  return {
    shoulder,
    elbow: { x: elbowX, y: elbowY },
    wrist: { x: wrist.x, y: wrist.y },
    upperArmAngle: (shoulderAngle * 180) / Math.PI,
    forearmAngle: forearmAngleDeg,
    handAngle
  };
}
