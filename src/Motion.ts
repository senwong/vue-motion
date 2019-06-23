import { createAnimate } from "./utils";
import { Options, StyleType } from "./types";
import { noWobble } from "./presets";
interface DataType {
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
      interpolatingStyles: {}
    };
    return data;
  },
  props: {
    // {width: 0, height: 0, x: 0}
    styles: {
      required: true
    },
    options: {
      default: () => noWobble
    }
  },
  created() {
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
  }
};
export default Motion;
