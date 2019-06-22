// styles = {height: 100, width: 200}
import { PluginType } from "./types";
import Motion from "./Motion";
import StaggeredMotion from "./StaggeredMotion";

const VueMotion: PluginType = { install: null };
VueMotion.install = function(Vue, opttions) {
  Vue.component("Motion", Motion);
  Vue.component("StaggeredMotion", StaggeredMotion);
};
export default VueMotion;
