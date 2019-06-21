interface PluginType {
  install: (Vue: any, options: any) => void;
}
interface StyleType {
  [property: string]: number;
}
interface StyleInfoType {
  middleValue: number;
  accValue: number;
  x: number;
  acceleration: number;
  velocity: number;
  lastVelocity: number;
  direction: number;
}
interface PropertyStyleInfoType {
  [property: string]: StyleInfoType;
}
const VueMotion: PluginType = { install: null };

// styles = {height: 100, width: 200}
export const Motion = {
  template: `
    <div>
      <slot v-bind:styles="animatedStyles"></slot>
    </div>
  `,
  data() {
    return {
      animatedStyles: {}
    };
  },
  props: {
    styles: {
      required: true
    },
    stiffness: {
      type: Number,
      default: 100,
      validator: function(value: number) {
        return value > 0;
      }
    },
    damping: {
      type: Number,
      default: 20,
      validator: function(value: number) {
        return value > 0;
      }
    },
    enable: {
      type: Boolean,
      default: true
    }
  },
  created() {
    this.animatedStyles = Object.assign({}, this.styles);
    Object.keys(this.styles).map(property => {
      this.$watch("styles." + property, function(
        newVal: number,
        oldVal: number
      ) {
        console.log("watch " + property, { newVal, oldVal });
        this.animateValue(oldVal, newVal, property);
      });
    });
  },
  watch: {
    styles(val: StyleType, oldVal: StyleType) {
      console.log("watch styles ", { val, oldVal });
      // this.animateValues(oldVal, val);
    }
  },
  methods: {
    // fromStyles and toStyles have same propertys
    animateValues(fromStyles: StyleType, toStyles: StyleType) {
      const propertys = Object.keys(toStyles);
      if (propertys.every((p: string) => fromStyles[p] === toStyles[p])) {
        return;
      }
      // spring config
      const k = 10,
        m = 1,
        msPerFrame = 1 / 60;
      const propertyStyleInfo: PropertyStyleInfoType = propertys.reduce(
        (styleInfo: PropertyStyleInfoType, p: string) => {
          const toValue = toStyles[p],
            fromValue = fromStyles[p];
          styleInfo[p] = {
            middleValue: Math.abs(toValue - fromValue) / 2,
            accValue: 0,
            x: undefined,
            acceleration: undefined,
            velocity: 0,
            lastVelocity: 0,
            direction: toValue - fromValue > 0 ? 1 : -1
          };
          return styleInfo;
        },
        {}
      );
      let lastTime: number,
        accTime = 0;
      const that = this;
      function step() {
        // get time delta to last frame
        const now = performance.now();
        const msFrame = (now - lastTime) / 1000;
        lastTime = now;

        const frameCount = Math.floor((accTime + msFrame) / msPerFrame);
        const timeToMove = frameCount * msPerFrame;
        accTime += msFrame - timeToMove; // 剩余的时间
        let isFinished = false;
        for (const property in propertyStyleInfo) {
          if (!propertyStyleInfo.hasOwnProperty(property)) {
            return;
          }
          const styleInfo = propertyStyleInfo[property];
          styleInfo.x = styleInfo.accValue - styleInfo.middleValue;
          styleInfo.acceleration = (-k * styleInfo.x) / m;
          styleInfo.lastVelocity = styleInfo.velocity;
          styleInfo.velocity += styleInfo.acceleration * timeToMove;
          styleInfo.acceleration += styleInfo.velocity * timeToMove;
          if (
            styleInfo.acceleration > styleInfo.middleValue &&
            Math.abs(styleInfo.velocity) <=
              Math.abs(styleInfo.acceleration * timeToMove)
          ) {
            isFinished = true;
          }
        }

        if (!isFinished) {
          window.requestAnimationFrame(() => {
            step();
          });
        } else {
          for (const property in propertyStyleInfo) {
            if (!propertyStyleInfo.hasOwnProperty(property)) {
              return;
            }
            const styleInfo = propertyStyleInfo[property];
            styleInfo.acceleration = Math.abs(
              toStyles[property] - fromStyles[property]
            );
          }
        }

        for (const property in propertyStyleInfo) {
          if (!propertyStyleInfo.hasOwnProperty(property)) {
            return;
          }
          const styleInfo = propertyStyleInfo[property];
          const acc = styleInfo.acceleration;
          const fromValue = fromStyles[property];
          that.animatedStyles[property] =
            styleInfo.direction > 0 ? acc + fromValue : fromValue - acc;
        }
      }
      // start animation
      window.requestAnimationFrame(() => {
        lastTime = performance.now();
        window.requestAnimationFrame(() => {
          step();
        });
      });
    },

    animateValue(fromValue: number, toValue: number, property: string) {
      if (fromValue === toValue) {
        return;
      }

      let m = 1,
        msPerFrame = 1 / 60;
      let acc = 0;
      let x = -Math.abs(toValue - fromValue);
      let a;
      let v = 0; //
      let accTime = 0,
        accFrameCount = 0;
      const direction = toValue - fromValue > 0 ? 1 : -1; // -1 逐渐减小 or 1 逐渐增大
      let lastTime: number;
      const that = this;
      const targetValue = Math.max(fromValue, toValue);
      function step() {
        // debug
        if (!that.enable) {
          return;
        }
        // get time delta to last frame
        const now = performance.now();
        const msFrame = (now - lastTime) / 1000;
        lastTime = now;

        const frameCount = Math.floor((accTime + msFrame) / msPerFrame);
        accFrameCount += frameCount;
        accTime += msFrame - frameCount * msPerFrame; // 剩余的时间
        const fd = -that.damping * v; // move right v > 0; move left v < 0. damping = 2 * Math.sqrt(stifness)
        const fs = -that.stiffness * x;
        a = (fs + fd) / 1000;
        v += a * frameCount;
        const deltaValue = Math.round(v * 1000) / 1000;

        x += deltaValue;
        if (accFrameCount > 0 && Math.abs(a) < 0.01 && Math.abs(v) < 0.01) {
          console.log("end animation: ", { a, v });
          return;
        }

        window.requestAnimationFrame(() => {
          step();
        });
        // fromValue 500 -> toValue 0, x -500 -> 0
        that.animatedStyles[property] =
          toValue > fromValue ? toValue + x : toValue - x;
      }
      window.requestAnimationFrame(() => {
        lastTime = performance.now();
        window.requestAnimationFrame(() => {
          step();
        });
      });
    }
  }
};
VueMotion.install = function(Vue, opttions) {
  Vue.component("Motion", Motion);
};
export default VueMotion;
