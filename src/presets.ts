export const noWobble = { stiffness: 5, damping: 6, mass: 1 };
export const gentle = { stiffness: 5, damping: 7, mass: 1 };
export const wobbly = { stiffness: 5, damping: 4, mass: 1 };
export const stiff = { stiffness: 5, damping: 5, mass: 1 };
const presets = {
  noWobble,
  gentle,
  wobbly,
  stiff
};
export default presets;
