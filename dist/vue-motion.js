(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.VueMotion = factory());
}(this, function () { 'use strict';

  function intanceofOptions(object) {
      return "stiffness" in object && "damping" in object && "mass" in object;
  }

  var noWobble = { stiffness: 10, damping: 40, mass: 1 };
  var gentle = { stiffness: 7, damping: 20, mass: 1 };
  var wobbly = { stiffness: 5, damping: 13, mass: 1 };
  var stiff = { stiffness: 5, damping: 30, mass: 1 };
  var presets = {
      noWobble: noWobble,
      gentle: gentle,
      wobbly: wobbly,
      stiff: stiff
  };

  var msPerFrame = 1000 / 60;
  var precision = 0.1;
  function oneFrameDistance(fromValue, toValue, velocity, options, frameCount) {
      if (frameCount === void 0) { frameCount = 1; }
      if (Number.isNaN(fromValue) ||
          Number.isNaN(toValue) ||
          Number.isNaN(velocity)) {
          console.error("onFrameDistance(" + fromValue + ", " + toValue + ", " + velocity + ")");
      }
      var stiffness = options.stiffness, damping = options.damping, mass = options.mass;
      var x = -(toValue - fromValue);
      var forceDamper = -damping * velocity;
      var forceSpring = -stiffness * x;
      var acceleration = (forceSpring + forceDamper) / mass;
      velocity += acceleration * ((frameCount * msPerFrame) / 1000);
      x += velocity;
      var ret = toValue + x;
      return { value: ret, velocity: velocity };
  }
  function createAnimate(fromValue, cb, options) {
      if (typeof options === "string") {
          if (options in presets) {
              options = presets[options];
          }
          else {
              console.error("unrecognized options" + options);
              options = presets.noWobble;
          }
      }
      else if (typeof options !== "object" || !intanceofOptions(options)) {
          console.error("unrecognized options" + options);
          options = presets.noWobble;
      }
      var oldRafId;
      var currentValue = fromValue;
      var toValue = fromValue;
      var velocity = 0;
      var accTime = 0, lastTimestamp;
      function step(timestamp) {
          if (Math.abs(toValue - currentValue) <= precision) {
              cb(toValue);
              fromValue = toValue;
              velocity = 0;
              return;
          }
          var msFrame;
          if (lastTimestamp) {
              msFrame = timestamp - lastTimestamp;
          }
          else {
              msFrame = msPerFrame;
          }
          lastTimestamp = timestamp;
          var frameCount = Math.floor((accTime + msFrame) / msPerFrame);
          accTime += msFrame - frameCount * msPerFrame;
          var _a = oneFrameDistance(currentValue, toValue, velocity, options, frameCount), newValue = _a.value, newVelocity = _a.velocity;
          currentValue = newValue;
          velocity = newVelocity;
          cb(currentValue);
          oldRafId = window.requestAnimationFrame(function (timestamp) {
              oldRafId = null;
              step(timestamp);
          });
      }
      function animateTo(toVal) {
          toValue = toVal;
          if (oldRafId) {
              return;
          }
          lastTimestamp = null;
          oldRafId = window.requestAnimationFrame(step);
      }
      return animateTo;
  }

  var Motion = {
      template: "\n    <div>\n      <slot v-bind:styles=\"interpolatingStyles\"></slot>\n    </div>\n  ",
      data: function () {
          var data = {
              interpolatingStyles: {}
          };
          return data;
      },
      props: {
          styles: {
              required: true
          },
          options: {
              "default": function () { return noWobble; }
          }
      },
      created: function () {
          var _this = this;
          this.interpolatingStyles = Object.assign({}, this.styles);
          Object.keys(this.styles).map(function (property) {
              var initialStyleValue = _this.styles[property];
              var animateTo = createAnimate(initialStyleValue, function (val) { return (_this.interpolatingStyles[property] = val); }, _this.options);
              _this.$watch("styles." + property, function (newVal) { return animateTo(newVal); });
          });
      }
  };

  var StaggeredMotion = {
      template: "\n    <div>\n      <slot v-bind:styles=\"interpolatingStyles\"></slot>\n    </div>\n  ",
      data: function () {
          var data = {
              interpolatingStyles: []
          };
          return data;
      },
      props: {
          styles: {
              required: true
          },
          options: {
              "default": function () { return noWobble; }
          }
      },
      created: function () {
          this.initial();
          this.watchLeadingStyle();
          this.watchInterpolatingStyles();
      },
      watch: {},
      methods: {
          initial: function () {
              this.interpolatingStyles = this.styles.map(function (s) {
                  return Object.assign({}, s);
              });
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
