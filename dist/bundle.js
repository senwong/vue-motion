var VueMotion = (function (exports) {
  'use strict';

  var VueMotion = { install: null };
  var Motion = {
      template: "\n    <div>\n      <slot v-bind:styles=\"animatedStyles\"></slot>\n    </div>\n  ",
      data: function () {
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
              "default": 100,
              validator: function (value) {
                  return value > 0;
              }
          },
          damping: {
              type: Number,
              "default": 20,
              validator: function (value) {
                  return value > 0;
              }
          },
          enable: {
              type: Boolean,
              "default": true
          }
      },
      created: function () {
          var _this = this;
          this.animatedStyles = Object.assign({}, this.styles);
          Object.keys(this.styles).map(function (property) {
              _this.$watch("styles." + property, function (newVal, oldVal) {
                  console.log("watch " + property, { newVal: newVal, oldVal: oldVal });
                  this.animateValue(oldVal, newVal, property);
              });
          });
      },
      watch: {
          styles: function (val, oldVal) {
              console.log("watch styles ", { val: val, oldVal: oldVal });
          }
      },
      methods: {
          animateValues: function (fromStyles, toStyles) {
              var propertys = Object.keys(toStyles);
              if (propertys.every(function (p) { return fromStyles[p] === toStyles[p]; })) {
                  return;
              }
              var k = 10, m = 1, msPerFrame = 1 / 60;
              var propertyStyleInfo = propertys.reduce(function (styleInfo, p) {
                  var toValue = toStyles[p], fromValue = fromStyles[p];
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
              }, {});
              var lastTime, accTime = 0;
              var that = this;
              function step() {
                  var now = performance.now();
                  var msFrame = (now - lastTime) / 1000;
                  lastTime = now;
                  var frameCount = Math.floor((accTime + msFrame) / msPerFrame);
                  var timeToMove = frameCount * msPerFrame;
                  accTime += msFrame - timeToMove;
                  var isFinished = false;
                  for (var property in propertyStyleInfo) {
                      if (!propertyStyleInfo.hasOwnProperty(property)) {
                          return;
                      }
                      var styleInfo = propertyStyleInfo[property];
                      styleInfo.x = styleInfo.accValue - styleInfo.middleValue;
                      styleInfo.acceleration = (-k * styleInfo.x) / m;
                      styleInfo.lastVelocity = styleInfo.velocity;
                      styleInfo.velocity += styleInfo.acceleration * timeToMove;
                      styleInfo.acceleration += styleInfo.velocity * timeToMove;
                      if (styleInfo.acceleration > styleInfo.middleValue &&
                          Math.abs(styleInfo.velocity) <=
                              Math.abs(styleInfo.acceleration * timeToMove)) {
                          isFinished = true;
                      }
                  }
                  if (!isFinished) {
                      window.requestAnimationFrame(function () {
                          step();
                      });
                  }
                  else {
                      for (var property in propertyStyleInfo) {
                          if (!propertyStyleInfo.hasOwnProperty(property)) {
                              return;
                          }
                          var styleInfo = propertyStyleInfo[property];
                          styleInfo.acceleration = Math.abs(toStyles[property] - fromStyles[property]);
                      }
                  }
                  for (var property in propertyStyleInfo) {
                      if (!propertyStyleInfo.hasOwnProperty(property)) {
                          return;
                      }
                      var styleInfo = propertyStyleInfo[property];
                      var acc = styleInfo.acceleration;
                      var fromValue = fromStyles[property];
                      that.animatedStyles[property] =
                          styleInfo.direction > 0 ? acc + fromValue : fromValue - acc;
                  }
              }
              window.requestAnimationFrame(function () {
                  lastTime = performance.now();
                  window.requestAnimationFrame(function () {
                      step();
                  });
              });
          },
          animateValue: function (fromValue, toValue, property) {
              if (fromValue === toValue) {
                  return;
              }
              var msPerFrame = 1 / 60;
              var x = -Math.abs(toValue - fromValue);
              var a;
              var v = 0;
              var accTime = 0, accFrameCount = 0;
              var lastTime;
              var that = this;
              function step() {
                  if (!that.enable) {
                      return;
                  }
                  var now = performance.now();
                  var msFrame = (now - lastTime) / 1000;
                  lastTime = now;
                  var frameCount = Math.floor((accTime + msFrame) / msPerFrame);
                  accFrameCount += frameCount;
                  accTime += msFrame - frameCount * msPerFrame;
                  var fd = -that.damping * v;
                  var fs = -that.stiffness * x;
                  a = (fs + fd) / 1000;
                  v += a * frameCount;
                  var deltaValue = Math.round(v * 1000) / 1000;
                  x += deltaValue;
                  if (accFrameCount > 0 && Math.abs(a) < 0.01 && Math.abs(v) < 0.01) {
                      console.log("end animation: ", { a: a, v: v });
                      return;
                  }
                  window.requestAnimationFrame(function () {
                      step();
                  });
                  that.animatedStyles[property] =
                      toValue > fromValue ? toValue + x : toValue - x;
              }
              window.requestAnimationFrame(function () {
                  lastTime = performance.now();
                  window.requestAnimationFrame(function () {
                      step();
                  });
              });
          }
      }
  };
  VueMotion.install = function (Vue, opttions) {
      Vue.component("Motion", Motion);
  };

  exports.Motion = Motion;
  exports.default = VueMotion;

  return exports;

}({}));
