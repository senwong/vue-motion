import { Options, intanceofOptions } from "./types";
import presets from "./presets";

const msPerFrame = 1000 / 60;
const precision = 0.1;
function toFix(n: number): number {
  return Math.round(n * 1000) / 1000;
}
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
  const { stiffness, damping, mass } = options;
  // damping: x Newton * meter/second velocity: x meter/second
  let x = -(toValue - fromValue); // meter
  const forceDamper = -damping * velocity; // N move right v > 0; move left v < 0. damping = 2 * Math.sqrt(stifness)
  const forceSpring = -stiffness * x; // stiffness: N/m, x meter
  const acceleration = (forceSpring + forceDamper) / mass; // m/s^2

  velocity += acceleration * ((frameCount * msPerFrame) / 1000); // m/s
  x += velocity;
  let ret = toValue + x;
  return { value: ret, velocity };
}

export function createAnimate(
  fromValue: number,
  cb: (val: number) => void,
  options: Options
) {
  if (typeof options === "string") {
    if (options in presets) {
      options = presets[options];
    } else {
      console.error("unrecognized options" + options);
      options = presets.noWobble;
    }
  } else if (typeof options !== "object" || !intanceofOptions(options)) {
    console.error("unrecognized options" + options);
    options = presets.noWobble;
  }

  let oldRafId: number;
  let currentValue = fromValue;
  let toValue = fromValue;
  let velocity = 0; //
  let accTime = 0,
    lastTimestamp: number;
  function step(timestamp: number) {
    // animation end
    if (Math.abs(toValue - currentValue) <= precision) {
      cb(toValue);
      fromValue = toValue;
      velocity = 0;
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
    lastTimestamp = null;
    oldRafId = window.requestAnimationFrame(step);
  }
  return animateTo;
}
