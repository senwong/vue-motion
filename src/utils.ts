const msPerFrame = 1 / 60;
const precision = 0.01;
import { Options } from "./types";

export function oneFrameDistance(
  fromValue: number,
  toValue: number,
  velocity: number,
  options: Options,
  frameCount: number = 1
) {
  if (
    Number.isNaN(fromValue) ||
    Number.isNaN(toValue) ||
    Number.isNaN(velocity)
  ) {
    console.error(`onFrameDistance(${fromValue}, ${toValue}, ${velocity})`);
  }
  console.log({ stiffness: options.stiffness, damping: options.damping });
  const { stiffness, damping } = options;

  let x = -Math.abs(toValue - fromValue);
  const forceDamper = -damping * velocity; // move right v > 0; move left v < 0. damping = 2 * Math.sqrt(stifness)
  const forceSpring = -stiffness * x;
  let acceleration = (forceSpring + forceDamper) / 1000;
  velocity += acceleration * frameCount;
  x += velocity;
  let ret = toValue > fromValue ? toValue + x : toValue - x;
  ret = Math.round(ret * 1000) / 1000;

  return { value: ret, velocity, acceleration };
}

export function createAnimate(
  fromValue: number,
  cb: (val: number) => void,
  options: Options
) {
  let oldRafId: number;
  let currentValue = fromValue;

  function animateTo(toValue: number) {
    if (currentValue === toValue) {
      return;
    }
    // cancel old not finished animation
    if (oldRafId) {
      window.cancelAnimationFrame(oldRafId);
    }

    let velocity = 0; //
    let accTime = 0,
      accFrameCount = 0;
    let lastTime: number;
    function step() {
      // get time delta to last frame
      const now = performance.now();
      const msFrame = (now - lastTime) / 1000;
      lastTime = now;

      const frameCount = Math.floor((accTime + msFrame) / msPerFrame);
      accFrameCount += frameCount;
      accTime += msFrame - frameCount * msPerFrame; // 剩余的时间

      const {
        value: newValue,
        velocity: newVelocity,
        acceleration
      } = oneFrameDistance(
        currentValue,
        toValue,
        velocity,
        options,
        frameCount
      );
      currentValue = newValue;
      velocity = newVelocity;

      // check if animation end
      if (
        accFrameCount > 0 &&
        Math.abs(acceleration) < precision &&
        Math.abs(velocity) < precision
      ) {
        cb(toValue);
        return;
      }
      cb(currentValue);
      oldRafId = window.requestAnimationFrame(() => {
        step();
      });
    }
    lastTime = performance.now();
    step();
  }
  return animateTo;
}
