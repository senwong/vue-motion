const msPerFrame = 1000 / 60;
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
  const { stiffness, damping } = options;

  let x = -Math.abs(toValue - fromValue);
  const forceDamper = -damping * velocity; // move right v > 0; move left v < 0. damping = 2 * Math.sqrt(stifness)
  const forceSpring = -stiffness * x;
  let acceleration = (forceSpring + forceDamper) / 1000;
  velocity += acceleration * frameCount;
  x += velocity;
  let ret = toValue > fromValue ? toValue + x : toValue - x;
  ret = Math.round(ret * 1000) / 1000;

  return { value: ret, velocity };
}

export function createAnimate(
  fromValue: number,
  cb: (val: number) => void,
  options: Options
) {
  let oldRafId: number;
  let currentValue = fromValue;
  let toValue = fromValue;
  let velocity = 0; //
  let accTime = 0,
    lastTimestamp: number;
  function step(timestamp: number) {
    // animation end
    if (Math.abs(toValue - currentValue) < precision) {
      cb(toValue);
      fromValue = toValue;
      return;
    }
    // get time delta to last frame
    let msFrame;
    if (lastTimestamp) {
      msFrame = timestamp - lastTimestamp;
    } else {
      // first invoke step function
      msFrame = msPerFrame;
    }
    lastTimestamp = timestamp;

    const frameCount = Math.floor((accTime + msFrame) / msPerFrame);
    accTime += msFrame - frameCount * msPerFrame; // 剩余的时间

    const { value: newValue, velocity: newVelocity } = oneFrameDistance(
      currentValue,
      toValue,
      velocity,
      options,
      frameCount
    );
    currentValue = newValue;
    velocity = newVelocity;

    cb(currentValue);
    oldRafId = window.requestAnimationFrame(timestamp => {
      oldRafId = null;
      step(timestamp);
    });
  }
  function animateTo(toVal: number) {
    toValue = toVal;
    // cancel old not finished animation
    if (oldRafId) {
      return;
    }
    oldRafId = window.requestAnimationFrame(step);
  }
  return animateTo;
}
