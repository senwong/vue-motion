export const noWobble = { stiffness: 10, damping: 40, mass: 1 };
export const gentle = { stiffness: 7, damping: 20, mass: 1 };
export const wobbly = { stiffness: 5, damping: 13, mass: 1 };
export const stiff = { stiffness: 5, damping: 30, mass: 1 };
const presets = {
  noWobble,
  gentle,
  wobbly,
  stiff
};
export default presets;
