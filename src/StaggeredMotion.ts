import { StaggeredMotionData, StyleType } from "./types";
import { createAnimate, oneFrameDistance } from "./utils";
import { noWobble } from "./presets";

const StaggeredMotion = {
  template: `
    <div>
      <slot v-bind:styles="interpolatingStyles"></slot>
    </div>
  `,
  data() {
    const data: StaggeredMotionData = {
      interpolatingStyles: []
    };
    return data;
  },
  props: {
    // [{x: 0}, {x: 0}, {x: 0}, {x: 0}]
    styles: {
      required: true
    },
    options: {
      default: () => noWobble
    }
  },
  created() {
    this.initial();
    this.watchLeadingStyle();
    this.watchInterpolatingStyles();
  },
  watch: {},
  methods: {
    initial() {
      this.interpolatingStyles = this.styles.map((s: StyleType) =>
        Object.assign({}, s)
      );
    },
    watchLeadingStyle() {
      // watch first style from props
      Object.keys(this.styles[0]).map(prop => {
        const initialValue = this.styles[0][prop];

        const interpolatedValueCallback = (val: number) =>
          (this.interpolatingStyles[0][prop] = val);
        const animatedTo = createAnimate(
          initialValue,
          interpolatedValueCallback,
          this.options
        );
        this.$watch(
          () => this.styles[0][prop],
          (newVal: number) => animatedTo(newVal)
        );
      });
    },
    watchInterpolatingStyles() {
      // watch interpolatingStyles from first to last - 1
      this.interpolatingStyles.map((style: StyleType, idx: number) => {
        if (idx >= this.interpolatingStyles.length - 1) {
          return;
        }
        Object.keys(style).map(prop => {
          //
          const nextIdx = idx + 1;
          let currentValue = this.interpolatingStyles[nextIdx][prop];
          //
          let currentVelocity = 0;
          this.$watch(
            () => this.interpolatingStyles[idx][prop],
            (newVal: number) => {
              // when the leading animation arrives end point,
              // other animations don't arrive end point,
              // use animateTo() function to arrive end point
              if (newVal === this.styles[0][prop]) {
                const interpolatedValueCallback = (val: number) =>
                  (this.interpolatingStyles[nextIdx][prop] = val);
                const animatedTo = createAnimate(
                  this.interpolatingStyles[nextIdx][prop],
                  interpolatedValueCallback,
                  this.options
                );
                animatedTo(newVal);
              } else {
                const ret = oneFrameDistance(
                  currentValue,
                  newVal,
                  currentVelocity,
                  this.options
                );

                currentValue = ret.value;
                currentVelocity = ret.velocity;
                this.interpolatingStyles[nextIdx][prop] = currentValue;
              }
            }
          );
        });
      });
    }
  }
};
export default StaggeredMotion;
