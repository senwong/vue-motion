(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.VueMotion = factory());
}(this, function () { 'use strict';

  var msPerFrame = 1 / 60;
  var precision = 0.01;
  function oneFrameDistance(fromValue, toValue, velocity, options, frameCount) {
      if (frameCount === void 0) { frameCount = 1; }
      if (Number.isNaN(fromValue) ||
          Number.isNaN(toValue) ||
          Number.isNaN(velocity)) {
          console.error("onFrameDistance(" + fromValue + ", " + toValue + ", " + velocity + ")");
      }
      console.log({ stiffness: options.stiffness, damping: options.damping });
      var stiffness = options.stiffness, damping = options.damping;
      var x = -Math.abs(toValue - fromValue);
      var forceDamper = -damping * velocity;
      var forceSpring = -stiffness * x;
      var acceleration = (forceSpring + forceDamper) / 1000;
      velocity += acceleration * frameCount;
      x += velocity;
      var ret = toValue > fromValue ? toValue + x : toValue - x;
      ret = Math.round(ret * 1000) / 1000;
      return { value: ret, velocity: velocity, acceleration: acceleration };
  }
  function createAnimate(fromValue, cb, options) {
      var oldRafId;
      var currentValue = fromValue;
      function animateTo(toValue) {
          if (currentValue === toValue) {
              return;
          }
          if (oldRafId) {
              window.cancelAnimationFrame(oldRafId);
          }
          var velocity = 0;
          var accTime = 0, accFrameCount = 0;
          var lastTime;
          function step() {
              var now = performance.now();
              var msFrame = (now - lastTime) / 1000;
              lastTime = now;
              var frameCount = Math.floor((accTime + msFrame) / msPerFrame);
              accFrameCount += frameCount;
              accTime += msFrame - frameCount * msPerFrame;
              var _a = oneFrameDistance(currentValue, toValue, velocity, options, frameCount), newValue = _a.value, newVelocity = _a.velocity, acceleration = _a.acceleration;
              currentValue = newValue;
              velocity = newVelocity;
              if (accFrameCount > 0 &&
                  Math.abs(acceleration) < precision &&
                  Math.abs(velocity) < precision) {
                  cb(toValue);
                  return;
              }
              cb(currentValue);
              oldRafId = window.requestAnimationFrame(function () {
                  step();
              });
          }
          lastTime = performance.now();
          step();
      }
      return animateTo;
  }

  var Motion = {
      template: "\n    <div>\n      <slot v-bind:styles=\"interpolatingStyles\"></slot>\n    </div>\n  ",
      data: function () {
          var data = {
              interpolatingStyles: {},
              options: { stiffness: null, damping: null }
          };
          return data;
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
              "default": 370,
              validator: function (value) {
                  return value > 0;
              }
          }
      },
      watch: {
          stiffness: function (newVal) {
              this.options.stiffness = newVal;
          },
          damping: function (newVal) {
              this.options.damping = newVal;
          }
      },
      created: function () {
          var _this = this;
          this.initialOptions();
          this.interpolatingStyles = Object.assign({}, this.styles);
          Object.keys(this.styles).map(function (property) {
              var initialStyleValue = _this.styles[property];
              var animateTo = createAnimate(initialStyleValue, function (val) { return (_this.interpolatingStyles[property] = val); }, _this.options);
              _this.$watch("styles." + property, function (newVal) { return animateTo(newVal); });
          });
      },
      methods: {
          initialOptions: function () {
              this.options.stiffness = this.stiffness;
              this.options.damping = this.damping;
          }
      }
  };

  var StaggeredMotion = {
      template: "\n    <div>\n      <slot v-bind:styles=\"interpolatingStyles\"></slot>\n    </div>\n  ",
      data: function () {
          var data = {
              interpolatingStyles: [],
              options: { stiffness: null, damping: null }
          };
          return data;
      },
      props: {
          styles: {
              required: true
          },
          stiffness: {
              type: Number,
              "default": 20,
              validator: function (value) { return value > 0; }
          },
          damping: {
              type: Number,
              "default": 370,
              validator: function (value) { return value > 0; }
          },
          enable: {
              type: Boolean,
              "default": true
          }
      },
      created: function () {
          this.initial();
          this.initialOptions();
          this.watchLeadingStyle();
          this.watchInterpolatingStyles();
      },
      watch: {
          stiffness: function (newVal) {
              this.options.stiffness = newVal;
          },
          damping: function (newVal) {
              this.options.damping = newVal;
          }
      },
      methods: {
          initial: function () {
              this.interpolatingStyles = this.styles.map(function (s) {
                  return Object.assign({}, s);
              });
          },
          initialOptions: function () {
              this.options.stiffness = this.stiffness;
              this.options.damping = this.damping;
          },
          watchLeadingStyle: function () {
              var _this = this;
              Object.keys(this.styles[0]).map(function (prop) {
                  var initialValue = _this.styles[0][prop];
                  var interpolatedValueCallback = function (val) {
                      return (_this.interpolatingStyles[0][prop] = val);
                  };
                  var animatedTo = createAnimate(initialValue, interpolatedValueCallback, _this.options);
                  _this.$watch(function () { return _this.styles[0][prop]; }, function (newVal) { return animatedTo(newVal); });
              });
          },
          watchInterpolatingStyles: function () {
              var _this = this;
              this.interpolatingStyles.map(function (style, idx) {
                  if (idx >= _this.interpolatingStyles.length - 1) {
                      return;
                  }
                  Object.keys(style).map(function (prop) {
                      var nextIdx = idx + 1;
                      var currentValue = _this.interpolatingStyles[nextIdx][prop];
                      var currentVelocity = 0;
                      _this.$watch(function () { return _this.interpolatingStyles[idx][prop]; }, function (newVal) {
                          if (newVal === _this.styles[0][prop]) {
                              var interpolatedValueCallback = function (val) {
                                  return (_this.interpolatingStyles[nextIdx][prop] = val);
                              };
                              var animatedTo = createAnimate(_this.interpolatingStyles[nextIdx][prop], interpolatedValueCallback, _this.options);
                              animatedTo(newVal);
                          }
                          else {
                              var ret = oneFrameDistance(currentValue, newVal, currentVelocity, _this.options);
                              currentValue = ret.value;
                              currentVelocity = ret.velocity;
                              _this.interpolatingStyles[nextIdx][prop] = currentValue;
                          }
                      });
                  });
              });
          }
      }
  };

  var VueMotion = {
      install: function (Vue, options) {
          Vue.component("Motion", Motion);
          Vue.component("StaggeredMotion", StaggeredMotion);
      },
      Motion: Motion,
      StaggeredMotion: StaggeredMotion
  };

  return VueMotion;

}));
