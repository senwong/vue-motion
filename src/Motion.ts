import { createAnimate } from "./utils";
import { Options, StyleType } from "./types";
interface DataType {
  options: Options;
  interpolatingStyles: StyleType;
}
const Motion = {
  template: `
    <div>
      <slot v-bind:styles="interpolatingStyles"></slot>
    </div>
  `,
  data() {
    const data: DataType = {
      interpolatingStyles: {},
      options: { stiffness: null, damping: null }
    };
    return data;
  },
  props: {
    // {width: 0, height: 0, x: 0}
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
      default: 370,
      validator: function(value: number) {
        return value > 0;
      }
    }
  },
  watch: {
    stiffness(newVal: number) {
      this.options.stiffness = newVal;
    },
    damping(newVal: number) {
      this.options.damping = newVal;
    }
  },
  created() {
    this.initialOptions();
    // initial interpolatingStyles
    this.interpolatingStyles = Object.assign({}, this.styles);
    // watch styles from parent component for changes
    Object.keys(this.styles).map(property => {
      let initialStyleValue = this.styles[property];

      const animateTo = createAnimate(
        initialStyleValue,
        (val: number) => (this.interpolatingStyles[property] = val),
        this.options
      );
      this.$watch("styles." + property, (newVal: number) => animateTo(newVal));
    });
  },
  methods: {
    initialOptions() {
      this.options.stiffness = this.stiffness;
      this.options.damping = this.damping;
    }
  }
};
export default Motion;
