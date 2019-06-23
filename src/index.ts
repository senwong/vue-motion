// styles = {height: 100, width: 200}
import Motion from "./Motion";
import StaggeredMotion from "./StaggeredMotion";
import { VueConstructor, PluginObject } from "vue";

const VueMotion: PluginObject<number> = {
  install(Vue: VueConstructor, options) {
    Vue.component("Motion", Motion);
    Vue.component("StaggeredMotion", StaggeredMotion);
  },
  Motion,
  StaggeredMotion
};
export default VueMotion;
