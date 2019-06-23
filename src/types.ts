export interface StyleType {
  [property: string]: number;
}
export interface StyleInfoType {
  middleValue: number;
  accValue: number;
  x: number;
  acceleration: number;
  velocity: number;
  lastVelocity: number;
  direction: number;
}
export interface PropertyStyleInfoType {
  [property: string]: StyleInfoType;
}

// staggeredMotion const styles = [{x: 0}, {x: 0}, {x: 0}];
// styles[0].x = 500, styles[1].x = stepValueFrom0, styles[2].x = stepValueFrom1;
/*
// created() {
  const n = this.styles.length;
  for (let i = 0; i < n -2; i++) {
    Object.keys(this.styles[i]).forEach(p => {
      const first = styles[i];
      this.$watch("first"+[i], function(newVal, oldVal) {
        this.animatedFirst(oldVal, newVal, animatedVal => {
          this.styles[i+1][p] = animatedVal;
        })
      })
    })
  }
}
*/
// watch(styles[0].x)
export interface StaggeredMotionData {
  interpolatingStyles: StyleType[];
  options: Options;
}

export interface Options {
  stiffness: number;
  damping: number;
}
