# vue-motion
Inspired by [react-moto](https://github.com/chenglou/react-motion)
## useage
1. `npm run build`
2. add`<script src="./veu-motion.js"></script>` in html file, or use esm or commonjs module.
3. if you want to use global component, `Vue.use(VueMotion)`, or just local component `import { Motion, StaggeredMotion } from './vue-motion.esm.js'`.
4. check a [exmaple](https://senwong.github.io/vue-motion).
## Motion
Motion component can create a simple animation like spring damper system
### Props
1. `styles` - object, A object containes variables you want to change. e.g. `{x: 0}`, whose value is the initial value.
2. `stiffness` - number, Spring's stiffness, defaults to 26.
3. `damping` - number, damper's damping factor, defaults to 370.
### Useage
```
// initial value in vue's data
styles={x: 0}

// place element to animate into template,
// the styles from v-slot contains the interploated value
<Motion :styles="styles" :stiffness="stiffness" :damping="damping">
  <template v-slot="{styles}">
    <div :style="{width: styles.x}" />
  </template>
</Motion>
```

## StaggeredMotion
StaggeredMotion can create a series of animation, one after one.
### Props
1. `styles` - array, a array of number value object, e.g.`[{x, 0}, {x: 0}, {x: 0}]`, the first object is leading object, changing first object's value will make other object's value to change.
2. `stiffness` - number, same as `stiffness` in `Motion`.
3. `damping` - number, same as `damping` in `Motion`.
### Useage
```
// initial value in vue's data
styles=[{x: 0}, {x: 0}, {x: 0}]

// place element to animate into template,
// the styles from v-slot contains the interploated value
<StaggeredMotion :styles="styles" :stiffness="stiffness" :damping="damping">
  <template v-slot="{ styles }">
    <div
      v-for="(style, idx) in styles"
      :key="idx"
      :style="{width: style.x}" />
  </template>
</StaggeredMotion>
```