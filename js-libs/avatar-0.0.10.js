/*
-----------------------------------------------------------------------------------
-- avatar.js - v0.0.10 - Built on 2015-11-25 by Jay Crossler using Grunt.js
-----------------------------------------------------------------------------------
-- Packaged with color.js - Copyright (c) 2008-2013, Andrew Brehaut, Tim Baumann, 
--                          Matt Wilson, Simon Heimler, Michel Vielmetter
-- colors.js - Copyright 2012-2013 Matt Jordan - https://github.com/mbjordan/Colors 
-----------------------------------------------------------------------------------
 color.js: */
// Copyright (c) 2008-2013, Andrew Brehaut, Tim Baumann, Matt Wilson,
//                          Simon Heimler, Michel Vielmetter
//
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
// * Redistributions of source code must retain the above copyright notice,
//   this list of conditions and the following disclaimer.
// * Redistributions in binary form must reproduce the above copyright notice,
//   this list of conditions and the following disclaimer in the documentation
//   and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
// AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
// ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
// LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
// SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
// CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
// ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE.

// color.js - version 1.0.1
//
// HSV <-> RGB code based on code from http://www.cs.rit.edu/~ncs/color/t_convert.html
// object function created by Douglas Crockford.
// Color scheme degrees taken from the colorjack.com colorpicker
//
// HSL support kindly provided by Tim Baumann - http://github.com/timjb

// create namespaces
/*global net */
if ("undefined" == typeof net) { var net = {}; }
if (!net.brehaut) { net.brehaut = {}; }

// this module function is called with net.brehaut as 'this'
(function ( ) {
  "use strict";
  // Constants

  // css_colors maps color names onto their hex values
  // these names are defined by W3C
  var css_colors = {aliceblue:'#F0F8FF',antiquewhite:'#FAEBD7',aqua:'#00FFFF',aquamarine:'#7FFFD4',azure:'#F0FFFF',beige:'#F5F5DC',bisque:'#FFE4C4',black:'#000000',blanchedalmond:'#FFEBCD',blue:'#0000FF',blueviolet:'#8A2BE2',brown:'#A52A2A',burlywood:'#DEB887',cadetblue:'#5F9EA0',chartreuse:'#7FFF00',chocolate:'#D2691E',coral:'#FF7F50',cornflowerblue:'#6495ED',cornsilk:'#FFF8DC',crimson:'#DC143C',cyan:'#00FFFF',darkblue:'#00008B',darkcyan:'#008B8B',darkgoldenrod:'#B8860B',darkgray:'#A9A9A9',darkgrey:'#A9A9A9',darkgreen:'#006400',darkkhaki:'#BDB76B',darkmagenta:'#8B008B',darkolivegreen:'#556B2F',darkorange:'#FF8C00',darkorchid:'#9932CC',darkred:'#8B0000',darksalmon:'#E9967A',darkseagreen:'#8FBC8F',darkslateblue:'#483D8B',darkslategray:'#2F4F4F',darkslategrey:'#2F4F4F',darkturquoise:'#00CED1',darkviolet:'#9400D3',deeppink:'#FF1493',deepskyblue:'#00BFFF',dimgray:'#696969',dimgrey:'#696969',dodgerblue:'#1E90FF',firebrick:'#B22222',floralwhite:'#FFFAF0',forestgreen:'#228B22',fuchsia:'#FF00FF',gainsboro:'#DCDCDC',ghostwhite:'#F8F8FF',gold:'#FFD700',goldenrod:'#DAA520',gray:'#808080',grey:'#808080',green:'#008000',greenyellow:'#ADFF2F',honeydew:'#F0FFF0',hotpink:'#FF69B4',indianred:'#CD5C5C',indigo:'#4B0082',ivory:'#FFFFF0',khaki:'#F0E68C',lavender:'#E6E6FA',lavenderblush:'#FFF0F5',lawngreen:'#7CFC00',lemonchiffon:'#FFFACD',lightblue:'#ADD8E6',lightcoral:'#F08080',lightcyan:'#E0FFFF',lightgoldenrodyellow:'#FAFAD2',lightgray:'#D3D3D3',lightgrey:'#D3D3D3',lightgreen:'#90EE90',lightpink:'#FFB6C1',lightsalmon:'#FFA07A',lightseagreen:'#20B2AA',lightskyblue:'#87CEFA',lightslategray:'#778899',lightslategrey:'#778899',lightsteelblue:'#B0C4DE',lightyellow:'#FFFFE0',lime:'#00FF00',limegreen:'#32CD32',linen:'#FAF0E6',magenta:'#FF00FF',maroon:'#800000',mediumaquamarine:'#66CDAA',mediumblue:'#0000CD',mediumorchid:'#BA55D3',mediumpurple:'#9370D8',mediumseagreen:'#3CB371',mediumslateblue:'#7B68EE',mediumspringgreen:'#00FA9A',mediumturquoise:'#48D1CC',mediumvioletred:'#C71585',midnightblue:'#191970',mintcream:'#F5FFFA',mistyrose:'#FFE4E1',moccasin:'#FFE4B5',navajowhite:'#FFDEAD',navy:'#000080',oldlace:'#FDF5E6',olive:'#808000',olivedrab:'#6B8E23',orange:'#FFA500',orangered:'#FF4500',orchid:'#DA70D6',palegoldenrod:'#EEE8AA',palegreen:'#98FB98',paleturquoise:'#AFEEEE',palevioletred:'#D87093',papayawhip:'#FFEFD5',peachpuff:'#FFDAB9',peru:'#CD853F',pink:'#FFC0CB',plum:'#DDA0DD',powderblue:'#B0E0E6',purple:'#800080',rebeccapurple:'#663399',red:'#FF0000',rosybrown:'#BC8F8F',royalblue:'#4169E1',saddlebrown:'#8B4513',salmon:'#FA8072',sandybrown:'#F4A460',seagreen:'#2E8B57',seashell:'#FFF5EE',sienna:'#A0522D',silver:'#C0C0C0',skyblue:'#87CEEB',slateblue:'#6A5ACD',slategray:'#708090',slategrey:'#708090',snow:'#FFFAFA',springgreen:'#00FF7F',steelblue:'#4682B4',tan:'#D2B48C',teal:'#008080',thistle:'#D8BFD8',tomato:'#FF6347',turquoise:'#40E0D0',violet:'#EE82EE',wheat:'#F5DEB3',white:'#FFFFFF',whitesmoke:'#F5F5F5',yellow:'#FFFF00',yellowgreen:'#9ACD32'};

  // CSS value regexes, according to http://www.w3.org/TR/css3-values/
  var css_integer = '(?:\\+|-)?\\d+';
  var css_float = '(?:\\+|-)?\\d*\\.\\d+';
  var css_number = '(?:' + css_integer + ')|(?:' + css_float + ')';
  css_integer = '(' + css_integer + ')';
  css_float = '(' + css_float + ')';
  css_number = '(' + css_number + ')';
  var css_percentage = css_number + '%';
  var css_whitespace = '\\s*?';

  // http://www.w3.org/TR/2003/CR-css3-color-20030514/
  var hsl_hsla_regex = new RegExp([
    '^hsl(a?)\\(', css_number, ',', css_percentage, ',', css_percentage, '(,(', css_number, '))?\\)$'
  ].join(css_whitespace) );
  var rgb_rgba_integer_regex = new RegExp([
    '^rgb(a?)\\(', css_integer, ',', css_integer, ',', css_integer, '(,(', css_number, '))?\\)$'
  ].join(css_whitespace) );
  var rgb_rgba_percentage_regex = new RegExp([
    '^rgb(a?)\\(', css_percentage, ',', css_percentage, ',', css_percentage, '(,(', css_number, '))?\\)$'
  ].join(css_whitespace) );

  // Package wide variables

  // becomes the top level prototype object
  var color;

  /* registered_models contains the template objects for all the
   * models that have been registered for the color class.
   */
  var registered_models = [];


  /* factories contains methods to create new instance of
   * different color models that have been registered.
   */
  var factories = {};

  // Utility functions

  /* object is Douglas Crockfords object function for prototypal
   * inheritance.
   */
  if (!this.object) {
    this.object = function (o) {
      function F () { }
      F.prototype = o;
      return new F();
    };
  }
  var object = this.object;

  /* takes a value, converts to string if need be, then pads it
   * to a minimum length.
   */
  function pad ( val, len ) {
    val = val.toString();
    var padded = [];

    for (var i = 0, j = Math.max( len - val.length, 0); i < j; i++) {
      padded.push('0');
    }

    padded.push(val);
    return padded.join('');
  }


  /* takes a string and returns a new string with the first letter
   * capitalised
   */
  function capitalise ( s ) {
    return s.slice(0,1).toUpperCase() + s.slice(1);
  }

  /* removes leading and trailing whitespace
   */
  function trim ( str ) {
    return str.replace(/^\s+|\s+$/g, '');
  }

  /* used to apply a method to object non-destructively by
   * cloning the object and then apply the method to that
   * new object
   */
  function cloneOnApply( meth ) {
    return function ( ) {
      var cloned = this.clone();
      meth.apply(cloned, arguments);
      return cloned;
    };
  }


  /* registerModel is used to add additional representations
   * to the color code, and extend the color API with the new
   * operation that model provides. see before for examples
   */
  function registerModel( name, model ) {
    var proto = object(color);
    var fields = []; // used for cloning and generating accessors

    var to_meth = 'to'+ capitalise(name);

    function convertAndApply( meth ) {
      return function ( ) {
        return meth.apply(this[to_meth](), arguments);
      };
    }

    for (var key in model) if (model.hasOwnProperty(key)) {
      proto[key] = model[key];
      var prop = proto[key];

      if (key.slice(0,1) == '_') { continue; }
      if (!(key in color) && "function" == typeof prop) {
        // the method found on this object is a) public and b) not
        // currently supported by the color object. Create an impl that
        // calls the toModel function and passes that new object
        // onto the correct method with the args.
        color[key] = convertAndApply(prop);
      }
      else if ("function" != typeof prop) {
        // we have found a public property. create accessor methods
        // and bind them up correctly
        fields.push(key);
        var getter = 'get'+capitalise(key);
        var setter = 'set'+capitalise(key);

        color[getter] = convertAndApply(
          proto[getter] = (function ( key ) {
            return function ( ) {
              return this[key];
            };
          })( key )
        );

        color[setter] = convertAndApply(
          proto[setter] = (function ( key ) {
            return function ( val ) {
              var cloned = this.clone();
              cloned[key] = val;
              return cloned;
            };
          })( key )
        );
      }
    } // end of for over model

    // a method to create a new object - largely so prototype chains dont
    // get insane. This uses an unrolled 'object' so that F is cached
    // for later use. this is approx a 25% speed improvement
    function F () { }
    F.prototype = proto;
    function factory ( ) {
      return new F();
    }
    factories[name] = factory;

    proto.clone = function () {
      var cloned = factory();
      for (var i = 0, j = fields.length; i < j; i++) {
        var key = fields[i];
        cloned[key] = this[key];
      }
      return cloned;
    };

    color[to_meth] = function ( ) {
      return factory();
    };

    registered_models.push(proto);

    return proto;
  }// end of registerModel

  // Template Objects

  /* color is the root object in the color hierarchy. It starts
   * life as a very simple object, but as color models are
   * registered it has methods programmatically added to manage
   * conversions as needed.
   */
  color = {
    /* fromObject takes an argument and delegates to the internal
     * color models to try to create a new instance.
     */
    fromObject: function ( o ) {
      if (!o) {
        return object(color);
      }

      for (var i = 0, j = registered_models.length; i < j; i++) {
        var nu = registered_models[i].fromObject(o);
        if (nu) {
          return nu;
        }
      }

      return object(color);
    },

    toString: function ( ) {
      return this.toCSS();
    }
  };

  var transparent = null; // defined with an RGB later.

  /* RGB is the red green blue model. This definition is converted
   * to a template object by registerModel.
   */
  registerModel('RGB', {
    red:    0,
    green:  0,
    blue:   0,
    alpha:  0,

    /* getLuminance returns a value between 0 and 1, this is the
     * luminance calcuated according to
     * http://www.poynton.com/notes/colour_and_gamma/ColorFAQ.html#RTFToC9
     */
    getLuminance: function ( ) {
      return (this.red * 0.2126) + (this.green * 0.7152) + (this.blue * 0.0722);
    },

    /* does an alpha based blend of color onto this. alpha is the
     * amount of 'color' to use. (0 to 1)
     */
    blend: function ( color , alpha ) {
      color = color.toRGB();
      alpha = Math.min(Math.max(alpha, 0), 1);
      var rgb = this.clone();

      rgb.red = (rgb.red * (1 - alpha)) + (color.red * alpha);
      rgb.green = (rgb.green * (1 - alpha)) + (color.green * alpha);
      rgb.blue = (rgb.blue * (1 - alpha)) + (color.blue * alpha);
      rgb.alpha = (rgb.alpha * (1 - alpha)) + (color.alpha * alpha);

      return rgb;
    },

    /* fromObject attempts to convert an object o to and RGB
     * instance. This accepts an object with red, green and blue
     * members or a string. If the string is a known CSS color name
     * or a hexdecimal string it will accept it.
     */
    fromObject: function ( o ) {
      if (o instanceof Array) {
        return this._fromRGBArray ( o );
      }
      if ("string" == typeof o) {
        return this._fromCSS( trim( o ) );
      }
      if (o.hasOwnProperty('red') &&
          o.hasOwnProperty('green') &&
          o.hasOwnProperty('blue')) {
        return this._fromRGB ( o );
      }
      // nothing matchs, not an RGB object
    },

    _stringParsers: [
        // CSS RGB(A) literal:
        function ( css ) {
          css = trim(css);

          var withInteger = match(rgb_rgba_integer_regex, 255);
          if(withInteger) {
            return withInteger;
          }
          return match(rgb_rgba_percentage_regex, 100);

          function match(regex, max_value) {
            var colorGroups = css.match( regex );

            // If there is an "a" after "rgb", there must be a fourth parameter and the other way round
            if (!colorGroups || (!!colorGroups[1] + !!colorGroups[5] === 1)) {
              return null;
            }

            var rgb = factories.RGB();
            rgb.red   = Math.min(1, Math.max(0, colorGroups[2] / max_value));
            rgb.green = Math.min(1, Math.max(0, colorGroups[3] / max_value));
            rgb.blue  = Math.min(1, Math.max(0, colorGroups[4] / max_value));
            rgb.alpha = !!colorGroups[5] ? Math.min(Math.max(parseFloat(colorGroups[6]), 0), 1) : 1;

            return rgb;
          }
        },

        function ( css ) {
            var lower = css.toLowerCase();
            if (lower in css_colors) {
              css = css_colors[lower];
            }

            if (!css.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)) {
              return;
            }

            css = css.replace(/^#/,'');

            var bytes = css.length / 3;

            var max = Math.pow(16, bytes) - 1;

            var rgb = factories.RGB();
            rgb.red =   parseInt(css.slice(0, bytes), 16) / max;
            rgb.green = parseInt(css.slice(bytes * 1,bytes * 2), 16) / max;
            rgb.blue =  parseInt(css.slice(bytes * 2), 16) / max;
            rgb.alpha = 1;
            return rgb;
        },

        function ( css ) {
            if (css.toLowerCase() !== 'transparent') return;

            return transparent;
        }
    ],

    _fromCSS: function ( css ) {
      var color = null;
      for (var i = 0, j = this._stringParsers.length; i < j; i++) {
          color = this._stringParsers[i](css);
          if (color) return color;
      }
    },

    _fromRGB: function ( RGB ) {
      var newRGB = factories.RGB();

      newRGB.red = RGB.red;
      newRGB.green = RGB.green;
      newRGB.blue = RGB.blue;
      newRGB.alpha = RGB.hasOwnProperty('alpha') ? RGB.alpha : 1;

      return newRGB;
    },

    _fromRGBArray: function ( RGB ) {
      var newRGB = factories.RGB();

      newRGB.red = Math.max(0, Math.min(1, RGB[0] / 255));
      newRGB.green = Math.max(0, Math.min(1, RGB[1] / 255));
      newRGB.blue = Math.max(0, Math.min(1, RGB[2] / 255));
      newRGB.alpha = RGB[3] !== undefined ? Math.max(0, Math.min(1, RGB[3])) : 1;

      return newRGB;
    },

    // convert to a CSS string. defaults to two bytes a value
    toCSSHex: function ( bytes ) {
        bytes = bytes || 2;

        var max = Math.pow(16, bytes) - 1;
        var css = [
          "#",
          pad ( Math.round(this.red * max).toString( 16 ).toUpperCase(), bytes ),
          pad ( Math.round(this.green * max).toString( 16 ).toUpperCase(), bytes ),
          pad ( Math.round(this.blue * max).toString( 16 ).toUpperCase(), bytes )
        ];

        return css.join('');
    },

    toCSS: function ( bytes ) {
      if (this.alpha === 1) return this.toCSSHex(bytes);

      var max = 255;

      var components = [
        'rgba(',
        Math.max(0, Math.min(max, Math.round(this.red * max))), ',',
        Math.max(0, Math.min(max, Math.round(this.green * max))), ',',
        Math.max(0, Math.min(max, Math.round(this.blue * max))), ',',
        Math.max(0, Math.min(1, this.alpha)),
        ')'
      ];

      return components.join('');
    },

    toHSV: function ( ) {
      var hsv = factories.HSV();
      var min, max, delta;

      min = Math.min(this.red, this.green, this.blue);
      max = Math.max(this.red, this.green, this.blue);
      hsv.value = max; // v

      delta = max - min;

      if( delta == 0 ) { // white, grey, black
        hsv.hue = hsv.saturation = 0;
      }
      else { // chroma
        hsv.saturation = delta / max;

        if( this.red == max ) {
          hsv.hue = ( this.green - this.blue ) / delta; // between yellow & magenta
        }
        else if( this.green  == max ) {
          hsv.hue = 2 + ( this.blue - this.red ) / delta; // between cyan & yellow
        }
        else {
          hsv.hue = 4 + ( this.red - this.green ) / delta; // between magenta & cyan
        }

        hsv.hue = ((hsv.hue * 60) + 360) % 360; // degrees
      }

      hsv.alpha = this.alpha;

      return hsv;
    },
    toHSL: function ( ) {
      return this.toHSV().toHSL();
    },

    toRGB: function ( ) {
      return this.clone();
    }
  });

  transparent = color.fromObject({red: 0, blue: 0, green: 0, alpha: 0});


  /* Like RGB above, this object describes what will become the HSV
   * template object. This model handles hue, saturation and value.
   * hue is the number of degrees around the color wheel, saturation
   * describes how much color their is and value is the brightness.
   */
  registerModel('HSV', {
    hue: 0,
    saturation: 0,
    value: 1,
    alpha: 1,

    shiftHue: cloneOnApply(function ( degrees ) {
      var hue = (this.hue + degrees) % 360;
      if (hue < 0) {
        hue = (360 + hue) % 360;
      }

      this.hue = hue;
    }),

    devalueByAmount: cloneOnApply(function ( val ) {
      this.value = Math.min(1, Math.max(this.value - val, 0));
    }),

    devalueByRatio: cloneOnApply(function ( val ) {
      this.value = Math.min(1, Math.max(this.value * (1 - val), 0));
    }),

    valueByAmount: cloneOnApply(function ( val ) {
      this.value = Math.min(1, Math.max(this.value + val, 0));
    }),

    valueByRatio: cloneOnApply(function ( val ) {
      this.value = Math.min(1, Math.max(this.value * (1 + val), 0));
    }),

    desaturateByAmount: cloneOnApply(function ( val ) {
      this.saturation = Math.min(1, Math.max(this.saturation - val, 0));
    }),

    desaturateByRatio: cloneOnApply(function ( val ) {
      this.saturation = Math.min(1, Math.max(this.saturation * (1 - val), 0));
    }),

    saturateByAmount: cloneOnApply(function ( val ) {
      this.saturation = Math.min(1, Math.max(this.saturation + val, 0));
    }),

    saturateByRatio: cloneOnApply(function ( val ) {
      this.saturation = Math.min(1, Math.max(this.saturation * (1 + val), 0));
    }),

    schemeFromDegrees: function ( degrees ) {
      var newColors = [];
      for (var i = 0, j = degrees.length; i < j; i++) {
        var col = this.clone();
        col.hue = (this.hue + degrees[i]) % 360;
        newColors.push(col);
      }
      return newColors;
    },

    complementaryScheme: function ( ) {
      return this.schemeFromDegrees([0,180]);
    },

    splitComplementaryScheme: function ( ) {
      return this.schemeFromDegrees([0,150,320]);
    },

    splitComplementaryCWScheme: function ( ) {
      return this.schemeFromDegrees([0,150,300]);
    },

    splitComplementaryCCWScheme: function ( ) {
      return this.schemeFromDegrees([0,60,210]);
    },

    triadicScheme: function ( ) {
      return this.schemeFromDegrees([0,120,240]);
    },

    clashScheme: function ( ) {
      return this.schemeFromDegrees([0,90,270]);
    },

    tetradicScheme: function ( ) {
      return this.schemeFromDegrees([0,90,180,270]);
    },

    fourToneCWScheme: function ( ) {
      return this.schemeFromDegrees([0,60,180,240]);
    },

    fourToneCCWScheme: function ( ) {
      return this.schemeFromDegrees([0,120,180,300]);
    },

    fiveToneAScheme: function ( ) {
      return this.schemeFromDegrees([0,115,155,205,245]);
    },

    fiveToneBScheme: function ( ) {
      return this.schemeFromDegrees([0,40,90,130,245]);
    },

    fiveToneCScheme: function ( ) {
      return this.schemeFromDegrees([0,50,90,205,320]);
    },

    fiveToneDScheme: function ( ) {
      return this.schemeFromDegrees([0,40,155,270,310]);
    },

    fiveToneEScheme: function ( ) {
      return this.schemeFromDegrees([0,115,230,270,320]);
    },

    sixToneCWScheme: function ( ) {
      return this.schemeFromDegrees([0,30,120,150,240,270]);
    },

    sixToneCCWScheme: function ( ) {
      return this.schemeFromDegrees([0,90,120,210,240,330]);
    },

    neutralScheme: function ( ) {
      return this.schemeFromDegrees([0,15,30,45,60,75]);
    },

    analogousScheme: function ( ) {
      return this.schemeFromDegrees([0,30,60,90,120,150]);
    },

    fromObject: function ( o ) {
      if (o.hasOwnProperty('hue') &&
          o.hasOwnProperty('saturation') &&
          o.hasOwnProperty('value')) {
        var hsv = factories.HSV();

        hsv.hue = o.hue;
        hsv.saturation = o.saturation;
        hsv.value = o.value;
        hsv.alpha = o.hasOwnProperty('alpha') ? o.alpha : 1;

        return hsv;
      }
      // nothing matches, not an HSV object
      return null;
    },

    _normalise: function ( ) {
       this.hue %= 360;
       this.saturation = Math.min(Math.max(0, this.saturation), 1);
       this.value = Math.min(Math.max(0, this.value));
       this.alpha = Math.min(1, Math.max(0, this.alpha));
    },

    toRGB: function ( ) {
      this._normalise();

      var rgb = factories.RGB();
      var i;
      var f, p, q, t;

      if( this.saturation === 0 ) {
        // achromatic (grey)
        rgb.red = this.value;
        rgb.green = this.value;
        rgb.blue = this.value;
        rgb.alpha = this.alpha;
        return rgb;
      }

      var h = this.hue / 60;			// sector 0 to 5
      i = Math.floor( h );
      f = h - i;			// factorial part of h
      p = this.value * ( 1 - this.saturation );
      q = this.value * ( 1 - this.saturation * f );
      t = this.value * ( 1 - this.saturation * ( 1 - f ) );

      switch( i ) {
        case 0:
          rgb.red = this.value;
          rgb.green = t;
          rgb.blue = p;
          break;
        case 1:
          rgb.red = q;
          rgb.green = this.value;
          rgb.blue = p;
          break;
        case 2:
          rgb.red = p;
          rgb.green = this.value;
          rgb.blue = t;
          break;
        case 3:
          rgb.red = p;
          rgb.green = q;
          rgb.blue = this.value;
          break;
        case 4:
          rgb.red = t;
          rgb.green = p;
          rgb.blue = this.value;
          break;
        default:		// case 5:
          rgb.red = this.value;
          rgb.green = p;
          rgb.blue = q;
          break;
      }

      rgb.alpha = this.alpha;

      return rgb;
    },
    toHSL: function() {
      this._normalise();

      var hsl = factories.HSL();

      hsl.hue = this.hue;
      var l = (2 - this.saturation) * this.value,
          s = this.saturation * this.value;
      if(l && 2 - l) {
        s /= (l <= 1) ? l : 2 - l;
      }
      l /= 2;
      hsl.saturation = s;
      hsl.lightness = l;
      hsl.alpha = this.alpha;

      return hsl;
    },

    toHSV: function ( ) {
      return this.clone();
    }
  });

  registerModel('HSL', {
    hue: 0,
    saturation: 0,
    lightness: 0,
    alpha: 1,

    darkenByAmount: cloneOnApply(function ( val ) {
      this.lightness = Math.min(1, Math.max(this.lightness - val, 0));
    }),

    darkenByRatio: cloneOnApply(function ( val ) {
      this.lightness = Math.min(1, Math.max(this.lightness * (1 - val), 0));
    }),

    lightenByAmount: cloneOnApply(function ( val ) {
      this.lightness = Math.min(1, Math.max(this.lightness + val, 0));
    }),

    lightenByRatio: cloneOnApply(function ( val ) {
      this.lightness = Math.min(1, Math.max(this.lightness * (1 + val), 0));
    }),

    fromObject: function ( o ) {
      if ("string" == typeof o) {
        return this._fromCSS( o );
      }
      if (o.hasOwnProperty('hue') &&
          o.hasOwnProperty('saturation') &&
          o.hasOwnProperty('lightness')) {
        return this._fromHSL ( o );
      }
      // nothing matchs, not an RGB object
    },

    _fromCSS: function ( css ) {
      var colorGroups = trim( css ).match( hsl_hsla_regex );

      // if there is an "a" after "hsl", there must be a fourth parameter and the other way round
      if (!colorGroups || (!!colorGroups[1] + !!colorGroups[5] === 1)) {
        return null;
      }

      var hsl = factories.HSL();
      hsl.hue        = (colorGroups[2] % 360 + 360) % 360;
      hsl.saturation = Math.max(0, Math.min(parseInt(colorGroups[3], 10) / 100, 1));
      hsl.lightness  = Math.max(0, Math.min(parseInt(colorGroups[4], 10) / 100, 1));
      hsl.alpha      = !!colorGroups[5] ? Math.max(0, Math.min(1, parseFloat(colorGroups[6]))) : 1;

      return hsl;
    },

    _fromHSL: function ( HSL ) {
      var newHSL = factories.HSL();

      newHSL.hue = HSL.hue;
      newHSL.saturation = HSL.saturation;
      newHSL.lightness = HSL.lightness;

      newHSL.alpha = HSL.hasOwnProperty('alpha') ? HSL.alpha : 1;

      return newHSL;
    },

    _normalise: function ( ) {
       this.hue = (this.hue % 360 + 360) % 360;
       this.saturation = Math.min(Math.max(0, this.saturation), 1);
       this.lightness = Math.min(Math.max(0, this.lightness));
       this.alpha = Math.min(1, Math.max(0, this.alpha));
    },

    toHSL: function() {
      return this.clone();
    },
    toHSV: function() {
      this._normalise();

      var hsv = factories.HSV();

      // http://ariya.blogspot.com/2008/07/converting-between-hsl-and-hsv.html
      hsv.hue = this.hue; // H
      var l = 2 * this.lightness,
          s = this.saturation * ((l <= 1) ? l : 2 - l);
      hsv.value = (l + s) / 2; // V
      hsv.saturation = ((2 * s) / (l + s)) || 0; // S
      hsv.alpha = this.alpha;

      return hsv;
    },
    toRGB: function() {
      return this.toHSV().toRGB();
    }
  });

  // Package specific exports

  /* the Color function is a factory for new color objects.
   */
  function Color( o ) {
    return color.fromObject( o );
  }
  Color.isValid = function( str ) {
    var key, c = Color( str );

    var length = 0;
    for(key in c) {
      if(c.hasOwnProperty(key)) {
        length++;
      }
    }

    return length > 0;
  };
  net.brehaut.Color = Color;
}).call(net.brehaut);

/* Export to CommonJS
*/
if(typeof module !== 'undefined') {
  module.exports = net.brehaut.Color;
}
/*
 Colors JS Library v1.2.4
 Copyright 2012-2013 Matt Jordan
 Licensed under Creative Commons Attribution-ShareAlike 3.0 Unported. (http://creativecommons.org/licenses/by-sa/3.0/)
 https://github.com/mbjordan/Colors
*/
(function(n){var l={},g={};l.render=function(a,b){var d={},c;if("object"==typeof a)return"rgb"===b&&(c=["R","G","B","RGB"]),"hsv"===b&&(c=["H","S","V","HSV"]),"hsl"===b&&(c=["H","S","L","HSL"]),d[c[0]]=a[0],d[c[1]]=a[1],d[c[2]]=a[2],d[c[3]]=a[0]+" "+a[1]+" "+a[2],d.a=a,d};l.paddedHex=function(a){a=(10>a?"0":"")+a.toString(16);return 1===a.length?"0"+a:a};Number.prototype.round=function(a){return parseFloat(this.toFixed(a||10))};g.rgb2hex=function(a,b,d){a=l.paddedHex(a);b=void 0!==b?l.paddedHex(b):
a;d=void 0!==d?l.paddedHex(d):a;return"#"+a+b+d};g.hex2rgb=function(a){a=a.replace("#","");return 6===a.length?l.render([parseInt(a.substr(0,2),16),parseInt(a.substr(2,2),16),parseInt(a.substr(4,2),16)],"rgb"):parseInt(a,16)};g.hex2hsv=function(a){a="#"==a.charAt(0)?a.substring(1,7):a;var b=parseInt(a.substring(0,2),16)/255,d=parseInt(a.substring(2,4),16)/255;a=parseInt(a.substring(4,6),16)/255;var c=0,e=0,h=0,e=Math.min(b,d,a),k=Math.max(b,d,a),f=k-e,m,g,h=k;0===f?e=c=0:(e=f/k,m=((k-b)/6+f/2)/f,
g=((k-d)/6+f/2)/f,f=((k-a)/6+f/2)/f,b==k?c=f-g:d==k?c=1/3+m-f:a==k&&(c=2/3+g-m),0>c&&(c+=1),1<c&&(c-=1));return l.render([Math.round(360*c),Math.round(100*e),Math.round(100*h)],"hsv")};g.hsv2rgb=function(a,b,d){var c=[],e,h,k;"object"==typeof a?(e=a[0],b=a[1],a=a[2]):(e=a,a=d);b/=100;a/=100;d=Math.floor(e/60%6);h=e/60-d;e=a*(1-b);k=a*(1-h*b);b=a*(1-(1-h)*b);switch(d){case 0:c=[a,b,e];break;case 1:c=[k,a,e];break;case 2:c=[e,a,b];break;case 3:c=[e,k,a];break;case 4:c=[b,e,a];break;case 5:c=[a,e,k]}return l.render([Math.min(255,
Math.floor(256*c[0])),Math.min(255,Math.floor(256*c[1])),Math.min(255,Math.floor(256*c[2]))],"rgb")};g.rgb2hsl=function(a,b,d){var c,e,h,k,f;"object"===typeof a?(c=a[0],b=a[1],a=a[2]):(c=a,a=d);c/=255;b/=255;a/=255;d=Math.max(c,b,a);e=Math.min(c,b,a);k=(d+e)/2;if(d==e)h=e=0;else{f=d-e;e=0.5<k?f/(2-d-e):f/(d+e);switch(d){case c:h=(b-a)/f+(b<a?6:0);break;case b:h=(a-c)/f+2;break;case a:h=(c-b)/f+4}h/=6}return l.render([Math.floor(360*h),(100*e).round(1),(100*k).round(1)],"hsl")};g.hsv2hsl=function(a,
b,d){var c,e,h,k,f,g;"object"==typeof a?(c=a[0],e=a[1],h=a[2]):(c=a,e=b,h=d);h=this.hsv2rgb(c,e,h);c=h.R/255;e=h.G/255;k=h.B/255;f=Math.max(c,e,k);g=Math.min(c,e,k);h=(f+g)/2;f!=g&&(b=0.5>h?(f-g)/(f+g):(f-g)/(2-f-g),a=c==f?(e-k)/(f-g):e==f?2+(k-c)/(f-g):4+(c-e)/(f-g));return l.render([Math.floor(a),Math.floor(b),Math.floor(d)],"hsl")};g.name2hex=function(a){a=a.toLowerCase();a={aliceblue:"#f0f8ff",antiquewhite:"#faebd7",aqua:"#00ffff",aquamarine:"#7fffd4",azure:"#f0ffff",beige:"#f5f5dc",bisque:"#ffe4c4",
black:"#000000",blanchedalmond:"#ffebcd",blue:"#0000ff",blueviolet:"#8a2be2",brown:"#a52a2a",burlywood:"#deb887",cadetblue:"#5f9ea0",chartreuse:"#7fff00",chocolate:"#d2691e",coral:"#ff7f50",cornflowerblue:"#6495ed",cornsilk:"#fff8dc",crimson:"#dc143c",cyan:"#00ffff",darkblue:"#00008b",darkcyan:"#008b8b",darkgoldenrod:"#b8860b",darkgray:"#a9a9a9",darkgrey:"#a9a9a9",darkgreen:"#006400",darkkhaki:"#bdb76b",darkmagenta:"#8b008b",darkolivegreen:"#556b2f",darkorange:"#ff8c00",darkorchid:"#9932cc",darkred:"#8b0000",
darksalmon:"#e9967a",darkseagreen:"#8fbc8f",darkslateblue:"#483d8b",darkslategray:"#2f4f4f",darkslategrey:"#2f4f4f",darkturquoise:"#00ced1",darkviolet:"#9400d3",deeppink:"#ff1493",deepskyblue:"#00bfff",dimgray:"#696969",dimgrey:"#696969",dodgerblue:"#1e90ff",firebrick:"#b22222",floralwhite:"#fffaf0",forestgreen:"#228b22",fuchsia:"#ff00ff",gainsboro:"#dcdcdc",ghostwhite:"#f8f8ff",gold:"#ffd700",goldenrod:"#daa520",gray:"#808080",grey:"#808080",green:"#008000",greenyellow:"#adff2f",honeydew:"#f0fff0",
hotpink:"#ff69b4",indianred:"#cd5c5c",indigo:"#4b0082",ivory:"#fffff0",khaki:"#f0e68c",lavender:"#e6e6fa",lavenderblush:"#fff0f5",lawngreen:"#7cfc00",lemonchiffon:"#fffacd",lightblue:"#add8e6",lightcoral:"#f08080",lightcyan:"#e0ffff",lightgoldenrodyellow:"#fafad2",lightgray:"#d3d3d3",lightgrey:"#d3d3d3",lightgreen:"#90ee90",lightpink:"#ffb6c1",lightsalmon:"#ffa07a",lightseagreen:"#20b2aa",lightskyblue:"#87cefa",lightslategray:"#778899",lightslategrey:"#778899",lightsteelblue:"#b0c4de",lightyellow:"#ffffe0",
lime:"#00ff00",limegreen:"#32cd32",linen:"#faf0e6",magenta:"#ff00ff",maroon:"#800000",mediumaquamarine:"#66cdaa",mediumblue:"#0000cd",mediumorchid:"#ba55d3",mediumpurple:"#9370d8",mediumseagreen:"#3cb371",mediumslateblue:"#7b68ee",mediumspringgreen:"#00fa9a",mediumturquoise:"#48d1cc",mediumvioletred:"#c71585",midnightblue:"#191970",mintcream:"#f5fffa",mistyrose:"#ffe4e1",moccasin:"#ffe4b5",navajowhite:"#ffdead",navy:"#000080",oldlace:"#fdf5e6",olive:"#808000",olivedrab:"#6b8e23",orange:"#ffa500",
orangered:"#ff4500",orchid:"#da70d6",palegoldenrod:"#eee8aa",palegreen:"#98fb98",paleturquoise:"#afeeee",palevioletred:"#d87093",papayawhip:"#ffefd5",peachpuff:"#ffdab9",peru:"#cd853f",pink:"#ffc0cb",plum:"#dda0dd",powderblue:"#b0e0e6",purple:"#800080",red:"#ff0000",rosybrown:"#bc8f8f",royalblue:"#4169e1",saddlebrown:"#8b4513",salmon:"#fa8072",sandybrown:"#f4a460",seagreen:"#2e8b57",seashell:"#fff5ee",sienna:"#a0522d",silver:"#c0c0c0",skyblue:"#87ceeb",slateblue:"#6a5acd",slategray:"#708090",slategrey:"#708090",
snow:"#fffafa",springgreen:"#00ff7f",steelblue:"#4682b4",tan:"#d2b48c",teal:"#008080",thistle:"#d8bfd8",tomato:"#ff6347",turquoise:"#40e0d0",violet:"#ee82ee",wheat:"#f5deb3",white:"#ffffff",whitesmoke:"#f5f5f5",yellow:"#ffff00",yellowgreen:"#9acd32"}[a];return void 0===a?"Invalid Color Name":a};g.name2rgb=function(a){a=this.name2hex(a);return/^[a-fA-F0-9#]{7}$/.test(a)?this.hex2rgb(a):l.render(["Invalid Color Name","Invalid Color Name","Invalid Color Name"],"rgb")};g.name2hsv=function(a){a=this.name2hex(a);
return/^[a-fA-F0-9#]{7}$/.test(a)?this.hex2hsv(a):l.render(["Invalid Color Name","Invalid Color Name","Invalid Color Name"],"hsv")};g.complement=function(a,b,d){var c;if("string"==typeof a&&/(#([A-Fa-f0-9]){3}(([A-Fa-f0-9]){3})?)/.test(a))return a=a.replace("#",""),b="#",6===a.length&&(b+=l.paddedHex(255-this.hex2rgb(a.substr(0,2))),b+=l.paddedHex(255-this.hex2rgb(a.substr(2,2))),b+=l.paddedHex(255-this.hex2rgb(a.substr(4,2)))),3===a.length&&(b+=l.paddedHex(255-this.hex2rgb(a.substr(0,1)+a.substr(0,
1))),b+=l.paddedHex(255-this.hex2rgb(a.substr(1,1)+a.substr(1,1))),b+=l.paddedHex(255-this.hex2rgb(a.substr(2,1)+a.substr(2,1)))),b;void 0!==a&&void 0!==b&&void 0!==d&&(c=[255-a,255-b,255-d]);"object"==typeof a&&(c=[255-a[0],255-a[1],255-a[2]]);return l.render(c,"rgb")};g.rand=function(a){var b,d;if("hex"===a||void 0===a){a="";for(d=0;6>d;d++)b=Math.floor(16*Math.random()),a+="0123456789abcdef".substring(b,b+1);return"#"+a}if("rgb"==a)return a=Math.floor(-254*Math.random()+255),b=Math.floor(-254*
Math.random()+255),d=Math.floor(-254*Math.random()+255),l.render([a,b,d],"rgb")};n.Colors=n.$c=g})(window);
//Jay's math helpers
_.mixin({ deepClone: function (p_object) {
    return JSON.parse(JSON.stringify(p_object));
} });

var maths = {};
maths.clamp = function (number, min, max) {
    return Math.min(Math.max(number, min), max);
};
maths.heightOnSin = function (theta_min, theta_max, step, steps, amplitude, func) {
    func = func || Math.sin; //Find the Sin value by default, you can also pass in Math.cos

    var percent = step / steps;
    var theta = theta_min + ((theta_max - theta_min) * percent);
    return Math.sin(theta * Math.PI) * amplitude;
};
maths.sizeFromAmountRange = function (size_min, size_max, amount, amount_min, amount_max) {
    var percent = (amount - amount_min) / (amount_max - amount_min);
    return size_min + (percent * (size_max - size_min));
};
maths.colorBlendFromAmountRange = function (color_start, color_end, amount, amount_min, amount_max) {
    var percent = (amount - amount_min) / (amount_max - amount_min);

    if (color_start.substring(0, 1) == "#") color_start = color_start.substring(1, 7);
    if (color_end.substring(0, 1) == "#") color_end = color_end.substring(1, 7);

    var s_r = color_start.substring(0, 2);
    var s_g = color_start.substring(2, 4);
    var s_b = color_start.substring(4, 6);
    var e_r = color_end.substring(0, 2);
    var e_g = color_end.substring(2, 4);
    var e_b = color_end.substring(4, 6);

    var n_r = Math.abs(parseInt((parseInt(s_r, 16) * percent) + (parseInt(e_r, 16) * (1 - percent))));
    var n_g = Math.abs(parseInt((parseInt(s_g, 16) * percent) + (parseInt(e_g, 16) * (1 - percent))));
    var n_b = Math.abs(parseInt((parseInt(s_b, 16) * percent) + (parseInt(e_b, 16) * (1 - percent))));
    var rgb = maths.decimalToHex(n_r) + maths.decimalToHex(n_g) + maths.decimalToHex(n_b);

    return "#" + rgb;
};
maths.decimalToHex = function (d, padding) {
    var hex = Number(d).toString(16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

    while (hex.length < padding) {
        hex = "0" + hex;
    }

    return hex;
};
maths.idealTextColor = function (bgColor) {

    var nThreshold = 150;
    var components = maths.getRGBComponents(bgColor);
    var bgDelta = (components.R * 0.299) + (components.G * 0.587) + (components.B * 0.114);

    return ((255 - bgDelta) < nThreshold) ? "#000000" : "#ffffff";
};
maths.getRGBComponents = function (color) {

    var r = color.substring(1, 3);
    var g = color.substring(3, 5);
    var b = color.substring(5, 7);

    return {
        R: parseInt(r, 16),
        G: parseInt(g, 16),
        B: parseInt(b, 16)
    };
};
maths.hexColorToRGBA = function (color, transparency) {
    var rgb;
    if (!color) return "rgba(0,0,0,1)";
    var newColor, rgbArr;
    if (color.indexOf("rgb(") == 0 && color.indexOf(",") > 5) {
        //Is in format of rgb(215,159,102)
        newColor = color.substr(0, color.length - 1);
        newColor = newColor.substr(4);
        rgbArr = newColor.split(",");
        rgb = {R: rgbArr[0], G: rgbArr[1], B: rgbArr[2]}
    } else if (color.indexOf("rgba(") == 0 && color.indexOf(",") > 5) {
        //Is in format of rgba(215,159,102,.6)
        newColor = color.substr(0, color.length - 1);
        newColor = newColor.substr(5);
        rgbArr = newColor.split(",");
        rgb = {R: rgbArr[0], G: rgbArr[1], B: rgbArr[2]}
    } else if (color.indexOf("#") == 0) {
        rgb = maths.getRGBComponents(color);
    } else {
        //is likely a color name
        newColor = net.brehaut.Color(color).toString();
        rgb = maths.getRGBComponents(newColor);
    }
    transparency = transparency || 1;
    return "rgba(" + rgb.R + "," + rgb.G + "," + rgb.B + "," + transparency + ")";
};
maths.buildTransformFromTriangleToTriangle = function (sourceTriangle, destTriangle) {
    //Evolved from http://stackoverflow.com/questions/1114257/transform-a-triangle-to-another-triangle
    var x11 = sourceTriangle[0].x;
    var x12 = sourceTriangle[0].y;
    var x21 = sourceTriangle[1].x;
    var x22 = sourceTriangle[1].y;
    var x31 = sourceTriangle[2].x;
    var x32 = sourceTriangle[2].y;
    var y11 = destTriangle[0].x;
    var y12 = destTriangle[0].y;
    var y21 = destTriangle[1].x;
    var y22 = destTriangle[1].y;
    var y31 = destTriangle[2].x;
    var y32 = destTriangle[2].y;

    var a1 = ((y11 - y21) * (x12 - x32) - (y11 - y31) * (x12 - x22)) /
        ((x11 - x21) * (x12 - x32) - (x11 - x31) * (x12 - x22));
    var a2 = ((y11 - y21) * (x11 - x31) - (y11 - y31) * (x11 - x21)) /
        ((x12 - x22) * (x11 - x31) - (x12 - x32) * (x11 - x21));
    var a3 = y11 - a1 * x11 - a2 * x12;
    var a4 = ((y12 - y22) * (x12 - x32) - (y12 - y32) * (x12 - x22)) /
        ((x11 - x21) * (x12 - x32) - (x11 - x31) * (x12 - x22));
    var a5 = ((y12 - y22) * (x11 - x31) - (y12 - y32) * (x11 - x21)) /
        ((x12 - x22) * (x11 - x31) - (x12 - x32) * (x11 - x21));
    var a6 = y12 - a4 * x11 - a5 * x12;

    //Return a matrix in a format that can be used by canvas.context.transform(m[0],m[1],m[2],m[3],m[4],m[5])
    return [a1, a4, a2, a5, a3, a6];
};
//--------------------------------------------
// Library of commonly used generic functions.
//--------------------------------------------

var Helpers = Helpers || {};
Helpers.between = function (s, prefix, suffix, suffixAtEnd, prefixAtEnd) {
    if (!s.lastIndexOf || !s.indexOf) {
        return s;
    }
    var i = prefixAtEnd ? s.lastIndexOf(prefix) : s.indexOf(prefix);
    if (i >= 0) {
        s = s.substring(i + prefix.length);
    }
    else {
        return '';
    }
    if (suffix) {
        i = suffixAtEnd ? s.lastIndexOf(suffix) : s.indexOf(suffix);
        if (i >= 0) {
            s = s.substring(0, i);
        }
        else {
            return '';
        }
    }
    return s;
};
Helpers.sortWithConditions = function (input, val_name) {
	//Sorts in order, and if any item has a before/behind or after/above condition, reorders those
    val_name = val_name || "name";

	var out = [];
    var remaining = [];
    var i, c, t, item, after, highest, condition, to;

    for (i=0; i<input.length; i++) {
        item = input[i];
        if (item.after || item.above) { //TODO: Also implement item.before || item.behind
            remaining.push(item);
        } else {
            out.push(item);
        }
    }

    //Look through each item, order them by their conditions
    var unmatched = 0;
    for (i=0; i<remaining.length; i++) {
        item = remaining[i];
        after = item.after || item.above;
        if (!_.isArray(after)) after = [after];
        highest = 0;
        var conditions_met = 0;
        for (c=0; c<after.length; c++) {
            condition = after[c];
            for (t=0; t<out.length; t++) {
                to = out[t];
                if (condition == to[val_name]) {
                    if ((t+1) > highest) highest = t+1;
                    conditions_met++;
                    break;
                }
            }
        }
        if (conditions_met == after.length) {
            out.splice(highest, 0, item);
        } else {
            out.push(item);
            unmatched++;
        }
    }
    //Re-sort the last few items
    for (i=(out.length-unmatched); i<out.length; i++) {
        item = out[i];
        after = item.after || item.above;
        if (!_.isArray(after)) after = [after];
        highest = 0;
        for (c=0; c<after.length; c++) {
            condition = after[c];
            for (t=0; t<out.length; t++) {
                to = out[t];
                if (condition == to[val_name]) {
                    if (t > highest) highest = t+1;
                    break;
                }
            }
        }
        out.splice(i, 1);
        out.splice(highest, 0, item);
    }


	return out;
};

Helpers.randomSetSeed = function (seed) {
    Helpers._randseed = seed || 42;
};
Helpers.random = function () {
    Helpers._randseed = Helpers._randseed || 42;
    var x = Math.sin(Helpers._randseed++) * 10000;
    return x - Math.floor(x);
};
Helpers.randInt = function (max) {
    max = max || 100;
    return parseInt(Helpers.random() * max + 1);
};
Helpers.randOption = function (options) {
    var len = options.length;
    return options[Helpers.randInt(len) - 1];
};

Helpers.dateFromPythonDate = function (date, defaultVal) {
    //Requires moment.js

    if (date == 'None') date = undefined;
    if (date == null) date = undefined;
    if (date == '') date = undefined;

    var output = defaultVal;
    if (date) {
        date = date.replace(/p.m./, 'pm');
        date = date.replace(/a.m./, 'am');
        date = date.replace(/\. /, " ");
        //TODO: Get to work with Zulu times
        output = moment(date);
    }
    if (output && output.isValid && !output.isValid()) output = defaultVal || moment();
    return output;
};

Helpers.knownFileExt = function (ext) {
    var exts = ",3gp,7z,ace,ai,aif,aiff,amr,asf,aspx,asx,bat,bin,bmp,bup,cab,cbr,cda,cdl,cdr,chm,dat,divx,dll,dmg,doc,docx,dss,dvf,dwg,eml,eps,exe,fla,flv,gif,gz,hqx,htm,html,ifo,indd,iso,jar,jp2,jpeg,jpg,kml,kmz,lnk,log,m4a,m4b,m4p,m4v,mcd,mdb,mid,mov,mp2,mp4,mpeg,mpg,msi,mswmm,ogg,pdf,png,pps,ppt,pptx,ps,psd,pst,ptb,pub,qbb,qbw,qxd,ram,rar,rm,rmvb,rtf,sea,ses,sit,sitx,ss,swf,tgz,thm,tif,tmp,torrent,ttf,txt,vcd,vob,wav,wma,wmv,wps,xls,xpi,zip,";
    return (exts.indexOf("," + ext + ",") > -1);
};

Helpers.thousandsFormatter = function (num) {
    return num > 999 ? (num / 1000).toFixed(1) + 'k' : num;
};
Helpers.invertColor = function (hexTripletColor) {
    var color = hexTripletColor;
    color = color.substring(1);           // remove #
    color = parseInt(color, 16);          // convert to integer
    color = 0xFFFFFF ^ color;             // invert three bytes
    color = color.toString(16);           // convert to hex
    color = ("000000" + color).slice(-6); // pad with leading zeros
    color = "#" + color;                  // prepend #
    return color;
};
Helpers.rgb2hex = function (rgb) {
    if (typeof rgb != "string") return rgb;
    function hex(x) {
        return ("0" + parseInt(x).toString(16)).slice(-2);
    }

    if (rgb && rgb.search("rgb") == -1) {
        rgb = rgb.split(',');
        if (rgb.length >= 3) {
            return "#" + hex(rgb[0]) + hex(rgb[1]) + hex(rgb[2]);
        }
        return rgb;
    } else if (rgb) {
        rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);
        return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
    } else {
        return rgb;
    }
};
Helpers.getRGBComponents = function (color) {
    var r = color.substring(1, 3),
        g = color.substring(3, 5),
        b = color.substring(5, 7);
    return {
        R: parseInt(r, 16),
        G: parseInt(g, 16),
        B: parseInt(b, 16)
    };
};
Helpers.idealTextColor = function (bgColor) {
    if (bgColor.length === 4) {
        bgColor = '#' + bgColor[1] + bgColor[1] + bgColor[2] + bgColor[2] + bgColor[3] + bgColor;
    }
    var nThreshold = 105,
        components = Helpers.getRGBComponents(bgColor),
        bgDelta = (components.R * 0.299) + (components.G * 0.587) + (components.B * 0.114);
    return ((255 - bgDelta) < nThreshold) ? "#000000" : "#ffffff";
};
Helpers.getColorWithBackground = function (bg_color, useInvertedInsteadOfBlackWhite) {
    var color = Helpers.rgb2hex(bg_color);
    var overColor = useInvertedInsteadOfBlackWhite ? Helpers.invertColor(color) : Helpers.idealTextColor('#' + color);
    return overColor;
};

Helpers.getQueryString = function () {
    var result = {}, queryString = location.search.substring(1),
        re = /([^&=]+)=([^&]*)/g, m;
    while (m = re.exec(queryString)) {
        result[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
    }
    return result;
};
Helpers.exists = function () {
    //Check if variables exist
    var allExist = true;
    for (var i = 0; i < arguments.length; i++) {
        //TODO: Should it check for null as well?
        if (typeof arguments[i] == "undefined") {
            allExist = false;
            break;
        }
    }
    return allExist;
};
Helpers.upperCase = function (input, eachword) {
    if (typeof input == "undefined") return;

    if (eachword) {
        return input.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    } else {
        return input.charAt(0).toUpperCase() + input.slice(1);
    }
};
Helpers.MakeSureClassExists = function (pointer) {
    //usage: HelperFunctions.MakeSureClassExists('Settings.data');

    var classArr = pointer.split(".");

    var newClass = {};

    if (classArr.length && classArr.length > 0) {
        //It's a multiple-level class

        var rootClass = classArr[0];
        if (window[rootClass]) {
            newClass = window[rootClass];
        } else {
            eval(rootClass + ' = {}');
        }

        var classEval = rootClass;
        for (var i = 1; i < classArr.length; i++) {
            //Loop through everything beyond the first level and make sub objects
            classEval += "['" + classArr[i] + "']";
            if (eval("typeof " + classEval) == 'undefined') {
                eval(classEval + " = {}")
            }
        }
    }
};
Helpers.dateCameBefore = function (dateToCheck) {
    var isADate = false;
    var result = false;
    if (dateToCheck && dateToCheck.isValid) {
        isADate = true;
    } else {
        dateToCheck = moment(dateToCheck);
    }
    if (dateToCheck && dateToCheck.isValid && dateToCheck.isValid()) {
        var now = moment();
        var timeDiff = now.diff(dateToCheck);
        if (timeDiff > 0) result = true;
    } else {
        result = "Invalid Date";
    }
    return result;
};
Helpers.buildBootstrapDropdown = function (title, items) {
    var $group = $("<span class='btn-group'>");
    $("<a class='btn dropdown-toggle btn-mini' data-toggle='dropdown' href='#'>" + title + "<span class='caret'></span></a>")
        .appendTo($group);
    var $ul = $("<ul class='dropdown-menu'>")
        .appendTo($group);
    _.each(items, function (dd) {
        var $li = $("<li>").appendTo($ul);
        var $a = $("<a>")
            .attr({target: '_blank', alt: (dd.alt || dd.name || "")})
            .text(dd.title || "Item")
            .appendTo($li);
        if (dd.url) {
            $a.attr({href: dd.href});
        }
        if (dd.onclick) {
            $a.on('click', dd.onclick);
        }
    });
    return $group;
};
Helpers.buildBootstrapInputDropdown = function (title, items, $input) {
    var $group = $("<span class='input-append btn-group'>");
    var $group_holder = $("<a class='btn dropdown-toggle btn-mini' data-toggle='dropdown' href='#'>")
        .css({float: "none"})
        .appendTo($group);
    var $group_title = $("<span>")
        .text(title)
        .appendTo($group_holder);
    $("<span>")
        .addClass('caret')
        .appendTo($group_holder);

    var $ul = $("<ul class='dropdown-menu'>")
        .appendTo($group);
    _.each(items, function (dd) {
        var $li = $("<li>").appendTo($ul);
        var $a = $("<a>")
            .attr({alt: (dd.alt || dd.name || "")})
            .attr({href: "#"})
            .on('click', function () {
                var value = $(this).text();
                $input.val(value);
                $group_title.text(value);
            })
            .appendTo($li);
        if (dd.imgSrc) {
            $("<img>")
                .attr({src: dd.imgSrc})
                .appendTo($a);
        }
        $('<span>')
            .text(dd.title || "Item")
            .appendTo($a);
    });
    return $group;
};
Helpers.tryToMakeDate = function (val, fieldName) {
    var returnVal;
    var name = (fieldName && fieldName.toLowerCase) ? fieldName.toLowerCase() : "";

    if (name && (name == "date" || name == "created" || name == "updated" || name == "datetime")) {
        var testDate = moment(val);
        if (testDate.isValid()) {
            returnVal = val + " <b>(" + testDate.calendar() + ")</b>";
        }
    }
    return (returnVal || val);
};
Helpers.randomLetters = function (n) {
    var out = "";
    n = n || 1;
    for (var i = 0; i < n; i++) {
        out += String.fromCharCode("a".charCodeAt(0) + (Math.random() * 26) - 1)
    }
    return out;
};
Helpers.pluralize = function (str) {
    var uncountable_words = [
        'equipment', 'information', 'rice', 'money', 'species', 'series',
        'fish', 'sheep', 'moose', 'deer', 'news'
    ];
    var plural_rules = [
        [new RegExp('(m)an$', 'gi'), '$1en'],
        [new RegExp('(pe)rson$', 'gi'), '$1ople'],
        [new RegExp('(child)$', 'gi'), '$1ren'],
        [new RegExp('^(ox)$', 'gi'), '$1en'],
        [new RegExp('(ax|test)is$', 'gi'), '$1es'],
        [new RegExp('(octop|vir)us$', 'gi'), '$1i'],
        [new RegExp('(alias|status)$', 'gi'), '$1es'],
        [new RegExp('(bu)s$', 'gi'), '$1ses'],
        [new RegExp('(buffal|tomat|potat)o$', 'gi'), '$1oes'],
        [new RegExp('([ti])um$', 'gi'), '$1a'],
        [new RegExp('sis$', 'gi'), 'ses'],
        [new RegExp('(?:([^f])fe|([lr])f)$', 'gi'), '$1$2ves'],
        [new RegExp('(hive)$', 'gi'), '$1s'],
        [new RegExp('([^aeiouy]|qu)y$', 'gi'), '$1ies'],
        [new RegExp('(x|ch|ss|sh)$', 'gi'), '$1es'],
        [new RegExp('(matr|vert|ind)ix|ex$', 'gi'), '$1ices'],
        [new RegExp('([m|l])ouse$', 'gi'), '$1ice'],
        [new RegExp('(quiz)$', 'gi'), '$1zes'],
        [new RegExp('s$', 'gi'), 's'],
        [new RegExp('$', 'gi'), 's']
    ];
    var ignore = _.indexOf(uncountable_words, str.toLowerCase()) > -1;
    if (!ignore) {
        for (var x = 0; x < plural_rules.length; x++) {
            if (str.match(plural_rules[x][0])) {
                str = str.replace(plural_rules[x][0], plural_rules[x][1]);
                break;
            }
        }
    }
    return str;
};
Helpers.stringAfterString = function (string, after, valIfNotFound) {
    var inLoc = string.indexOf(after);
    if (Helpers.exists(inLoc) && inLoc > -1) {
        return string.substr(inLoc + after.length);
    } else {
        return valIfNotFound || string;
    }
};
Helpers.isNumeric = function (n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
};
Helpers.nameOfUSState = function (code, withComma) {
    var lookup = {AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', DC: 'District of Columbia', FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming'};
    var state = lookup[code.toUpperCase()];
    var output = "";
    if (state) output = withComma ? ", " + state : state;
    return output;
};
Helpers.getQueryVariable = function (variable) {
    var query = window.location.search.substring(1);
    var output = false;
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) {
            output = pair[1];
            break;
        }
    }
    return output;
};
Helpers.createCSSClass = function (selector, style) {
//FROM: http://stackoverflow.com/questions/1720320/how-to-dynamically-create-css-class-in-javascript-and-apply
    if (!document.styleSheets) {
        return;
    }

    if (document.getElementsByTagName("head").length == 0) {
        return;
    }

    var styleSheet;
    var mediaType;
    var media;
    if (document.styleSheets.length > 0) {
        for (i = 0; i < document.styleSheets.length; i++) {
            if (document.styleSheets[i].disabled) {
                continue;
            }
            media = document.styleSheets[i].media;
            mediaType = typeof media;

            if (mediaType == "string") {
                if (media == "" || (media.indexOf("screen") != -1)) {
                    styleSheet = document.styleSheets[i];
                }
            } else if (mediaType == "object" && media.mediaText) {
                if (media.mediaText == "" || (media.mediaText.indexOf("screen") != -1)) {
                    styleSheet = document.styleSheets[i];
                }
            }

            if (Helpers.exists(styleSheet)) {
                break;
            }
        }
    }

    if (Helpers.exists(styleSheet)) {
        var styleSheetElement = document.createElement("style");
        styleSheetElement.type = "text/css";

        document.getElementsByTagName("head")[0].appendChild(styleSheetElement);

        for (i = 0; i < document.styleSheets.length; i++) {
            if (document.styleSheets[i].disabled) {
                continue;
            }
            styleSheet = document.styleSheets[i];
        }

        media = styleSheet.media;
        mediaType = typeof media;
    }

    var i;
    if (mediaType == "string") {
        for (i = 0; i < styleSheet.rules.length; i++) {
            if (styleSheet.rules[i].selectorText.toLowerCase() == selector.toLowerCase()) {
                styleSheet.rules[i].style.cssText = style;
                return;
            }
        }
        styleSheet.addRule(selector, style);
    } else if (mediaType == "object") {
        for (i = 0; i < styleSheet.cssRules.length; i++) {
            if (styleSheet.cssRules[i].selectorText && styleSheet.cssRules[i].selectorText.toLowerCase() == selector.toLowerCase()) {
                styleSheet.cssRules[i].style.cssText = style;
                return;
            }
        }
        styleSheet.insertRule(selector + "{" + style + "}", 0);
    }
};
Helpers.loadCSSFiles = function (cssArray) {
    if (typeof(cssArray) == 'string') cssArray = [cssArray];
    if (!_.isArray(cssArray)) cssArray = [];

    for (var c = 0; c < cssArray.length; c++) {
        var link = document.createElement("link");
        link.setAttribute("rel", "stylesheet");
        link.setAttribute("type", "text/css");
        link.setAttribute("href", cssArray[c]);
        document.getElementsByTagName("head")[0].appendChild(link);
    }
};
Helpers.directoryOfPage = function (url) {
    url = url || document.location.href;
    var lio = url.lastIndexOf("/");
    return url.substr(0, lio + 1);
};
Helpers.randomcolor = function (brightness) {
    if (!Helpers.exists(brightness)) return '#' + Math.floor(Math.random() * 16777215).toString(16);

    //6 levels of brightness from 0 to 5, 0 being the darkest
    var rgb = [Math.random() * 256, Math.random() * 256, Math.random() * 256];
    var mix = [brightness * 51, brightness * 51, brightness * 51]; //51 => 255/5
    var mixed_rgb = [rgb[0] + mix[0], rgb[1] + mix[1], rgb[2] + mix[2]].map(function (x) {
        return Math.round(x / 2.0)
    });
    return "rgb(" + mixed_rgb.join(",") + ")";
};
Helpers.randRange = function (minVal, maxVal, floatVal) {
    //From: JSEDI
    //optional Floatval specifies number of decimal points
    var randVal = minVal + (Math.random() * (maxVal - minVal + 1));
    return (Helpers.exists(floatVal)) ? Math.round(randVal - .5) : randVal.toFixed(floatVal);
};
Helpers.round = function (num, dec) {
    return (Math.round(num * (Math.pow(10, dec))) / Math.pow(10, dec));
};
Helpers.hexFromDec = function (decimal) {
    var code = Math.round(decimal).toString(16);
    (code.length > 1) || (code = '0' + code);
    return code;
};
Helpers.randomcolor_basedon = function (colorrgb) {
    colorrgb = colorrgb || "#505050";
    if (colorrgb.indexOf("#") == 0) colorrgb = colorrgb.substr(1);
    if (colorrgb.length && colorrgb.length == 3)
        colorrgb = colorrgb.substr(0, 1) + "0" + colorrgb.substr(1, 1) + "0" + colorrgb.substr(2, 1) + "0";
    var r = parseInt(colorrgb.substr(0, 2), 16);
    var g = parseInt(colorrgb.substr(2, 2), 16);
    var b = parseInt(colorrgb.substr(4, 2), 16);
    var range = 16;
    r = Helpers.hexFromDec(r + Helpers.randRange(0, range) - (range / 2));
    g = Helpers.hexFromDec(g + Helpers.math.randRange(0, range) - (range / 2));
    b = Helpers.hexFromDec(b + Helpers.math.randRange(0, range) - (range / 2));
    return "#" + r + g + b;
};
Helpers.color_transparency = function (colorrgb, trans) {
    colorrgb = colorrgb || "#505050";
    if (colorrgb.indexOf("#") == 0) colorrgb = colorrgb.substr(1);
    if (colorrgb.length && colorrgb.length == 3)
        colorrgb = colorrgb.substr(0, 1) + "0" + colorrgb.substr(1, 1) + "0" + colorrgb.substr(2, 1) + "0";
    var r = parseInt(colorrgb.substr(0, 2), 16);
    var g = parseInt(colorrgb.substr(2, 2), 16);
    var b = parseInt(colorrgb.substr(4, 2), 16);
    return "rgba(" + r + "," + g + "," + b + "," + trans + ")";
};

Helpers.steppedGYR = function (percentage) {
    percentage = percentage || 0;
    var ret;
    if (percentage <= .5) {
        ret = Helpers.blendColors("#00ff00", '#ffff00', percentage * 2);
    } else {
        ret = Helpers.blendColors('#ffff00', "#ff0000", (percentage - .5) * 2);
    }
    return ret;
};
Helpers.blendColors = function (c1, c2, percentage) {
    if (typeof Colors == 'undefined') {
        throw "Requires colors.min.js library";
    }
    if (!c1 || !c2) return c1;

    c1 = (c1.indexOf('#') == 0) ? c1 = Colors.hex2rgb(c1) : Colors.name2rgb(c1);
    c2 = (c2.indexOf('#') == 0) ? c2 = Colors.hex2rgb(c2) : Colors.name2rgb(c2);

    var rDiff = (c2.R - c1.R) * percentage;
    var gDiff = (c2.G - c1.G) * percentage;
    var bDiff = (c2.B - c1.B) * percentage;


    var result = Colors.rgb2hex(parseInt(c1.R + rDiff), parseInt(c1.G + gDiff), parseInt(c1.B + bDiff));
    if (result.indexOf('#') != 0) {
        result = c1;
    }
    return result;
};
Helpers.bw = function (color) {
//r must be an rgb color array of 3 integers between 0 and 255.
    if (typeof Colors == 'undefined') {
        throw "Requires colors.min.js library";
    }

    var r = Colors.hex2rgb(color).a;

    var contrast = function (B, F) {
        var abs = Math.abs,
            BG = (B[0] * 299 + B[1] * 587 + B[2] * 114) / 1000,
            FG = (F[0] * 299 + F[1] * 587 + F[2] * 114) / 1000,
            bright = Math.round(Math.abs(BG - FG)),
            diff = abs(B[0] - F[0]) + abs(B[1] - F[1]) + abs(B[2] - F[2]);
        return [bright, diff];
    };
    var c, w = [255, 255, 255], b = [0, 0, 0];
    if (r[1] > 200 && (r[0] + r[2]) < 50) c = b;
    else {
        var bc = contrast(b, r);
        var wc = contrast(w, r);
        if ((bc[0] * 4 + bc[1]) > (wc[0] * 4 + wc[1])) c = b;
        else if ((wc[0] * 4 + wc[1]) > (bc[0] * 4 + bc[1])) c = w;
        else c = (bc[0] < wc[0]) ? w : b;
    }
    return 'rgb(' + c.join(',') + ')';
};
Helpers.removeMobileAddressBar = function (doItNow) {
    function fixSize() {
        // Get rid of address bar on iphone/ipod
        window.scrollTo(0, 0);
        document.body.style.height = '100%';
        if (!(/(iphone|ipod)/.test(navigator.userAgent.toLowerCase()))) {
            if (document.body.parentNode) {
                document.body.parentNode.style.height = '100%';
            }
        }
    }

    if (doItNow) {
        fixSize();
    } else {
        setTimeout(fixSize, 700);
        setTimeout(fixSize, 1500);
    }
};

Helpers.orientationInfo = function (x, y) {
    x = x || $(window).width();
    y = y || $(window).height();
    var layout = (x > y) ? 'horizontal' : 'vertical';

    return {layout: layout, ratio: x / y};
};
Helpers.dots = function (num) {
    var output = "";
    for (var i = 0; i < num; i++) {
        if (i % 5 == 0) output += " ";
        output += "&#149;";
    }
    if (num == 0) {
        output = "0";
    }
    return output;
};
Helpers.isIOS = function () {
    navigator.userAgent.toLowerCase().match(/(iphone|ipod|ipad)/);
};
Helpers.exists = function () {
    //Check if variables exist
    var allExist = true;
    for (var i = 0; i < arguments.length; i++) {
        if (typeof arguments[i] == "undefined") {
            allExist = false;
            break;
        }
    }
    return allExist;
};
Helpers.distanceXY = function (p1, p2) {
    return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
};
Helpers.isInArray = function (searchFor, searchIn, ignoreCase) {
    if (!Helpers.exists(searchFor) || !Helpers.exists(searchIn)) return false;
    if (!Helpers.isArray(searchFor)) searchFor = [searchFor];
    if (!Helpers.isArray(searchIn)) searchIn = [searchIn];
    var found = false;
    for (var i = 0; i < searchFor.length; i++) {
        for (var j = 0; j < searchIn.length; j++) {
            var s_f = searchFor[i];
            var s_i = searchIn[j];
            if (ignoreCase && typeof s_f == 'string' && typeof s_i == 'string') {
                if (s_f.toLowerCase() == s_i.toLowerCase()) {
                    found = true;
                    break;
                }
            } else {
                if (s_f == s_i) {
                    found = true;
                    break;
                }
            }
        }
    }
    return found;
};


(function ($) {
    // eventType - "click", "mouseover" etc.
    // destination - either jQuery object, dom element or selector
    // clearCurrent - if true it will clear current handlers at destination - default false
    $.fn.copyEventTo = function (eventType, destination, clearCurrent) {
        var events = [];
        this.each(function () {
            var allEvents = jQuery._data(this, "events");
            if (typeof allEvents === "object") {
                var thoseEvents = allEvents[eventType];
                if (typeof thoseEvents === "object") {
                    for (var i = 0; i < thoseEvents.length; i++) {
                        events.push(allEvents[eventType][i].handler);
                    }
                }
            }
        });
        if (typeof destination === "string") {
            destination = $(destination);
        } else if (typeof destination === "object") {
            if (typeof destination.tagName === "string") {
                destination = $(destination);
            }
        }
        if (clearCurrent === true) destination.off(eventType);
        destination.each(function () {
            for (var i = 0; i < events.length; i++) {
                destination.bind(eventType, events[i]);
            }
        });
        return this;
    }

})(jQuery);

(function(){

  if ("performance" in window == false) {
      window.performance = {};
  }

  Date.now = (Date.now || function () {  // thanks IE8
	  return new Date().getTime();
  });

  if ("now" in window.performance == false){

    var nowOffset = Date.now();

    if (performance.timing && performance.timing.navigationStart){
      nowOffset = performance.timing.navigationStart
    }

    window.performance.now = function now(){
      return Date.now() - nowOffset;
    }
  }

})();
var Avatar = (function ($, _, net, createjs, Helpers, maths) {
    //Uses jquery and Underscore and colors.js and createjs's easel.js

    //TODO: Have a skull-width and jaw-width, and then combine this with thickness to determine face type
    //TODO: Use age, thickness, and musculature to determine which muscles/lines to draw

    //TODO: Add oval decoration
    //TODO: Add descendant page with Procyon
    //TODO: Add a character builder
    //TODO: Decorations are weird on faces.html

    //TODO: Have a shape builder function to standardize and make reusable

    //TODO: Zones should work by polygons
    //TODO: Zones specify color zones that can be shifted or have image effects applied
    //TODO: Zones to have oval like eye be white
    //TODO: Have packs use three standard dots for neck size? and height to scale clothing

    //TODO: Scars and Jewelery
    //TODO: Sag wrinkles when older
    //TODO: Emotions
    //TODO: Moving eyes
    //TODO: Outfits and standing avatar
    //TODO: Check big noses don't go over eyes

    //TODO: Three levels of cheek curves
    //TODO: Multiline function has shadow, offset shadow
    //TODO: Eyes get eyelashes
    //TODO: Iris smaller with variable shapes, pattern in retina

    //TODO: Lots to fix on parent/child example - skin colors bleeding over, images offset on margins
    //TODO: On Option Explorer, "Heart" only shows for all face options after 1 option is set

    //-----------------------------
    //Private Global variables
    var version = '0.0.10',
        summary = 'Procedurally render people on HTML5 canvas.',
        author = 'Jay Crossler - http://github.com/jaycrossler',
        file_name = 'avatar.js';

    var _stage_options = {
        percent_height: 1,
        buffer: 0.1,
        x: 0,
        y: 0
    };
    var STAGES = []; //Global list of all stages used to lookup any existing ones

    //-----------------------------
    var _face_options = {};
    var _data = {'Human': {}};

    //-----------------------------
    //Initialization
    function AvatarClass(option1, option2, option3) {
        this.version = file_name + ' (version ' + version + ') - ' + summary + ' by ' + author;
        this.timing_log = [];
        this.face_options = null;
        this.initialization_seed = null;
        this.times_avatar_drawn = 0;
        this.stage_options = null;
        this.event_list = [];
        this.registered_points = [];
        this.textures = [];
        this.content_packs_used = {};
        this.no_local_editing = (document.location.protocol == 'file:');

        return this.initialize(option1, option2, option3);
    }
    AvatarClass.prototype.initialize = function(option1, option2, option3) {

        if (option1 == 'get_linked_template') {
            option2 = option2 || getFirstRaceFromData();
            return this.data[option2] || {error: 'race does not exist'};
        } else if (option1 == 'copy_data_template') {
            option2 = option2 || getFirstRaceFromData();
            if (this.data[option2]) {
                var data = this.data[option2];
                data = JSON.parse(JSON.stringify(data));
                return data;
            } else {
                return {error: 'race does not exist'};
            }

        } else if (option1 == 'add_render_function') {
            this.renderers.push(option2);

        } else if (option1 == 'get_render_functions') {
            return this.renderers;

        } else if (option1 == 'get_private_functions') {
            return this._private_functions;

        } else if (option1 == 'set_data_template') {
            if (!_.isString(option2)) {
                throw "Name of data template missing"
            }
            if (!_.isObject(option3)) {
                throw "Detail object of data template pack missing"
            }
            this.data[option2] = option3;

        } else if (option1 == 'register_content_pack') {
            if (this._private_functions.registerContentPack) {
                this._private_functions.registerContentPack(this, option2, option3);
            }

        } else if (option1 == 'get_races') {
            var races = [];
            for (var race in this.data) {
                races.push(race);
            }
            return races;

        } else if (option1 == '') {
            //NOTE: avatar class initialized

        } else {
            this.drawOrRedraw(option1, option2, option3);
        }
    };

    AvatarClass.prototype.renderers = [];
    AvatarClass.prototype.data = _data;
    AvatarClass.prototype.content_packs = {};

    AvatarClass.prototype.numberOfStagesDrawn = function () {
        return STAGES.length;
    };
    AvatarClass.prototype.initializeOptions = function (face_options_basic, human_data_options) {
        _face_options = face_options_basic;
        _data['Human'] = human_data_options;
    };

    AvatarClass.prototype.drawOrRedraw = function (face_options, stage_options, canvas_name) {
        var timing_start = window.performance.now();

        if (this.face_options === null) {
            this.initialization_seed = null;
        }

        this.initialization_options = face_options || this.initialization_options || {};

        this.face_options = $.extend({}, this.face_options || _face_options, face_options || {});
        this.stage_options = $.extend({}, this.stage_options || _stage_options, stage_options || {});

        //Determine the random seed to use.  Either use the one passed in, the existing one, or a random one.
        face_options = face_options || {};
        var rand_seed = face_options.rand_seed || this.initialization_seed || Math.floor(Math.random() * 100000);
        this.initialization_seed = rand_seed;
        this.initialization_options.rand_seed = rand_seed;
        //Set this random seed to be used throughout the avatar's lifespan
        this.randomSetSeed(rand_seed);

        //Determine the race, and pick random variables to use for unspecified values
        this.face_options.race = this.face_options.race || getFirstRaceFromData();

        var race_data = this.getRaceData();
        for (var key in race_data) {
            this.randomFaceOption(key, true, true);
        }

        //Find the canvas that the stage should be drawn on (possibly multiple stages per canvas)
        if (canvas_name) {
            this.stage_options.canvas_name = canvas_name;
        }
        if (this.stage_options.canvas_name) {
            canvas_name = this.stage_options.canvas_name;
            if (canvas_name && canvas_name instanceof jQuery) {
                this.stage_options.canvas_name = canvas_name.attr('id') || canvas_name.selector || "canvas";
                this.$canvas = canvas_name;
            }
            var existing_stage = findStageByCanvas(this.stage_options.canvas_name);
            if (!this.$canvas && this.stage_options.$canvas) {
              this.$canvas = this.stage_options.$canvas;
            } else if (!this.$canvas && $(this.stage_options.canvas_name)) {
                this.$canvas = $('#' + this.stage_options.canvas_name);
            }

            if (existing_stage) {
                this.stage = existing_stage;
            } else {
                this.stage = setupStage(this.stage_options.canvas_name);
                if (!this.stage.canvas) {
                    throw "The canvas was not properly initialized in the stage, maybe jquery hadn't finished building it yet."
                }
                addStageByCanvas({canvas_id: this.stage_options.canvas_name, $canvas: this.$canvas, stage: this.stage});
            }
        } else {
            //There was no canvas given.  Create a fake canvas to give to the stage
            var fake_canvas = document.createElement('canvas');
            fake_canvas.width = this.stage_options.width || 400;
            fake_canvas.height = this.stage_options.height || 400;
            this.$canvas = $(fake_canvas);
            this.stage = setupStage(fake_canvas);
            var id = 'fake_canvas_' + STAGES.length;
            addStageByCanvas({canvas_id: id, $canvas: this.$canvas, stage: this.stage});
        }

        //Draw the faces
        if (this.stage) {
            this.erase();

            this.randomSetSeed(rand_seed);
            generateSkinAndHairColors(this);
            if (this._private_functions.generateTextures) { //Should be in avatar-textures.js
                this._private_functions.generateTextures(this);
            }

            this.randomSetSeed(rand_seed); //Reset the random seed after textures are generated

            if (stage_options && stage_options.clear_before_draw) this.stage.removeAllChildren();

            var face = this.buildFace();
            try {
                this.drawOnStage(face, this.stage);
            } catch (ex) {
                this.timing_log.push({name:"exception", elapsed: -1, ex: ex});
                console.error("Problem when drawing part of a face: " + ex.name);
            }
            this.faceShapeCollection = face;

            registerEvents(this);

            try {
                this.stage.update();
            } catch (ex) {
                this.timing_log.push({name:"exception", elapsed: -1, ex: ex});
                console.error("Problem 2 when drawing part of a face: " + ex.name);
            }

            var timing_end_draw = window.performance.now();
            var time_elapsed_draw = (timing_end_draw - timing_start);
            this.timing_log.push({name: "draw-elapsed", elapsed: time_elapsed_draw, times_redrawn: ++this.times_avatar_drawn});

            if (this.face_options.callback_after_building) {
                this.face_options.callback_after_building(this);
            }
        }

        var timing_end = window.performance.now();
        var time_elapsed = (timing_end - timing_start);
        this.timing_log.push({name: "build-elapsed", elapsed: time_elapsed, times_redrawn: this.times_avatar_drawn});
    };

    //-----------------------------
    //Supporting functions
    AvatarClass.prototype.log = function (showToConsole, showHTML) {
        var log = "Avatar: [seed:" + this.face_options.rand_seed + " #" + this.times_avatar_drawn + "]";
        _.each(this.timing_log, function (log_item) {
            if (log_item.name == 'exception') {
                if (log_item.ex) {
                    log += "\n -- EXCEPTION: " + log_item.ex.name + ", " + log_item.ex.message;
                } else if (log_item.msg) {
                    log += "\n -- EXCEPTION: " + log_item.msg;
                } else {
                    log += "\n -- EXCEPTION";
                }
            } else if (log_item.elapsed) {
                log += "\n - " + log_item.name + ": " + Helpers.round(log_item.elapsed, 4) + "ms";
            } else {
                log += "\n - " + log_item.name;
            }
        });

        if (showToConsole) console.log(log);
        if (showHTML) log = log.replace(/\n/g, '<br/>');
        return log;
    };
    AvatarClass.prototype.logMessage = function (msg) {
        if (_.isString(msg)) msg = {name:msg};

        this.timing_log.push(msg);
    };
    AvatarClass.prototype.lastTimeDrawn = function () {
        var time_drawn = 0;
        var last = _.last(this.timing_log);
        if (last) time_drawn = last.elapsed;

        return time_drawn;
    };

    AvatarClass.prototype.getSeed = function (showAsString) {
        var result = this.initialization_options || {};
        return showAsString ? JSON.stringify(result) : result;
    };
    AvatarClass.prototype.erase = function () {
        if (this.faceShapeCollection) {
            this.faceShapeCollection.removeAllChildren();
            this.faceShapeCollection.visible = false;
        }
    };
    AvatarClass.prototype.getRaceData = function () {
        var race = this.face_options.race || getFirstRaceFromData();
        return _data[race] || _data[getFirstRaceFromData()];
    };
    AvatarClass.prototype.drawOnStage = function (face, stage) {
        stage.addChild(face);
        stage.update();
    };
    function turnWordToNumber(word, min, max, options) {
        options = options || "Darkest,Darker,Dark,Very Low,Low,Less,Below,Reduce,Raised,Above,More,High,Very High,Bright,Brighter,Brightest";
        if (typeof options == "string") options = options.split(",");

        var pos = _.indexOf(options, word);
        var val = (min + max) / 2;
        if (pos > -1) {
            var percent = pos / options.length;
            val = min + (percent * (max - min));
        }
        return val;
    }

    function generateSkinAndHairColors(avatar) {

        //TODO: vary colors based on charisma and age
        //Merge and tweak colors
        var skinColor = '';
        if (_.isString(avatar.face_options.skin_colors)) {
            skinColor = net.brehaut.Color(avatar.face_options.skin_colors);
            avatar.face_options.skin_colors = {name: avatar.face_options.skin_colors, skin: skinColor.toString()};
        } else if (avatar.face_options.skin_colors.skin) {
            skinColor = net.brehaut.Color(avatar.face_options.skin_colors.skin);
        }

        var skin_darken_amount, R, G, B;
        //Based on math from http://johnthemathguy.blogspot.com/2013/08/what-color-is-human-skin.html
        if (avatar.face_options.skin_shade == "Light") {
            skin_darken_amount = turnWordToNumber(avatar.face_options.skin_shade_tint, -3.5, 0.5);
            R = 224.3 + 9.6 * skin_darken_amount;
            G = 193.1 + 17.0 * skin_darken_amount;
            B = 177.6 + 21.0 * skin_darken_amount;
            skinColor = net.brehaut.Color("rgb(" + parseInt(R) + "," + parseInt(G) + "," + parseInt(B) + ")");
            avatar.face_options.skin_colors = {name: "light:" + skin_darken_amount, skin: skinColor.toString()};
        } else if (avatar.face_options.skin_shade == "Dark") {
            skin_darken_amount = turnWordToNumber(avatar.face_options.skin_shade_tint, -3.5, 3);
            R = 168.8 + 38.5 * skin_darken_amount;
            G = 122.5 + 32.1 * skin_darken_amount;
            B = 96.7 + 26.3 * skin_darken_amount;
            skinColor = net.brehaut.Color("rgb(" + parseInt(R) + "," + parseInt(G) + "," + parseInt(B) + ")");
            avatar.face_options.skin_colors = {name: "dark:" + skin_darken_amount, skin: skinColor.toString()};
        }

        if (!_.isObject(avatar.face_options.skin_colors)) {
            avatar.face_options.skin_colors = {name: 'skin', skin: 'rgb(228,131,86)'};
        }

        //TODO: Check that skin is not too white
        var red = net.brehaut.Color('#885544');
        if (!avatar.face_options.skin_colors.highlights) avatar.face_options.skin_colors.highlights = skinColor.lightenByRatio(.4).toString();
        if (!avatar.face_options.skin_colors.cheek) avatar.face_options.skin_colors.cheek = skinColor.blend(red, .1).darkenByRatio(.2).toString();
        if (!avatar.face_options.skin_colors.darkflesh) avatar.face_options.skin_colors.darkflesh = skinColor.blend(red, .1).darkenByRatio(.3).toString();
        if (!avatar.face_options.skin_colors.deepshadow) avatar.face_options.skin_colors.deepshadow = skinColor.darkenByRatio(.4).toString();

        //TODO: Hair color should be more affected by age and stress?
        var age_hair_percent = Math.min(Math.max(0, avatar.face_options.age - 35) / 60, 1);
        var hairColor = colorFromName(avatar.face_options.hair_color_roots, true);

        if (!avatar.face_options.hair_color) {
            var gray = net.brehaut.Color('#eeeeee');
            avatar.face_options.hair_color = hairColor.blend(gray, age_hair_percent).desaturateByRatio(age_hair_percent).toString();
        }
        if (!avatar.face_options.beard_color) {
            var gray_d = net.brehaut.Color('#dddddd');
            avatar.face_options.beard_color = hairColor.blend(gray_d, age_hair_percent).desaturateByRatio(age_hair_percent).toString();
        }
    }

    function find_renderer(avatar, layer, ignore_packs) {
        var render_layer = _.find(avatar.renderers, function (rend) {
            return (rend.style == layer.style) && (rend.feature == layer.feature);
        });
        //Look if there is another renderer that matches from content packs
        var render_pack;
        if (!ignore_packs && avatar._private_functions.content_packs_renderer) {
            var content_pack_render_layer = avatar._private_functions.content_packs_renderer(avatar, layer);
            if (content_pack_render_layer) {
                //Find the frequency it should be applied. If not set, use 100%
                var freq = content_pack_render_layer.use_frequency;
                if (_.isUndefined(freq)) freq = 1;
                if (avatar._private_functions.random(avatar.face_options)<freq) {
                    render_pack = content_pack_render_layer;
                    if (render_layer && render_layer.renderer) {
                        render_pack.prerenderer = render_layer.renderer;
                    }
                }
            }
        }
        return render_pack || render_layer;
    }

    AvatarClass.prototype.buildFace = function () {
        var container = new createjs.Container();
        this.lines = [];
        var avatar = this;

        var face_zones = buildFaceZones(avatar);
        var race_data = avatar.getRaceData();

        //Loop through each rendering order and draw each layer
        _.each(race_data.rendering_order || [], function (layer) {
            avatar.randomSetSeed(avatar.face_options.rand_seed); //Reset the random seed before each rendering

            if (layer.decoration) {
                addSceneChildren(container, buildDecoration(avatar, layer));

            } else if (layer.feature) {
                var render_layer = find_renderer(avatar, layer, layer.hide);

                if (render_layer && render_layer.renderer) {
                    if (render_layer.prerenderer) {
                        //Pre-render something but don't draw it (used to caclulate point locations)
                        var feature_shapes_pre = render_layer.prerenderer(face_zones, avatar, layer);
//                        addSceneChildren(container, feature_shapes_pre);
                    }
                    var feature_shapes = render_layer.renderer(face_zones, avatar, layer);
                    if (!layer.hide) {
                        addSceneChildren(container, feature_shapes);
                    }
                } else {
                    var msg = "avatar.js - Renderer named " + layer.feature + " not found, skipping.";
                    console.error(msg);
                    avatar.timing_log.push({name: "exception", elapsed: -1, msg: msg});
                }
            }
        });

        return container;
    };
    AvatarClass.prototype.randomFaceOption = function (key, dontForceSetting, skipRedraw) {
        var option_name = '';
        var result, currentVal;
        var data = this.getRaceData();
        if (_.str.endsWith(key, '_options') && data[key]) {
            var options = data[key];
            option_name = key.split('_options')[0];
            currentVal = this.face_options[option_name];

            if (!dontForceSetting || (dontForceSetting && !currentVal)) {
                //Set a random option
                result = randOption(options, this.face_options, currentVal);
                this.face_options[option_name] = result;
            } else if (_.isObject(options[0]) && _.isString(currentVal)) {
                //The value is set as text, if it's an array of objects then set the object to the val
                var obj = _.find(options, function (opt) {
                    return opt.name == currentVal;
                });
                if (obj) this.face_options[option_name] = obj;
            }
        }

        if (!skipRedraw) {
            this.drawOrRedraw();
        }
        return result;
    };
    AvatarClass.prototype.unregisterEvent = function (shapeNames) {
        var avatar = this;
        if (shapeNames == 'all') {
            _.each(avatar.event_list, function (event) {
                if (event.shape) {
                    event.shape.removeEventListener(event.eventType || 'click');
                }
            });
            avatar.event_list = [];
        }

        var newEventList = [];
        _.each(avatar.event_list, function (event) {
            if (event.shapeNames == shapeNames && event.shape) {
                event.shape.removeEventListener(event.eventType || 'click');
            } else {
                newEventList.push(event);
            }
        });
        avatar.event_list = newEventList;
    };
    AvatarClass.prototype.registerEvent = function (shapeNames, functionToRun, eventType, dontRegister) {
        eventType = eventType || 'click';
        if (!functionToRun) return;
        var avatar = this;

        if (!dontRegister) {
            avatar.event_list.push({shapeNames: shapeNames, functionToRun: functionToRun, eventType: eventType});
        }

        _.each(shapeNames.split(","), function (shapeName) {
            var shape = findShape(avatar.lines, shapeName);
            if (shape && shape.shape) {
                shape.shape.addEventListener(eventType, function () {
                    functionToRun(avatar);
                });
            }
        });
    };
    AvatarClass.prototype.getBounds = function () {
        var p1 = findPoint(this, 'facezone topleft');
        var p2 = findPoint(this, 'facezone bottomright');
        var p2x = parseInt(p2.x - p1.x);
        var p2y = parseInt(p2.y - p1.y);

        return ({top_x: parseInt(p1.x), top_y: parseInt(p1.y), bottom_x: p2x, bottom_y: p2y});
    };

    //================
    //Private functions
    var color_lookup_object = {
        'Midnight Black': '#090806',
        'Off Black': '#2c222b',
        'Darkest Brown': '#3b302a',
        'Medium Dark Brown': '4e433f',
        'Chestnut Brown': '#504444',
        'Light Chestnut Brown': '#6a4e42',
        'Dark Golden Brown': '#554838',
        'Light Golden Brown': '#a78368',
        'Dark Honey Blond': '#b89778',
        'Bleached Blond': '#dcd0ba',
        'Light Ash Blond': '#debc99',
        'Light Ash Brown': '#977961',
        'Lightest Blond': '#e6cea8',
        'Pale Golden Blond': '#e5c8a8',
        'Strawberry Blond': '#a56b46',
        'Light Auburn': '#91553d',
        'Dark Auburn': '#533d32',
        'Darkest Gray': '#71635a',
        'Medium Gray': '#b7a69e',
        'Light Gray': '#d6c4c2',
        'White Blond': '#fff5e1',
        'Platinum Blond': '#cbbfb1',
        'Russet Red': '#8d4a42',
        'Terra Cotta': '#b6523a',
        'Toasted Wheat': '#d8c078',
        'Melted Butter': '#e3cc88',
        'Wheat Milk': '#f2da91',
        'Cake Two': '#f2e1ae',
        'Shoe Brown': '#664f3c',
        'Cookie': '#8c684a',
        'Tree Bark': '#332a22',
        'Poor Jean': '#f2e7c7'
    };

    function colorFromName(colorName, returnAsBrehaultObject, ifNotFound) {
        var color = color_lookup_object[colorName];

        if (!color) {
            color = ifNotFound || '#000000';
        }
        if (returnAsBrehaultObject) {
            color = net.brehaut.Color(color);
        }

        return color;
    }

    function getFirstRaceFromData() {
        for (key in _data) {
            //wonky way to get first key
            return key;
        }
        throw "No first race found in _data";
    }

    function registerEvents(avatar) {
        var usesMouseOver = false;
        _.each(avatar.event_list, function (event) {
            avatar.registerEvent(event.shapeNames, event.functionToRun, event.eventType, true);
            if (event.eventType == 'mouseover' || event.eventType == 'mouseout') usesMouseOver = true;
        });
        if (usesMouseOver) {
            avatar.stage.enableMouseOver();
        }
    }

    function buildDecoration(avatar, decoration) {
        var shapes = [];

        var data = avatar.getRaceData();
        var data_item = _.find(data.decorations || [], function (dec) {
            return dec.name == decoration.decoration;
        });
        if (data_item) {
            decoration = JSON.parse(JSON.stringify(decoration)); //Deep-copy this
            $.extend(decoration, data_item);
        }

        if (decoration.type == 'rectangle') {
            var p1, p2;
            if (decoration.docked) {
                var image_tl = findPoint(avatar, 'facezone topleft');
                var image_br = findPoint(avatar, 'facezone bottomright');
                var height = decoration.height || 16;
                var width = decoration.width || 16;
                if (decoration.docked == "bottom") {
                    p1 = {x: image_tl.x, y: image_br.y - height};
                    p2 = {x: image_br.x, y: image_br.y};

                    if (decoration.forceInBounds) {
                        var canvas_h = avatar.$canvas.height();
                        if (p2.y > canvas_h) {
                            p1.y += (canvas_h - p2.y);
                            p2.y += (canvas_h - p2.y);
                        }
                    }
                } //TODO: Add other docked locations


            } else {
                p1 = (_.isString(decoration.p1)) ? findPoint(avatar, decoration.p1) : decoration.p1;
                p2 = (_.isString(decoration.p2)) ? findPoint(avatar, decoration.p2) : decoration.p2;
            }
            if (p1 && _.isObject(p1) && p2 && _.isObject(p2)) {
                var p1x = parseInt(p1.x);
                var p1y = parseInt(p1.y);
                var p2x = parseInt(p2.x - p1.x);
                var p2y = parseInt(p2.y - p1.y);

                if (decoration.forceInBounds) {
                    var canvas_w = avatar.$canvas.width();
                    var canvas_h = avatar.$canvas.height();
                    if (p1x < 1) p1x = 1;
                    if (p1y < 1) p1y = 1;
                    if (p2x > canvas_w) p2x = (canvas_w - p1x) - 2;
                    if (p2y > canvas_h) p2y = (canvas_h - p1y) - 2;
                }

                var rect = new createjs.Shape();
                if (decoration.size) rect.graphics.setStrokeStyle(decoration.size);
                if (decoration.line_color || decoration.color) rect.graphics.beginStroke(decoration.line_color || decoration.color);
                if (decoration.fill_color || decoration.color) rect.graphics.beginFill(decoration.fill_color || decoration.color);
                rect.alpha = decoration.alpha || 1;
                rect.graphics.drawRect(p1x, p1y, p2x, p2y);
                rect.graphics.endFill();
                shapes.push(rect);
                avatar.lines.push({name: decoration.name || 'decoration ' + (decoration.name || "item"), line: [p1, {x: p2x, y: p2y}], shape: rect, scale_x: 1, scale_y: 1, x: 1, y: 1});

                if (decoration.text) {
                    var font_size = decoration.font_size || 10;
                    var font_name = decoration.font_name || "Arial";
                    var font_color = decoration.font_color || decoration.color || "Black";
                    var font_text = decoration.text;

                    if (font_text.indexOf("{{") > -1) {
                        _.templateSettings = {
                            interpolate: /\{\{(.+?)\}\}/g
                        };

                        var text_template = _.template(font_text);
                        try {
                            font_text = text_template(avatar.face_options);
                        } catch (ex) {
                            //Decoration couldn't parse variable
                            font_text = "";
                        }
                    }

                    var text = new createjs.Text(font_text, font_size + "px " + font_name, font_color);
                    var textBounds = text.getBounds();
                    var textWidth = p2x;
                    if (textBounds && textBounds.width) {
                        textWidth = textBounds.width;
                    }
                    text.x = p1x + ((p2x - textWidth) / 2);
                    text.y = ((p2y - font_size) / 2) + p1y + (p2y / 2);
                    text.textBaseline = "alphabetic";
                    shapes.push(text);
                }


            }
        } else if (decoration.type == 'image') {
            //TODO: Add images - is there a way to do this from a local file?
        }

        return shapes;
    }

    function getHeightOfStage(avatar) {
        var stage = avatar.stage;
        var stage_options = avatar.stage_options;

        var height = (stage_options.height || stage_options.size || (stage.canvas.height * stage_options.percent_height)) * (1 - stage_options.buffer);
        var full_height = height;

        var age = maths.clamp(avatar.face_options.age, 4, 25);
        var age_size = (50 + age) / 75;  //TODO: Use a Height in Inches
        height *= age_size;

        var height_offset = (stage_options.size || (stage.canvas.height * stage_options.percent_height)) * (stage_options.buffer / 2);

        var resolution = height / 200;

        return {height: height, height_offset: height_offset, full_height: full_height, age_size: age_size, resolution: resolution};
    }

    function buildFaceZones(avatar) {
        var face_options = avatar.face_options;
        var stage_options = avatar.stage_options;

        var face_zones = {neck: {}, face: {}, nose: {}, ears: {}, eyes: {}, chin: {}, hair: {}};

        var height_object = getHeightOfStage(avatar);
        var height = height_object.height;
        var height_offset = height_object.height_offset;
        var full_height = height_object.full_height;

        stage_options.height_offset = height_offset;

        var half_height = height / 2;
        stage_options.half_height = half_height;
        face_zones.face_width = half_height * (0.55 + (face_options.thickness / 35));

        var eye_spacing = 0.005;
        if (face_options.eye_spacing == "Pinched") {
            eye_spacing = 0;
        } else if (face_options.eye_spacing == "Squeezed") {
            eye_spacing = -.005;
        } else if (face_options.eye_spacing == "Thin") {
            eye_spacing = 0.01;
        } else if (face_options.eye_spacing == "Wide") {
            eye_spacing = 0.013;
        }

        var eye_size = 1;
        if (face_options.eye_size == "Tiny") {
            eye_size = .8;
        } else if (face_options.eye_size == "Small") {
            eye_size = .9;
        } else if (face_options.eye_size == "Big") {
            eye_size = 1.05;
        } else if (face_options.eye_size == "Large") {
            eye_size = 1.1;
            eye_size += .01;
        } else if (face_options.eye_size == "Massive") {
            eye_size = 1.2;
            eye_size += .017;
        } else if (face_options.eye_size == "Big Eyed") {
            eye_size = 1.3;
            eye_spacing += .022;
        } else if (face_options.eye_size == "Huge Eyed") {
            eye_size = 1.4;
            eye_spacing += .026;
        } else if (face_options.eye_size == "Giant") {
            eye_size = 1.5;
            eye_spacing += .03;
        }

        var mouth_height = 0.05;
        if (face_options.mouth_height == "Low") {
            mouth_height = 0.04;
        } else if (face_options.mouth_height == "Raised") {
            mouth_height = 0.06;
        } else if (face_options.mouth_height == "High") {
            mouth_height = 0.07;
        }

        var nose_height = 0.01;
        if (face_options.nose_height == "Low") {
            nose_height = 0;
        } else if (face_options.nose_height == "Raised") {
            nose_height = 0.02;
        }

        var forehead_height = 0.01;
        if (face_options.forehead_height == "Under") {
            forehead_height = 0.1;
        } else if (face_options.forehead_height == "Low") {
            forehead_height = 0.11;
        } else if (face_options.forehead_height == "Less") {
            forehead_height = 0.12;
        } else if (face_options.forehead_height == "Normal") {
            forehead_height = 0.13;
        } else if (face_options.forehead_height == "Above") {
            forehead_height = 0.14;
        } else if (face_options.forehead_height == "Raised") {
            forehead_height = 0.15;
        } else if (face_options.forehead_height == "High") {
            forehead_height = 0.16;
        } else if (face_options.forehead_height == "Floating") {
            forehead_height = 0.17;
        }


        var x = stage_options.x;
        var y = stage_options.y;

        if (height_object.age_size < 1) {
            y += (full_height - height + 2);
            x += (full_height - height) / 2;
        }

        face_zones.thick_unit = face_zones.face_width * .007;

        face_zones.neck = {
            left: -face_zones.face_width * .7,
            top: 0,
            right: 1.4 * face_zones.face_width,
            bottom: height * .6,
            x: x + half_height,
            y: y + height_offset + half_height
        };
        face_zones.face = {
            left: -face_zones.face_width,
            top: -half_height,
            right: 2 * face_zones.face_width,
            bottom: height,
            x: x + half_height,
            y: y + height_offset + half_height
        };

        face_zones.eyes = {
            top: (-half_height / 16) * eye_size,
            bottom: (2 * half_height / 12) * eye_size,
            y: y + height_offset + (half_height * (0.8 + forehead_height)),

            left: (-half_height / 8) * eye_size,
            right: (2 * half_height / 8) * eye_size,
            left_x: x + (half_height * (0.75 - eye_spacing)),
            right_x: x + (half_height * (1.25 + eye_spacing)),

            iris: {
                top: -half_height / 24,
                bottom: 2 * half_height / 16,
                y: y + height_offset + (half_height * (0.8 + forehead_height)),

                left: -half_height / 16,
                right: 2 * half_height / 16,
                left_x: x + (half_height * (0.75 - eye_spacing)),
                right_x: x + (half_height * (1.25 + eye_spacing))
            },

            pupil: {
                top: -half_height / 65,
                bottom: 2 * half_height / 28,
                y: y + height_offset + (half_height * (0.805 + forehead_height)),

                left: -half_height / 32,
                right: 2 * half_height / 32,
                left_x: x + (half_height * (0.75 - eye_spacing)),
                right_x: x + (half_height * (1.25 + eye_spacing))
            }
        };

        face_zones.ears = {
            top: -half_height / 5,
            bottom: 2 * half_height / 5,
            y: y + height_offset + (half_height * (0.9 + forehead_height)),

            left: -half_height / 16,
            right: 2 * half_height / 16,
            left_x: x + half_height + face_zones.face.left,
            right_x: x + half_height + (face_zones.face.right / 2)
        };

        face_zones.nose = {
            left: -half_height / 15, top: -half_height / 15,
            right: 2 * half_height / 15, bottom: 2 * half_height / 15,
            radius: half_height / 15,
            x: x + half_height,
            y: y + height_offset + (half_height * (1.13 + (forehead_height * 1.2) + nose_height))
        };

        face_zones.mouth = {
            left: -half_height / 6, top: -half_height / 18,
            right: 2 * half_height / 6, bottom: 2 * half_height / 18,
            x: x + half_height,
            y: y + height_offset + (half_height * (1.5 + (forehead_height / 2) + nose_height + mouth_height))
        };

        namePoint(avatar, 'facezone topleft', {
            x: face_zones.ears.left_x + (2 * face_zones.ears.left),
            y: y
        });
        namePoint(avatar, 'facezone bottomright', {
            x: face_zones.ears.right_x + face_zones.ears.right,
            y: face_zones.neck.y + face_zones.neck.bottom
        });

        return face_zones;
    }


    //-----------------------------
    //Drawing Helpers

    function addSceneChildren(container, children) {
        _.each(children, function (c) {
            if (_.isArray(c)) {
                addSceneChildren(container, c);
            } else {
                container.addChild(c);
            }
        });
        return container;
    }

    function transformLineToGlobalCoordinates(lines, shape_name) {
        var line_new = [];

        var shape = findShape(lines, shape_name);

        _.each(shape.line, function (point) {
            var new_point = _.clone(point);
            new_point.x = (shape.x || 0) + ((shape.scale_x || 1) * .1 * point.x);
            new_point.y = (shape.y || 0) + ((shape.scale_y || 1) * .1 * point.y);

            line_new.push(new_point);
        });
        return line_new;

    }

    function lineSegmentCompared(source_line, compare_line, method, level_adjust) {
        level_adjust = level_adjust || 0;
        method = method || 'above';
        var return_line = [];

        var lowest_compare_point, highest_compare_point;
        if (method == 'above') {
            if (_.isNumber(compare_line)) {
                lowest_compare_point = compare_line;
            } else {
                highest_compare_point = Number.MAX_VALUE;
                _.each(compare_line, function (point) {
                    if (point.y < highest_compare_point) {
                        highest_compare_point = point.y;
                    }
                });
            }
            _.each(source_line, function (point) {
                if ((point.y + level_adjust) <= highest_compare_point) {
                    return_line.push(point);
                }
            })
        } else if (method == 'below') {
            if (_.isNumber(compare_line)) {
                lowest_compare_point = compare_line;
            } else {
                lowest_compare_point = Number.MIN_VALUE;
                _.each(compare_line, function (point) {
                    if (point.y > lowest_compare_point) {
                        lowest_compare_point = point.y;
                    }
                });
            }
            _.each(source_line, function (point) {
                if ((point.y - level_adjust) >= lowest_compare_point) {
                    return_line.push(point);
                }
            })
        } else if (method == 'left') {
            if (_.isNumber(compare_line)) {
                lowest_compare_point = compare_line;
            } else {
                lowest_compare_point = Number.MAX_VALUE;
                _.each(compare_line, function (point) {
                    if (point.x < lowest_compare_point) {
                        lowest_compare_point = point.x;
                    }
                });
            }
            _.each(source_line, function (point) {
                if ((point.x - level_adjust) <= lowest_compare_point) {
                    return_line.push(point);
                }
            })
        } else if (method == 'right') {
            if (_.isNumber(compare_line)) {
                highest_compare_point = compare_line;
            } else {
                highest_compare_point = Number.MIN_VALUE;
                _.each(compare_line, function (point) {
                    if (point.x > highest_compare_point) {
                        highest_compare_point = point.x;
                    }
                });
            }
            _.each(source_line, function (point) {
                if ((point.x + level_adjust) >= highest_compare_point) {
                    return_line.push(point);
                }
            })

        }
        return return_line;
    }

    function transformShapeLine(options_lists, face_options, existing_list) {
        if (!_.isArray(options_lists)) options_lists = [options_lists];

        if (existing_list) {
            existing_list = JSON.parse(JSON.stringify(existing_list));
        } else {
            existing_list = [];
        }

        _.each(options_lists, function (options) {
            var type = options.type || 'circle';
            var steps = options.steps || 18;
            options.radius = options.radius || 1;

            var starting_step = options.starting_step || 0;
            var ending_step = options.ending_step || existing_list.length || steps;

            var c, x, y;
            if (type == 'smooth') {
                if (options.starting_step !== undefined) starting_step = (existing_list.length + options.starting_step) % (existing_list.length);
                if (options.ending_step !== undefined) ending_step = (existing_list.length + options.ending_step) % (existing_list.length);

                if (starting_step < ending_step) {
                    for (c = starting_step; c < ending_step; c++) {
                        existing_list[c].line = false;
                    }
                } else {
                    for (c = 0; c < ending_step; c++) {
                        existing_list[c].line = false;
                    }
                    for (c = starting_step; c < existing_list.length; c++) {
                        existing_list[c].line = false;
                    }
                }
            } else if (type == 'contract') {
                var mid_x = comparePoints(existing_list, 'x', 'middle');
                var mid_y = comparePoints(existing_list, 'y', 'middle');

                if (options.starting_step !== undefined) starting_step = (existing_list.length + options.starting_step) % (existing_list.length);
                if (options.ending_step !== undefined) ending_step = (existing_list.length + options.ending_step) % (existing_list.length);

                if (starting_step < ending_step) {
                    for (c = starting_step; c < ending_step; c++) {
                        existing_list[c].x = mid_x - ((mid_x - existing_list[c].x) * (options.multiplier || .9));
                        existing_list[c].y = mid_y - ((mid_y - existing_list[c].y) * (options.multiplier || .9));
                    }
                } else {
                    for (c = 0; c < ending_step; c++) {
                        existing_list[c].x = mid_x - ((mid_x - existing_list[c].x) * (options.multiplier || .9));
                        existing_list[c].y = mid_y - ((mid_y - existing_list[c].y) * (options.multiplier || .9));
                    }
                    for (c = starting_step; c < existing_list.length; c++) {
                        existing_list[c].x = mid_x - ((mid_x - existing_list[c].x) * (options.multiplier || .9));
                        existing_list[c].y = mid_y - ((mid_y - existing_list[c].y) * (options.multiplier || .9));
                    }
                }
            } else if (type == 'midline of loop') {
                //Takes a loop and averages the points through the middle
                var e_length = existing_list.length;
                var e_length_mid = e_length / 2;
                var new_list = [];

                for (c = 0; c < e_length_mid; c++) {
                    var xy = _.clone(existing_list[c]);
                    new_list.push(xy);
                }
                var id = 0;
                for (c = e_length - 1; c > e_length_mid; c--) {
                    var point_c = existing_list[c];
                    new_list[id].x += point_c.x;
                    new_list[id].x /= 2;
                    new_list[id].y += point_c.y;
                    new_list[id].y /= 2;
                    id++;
                }
                existing_list = new_list;

            } else if (type == 'reverse') {
                var axis = options.axis || 0;
                if (axis == 'left') {
                    axis = comparePoints(existing_list, 'x', 'lowest');
                } else if (axis == 'right') {
                    axis = comparePoints(existing_list, 'x', 'highest');
                } else if (axis == 'top') {
                    axis = comparePoints(existing_list, 'y', 'lowest');
                } else if (axis == 'bottom') {
                    axis = comparePoints(existing_list, 'y', 'highest');
                }

                if (options.direction == 'vertical') {
                    for (c = 0; c < existing_list.length; c++) {
                        existing_list[c].y = axis - (existing_list[c].y - axis);
                    }
                } else {  //Assume horizontal
                    for (c = 0; c < existing_list.length; c++) {
                        existing_list[c].x = axis - (existing_list[c].x - axis);
                    }
                }
            } else if (type == 'shift') {
                if (options.starting_step !== undefined) starting_step = (existing_list.length + options.starting_step) % (existing_list.length);
                if (options.ending_step !== undefined) ending_step = (existing_list.length + options.ending_step) % (existing_list.length);

                if (starting_step < ending_step) {
                    for (c = starting_step; c < ending_step; c++) {
                        existing_list[c].x += options.x_offset || 0;
                        existing_list[c].y += options.y_offset || 0;
                    }
                } else {
                    for (c = 0; c < ending_step; c++) {
                        existing_list[c].x += options.x_offset || 0;
                        existing_list[c].y += options.y_offset || 0;
                    }
                    for (c = starting_step; c < existing_list.length; c++) {
                        existing_list[c].x += options.x_offset || 0;
                        existing_list[c].y += options.y_offset || 0;
                    }

                }

            } else if (type == 'pinch') {
                if (options.starting_step !== undefined) starting_step = (existing_list.length + options.starting_step) % (existing_list.length);
                if (options.ending_step !== undefined) ending_step = (existing_list.length + options.ending_step) % (existing_list.length);

                if (starting_step < ending_step) {
                    for (c = starting_step; c < ending_step; c++) {
                        existing_list[c].y *= options.pinch_amount || .8;
                    }
                } else {
                    //TODO: There's a better way to do this double loop
                    for (c = 0; c < ending_step; c++) {
                        existing_list[c].y *= options.pinch_amount || .8;
                    }
                    for (c = starting_step; c < existing_list.length; c++) {
                        existing_list[c].y *= options.pinch_amount || .8;
                    }

                }
            }
            else if (type == 'randomize') {
                if (options.starting_step !== undefined) starting_step = (existing_list.length + options.starting_step) % (existing_list.length);
                if (options.ending_step !== undefined) ending_step = (existing_list.length + options.ending_step) % (existing_list.length);

                for (c = starting_step; c < ending_step; c++) {
                    var point = existing_list[c];
                    point.x += ((random(face_options) - .5) * options.x_range || .1);
                    point.y += ((random(face_options) - .5) * options.y_range || .1);
                    existing_list[c] = point;
                }

            } else if (type == 'circle') {
                for (c = starting_step; c < ending_step; c++) {
                    x = Math.cos(c / steps * 2 * Math.PI);
                    y = Math.sin(c / steps * 2 * Math.PI);

                    existing_list.push({x: x * (options.radius_x || options.radius), y: y * (options.radius_y || options.radius)});
                }
            } else if (type == 'oval') {
                for (c = starting_step; c < ending_step; c++) {
                    x = Math.cos(c / steps * 2 * Math.PI);
                    y = Math.sin(c / steps * 2 * Math.PI);

                    x = x < 0 ? -Math.pow(Math.abs(x), options.warp_x || 1) : Math.pow(x, options.warp_x || 1);
                    x = x < 0 ? x * (options.shrink_left || 1) : x * (options.shrink_right || 1);

                    y = y < 0 ? -Math.pow(Math.abs(y), options.warp_y || 1) : Math.pow(y, options.warp_y || 1);
                    y = y < 0 ? y * (options.shrink_top || 1) : y * (options.shrink_bottom || 1);

                    if (options.pinch_bottom && y > 0) {
                        x = x < 0 ? -Math.pow(Math.abs(x), options.pinch_bottom || 1) : Math.pow(x, options.pinch_bottom || 1);
                    }
                    if (options.pinch_top && y < 0) {
                        x = x < 0 ? -Math.pow(Math.abs(x), options.pinch_top || 1) : Math.pow(x, options.pinch_top || 1);
                    }
                    if (options.warp_y_bottom && y > 0) {
                        y = Math.pow(y, options.warp_y_bottom || 1);
                    }
                    if ((typeof options.raise_below == "number") && y > options.raise_below) {
                        y *= options.raise_below_amount || .9;
                    }
                    var point_b = {x: x * (options.radius_x || options.radius), y: y * (options.radius_y || options.radius)};
                    if ((typeof options.facet_below == "number") && (y > options.facet_below)) {
                        var next_y = Math.sin((c + 1) / steps * 2 * Math.PI);

                        if ((typeof options.dont_facet_below == "number") && y > options.dont_facet_below && next_y > options.dont_facet_below) {
                            // Don't make the lower points a line
                        } else {
                            point_b.line = true;
                        }
                    }

                    existing_list.push(point_b);
                }
            } else if (_.str.startsWith(type, 'almond-horizontal')) {
                for (c = starting_step; c < ending_step; c++) {
                    x = Math.cos(c / steps * 2 * Math.PI) * (options.radius_x || options.radius);
                    y = Math.sin(c / steps * 2 * Math.PI) * (options.radius_y || options.radius) * .5;
                    existing_list.push({x: x, y: y});
                    if (c % (steps / 2)) {
                        existing_list.push({x: x, y: y});
                    }
                }
            } else if (type == 'neck') {
                existing_list = [
                    {x: -options.radius, y: -options.radius},
                    {x: -options.radius, y: -options.radius},
                    {x: options.radius, y: -options.radius},
                    {x: options.radius, y: -options.radius},
                    {x: options.radius * (options.curvature || 1), y: 0},
                    {x: options.radius, y: options.radius},
                    {x: options.radius, y: options.radius},
                    {x: -options.radius, y: options.radius},
                    {x: -options.radius, y: options.radius},
                    {x: -options.radius * (options.curvature || 1), y: 0}
                ];
            }
        });
        return existing_list;
    }

    function comparePoints(existing_list, attribute, cardinality, returnPoint) {
        var result = null;
        var best_point = null;
        if (attribute == 'height') {
            var y_max = comparePoints(existing_list, 'y', 'highest');
            var y_min = comparePoints(existing_list, 'y', 'lowest');
            result = Math.max(y_max - y_min, y_min - y_max);

        } else if (attribute == 'width') {
            var x_max = comparePoints(existing_list, 'x', 'highest');
            var x_min = comparePoints(existing_list, 'x', 'lowest');
            result = Math.max(x_max - x_min, x_min - x_max);

        } else if (attribute == 'closest') {
            var closest_distance = Number.MAX_VALUE;
            var closest_point = null;
            for (var c = 0; c < existing_list.length; c++) {
                var point = existing_list[c];
                var dist = Helpers.distanceXY(point, cardinality);
                if (dist < closest_distance) {
                    closest_point = point;
                    closest_distance = dist;
                }
            }
            result = closest_point;

        } else if (attribute == 'crosses x') {
            for (var d = 0; d < existing_list.length; d++) {
                var current_point = existing_list[d];
                var next_point;
                if (d < existing_list.length - 1) {
                    next_point = existing_list[d + 1];
                } else {
                    next_point = existing_list[d];
                }

                if ((current_point.x <= cardinality && next_point.x >= cardinality) ||
                    (current_point.x >= cardinality && next_point.x <= cardinality)) {
                    //This line segment crosses the desired y
                    if (current_point.x == next_point.x) {
                        result = current_point.y;
                    } else if (current_point.y == next_point.y) {
                        result = current_point.y;
                    } else {
                        var intersect = checkLineIntersection(current_point, next_point,
                            {x: cardinality, y: current_point.y}, {x: cardinality, y: next_point.y});
                        result = intersect.y;
                    }
                    break;
                }
            }
            if (result == null) {
                var index = existing_list.length - 1;
                result = (existing_list[index] && existing_list[index].y) ? existing_list[index].y : 0;
            }

        } else if (attribute == 'crosses y') {
            for (var d = 0; d < existing_list.length; d++) {
                var current_point = existing_list[d];
                var next_point;
                if (d < existing_list.length - 1) {
                    next_point = existing_list[d + 1];
                } else {
                    next_point = existing_list[d];
                }

                if ((current_point.y <= cardinality && next_point.y >= cardinality) ||
                    (current_point.y >= cardinality && next_point.y <= cardinality)) {
                    //This line segment crosses the desired y
                    if (current_point.y == next_point.y) {
                        result = current_point.x;
                    } else if (current_point.x == next_point.x) {
                        result = current_point.x;
                    } else {
                        var intersect = checkLineIntersection(current_point, next_point,
                            {y: cardinality, x: current_point.x}, {y: cardinality, x: next_point.x});
                        result = intersect.x;
                    }
                    break;
                }
            }
            if (result == null) {
                var index = existing_list.length - 1;
                result = (existing_list[index] && existing_list[index].y) ? existing_list[index].y : 0;

            }

        } else {
            var lowest = Number.MAX_VALUE;
            var highest = Number.MIN_VALUE;

            _.each(existing_list, function (point) {
                if (point[attribute] > highest) {
                    highest = point[attribute];
                    if (cardinality == 'highest') {
                        best_point = point;
                    }
                }
                if (point[attribute] < lowest) {
                    lowest = point[attribute];
                    if (cardinality == 'lowest') {
                        best_point = point;
                    }
                }
            });

            if (cardinality == 'highest') {
                result = highest == Number.MIN_VALUE ? 0 : highest;
            } else if (cardinality == 'lowest') {
                result = lowest == Number.MAX_VALUE ? 0 : lowest;
            } else if (cardinality == 'middle') {
                if (highest == Number.MIN_VALUE) {
                    result = 0;
                } else {
                    result = (highest + lowest) / 2;
                }
                //TODO: Return point if returnPoint requested
            }
        }
        if (returnPoint) {
            result = best_point;
        }
        return result;
    }

    function midPointBetween(p1, p2) {
        return {
            x: p1.x + (p2.x - p1.x) / 2,
            y: p1.y + (p2.y - p1.y) / 2
        }
    }

    //Point and line tracking
    function findShape(lines, name, empty_value, attribute_name) {
        var shape = _.find(lines, function (shape) {
            return shape.name == name
        });
        if (!shape && !attribute_name) {
            console.error("avatar.js - Error: " + name + " not found when trying to 'findShape'");
        }
        var result;
        if (attribute_name && shape && shape[attribute_name]) {
            result = shape[attribute_name];
        } else {
            result = shape || (typeof empty_value == "undefined" ? {} : empty_value);
        }
        return result;
    }

    function findPoint(avatar, name) {
        var existingPoint = _.find(avatar.registered_points, function (point) {
            return point.name == name;
        });
        var found = null;
        if (existingPoint && existingPoint.point) {
            found = existingPoint.point;
        } else {
            console.error("avatar.js - Error: " + name + " not found when trying to 'findPoint'");
        }
        return found || {};
    }

    function namePoint(avatar, name, point) {
        var existingPoint = _.find(avatar.registered_points, function (point) {
            return point.name == name;
        });
        if (existingPoint) {
            existingPoint.point = point;
        } else {
            avatar.registered_points = avatar.registered_points || [];
            avatar.registered_points.push({name: name, point: point});
        }
    }

    //Path creation and editing
    function transformPathFromLocalCoordinates(points_local, width_radius, height_radius, center_x, center_y) {
        if (!_.isArray(points_local)) points_local = [points_local];

        var points = [];
        for (var p = 0; p < points_local.length; p++) {
            var point = _.clone(points_local[p]);
            var x = (width_radius * point.x / 10) + (center_x || 0);
            var y = (height_radius * point.y / 10) + (center_y || 0);
            point.x = x;
            point.y = y;
            points.push(point);
        }
        return points;
    }

    function transformPathFromGlobalCoordinates(points_global, width_radius, height_radius, center_x, center_y) {
        //NOTE: Untested function
        if (!_.isArray(points_global)) points_global = [points_global];

        var points = [];
        for (var p = 0; p < points_global.length; p++) {
            var point = _.clone(points_global[p]);
            var x = point.x - (center_x || 0);
            var y = point.y - (center_y || 0);
            point.x = x / width_radius * 10;
            point.y = y / height_radius * 10;
            points.push(point);
        }
        return points;
    }

    function createPathFromLocalCoordinates(points_local, style, width_radius, height_radius) {
        var points = transformPathFromLocalCoordinates(points_local, width_radius, height_radius);
        return createPath(points, style);
    }

    function createPath(points, style) {
        if (!points || !points.length || points.length < 2) return null;
        style = style || {};

        var color = style.line_color || style.color || 'black';
        if (color == 'blank') color = 'rgba(0,0,0,0)';
        var thickness = style.thickness || 1;
        var fill_color = style.fill_color || null;

        var returnedShapes = [];

        if (style.dot_array) {

            for (var i = 0; i < points.length; i++) {
                var point = points[i];
                var circle = new createjs.Shape();
                circle.graphics.beginStroke(color).drawEllipse(point.x - (thickness / 2), point.y - (thickness / 2), thickness, thickness);

                if (style.x) circle.x = style.x;
                if (style.y) circle.y = style.y;
                if (style.alpha) circle.alpha = style.alpha;
                if (style.rotation) circle.rotation = style.rotation;
                returnedShapes.push(circle);
            }

        } else {
            var line = new createjs.Shape();

            line.graphics.beginStroke(color).setStrokeStyle(thickness);

            //TODO: Have multiple fills?
            if (style.fill_canvas) {
                line.graphics.beginBitmapFill(style.fill_canvas)
            } else if (fill_color) {
                line.graphics.beginFill(fill_color);
            } else if (style.fill_colors) {
                var x_offset_start, x_offset_end, y_offset_start, y_offset_end, radius, fill_steps;
                if (style.fill_method == 'linear') {
                    x_offset_start = assignNumbersInOrder(style.x_offset_start, -style.radius, comparePoints(points, 'x', 'lowest'), 0);
                    x_offset_end = assignNumbersInOrder(style.x_offset_end, style.radius, comparePoints(points, 'x', 'highest'), 0);
                    y_offset_start = assignNumbersInOrder(style.y_offset_start, 0);
                    y_offset_end = assignNumbersInOrder(style.y_offset_end, 0);
                    fill_steps = style.fill_steps || [0, 1];

                    line.graphics.beginLinearGradientFill(
                        style.fill_colors, fill_steps, x_offset_start, y_offset_start, x_offset_end, y_offset_end)

                } else { //Assume Radial
                    x_offset_start = assignNumbersInOrder(style.x_offset_start, style.x_offset, comparePoints(points, 'x', 'middle'), 0);
                    x_offset_end = assignNumbersInOrder(style.x_offset_end, style.x_offset, comparePoints(points, 'x', 'middle'), 0);
                    y_offset_start = assignNumbersInOrder(style.y_offset_start, style.y_offset, comparePoints(points, 'y', 'middle'), 0);
                    y_offset_end = assignNumbersInOrder(style.y_offset_end, style.y_offset, comparePoints(points, 'y', 'middle'), 0);
                    fill_steps = style.fill_steps || [0, 1];
                    radius = style.radius || 10;

                    line.graphics.beginRadialGradientFill(
                        style.fill_colors, fill_steps, x_offset_start, y_offset_start, 0, x_offset_end, y_offset_end, radius);
                }
            }

            var p1, p2, p3, mid;

            if (style.close_line) {
                p1 = points[0];
                p2 = points[1];
                mid = midPointBetween(p1, p2);
                line.graphics.moveTo(mid.x, mid.y);
            } // TODO: There's some overlap if closed - maybe don't draw p0, and just loop through p1,p2?

            if (style.x) line.x = style.x;
            if (style.y) line.y = style.y;
            if (style.alpha) line.alpha = style.alpha;
            if (style.rotation) line.rotation = style.rotation;

            for (var j = 1; j < points.length; j++) {
                p1 = points[(points.length + j - 1) % (points.length)];
                p2 = points[j];
                mid = midPointBetween(p1, p2);
                if (p1.line) {
                    line.graphics.lineTo(p1.x, p1.y);
                } else {
                    line.graphics.quadraticCurveTo(p1.x, p1.y, mid.x, mid.y);
                }
            }

            if (style.close_line) {
                p1 = points[points.length - 1];
                p2 = points[0];
                p3 = points[1];
                mid = midPointBetween(p1, p2);
                line.graphics.quadraticCurveTo(p1.x, p1.y, mid.x, mid.y);
                mid = midPointBetween(p2, p3);
                line.graphics.quadraticCurveTo(p2.x, p2.y, mid.x, mid.y);

            } else {
                line.graphics.lineTo(points[points.length - 1].x, points[points.length - 1].y);
            }
            returnedShapes.push(line);
        }
        if (returnedShapes.length && returnedShapes.length == 1) {
            return returnedShapes[0];
        } else {
            return returnedShapes;
        }
    }

    function assignNumbersInOrder(num1, num2, num3, num4, num5) {
        var result = num1;
        if (typeof num1 != 'number' || isNaN(num1)) {
            result = num2;
            if (typeof num2 != 'number' || isNaN(num2)) {
                result = num3;
                if (typeof num3 != 'number' || isNaN(num3)) {
                    result = num4;
                    if (typeof num4 != 'number' || isNaN(num4)) {
                        result = num5;
                        if (typeof num5 != 'number' || isNaN(num5)) {
                            result = 0;
                        }
                    }
                }
            }
        }
        return result
    }

    function createMultiPathFromLocalCoordinates(points_local, style, width_radius, height_radius) {
        var points = transformPathFromLocalCoordinates(points_local, width_radius, height_radius);
        return createMultiPath(points, style);
    }

    function amountFromVarOrRange(point_amount, gradient, setting, percent, isColor) {
        var amount = setting;

        if (point_amount) {
            amount = point_amount;
        } else if (gradient) {
            if (!_.isArray(gradient)) gradient = [gradient];
            var grad_length = gradient.length;
            if (grad_length == 1) {
                amount = gradient[0];
            } else {
                var pos_percent = percent * (grad_length - 1);
                var pos_floor = Math.floor(pos_percent);
                var pos_ceil = Math.ceil(pos_percent);

                if (pos_floor == pos_ceil) {
                    amount = gradient[pos_floor];
                } else {
                    var val_at_pos_floor = gradient[pos_floor];
                    var val_at_pos_ceil = gradient[pos_ceil];

                    var pos_percent_at_floor = pos_floor / (grad_length - 1);
                    var pos_percent_at_ceil = pos_ceil / (grad_length - 1);

                    var percent_between_floor_and_ceil = (percent - pos_percent_at_floor) / (pos_percent_at_ceil - pos_percent_at_floor);
                    if (isColor) {
                        var color_floor = net.brehaut.Color(val_at_pos_floor);
                        var color_ceil = net.brehaut.Color(val_at_pos_ceil);
                        amount = color_floor.blend(color_ceil, percent_between_floor_and_ceil).toString();
                    } else {
                        amount = ((val_at_pos_ceil - val_at_pos_floor) * percent_between_floor_and_ceil) + val_at_pos_floor;
                    }
                }
            }
        }

        return amount;
    }

    function createMultiPath(points, style) {
        if (!points || !points.length || points.length < 2) return null;
        style = style || {};

        //NOTE: Color, Thickness, and Alpha can be:
        // 1) Specified on each line segment (highest priority)
        // 2) Given as a range (e.g. '[0,.1,.9,1]'
        // 3) Given as a standard variable (e.g. 'style.thickness')

        var color = style.line_color || 'black';
        var thickness = style.thickness || 1;

        if (style.break_line_every) {
            points = hydratePointsAlongLine(points, style.break_line_every, true);
        }

        var returnedShapes = [];

        var line = new createjs.Shape();
        for (var i = 1; i < points.length; i++) {

            var p1 = points[i - 1];
            var p2 = points[i];
            var p3 = points[i + 1];

            //TODO: get p3 and do a mid for quads?

            var percent = (i / points.length);
            var thickness_now = amountFromVarOrRange(p1.thickness, style.thickness_gradients, thickness, percent);
            var color_now = amountFromVarOrRange(p1.color, style.line_color_gradients, color, percent, true);

            if (thickness_now > 0) {
                line.graphics.beginStroke(color_now).setStrokeStyle(thickness_now);

                if (style.dot_array) {
                    line.graphics.drawEllipse(p1.x - (thickness / 2), p1.y - (thickness / 2), thickness, thickness);
                } else if (!p1.line && p3) {
                    line.graphics.moveTo(p1.x, p1.y).quadraticCurveTo(p2.x, p2.y, p3.x, p3.y);
                } else {
                    line.graphics.moveTo(p1.x, p1.y).lineTo(p2.x, p2.y);
                }
            }
        }

        if (style.alpha !== undefined) line.alpha = style.alpha;
        if (style.x) line.x = style.x;
        if (style.y) line.y = style.y;
        if (style.rotation) line.rotation = style.rotation;

        line.graphics.endStroke();

        returnedShapes.push(line);

        return returnedShapes;
    }

    function extrudeHorizontalArc(linePoints, distX, distY, distPeak) {
        //Have distY be positive to do an inner arc
        var newPoints = [];

        var midX = 0;
        _.each(linePoints, function (point) {
            midX += point.x;
        });
        midX /= linePoints.length;

        if (distY > 0) {
            _.each(linePoints, function (point) {
                var usePoint = true;
                var newX, newY;

                if (point.x < midX) {
                    newX = point.x + distX;
                    newY = point.y + distY;
                    if (newX > midX) usePoint = false;
                } else if (point.x > midX) {
                    newX = point.x - distX;
                    newY = point.y + distY;
                    if (newX < midX) usePoint = false;
                }
                if (usePoint) {
                    var newPoint = _.clone(point);
                    newPoint.x = newX;
                    newPoint.y = newY;
                    newPoints.push(newPoint);
                }
            });
            if (typeof distPeak == "number" && newPoints.length && newPoints.length > 2) {
                var midPos = Math.ceil(newPoints.length / 2);

                var newPoint = _.clone(newPoints[midPos]);
                newPoint.x = midX;
                newPoint.y += distPeak;
                newPoints.splice(midPos, 0, newPoint);
            }

        } else {

            _.each(linePoints, function (point) {
                var newX, newY;

                if (point.x < midX) {
                    newX = point.x - distX;
                    newY = point.y + distY;
                } else if (point.x >= midX) {
                    newX = point.x + distX;
                    newY = point.y + distY;
                }
                var newPoint = _.clone(point);
                newPoint.x = newX;
                newPoint.y = newY;
                newPoints.push(newPoint);
            });

        }
        return newPoints;
    }

    function distanceBetween(point1, point2) {
        return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
    }

    function angleBetween(point1, point2) {
        return Math.atan2(point2.x - point1.x, point2.y - point1.y);
    }

    function hydratePointsAlongLine(line, spacing, dontLinkLastFirst) {
        spacing = spacing || 5;
        var newLine = [];
        var lastPoint = line[0];

        var currentPoint;
        _.each(line, function (currentPoint) {
            var dist = distanceBetween(lastPoint, currentPoint);
            var angle = angleBetween(lastPoint, currentPoint);
            for (var i = 0; i < dist; i += spacing) {
                var newPoint = _.clone(currentPoint);
                newPoint.x = lastPoint.x + (Math.sin(angle) * i);
                newPoint.y = lastPoint.y + (Math.cos(angle) * i);
                newLine.push(newPoint);
            }
            lastPoint = currentPoint;
        });

        if (!dontLinkLastFirst) {
            //Do again for last-first point
            lastPoint = line[line.length - 1];
            currentPoint = line[0];
            var dist = distanceBetween(lastPoint, currentPoint);
            var angle = angleBetween(lastPoint, currentPoint);
            for (var i = 0; i < dist; i += spacing) {
                var newPoint = _.clone(currentPoint);
                newPoint.x = lastPoint.x + (Math.sin(angle) * i);
                newPoint.y = lastPoint.y + (Math.cos(angle) * i);
                newLine.push(newPoint);
            }
        }
        return newLine;
    }

    function constrainPolyLineToBox(poly_line, box) {
        var constrained_line = [];

        var last_crossed = null;
        var last_point = null;
        _.each(poly_line, function (point, i) {
            var directionOfCurrentPoint = whereIsPointInBox(point, box);
            if (!last_point || !last_point.inside || !directionOfCurrentPoint.inside) {
                var i_last = (i - 1 + poly_line.length) % poly_line.length;
                var line_start = poly_line[i_last]; //Find previous point, or last point if less
                var line_end = point;

                //Track where points crossed boundary lines
                var cross_points = [];
                var cross_top = checkLineIntersection(line_start, line_end, box.tl, {x: box.br.x, y: box.tl.y}, 'top');
                if (cross_top.onLine1 && cross_top.onLine2) cross_points.push(cross_top);

                var cross_right = checkLineIntersection(line_start, line_end, box.br, {x: box.br.x, y: box.tl.y}, 'right');
                if (cross_right.onLine1 && cross_right.onLine2) cross_points.push(cross_right);

                var cross_bottom = checkLineIntersection(line_start, line_end, box.br, {x: box.tl.x, y: box.br.y}, 'bottom');
                if (cross_bottom.onLine1 && cross_bottom.onLine2) cross_points.push(cross_bottom);

                var cross_left = checkLineIntersection(line_start, line_end, box.tl, {x: box.tl.x, y: box.br.y}, 'left');
                if (cross_left.onLine1 && cross_left.onLine2) cross_points.push(cross_left);

                //The closest should be the next in line
                cross_points = cross_points.sort(function (point_crossed) {
                    return Helpers.distanceXY(point, point_crossed)
                });
                cross_points = cross_points.reverse();

                //For all points that cross the boundary, add cross points and corner points
                _.each(cross_points, function (cross_point) {
                    var point_clone = _.clone(point);
                    point_clone.line = true;
                    point_clone.x = cross_point.x;
                    point_clone.y = cross_point.y;

                    if (last_crossed && (cross_point.crossed != last_crossed)) {
                        //Cover corner points
                        var point_clone2 = _.clone(point);
                        point_clone2.line = true;

                        if ((cross_point.crossed == 'top' && last_crossed == 'right') || (cross_point.crossed == 'right' && last_crossed == 'top')) {
                            point_clone2.x = box.br.x;
                            point_clone2.y = box.tl.y;
                            constrained_line.push(point_clone2);
                        } else if ((cross_point.crossed == 'top' && last_crossed == 'left') || (cross_point.crossed == 'left' && last_crossed == 'top')) {
                            point_clone2.x = box.tl.x;
                            point_clone2.y = box.tl.y;
                            constrained_line.push(point_clone2);
                        } else if ((cross_point.crossed == 'bottom' && last_crossed == 'right') || (cross_point.crossed == 'right' && last_crossed == 'bottom')) {
                            point_clone2.x = box.br.x;
                            point_clone2.y = box.br.y;
                            constrained_line.push(point_clone2);
                        } else if ((cross_point.crossed == 'bottom' && last_crossed == 'left') || (cross_point.crossed == 'left' && last_crossed == 'bottom')) {
                            point_clone2.x = box.tl.x;
                            point_clone2.y = box.br.y;
                            constrained_line.push(point_clone2);
                        } else if (cross_point.crossed == 'right' && last_crossed == 'left') {
//                        if (directionOfCurrentPoint.bottom) { //TODO: This wont work for everything
                            point_clone2.x = box.tl.x;
                            point_clone2.y = box.br.y;
                            constrained_line.push(point_clone2);
                            var p3 = _.clone(point_clone2);
                            p3.x = box.br.x;
                            constrained_line.push(p3);
                        } else if (cross_point.crossed == 'left' && last_crossed == 'right') {
//                        if (directionOfCurrentPoint.bottom) { //TODO: This wont work for everything
                            point_clone2.x = box.tl.x;
                            point_clone2.y = box.br.y;
                            var p4 = _.clone(point_clone2);
                            p4.x = box.br.x;
                            constrained_line.push(point_clone2);
                            constrained_line.push(p4);
                        }
//                    last_crossed = cross_point.crossed;
                    }
                    constrained_line.push(point_clone);

                    if (cross_point.crossed) {
                        last_crossed = cross_point.crossed;
                    }
                });
            }
            if (directionOfCurrentPoint.inside) {
                constrained_line.push(_.clone(point));
            }

            last_point = point;
        });

        return constrained_line;
    }

    function whereIsPointInBox(point, box) {
        // point = {x, y}
        // box = {tl.x, tl.y, br.x, br.y}

        var whereIsPoint = {};
        if (point.x <= box.br.x && point.x >= box.tl.x &&
            point.y <= box.br.y && point.y >= box.tl.y) {
            whereIsPoint.inside = true;
        } else if (point.x >= box.br.x) {
            if (point.y < box.tl.y) {
                whereIsPoint.top = true;
                whereIsPoint.right = true;
            } else if (point.y > box.br.y) {
                whereIsPoint.bottom = true;
                whereIsPoint.right = true;
            } else {
                whereIsPoint.middle = true;
                whereIsPoint.right = true;
            }
        } else if (point.x <= box.tl.x) {
            if (point.y < box.tl.y) {
                whereIsPoint.top = true;
                whereIsPoint.left = true;
            } else if (point.y > box.br.y) {
                whereIsPoint.bottom = true;
                whereIsPoint.left = true;
            } else {
                whereIsPoint.middle = true;
                whereIsPoint.left = true;
            }
        } else {
            if (point.y < box.tl.y) {
                whereIsPoint.top = true;
                whereIsPoint.middle = true;
            } else if (point.y > box.br.y) {
                whereIsPoint.bottom = true;
                whereIsPoint.middle = true;
            } else {
                whereIsPoint.inside = true;
            }
        }

        return whereIsPoint;
    }

    function checkLineIntersection(line1Start, line1End, line2Start, line2End, crossedName) {
        //From: http://jsfiddle.net/justin_c_rounds/Gd2S2/
        // if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite)
        // and booleans for whether line segment 1 or line segment 2 contain the point

        var denominator, a, b, numerator1, numerator2, result = {
            x: null,
            y: null,
            onLine1: false,
            onLine2: false
        };
        denominator = ((line2End.y - line2Start.y) * (line1End.x - line1Start.x)) - ((line2End.x - line2Start.x) * (line1End.y - line1Start.y));
        if (denominator == 0) {
            return result;
        }
        a = line1Start.y - line2Start.y;
        b = line1Start.x - line2Start.x;
        numerator1 = ((line2End.x - line2Start.x) * a) - ((line2End.y - line2Start.y) * b);
        numerator2 = ((line1End.x - line1Start.x) * a) - ((line1End.y - line1Start.y) * b);
        a = numerator1 / denominator;
        b = numerator2 / denominator;

        // if we cast these lines infinitely in both directions, they intersect here:
        result.x = line1Start.x + (a * (line1End.x - line1Start.x));
        result.y = line1Start.y + (a * (line1End.y - line1Start.y));

        // it is worth noting that this should be the same as:
        // x = line2Start.x + (b * (line2End.x - line2Start.x));
        // y = line2Start.x + (b * (line2End.y - line2Start.y));

        // if line1 is a segment and line2 is infinite, they intersect if:
        if (a > 0 && a < 1) {
            result.onLine1 = true;
        }
        // if line2 is a segment and line1 is infinite, they intersect if:
        if (b > 0 && b < 1) {
            result.onLine2 = true;
        }
        if (crossedName) {
            result.crossed = crossedName;
        }
        // if line1 and line2 are segments, they intersect if both of the above are true
        return result;
    }

    //---------------------
    //Stage management
    function setupStage(canvas) {
        return new createjs.Stage(canvas);
    }

    function findStageByCanvas(canvas_id) {
        var isString = typeof canvas_id == "string";
        var stage = null;

        //Search by canvas_id or $canvas
        for (var i = 0; i < STAGES.length; i++) { //Searches through the main 'avatar' class, not just this instance
            var STAGE = STAGES[i];
            if (isString) {
                if (STAGE.canvas_id == canvas_id) {
                    stage = STAGE.stage;
                    break;
                }
            } else {
                if (STAGE.$canvas == canvas_id) {
                    stage = STAGE.stage;
                    break;
                }
            }
        }
        return stage;
    }

    function addStageByCanvas(options) {
        var item = {};
        if (options.canvas_id) {
            item.canvas_id = options.canvas_id;
            item.$canvas = $(item.canvas_id);
        }
        if (options.$canvas) {
            item.$canvas = options.$canvas;
        }
        if (options.stage) {
            item.stage = options.stage;
        } else {
            throw "error in avatar.js - addStageByCanvas needs a stage to be passed in"
        }
        STAGES.push(item);
    }

    //----------------------
    //Random numbers
    AvatarClass.prototype.randomSetSeed = function (seed) {
        this.face_options = this.face_options || {};
        this.face_options.rand_seed = seed || Math.random();
    };

    function random(face_options) {
        face_options = face_options || {};
        face_options.rand_seed = face_options.rand_seed || Math.random();
        var x = Math.sin(face_options.rand_seed++) * 300000;
        return x - Math.floor(x);
    }

    function randInt(max, face_options) {
        max = max || 100;
        return parseInt(random(face_options) * max + 1);
    }

    function randOption(options, face_options, dontUseVal) {
        var len = options.length;
        var numChosen = randInt(len, face_options) - 1;
        var result = options[numChosen];
        if (dontUseVal) {
            if (result == dontUseVal) {
                numChosen = (numChosen + 1) % len;
                result = options[numChosen];
            }
        }
        return result;
    }

    AvatarClass.prototype._private_functions = {
        getFirstRaceFromData: getFirstRaceFromData,
        registerEvents: registerEvents,
        buildDecoration: buildDecoration,
        find_renderer: find_renderer,
        buildFaceZones: buildFaceZones,
        addSceneChildren: addSceneChildren,
        transformPathFromLocalCoordinates: transformPathFromLocalCoordinates,
        transformPathFromGlobalCoordinates: transformPathFromGlobalCoordinates,
        transformLineToGlobalCoordinates: transformLineToGlobalCoordinates,
        lineSegmentCompared: lineSegmentCompared,
        transformShapeLine: transformShapeLine,
        comparePoints: comparePoints,
        midPointBetween: midPointBetween,
        createPathFromLocalCoordinates: createPathFromLocalCoordinates,
        createPath: createPath,
        createMultiPathFromLocalCoordinates: createMultiPathFromLocalCoordinates,
        createMultiPath: createMultiPath,
        amountFromVarOrRange: amountFromVarOrRange,
        namePoint: namePoint,
        findPoint: findPoint,
        findShape: findShape,
        turnWordToNumber: turnWordToNumber,
        whereIsPointInBox: whereIsPointInBox,
        checkLineIntersection: checkLineIntersection,
        extrudeHorizontalArc: extrudeHorizontalArc,
        distanceBetween: distanceBetween,
        constrainPolyLineToBox: constrainPolyLineToBox,
        angleBetween: angleBetween,
        hydratePointsAlongLine: hydratePointsAlongLine,
        setupStage: setupStage,
        getHeightOfStage: getHeightOfStage,
        findStageByCanvas: findStageByCanvas,
        addStageByCanvas: addStageByCanvas,
        random: random,
        randInt: randInt,
        randOption: randOption
    };

    return AvatarClass;
})($, _, net, createjs, Helpers, maths);

//TODO: Is this the best way to have helper functions?
Avatar.getRaces = function () {
    return new Avatar('get_races');
};
Avatar.initializeOptions = function (face_options_basic, human_data_options) {
    var av_pointer = new Avatar('');
    av_pointer.initializeOptions(face_options_basic, human_data_options);
};
//TODO: Need to indicate that it should be under some layer (scar under beard, or clothes) or over another (hat)
//TODO: Builder should have some drag and drop and rotate/move
//TODO: Should work with 1 or 2 or 4? points

new Avatar('add_render_function', {style: 'lines', feature: 'augmentations', renderer: function (face_zones, avatar, layer) {
    var a = avatar._private_functions;
    var shapes = [];

    var augmentations = avatar.face_options.augmentations || [];
    _.each (augmentations || [], function(item){

        item.style = item.style || layer.style;

        var render_pack;
        if (avatar._private_functions.content_packs_renderer) {
            var content_pack_render_layer = a.content_packs_renderer(avatar, item, item);
            if (content_pack_render_layer) {
                //Find the frequency it should be applied. If not set, use 100%
                var freq = content_pack_render_layer.use_frequency;
                if (_.isUndefined(freq)) freq = 1;
                if (avatar._private_functions.random(avatar.face_options)<freq) {
                    render_pack = content_pack_render_layer;
                }
            }
        }

        if (render_pack && render_pack.renderer) {
            var feature_shapes = render_pack.renderer(face_zones, avatar, layer, item.options);

            if (!layer.hide) {
                shapes = shapes.concat(feature_shapes);
            }
            var log = "Added Augmentation - type: " + item.feature + ', pack: ' + render_pack.name + ', item: ' + render_pack.frame.name;
            avatar.logMessage(log);
        } else {
            avatar.logMessage("Couldn't find Augmentation - " + item.feature);
        }
    });


    return shapes;
}});
//beard
new Avatar('add_render_function', {style: 'lines', feature: 'beard', renderer: function (face_zones, avatar) {
    var f = face_zones;
    var a = avatar._private_functions;
    var face_options = avatar.face_options;
    var lines = avatar.lines;
    var shapes = [];

    var beard_style = _.clone(face_options.beard_style);
    if (face_options.gender == 'Female' || face_options.age < 18) beard_style = 'None';

    var stubble_style = face_options.stubble_style;
    if (face_options.gender == 'Female' || face_options.age < 15) stubble_style = 'None';

    if (beard_style == "None" && stubble_style == "None") return shapes;

    var stubble_alpha = 0.3;
    if (stubble_style == "Light") {
        stubble_alpha = 0.1;
    } else if (stubble_style == "Medium") {
        stubble_alpha = 0.4;
    } else if (stubble_style == "Heavy") {
        stubble_alpha = 0.7;
    }

    var inner_hair_x = 0;
    var inner_hair_y = 3;
    var outer_hair_x = .5;
    var outer_hair_y = .5;
    var beard_alpha = 0.95;

    if (beard_style == 'None') {
        //Skip
    } else if (beard_style == 'Full Chin') {
        inner_hair_y = 12;
        outer_hair_x = 1;
        outer_hair_y = 2;
        beard_alpha = .9;
    } else if (beard_style == 'Chin Warmer') {
        inner_hair_y = 10;
        outer_hair_x = .5;
        outer_hair_y = .5;
        beard_alpha = .8;
    } else if (beard_style == 'Soup Catcher') {
        inner_hair_y = 13;
        outer_hair_x = 1;
        outer_hair_y = 10;
        beard_alpha = .9;
    } else if (beard_style == 'Thin Chin Wrap') {
        inner_hair_y = 1;
        outer_hair_x = 0;
        outer_hair_y = .2;
        beard_alpha = .4;
    } else if (beard_style == 'Thin Low Chin Wrap') {
        inner_hair_x = 1;
        inner_hair_y = 1;
        outer_hair_x = 0;
        outer_hair_y = .2;
        beard_alpha = .3;
    }
    if (face_options.age < 20) {  //TODO: Make this a scaling function
        inner_hair_x *= .25;
        inner_hair_y *= .25;
        outer_hair_x *= .25;
        outer_hair_y *= .25;
    } else if (face_options.age < 23) {
        inner_hair_x *= .5;
        inner_hair_y *= .5;
        outer_hair_x *= .5;
        outer_hair_y *= .5;
    } else if (face_options.age < 26) {
        inner_hair_x *= .75;
        inner_hair_y *= .75;
        outer_hair_x *= .75;
        outer_hair_y *= .75;
    }

    var color = _.clone(face_options.beard_color || face_options.hair_color);
    if (color == 'Hair') color = face_options.hair_color;
    var fill_color = color;
    if (color == 'White' || color == '#000000') color = 'gray';
    color = maths.hexColorToRGBA(color, 1);
    fill_color = maths.hexColorToRGBA(fill_color, 1);


    var head_line = a.transformLineToGlobalCoordinates(lines, 'face');
    var eye_line = a.transformLineToGlobalCoordinates(lines, 'left eye');
    var nose_bottom_line = a.transformLineToGlobalCoordinates(lines, 'nose bottom line');

    var hair_line_level_adjust = 1;
    var beard_line = a.lineSegmentCompared(head_line, eye_line, 'below', hair_line_level_adjust * 10 * f.thick_unit);

//    var eye_line_bottom_y = a.comparePoints(eye_line, 'y','highest');
//    var beard_line_left = a.comparePoints(eye_line, 'x','lowest');
//    var beard_line_right = a.comparePoints(eye_line, 'x','highest');
//    var beard_line_bottom = a.comparePoints(eye_line, 'y','highest');
//
//    //TODO: Get to same component space
//    beard_line = a.constrainPolyLineToBox(beard_line, {
//        tl:{x:beard_line_left,y:eye_line_bottom_y},
//        br:{x:beard_line_right, y:beard_line_bottom}});

    var beard = a.createPath(beard_line, {thickness: f.thick_unit * 5, line_color: face_options.hair_color});
    lines.push({name: 'beard line', line: beard_line, shape: beard, x: 0, y: 0, scale_x: 1, scale_y: 1});
    //Note: this just added the beard as a reference line without showing it

    var nose_bottom_line_bottom_point = a.comparePoints(nose_bottom_line, "y", "highest");

    var stubble_fill_canvas = a.findShape(avatar.textures, 'stubble lines', null, 'canvas');
    if (beard_style == "None" && stubble_style != "None" && beard_line && beard_line.length && beard_line.length > 2) {
        var inner_stubble_line = a.extrudeHorizontalArc(beard_line, 0, -f.thick_unit * 100);

        var inner_stubble_line_top_point = a.comparePoints(inner_stubble_line, "y", "highest");
        if (inner_stubble_line_top_point > nose_bottom_line_bottom_point) {
            var lower_by = inner_stubble_line_top_point - nose_bottom_line_bottom_point - (f.thick_unit * 10);
            inner_stubble_line = a.transformShapeLine({type: 'shift', y_offset: -lower_by}, face_options, inner_stubble_line);
        }

        var full_stubble_line = beard_line.concat(inner_stubble_line.reverse());
        full_stubble_line = a.transformShapeLine({type: 'smooth'}, face_options, full_stubble_line);


        var full_stubble = a.createPath(full_stubble_line, {
            close_line: true, line_color: 'blank',
            fill_color: '#444'
        });
        full_stubble.alpha = stubble_alpha / 4;
        lines.push({name: 'full stubble', line: full_stubble_line, shape: full_stubble, alpha: beard_alpha});
        shapes = shapes.concat(full_stubble);

        var full_stubble_texture = a.createPath(full_stubble_line, {
            close_line: true, line_color: 'blank',
            fill_canvas: stubble_fill_canvas
        });
        full_stubble_texture.alpha = stubble_alpha;
        shapes = shapes.concat(full_stubble_texture);
    }

    if (beard_style != "None" && beard_line && beard_line.length && beard_line.length > 2) {

        var inner_hair_line = a.extrudeHorizontalArc(beard_line, -f.thick_unit * inner_hair_x * 10, -f.thick_unit * inner_hair_y * 10);
        var outer_hair_line = a.extrudeHorizontalArc(beard_line, -f.thick_unit * outer_hair_x * 10, f.thick_unit * outer_hair_y * 10);

        //TODO: Adjust differently by ear
        var inner_hair_line_top_point = a.comparePoints(inner_hair_line, "y", "highest");
        if (inner_hair_line_top_point < nose_bottom_line_bottom_point) {
            var lower_by = inner_hair_line_top_point - nose_bottom_line_bottom_point;
            inner_hair_line = a.transformShapeLine({type: 'shift', y_offset: -lower_by}, face_options, inner_hair_line);
        }

        var full_beard_line = outer_hair_line.concat(inner_hair_line.reverse());
        full_beard_line = a.transformShapeLine({type: 'smooth'}, face_options, full_beard_line);


        var full_beard = a.createPath(full_beard_line, {
            close_line: true, thickness: f.thick_unit * .5, line_color: color,
            fill_color: fill_color
        });
        full_beard.alpha = beard_alpha;
        lines.push({name: 'full beard', line: full_beard_line, shape: full_beard, x: 0, y: 0, scale_x: 1, scale_y: 1, alpha: beard_alpha});
        shapes = shapes.concat(full_beard);

        var full_beard_texture = a.createPath(full_beard_line, {
            close_line: true, line_color: 'blank',
            fill_canvas: stubble_fill_canvas
        });
        full_beard_texture.alpha = beard_alpha;
        shapes = shapes.concat(full_beard_texture);
    }
    return shapes;
}});


//mustache
new Avatar('add_render_function', {style: 'lines', feature: 'mustache', renderer: function (face_zones, avatar) {
    var f = face_zones;
    var a = avatar._private_functions;
    var face_options = avatar.face_options;
    var lines = avatar.lines;
    var shapes = [];

    var mustache_style = face_options.mustache_style;
    if (face_options.gender == 'Female' || face_options.age < 18) mustache_style = 'None';

    var mustache_width_mod = face_options.mustache_width;
    var mustache_height_mod = face_options.mustache_height;

    //TODO: Stretch to cover face
    mustache_width_mod = a.turnWordToNumber(mustache_width_mod, .8, 1.2, 'Small,Short,Medium,Long,Large');
    mustache_height_mod = a.turnWordToNumber(mustache_height_mod, .8, 1.2, 'Small,Short,Medium,Long,Large');

    var color = _.clone(face_options.beard_color || face_options.hair_color);
    if (color == 'Hair') color = face_options.hair_color;
    var fill_color = color;
    if (color == 'White' || color == '#000000') color = 'gray';
    color = maths.hexColorToRGBA(color, 1);
    fill_color = maths.hexColorToRGBA(fill_color, 1);

    if (mustache_style != "None") {

        //TODO: Link mustache points to lip anchors for mouth movement

        var nose_bottom_line = a.transformLineToGlobalCoordinates(lines, 'nose bottom line');
        var mouth_line = a.transformLineToGlobalCoordinates(lines, 'lips');
        var mouth_top_point = a.comparePoints(mouth_line, 'y', 'lowest', true);
        var nose_bottom_line_bottom_point = a.comparePoints(nose_bottom_line, "y", "highest", true);

        var mustache_line = [];
        var double_it = true;
        if (mustache_style == 'Propeller') {
            mustache_line = [
                {x: 0, y: 0},
                {x: -4, y: 1},
                {x: -10, y: 2},
                {x: -13, y: 1},
                {x: -15, y: 3},
                {x: -12, y: -1},
                {x: 0, y: -1}
            ]
        } else if (mustache_style == 'Handlebar') {
            mustache_line = [
                {x: 0, y: 0},
                {x: 3, y: -2},
                {x: 8, y: 4},
                {x: 12, y: 1},
                {x: 10, y: 3},
                {x: 8, y: 4},
                {x: 2, y: 2},
                {x: 0, y: 1}
            ]
        } else if (mustache_style == 'Pointy Handlebar') {
            mustache_line = [
                {x: 0, y: 0},
                {x: 3, y: -2},
                {x: 8, y: 2},
                {x: 12, y: 2},
                {x: 12, y: 2},
                {x: 9, y: 3},
                {x: 5, y: 4},
                {x: 2, y: 2},
                {x: 0, y: 1}
            ]
        } else if (mustache_style == 'Low Handlebar') {
            mustache_line = [
                {x: 0, y: 0},
                {x: 3, y: -2},
                {x: 8, y: 2},
                {x: 12, y: 0},
                {x: 9, y: 2},
                {x: 5, y: 3},
                {x: 2, y: 2},
                {x: 0, y: 1}
            ]
        } else if (mustache_style == 'Long Curled Handlebar') {
            mustache_line = [
                {x: 0, y: 0},
                {x: 3, y: -2},
                {x: 8, y: 2},
                {x: 12, y: 0},
                {x: 14, y: -2},
                {x: 12, y: -4},
                {x: 10, y: -2},
                {x: 10, y: -2},
                {x: 12, y: -4},
                {x: 14, y: -2},
                {x: 12, y: 0},
                {x: 9, y: 2},
                {x: 5, y: 3},
                {x: 2, y: 2},
                {x: 0, y: 1}
            ]
        } else if (mustache_style == 'Curled Handlebar') {
            mustache_line = [
                {x: 0, y: 0},
                {x: 3, y: -2},
                {x: 8, y: 2},
                {x: 11, y: 0},
                {x: 13, y: -2},
                {x: 11, y: -3},
                {x: 10, y: -1},
                {x: 10, y: -1},
                {x: 11, y: -3},
                {x: 13, y: -2},
                {x: 11, y: 0},
                {x: 9, y: 2},
                {x: 5, y: 3},
                {x: 2, y: 2},
                {x: 0, y: 1}
            ]
        } else if (mustache_style == 'Lower Dali') {
            mustache_line = [
                {x: 0, y: -1},
                {x: 10, y: 0},
                {x: 10, y: 0},
                {x: 3, y: 0},
                {x: 0, y: -.5}
            ]
        } else if (mustache_style == 'Butterfly') {
            mustache_line = [
                {x: 0, y: -1},
                {x: 2, y: -1.1},
                {x: 10, y: 1.5},
                {x: 1, y: 2},
                {x: 0, y: 0}
            ]
        } else if (mustache_style == 'Fu Manchu') {
            mustache_line = [
                {x: 0, y: .5},
                {x: 6, y: -1.1},
                {x: 10, y: 1.5},
                {x: 10.5, y: 3},
                {x: 11, y: 10},
                {x: 11, y: 20},
                {x: 9, y: 23},
                {x: 9.5, y: 8},
                {x: 9.2, y: 2},

                {x: 1, y: 3.5},
                {x: 0, y: 1.5}
            ]
        } else if (mustache_style == 'Dali') {
            mustache_line = [
                {x: 0, y: -1},
                {x: 2, y: -1.1},
                {x: 8, y: 1.5},
                {x: 15, y: -10},
                {x: 15, y: -10},
                {x: 7, y: 3},
                {x: 1, y: 2},
                {x: 0, y: 0}
            ]
        } else if (mustache_style == 'Sparrow') {
            mustache_line = [
                {x: 0, y: .5},
                {x: 2, y: -0.1},
                {x: 10, y: 5},
                {x: 10, y: 8},
                {x: 10, y: 10},
                {x: 10, y: 8},
                {x: 4, y: 4},
                {x: .5, y: 4},
                {x: 0, y: 1}
            ]
        } else if (mustache_style == 'Zappa') {
            mustache_line = [
                {x: 0, y: .2},
                {x: 6, y: 0},
                {x: 9, y: 2},
                {x: 10, y: 5},
                {x: 10, y: 8},
                {x: 10.5, y: 9},
                {x: 9, y: 8},
                {x: 7, y: 4},
                {x: 0, y: 4.5}
            ]
        } else if (mustache_style == 'Anchor') {
            mustache_line = [
                {x: 0, y: -1},
                {x: 2, y: -1},
                {x: 2, y: 3},
                {x: 12, y: 0},
                {x: 1, y: 3.5},
                {x: 0, y: 2}
            ]
        } else if (mustache_style == 'Copstash') {
            mustache_line = [
                {x: 0, y: 0},
                {x: 3, y: -.1},
                {x: 8, y: 2.5},
                {x: 6, y: 2.5},
                {x: 1, y: 3},
                {x: 0, y: 1}
            ]
        } else {
            double_it = false;
        }

        if (double_it) {
            var other_side_mustache = a.transformShapeLine({type: 'reverse', direction: 'horizontal', axis: 0}, face_options, mustache_line);
            mustache_line = mustache_line.concat(other_side_mustache.reverse());
        }

        var alpha = .9;
        var x = nose_bottom_line_bottom_point.x;
        var y = ((mouth_top_point.y * 2) + (nose_bottom_line_bottom_point.y * 8)) / 10;
        var line_thickness = (f.thick_unit * 2);
        var width = f.thick_unit * 70 * mustache_width_mod;
        var height = f.thick_unit * 80 * mustache_height_mod;

        var mustache_outline = a.transformPathFromLocalCoordinates(mustache_line, width, height);
        var mustache_shape = a.createPath(mustache_outline, {
            close_line: true, thickness: line_thickness, color: color, fill_color: fill_color
        });
        mustache_shape.alpha = alpha;
        mustache_shape.x = x;
        mustache_shape.y = y;
        lines.push({name: 'mustache', line: mustache_outline, shape: mustache_shape, x: x, y: y, alpha: alpha, scale_x: width, scale_y: height});
        shapes.push(mustache_shape);


        var hair_canvas = a.findShape(avatar.textures, 'stubble lines', null, 'canvas');
        var mustache_shape_texture = a.createPath(mustache_outline, {
            close_line: true, line_color: 'blank', fill_canvas: hair_canvas
        });
        mustache_shape_texture.alpha = 0.2;
        mustache_shape_texture.x = x;
        mustache_shape_texture.y = y;
        shapes.push(mustache_shape_texture);

    }


    return shapes;
}});

(function (Avatar, net, maths) {
    var IMAGES = []; //Global list of any images that were loaded by content packs

    var isPhantomJS = (/PhantomJS/.test(window.navigator.userAgent)); //Used during test cases

    var a = new Avatar('get_private_functions');

    //-----------------------------
    //Image Management
    function findImage(url) {
        var existing_image = _.find(IMAGES, function (image) {
            return image.url == url;
        });
        return existing_image ? existing_image.parent_object : null;
    }

    function findOrLoadImage(avatar, url, run_after_loaded) {
        //Don't use cached images if more than 1 avatar is being drawn, as the overdraw can screw things up
        var isFirstStage = (avatar.numberOfStagesDrawn() == 1);

        var cached = isFirstStage && findImage(url);
        if (!isPhantomJS && cached) {
            return run_after_loaded(cached);
        } else {
            var img = new Image();
            img.onload = run_after_loaded;
            img.src = url;
            IMAGES.push({url: url, parent_object: img});
        }
    }

    //-----------------------------
    //Adding Content Pack
    a.registerContentPack = function (avatar, name, pack_data) {
        if (!_.isString(name)) {
            throw "Name of content pack missing"
        }
        if (!_.isObject(pack_data)) {
            throw "Detail object of content pack missing"
        }
        avatar.content_packs[name] = _.extend({name: name}, avatar.content_packs[name], pack_data);
    };

    function find_pack_that_can_be_shown(avatar, layer) {
        return _.filter(avatar.content_packs, function (pack) {
            var feature_list = pack.replace_features;
            if (_.isString(feature_list)) feature_list = [feature_list];

            //Check that the pack matches the feature being drawn
            var isFeatureMatch = _.indexOf(feature_list, layer.feature) > -1;

            //Check that the overall drawing style matches
            var isMatchingStyle = (pack.style == layer.style);

            var hasData, isFilterMatch, isAllowedPack;
            if (isFeatureMatch && isMatchingStyle) {
                //Check if the race or avatar specifies this pack is allowed
                var packOptions = avatar.face_options.use_content_packs || avatar.getRaceData().use_content_packs;
                if (_.isString(packOptions)) packOptions = [packOptions];

                isAllowedPack = (_.indexOf(packOptions, 'all') > -1 || _.indexOf(packOptions, pack.name) > -1);

                //Check that the pack seems to have valid data
                hasData = _.isObject(pack.data) && _.isArray(pack.data.frames) && pack.data.image;

                //Check that the pack doesn't have any filters that exclude it from running
                isFilterMatch = true;
                if (!layer.ignore_filters) {
                    for (var key in pack.filter || {}) {
                        var filter = pack.filter[key];
                        //Only exclude if key is set, but is different than filter
                        if (avatar.face_options[key] && avatar.face_options[key] != filter) {
                            isFilterMatch = false;
                        }
                    }
                }
            }

            return isMatchingStyle && isAllowedPack && hasData && isFeatureMatch && isFilterMatch;
        });
    }

    function find_frames_that_can_be_shown(avatar, matching_packs, item_override) {
        var matching_frames = [];

        //Check if there are any 'overrides' specified in face_options, then use those if so
        _.each(matching_packs, function (pack) {
            if ((item_override && item_override.name) || (pack.name && avatar.face_options[pack.name])) {
                var override_with_frame = item_override.name || avatar.face_options[pack.name];
                var frame = _.find(pack.data.frames, function (frame) {
                    return frame.name == override_with_frame
                });
                if (frame) {
                    frame.pack = pack;
                    matching_frames.push(frame)
                }
            }
        });

        if (matching_frames.length == 0) {
            //None specified, find some that match filters
            _.each(matching_packs, function (pack) {
                //Look through all matching packs to find frames that match filters
                var matching_frames_in = _.filter(pack.data.frames, function (frame) {
                    //TODO: Check for at least 3 points
                    var isFilterMatch = true;
                    for (var key in frame.filter || {}) {
                        var filter = frame.filter[key];
                        //Only exclude if key is set, but is different than filter
                        if (avatar.face_options[key] && avatar.face_options[key] != filter) {
                            isFilterMatch = false;
                        }
                    }

                    return isFilterMatch;
                });
                //Add a link to the parent pack to each frame
                _.each(matching_frames_in, function (frame) {
                    frame.pack = pack;
                });
                matching_frames = matching_frames.concat(matching_frames_in);
            });
        }
        return matching_frames;
    }

    //Rendering features
    a.content_packs_renderer = function (avatar, layer, item_override) {
        var matching_frames = [];
        var render_layer;

        var matching_packs = find_pack_that_can_be_shown(avatar, layer);
        if (matching_packs.length) {
            matching_frames = find_frames_that_can_be_shown(avatar, matching_packs, item_override);
        }
        //There's at least one frame of the pack that matches filters.
        if (matching_frames.length) {
            //NOTE: Sometimes a renderer might be built and later not used because frequency isn't high enough
            var matching_frame = a.randOption(matching_frames, avatar.face_options);
            var matching_pack = matching_frame.pack;

            render_layer = matching_pack;
            render_layer.frame = matching_frame;

            render_layer.renderer = function (face_zones, avatar, layer, options) {
                avatar.content_packs_used = avatar.content_packs_used || {};
                avatar.content_packs_used[matching_pack.name] = matching_frame.name;

                if (_.isFunction(matching_pack.custom_renderer)) {
                    return matching_pack.custom_renderer(face_zones, avatar, layer, matching_pack, matching_frame, options);
                } else {
                    return default_image_renderer(face_zones, avatar, layer, matching_pack, matching_frame, options);
                }
            }
        }

        return render_layer;
    };

    function default_image_renderer(face_zones, avatar, layer, pack, frame, options) {
        var a = avatar._private_functions;
        var shapes = [];

        var frame_coordinates = frame.coordinates || [];
        var coordinate_transform_list = [];

        //Find the coordinates from the frame and match them to points on avatar
        _.each(frame_coordinates, function (from_source) {
            var from = {point: from_source.point, x: from_source.x - frame.x, y: from_source.y - frame.y};
            var to = a.findPoint(avatar, from.point) || {};

            if (to) {
                coordinate_transform_list.push({from: from, to: to});

                if (pack.show_reference_points) {
                    var to_point = new createjs.Shape();
                    to_point.graphics.beginFill('#f00').drawCircle(to.x, to.y, 4);
                    shapes.push(to_point);
                    console.log('To', to.x, to.y);
                }
            }
        });

        //Map the three triangle coordinates from shape onto the face targets
        if (coordinate_transform_list.length > 2) {
            //Build triangles of first three mapped points
            var source = [coordinate_transform_list[0].from, coordinate_transform_list[1].from, coordinate_transform_list[2].from];
            var dest = [coordinate_transform_list[0].to, coordinate_transform_list[1].to, coordinate_transform_list[2].to];

            //Build the final transform matrix from three points in each reference frame
            var matrix = maths.buildTransformFromTriangleToTriangle(source, dest);

            //TODO: Verify that loading these is not asynchronous on image draw especially on mobile
            var render_it = function (obj) {
                return default_render_after_image_loaded(avatar, pack, frame, matrix, obj);
            };

            var shape = findOrLoadImage(avatar, pack.data.image, render_it);
            shapes.push(shape);

        }
        return shapes;
    }

    function remove_color_and_range(imageData, bg_color, bg_x) {
        var bg_color_obj = net.brehaut.Color(bg_color);
        var bg_r = parseInt(bg_color_obj.red * 255);
        var bg_g = parseInt(bg_color_obj.green * 255);
        var bg_b = parseInt(bg_color_obj.blue * 255);

        //Set any colors within the specified range to transparent
        var data = imageData.data;
        for (var i = 0, n = data.length; i < n; i += 4) {
            var red = data[i];
            var green = data[i + 1];
            var blue = data[i + 2];

            if ((red > bg_r - bg_x) && (red < bg_r + bg_x) &&
                (blue > bg_b - bg_x) && (blue < bg_b + bg_x) &&
                (green > bg_g - bg_x) && (green < bg_g + bg_x)) {
                imageData.data[i + 3] = 0;
            }
        }
        return imageData;
    }

    function apply_color_transform_to_zone(imageData, avatar, frame) {
        //TODO: Integrate in tan_colors packs and other transforms from online
        _.each(frame.zones || [], function (zone) {
            var x_start, y_start, width, height;

            if (zone.all) {
                x_start = 0;
                y_start = 0;
                width = frame.width;
                height = frame.height;
            } else {
                x_start = zone.x - frame.x;
                y_start = zone.y - frame.y;
                width = zone.width;
                height = zone.height;
            }

            if (x_start < 0) {
                width -= (0 - x_start);
                x_start = 0;
            }
            if (y_start < 0) {
                height -= (0 - y_start);
                y_start = 0;
            }
            var x_end = x_start + width;
            var y_end = y_start + height;

            //Find the color that should be applied
            var to_color = avatar.face_options[zone.color];
            var to_color_object = net.brehaut.Color(to_color);
            var c_red = parseInt(to_color_object.red * 255);
            var c_green = parseInt(to_color_object.green * 255);
            var c_blue = parseInt(to_color_object.blue * 255);

            var data = imageData.data;

            //Loop through all pixels in the zone
            for (var x = x_start; x < x_end; x++) {
                for (var y = y_start; y < y_end; y++) {
                    var i = 4 * (x + y * frame.width);
                    var red = data[i];
                    var green = data[i + 1];
                    var blue = data[i + 2];
                    if (red < 40 && green < 40 && blue < 50) {
                        imageData.data[i] = c_red;
                        imageData.data[i + 1] = c_green;
                        imageData.data[i + 2] = c_blue;
                    }
                }
            }
        });
        return imageData;
    }

    function default_render_after_image_loaded(avatar, pack, frame, matrix, parent_or_img) {

        //Get either the cached image or the loaded image object
        var was_cached = false;
        var img;
        if (parent_or_img.src) {
            was_cached = true;
            img = parent_or_img;
        } else {
            img = parent_or_img.target;
        }

        //Extract the sub-image from the file into a temp canvas
        var canvas_from_image_frame_cutout = document.createElement('canvas');
        canvas_from_image_frame_cutout.width = frame.width + frame.x;
        canvas_from_image_frame_cutout.height = frame.height + frame.y;
        var context = canvas_from_image_frame_cutout.getContext('2d');
        context.drawImage(img, frame.x, frame.y, frame.width, frame.height, 0, 0, frame.width, frame.height);

        //Remove background colors
        if (!avatar.no_local_editing) {
            try {
                //Get the image data and remove background color (with a range)

                //getImageData throws an exception if there is a security problem
                var imageData = context.getImageData(0, 0, frame.width, frame.height);

                if (pack.data.removeBackgroundNoise || pack.data.removeBackgroundColor) {
                    // iterate over all pixels
                    imageData = remove_color_and_range(imageData,
                            pack.data.removeBackgroundColor || 'white',
                            pack.data.removeBackgroundNoise || 20);

                }
                imageData = apply_color_transform_to_zone(imageData, avatar, frame);

                context.putImageData(imageData, 0, 0);
            } catch (ex) {
                if (ex.name == "SecurityError") {
                    avatar.no_local_editing = true;
                    var error = "Can't apply image complex transforms because images need to be served from a web url on the same server";
                    console.error(error);
                    avatar.logMessage({msg:error, name:'exception'});

                } else {
                    //Some other exception
                    debugger;
                }
            }
        }
        var canvas1 = document.createElement('canvas');
        canvas1.width = img.width;
        canvas1.height = img.height;
        var context1 = canvas1.getContext('2d');

        //Apply matrix transform to canvas and add as shape
        context1.setTransform(matrix[0], matrix[1], matrix[2], matrix[3], matrix[4], matrix[5]);
        context1.drawImage(canvas_from_image_frame_cutout, 0, 0);


        //Draw these asynchronously rather than passing them back into the stage list
        var bitmap;
        if (isPhantomJS) {
            //Note:PhantomJS running tests is throwing a security error when editing canvases locally using
            // the EaselJS Bitmap object, so when using PhantomJS, write pixels directly to canvas
            //TODO: Write pixels onto a rectangle and add as a shape

            var dWidth = canvas_from_image_frame_cutout.width;
            var dHeight = canvas_from_image_frame_cutout.height;
            var main_context = avatar.stage.canvas.getContext('2d');
            main_context.globalCompositeOperation = 'multiply';
            try {
                main_context.drawImage(canvas_from_image_frame_cutout, 0, 0,
                    dWidth, dHeight,
                    matrix[4], matrix[5], dWidth * matrix[0], dHeight * matrix[3]
                );
            } catch (ex) {
                avatar.logMessage({ex:ex, name:'exception'});
            }
            main_context.globalCompositeOperation = 'normal';

        } else {
            bitmap = new createjs.Bitmap(canvas1);
            bitmap.compositeOperation = 'multiply';
            if (!was_cached) {
                //Wasn't cached, so asynchronously add after loaded
                avatar.drawOnStage(bitmap, avatar.stage);
                avatar.faceShapeCollection.addChild(bitmap);
            }
//            avatar.stage.update(); //Overdraws canvas direct adds
        }
        return bitmap;
    }

})(Avatar, net, maths);
function createHairPattern(options, zone, hair_line, outer_hair_line, a) {
    //Can take in numbers like '123123' or '212,1231,53' and make hair

    var type = options.type || 'droopy';
    var pattern = options.pattern || '1111121111';
    var point_pattern = options.point_pattern || '';
    var head_width = a.comparePoints(hair_line, 'width');
    var hair_left = a.comparePoints(hair_line, 'x', 'lowest');

    var head_height = zone.bottom + zone.top;

    var hair_pieces = pattern.split(",");
    var left_hair, mid_hair, right_hair;
    if (hair_pieces.length == 1) {
        left_hair = [];
        mid_hair = '' + parseInt(hair_pieces[0]);
        right_hair = [];
    } else if (hair_pieces.length == 3) {
        left_hair = '' + parseInt(hair_pieces[0]);
        mid_hair = '' + parseInt(hair_pieces[1]);
        right_hair = '' + parseInt(hair_pieces[2]);
    }

    if (mid_hair.length < 2) {
        mid_hair = "1" + mid_hair + "1";
    }
    var head_slice_width = head_width / (mid_hair.length - 1);
    var head_slice_height = head_height / 8;

    //TODO: Handle left and right
    var new_hair_line = [];
    _.each(mid_hair, function (length_number, i) {
        var x = hair_left + (i * head_slice_width);

        var height = parseInt(length_number) * head_slice_height;
        var hair_line_height = a.comparePoints(hair_line, 'crosses x', x);
        var y = hair_line_height + height;

        new_hair_line.push({x: x, y: y});
//            new_hair_line.push({
//                x: zone.x+zone.left+(i * head_slice_width),
//                y: zone.y+zone.top+height
//            });

    });

//        var spacing = comparePoints(hair_line, 'width') / hair_line.length;
//
//        var hair_spaced = hydratePointsAlongLine(new_hair_line, spacing, true);
//        _.each(new_hair_line, function(nhl, i){
//            nhl.y += hair_spaced[i].y;
//        });


    return hair_line.concat(new_hair_line.reverse());
}

//hair
new Avatar('add_render_function', {style: 'lines', feature: 'hair', renderer: function (face_zones, avatar) {
    var f = face_zones;
    var a = avatar._private_functions;
    var face_options = avatar.face_options;
    var lines = avatar.lines;
    var shapes = [];

    var hair_line_level_adjust = -f.thick_unit * 2;
    var outer_hair_x = 10;
    var outer_hair_y = 20;


    if (face_options.age < 20) {
        outer_hair_y *= (face_options.age / 20);
    }

    var head_line = a.transformLineToGlobalCoordinates(lines, 'face');
    var eye_line = a.transformLineToGlobalCoordinates(lines, 'left eye');

    head_line = a.hydratePointsAlongLine(head_line, f.thick_unit * 30);

    var zone = f.face;
    var hair_line = a.lineSegmentCompared(head_line, eye_line, 'above', hair_line_level_adjust);

    if (hair_line && hair_line.length) {
        var hair_dot_array = a.createPath(hair_line, {dot_array: true, thickness: f.thick_unit * 5, line_color: face_options.hair_color});
        lines.push({name: 'hair dot line', line: hair_line, shape: hair_dot_array, x: 0, y: 0, scale_x: 1, scale_y: 1});
//            shapes = shapes.concat(hair);


//        var inner_hair_line = a.extrudeHorizontalArc(hair_line, f.thick_unit * inner_hair_x, f.thick_unit * inner_hair_y);
//            var inner_hair_dots = a.createPath(inner_hair_line, {dot_array:true, thickness: f.thick_unit * 2, line_color: face_options.hair_color});
//            shapes = shapes.concat(inner_hair_dots);

        var outer_hair_line = a.extrudeHorizontalArc(hair_line, f.thick_unit * outer_hair_x, -f.thick_unit * outer_hair_y);
//            var outer_hair_dots = a.createPath(outer_hair_line, {dot_array:true, thickness: f.thick_unit * 2, line_color: face_options.hair_color});
//            shapes = shapes.concat(outer_hair_dots);

        var color = _.clone(face_options.hair_color);
        var fill_color = color;
        if (color == 'White' || color == '#000000') color = 'gray';
        color = maths.hexColorToRGBA(color, 1);
        fill_color = maths.hexColorToRGBA(fill_color, 1);

//        var full_hair_line = inner_hair_line.concat(outer_hair_line.reverse());
//        full_hair_line = a.transformShapeLine({type: 'smooth'}, face_options, full_hair_line);

//        var outer_hair = a.createPath(full_hair_line, {close_line: true, thickness: f.thick_unit * 2, color: color, fill_color: fill_color});
//        lines.push({name: 'full hair', line: full_hair_line, shape: outer_hair});
//        shapes = shapes.concat(outer_hair);

        var hair_builder = {style: face_options.hair_style, pattern: '111121111', point_pattern: '', pattern_name: face_options.hair_pattern};
        if (face_options.hair_pattern == "Mid Bump") {
            hair_builder.pattern = '111121111';
        } else if (face_options.hair_pattern == "Eye Droop") {
            hair_builder.pattern = '411114356224';
        } else if (face_options.hair_pattern == "Side Part") {
            hair_builder.pattern = '0,123212321,0';
        } else if (face_options.hair_pattern == "Bowl") {
            hair_builder.pattern = '0,2222222,0';
        } else if (face_options.hair_pattern == "Receding") {
            hair_builder.pattern = '0,1111111,0';
        } else if (face_options.hair_pattern == "Bowl with Peak") {
            hair_builder.pattern = '0,111131111,0';
        } else if (face_options.hair_pattern == "Bowl with Big Peak") {
            hair_builder.pattern = '0,111242111,0';
            hair_builder.point_pattern = ' ,    P    , ';
        } else if (face_options.hair_pattern == "Side Part2") {
            hair_builder.pattern = '0,4323234,0';
        } else if (face_options.hair_pattern == "Twin Peaks") {
            hair_builder.pattern = '0,11242124211,0';
        }

        if (face_options.hair_style == "Spiky") {
            //Replace each blank with a "P"
            var point_pattern = _.str.repeat(" ", hair_builder.pattern.length);
            _.each(hair_builder.point_pattern, function (style, i) {
                if (style != " ") point_pattern[i] = style;
            });
            _.each(hair_builder.pattern, function (style, i) {
                if (style == ",") point_pattern[i] = ',';
                if (style == " ") point_pattern[i] = 'P';
            })
        } else if (face_options.hair_style == "Bald" || face_options.hair_style == "None" || face_options.age < 2) {
            hair_builder = {};
        }


        if (hair_builder.style) {
            var added_hair_line = createHairPattern(hair_builder, zone, hair_line, outer_hair_line, a);
            var added_outer_hair = a.createPath(added_hair_line, {
                close_line: true, thickness: f.thick_unit * 2, line_color: color,
                fill_color: fill_color
            });
            lines.push({name: 'full hair second layer', line: added_hair_line, shape: added_outer_hair});
            shapes = shapes.concat(added_outer_hair);

            var stubble_fill_canvas = a.findShape(avatar.textures, 'stubble lines', null, 'canvas');
            var added_outer_hair_fill = a.createPath(added_hair_line, {
                close_line: true, line_color: 'blank', fill_canvas: stubble_fill_canvas
            });
            added_outer_hair_fill.alpha = 0.2;
            shapes = shapes.concat(added_outer_hair_fill);
        }


    }
    return shapes;
}});
//-----------------------------------------
//Avatar.js (lines and circle styles)
//This set of functions adds rendering capabilities to avatar.js, specifically to draw things like human faces
//-----------------------------------------


(function (Avatar, _) {
    var a = new Avatar('get_private_functions');
    a.highlight_named_points = function(avatar){
        var container = new createjs.Container();

        var size = 3;

        _.each(avatar.registered_points, function(point){
            var x = point.point.x;
            var y = point.point.y;

            var shape_point = new createjs.Shape();
            var color = "blue";
            if (point.name.indexOf('face') > -1) {
                color = "yellow";
            } else if (point.name.indexOf('nose') > -1) {
                color = "red";
            } else if (point.name.indexOf('eye') > -1) {
                color = "orange";
            }

            shape_point.graphics.beginStroke('black').beginFill(color).drawRect(x-size, y-size, size*2, size*2);

            shape_point.addEventListener('click', function(){
               console.log('Clicked names point: '+point.name + ' - ' + JSON.stringify(point.point));
            });

            container.addChild(shape_point);
            avatar.faceShapeCollection.addChild(shape_point);
        });

        avatar.drawOnStage(container, avatar.stage);
        avatar.stage.update();
    }

})(Avatar, _);

//=====Line Styles==========
//face
new Avatar('add_render_function', {style: 'lines', feature: 'face', renderer: function (face_zones, avatar) {
    var f = face_zones;
    var a = avatar._private_functions;
    var face_options = avatar.face_options;
    var lines = avatar.lines;
    var shapes = [];

    var squish = 2.94; //2.9 - 3.1 (also adjust ears x offset)

    var zone = f.face;
    var radius_x = 10 * (zone.right - zone.left) / squish;
    var radius_y = 10 * (zone.bottom - zone.top) / squish;
    var options = {type: 'circle'};
    if (face_options.face_shape == 'Oblong') {
        options = {type: 'oval', warp_y: 0.7};
    } else if (face_options.face_shape == 'Oval') {
        options = {type: 'oval', warp_y: 0.55};
    } else if (face_options.face_shape == 'Rectangle') {
        options = {type: 'oval', facet_below: 0.1, warp_y: 0.3};
    } else if (face_options.face_shape == 'Square') {
        options = {type: 'oval', facet_below: 0.1, warp_y: 0.22};
    } else if (face_options.face_shape == 'Inverted Triangle') {
        options = {type: 'oval', facet_below: 0.1, warp_x: 0.6, pinch_bottom: 2};
    } else if (face_options.face_shape == 'Diamond') {
        options = {type: 'oval', warp_x: 0.3};
    } else if (face_options.face_shape == 'Triangular') {
        options = {type: 'oval', raise_below: 0.6, pinch_top: 2, steps: 36};
    } else if (face_options.face_shape == 'Heart') {
        options = {type: 'oval', facet_below: 0.1, warp_x: 0.3, pinch_bottom: 2};
    }
    options = $.extend({}, {facet_below: 0.4, dont_facet_below: 0.8, warp_x: 0.6, warp_y_bottom: 2}, options);

    var face_line = a.transformShapeLine(options, face_options);

    // Draw some points to help track boundaries later when mapping overlay images
//    options.steps = 16;
//    var face_line_low_res = a.transformShapeLine(options, face_options);
//    _.each(face_line_low_res, function(face_point, i){
//        var x = zone.x + (face_point.x * radius_x /10);
//        var y = zone.y + (face_point.y * radius_y /10);
//        a.namePoint(avatar, 'face boundary #'+i, {x: x, y: y});
//    });

    var skin_lighter = net.brehaut.Color(face_options.skin_colors.skin).lightenByRatio(0.05).toString();
    var skin_bright = net.brehaut.Color(face_options.skin_colors.skin).lightenByRatio(0.1).toString();
    var cheek_darker = net.brehaut.Color(face_options.skin_colors.cheek).darkenByRatio(0.05).toString();
    var fill_colors = [cheek_darker, skin_lighter, skin_bright, skin_lighter, cheek_darker];
    var fill_steps = [0, .25, .5, .75, 1];

    var face = a.createPathFromLocalCoordinates(face_line, {
            close_line: true, line_color: face_options.skin_colors.highlights,
            fill_method: 'linear', fill_colors: fill_colors, fill_steps: fill_steps,
            radius: radius_x * .1},
        radius_x, radius_y);
    face.x = zone.x;
    face.y = zone.y;
    lines.push({name: 'face', line: face_line, shape: face, scale_x: radius_x, scale_y: radius_y, x: zone.x, y: zone.y});
    shapes.push(face);


    var acne_alpha = 0;
    if (face_options.acne_style == "Very Light") {
        acne_alpha = 0.1;
    } else if (face_options.acne_style == "Light") {
        acne_alpha = 0.2;
    } else if (face_options.acne_style == "Medium") {
        acne_alpha = 0.3;
    } else if (face_options.acne_style == "Heavy") {
        acne_alpha = 0.4;
    }
    if (face_options.age > 25) {
        acne_alpha *= .8;
    } else if (face_options.age > 35) {
        acne_alpha *= .5;
    } else if (face_options.age > 45) {
        acne_alpha *= .2;
    } else if (face_options.age < 12) {
        acne_alpha *= .2;
    }

    var skin_texture_fill_canvas = a.findShape(avatar.textures, 'face bumps', null, 'canvas');
    var face_overlay = a.createPathFromLocalCoordinates(face_line, {
            close_line: true, line_color: 'blank',
            fill_canvas: skin_texture_fill_canvas
        },
        radius_x, radius_y);
    face_overlay.x = zone.x;
    face_overlay.y = zone.y;
    face_overlay.alpha = acne_alpha;
    lines.push({name: 'face bumps', line: face_line, shape: face_overlay, scale_x: radius_x, scale_y: radius_y, x: zone.x, y: zone.y});
    shapes.push(face_overlay);


    var skin_texture_fill_canvas2 = a.findShape(avatar.textures, 'face spots', null, 'canvas');
    var face_overlay2 = a.createPathFromLocalCoordinates(face_line, {
            close_line: true, line_color: 'blank',
            fill_canvas: skin_texture_fill_canvas2
        },
        radius_x, radius_y);
    face_overlay2.x = zone.x;
    face_overlay2.y = zone.y;
    face_overlay2.alpha = acne_alpha * 2;
    shapes.push(face_overlay2);


    return shapes;
}});

//shoulders
new Avatar('add_render_function', {style: 'lines', feature: 'shoulders', renderer: function (face_zones, avatar) {
    var f = face_zones;
    var a = avatar._private_functions;
    var face_options = avatar.face_options;
    var lines = avatar.lines;
    var shapes = [];

//TODO: Adjust by strength, align with bottom of neck
    var shoulder_shape_line = [
        {x: -4, y: -10},
        {x: -5, y: -9},
        {x: -10, y: 0},
        {x: -10, y: 0},
        {x: -10, y: 10},

        {x: 10, y: 10},
        {x: 10, y: 0},
        {x: 10, y: 0},
        {x: 5, y: -9},
        {x: 4, y: -10}
    ];

    var scale_y = f.thick_unit * 80;
    var scale_x = f.thick_unit * 200;
    var x = f.neck.x;
    var y = f.neck.y + (f.thick_unit * 300);

    var skin_lighter = net.brehaut.Color(face_options.skin_colors.skin).toString();
    var skin_bright = net.brehaut.Color(face_options.skin_colors.skin).lightenByRatio(0.05).toString();
    var cheek_darker = net.brehaut.Color(face_options.skin_colors.cheek).darkenByRatio(0.05).toString();
    var fill_colors = [skin_bright, skin_lighter, cheek_darker, skin_lighter, skin_bright];
    var fill_steps = [0, .25, .5, .75, 1];

    var image_tl = a.findPoint(avatar, 'facezone topleft');
    var image_br = a.findPoint(avatar, 'facezone bottomright');

    var shoulder_shape_line_global = a.transformPathFromLocalCoordinates(shoulder_shape_line, scale_x, scale_y, x, y);


    shoulder_shape_line_global = a.constrainPolyLineToBox(shoulder_shape_line_global, {tl: image_tl, br: image_br});

    var shoulder_shape = a.createPath(shoulder_shape_line_global, {
        fill_method: 'linear', fill_colors: fill_colors, fill_steps: fill_steps,
        line_color: face_options.skin_colors.highlights, radius: (f.thick_unit * 300),
        close_line: true
    });
    lines.push({name: 'shoulder', line: shoulder_shape_line, shape: shoulder_shape, scale_x: scale_x, scale_y: scale_y, x: x, y: y});
    shapes = shapes.concat(shoulder_shape);


    return shapes;
}});


//neck
new Avatar('add_render_function', {style: 'lines', feature: 'neck', renderer: function (face_zones, avatar) {
    var f = face_zones;
    var a = avatar._private_functions;
    var face_options = avatar.face_options;
    var lines = avatar.lines;
    var shapes = [];

    var neck_width = 0.75; //.5-.85
    var neck_curvature = 0.85; //.7 - .95
    var apple_transparency = 0.4; //.3 - .6
    var apple_height = 1.4; //0-2
    if (face_options.gender == 'Female') {
        neck_width *= 0.9;
    }
    if (face_options.face_shape == "Inverted Triangle") {
        neck_width *= 0.9;
    }

    var image_tl = a.findPoint(avatar, 'facezone topleft');
    var image_br = a.findPoint(avatar, 'facezone bottomright');

    var zone = f.neck;
    var scale_x = (zone.right - zone.left) * neck_width;
    var scale_y = (zone.bottom - zone.top) / 1.2;

    var skin_lighter = net.brehaut.Color(face_options.skin_colors.skin).toString();
    var skin_bright = net.brehaut.Color(face_options.skin_colors.skin).lightenByRatio(0.05).toString();
    var cheek_darker = net.brehaut.Color(face_options.skin_colors.cheek).darkenByRatio(0.05).toString();
    var fill_colors = [cheek_darker, skin_lighter, skin_bright, skin_lighter, cheek_darker];
    var fill_steps = [0, .25, .5, .75, 1];

    var x = zone.x;
    var y = zone.y + (f.thick_unit * 195);

    var neck_draw_options = {
        fill_method: 'linear', fill_colors: fill_colors, fill_steps: fill_steps,
        line_color: 'blank',
        close_line: true
    };

    var neck_line, neck;
    if (face_options.neck_size == 'Concave') {
        neck_line = a.transformShapeLine({type: 'neck', radius: 5, curvature: neck_curvature}, face_options);
        neck_line = a.transformPathFromLocalCoordinates(neck_line, scale_x, scale_y, x, y);
        neck_line = a.constrainPolyLineToBox(neck_line, {tl: image_tl, br: image_br});

        neck = a.createPath(neck_line, neck_draw_options);

        lines.push({name: 'neck', line: neck_line, shape: neck});
        shapes.push(neck);

    } else if (face_options.neck_size == 'Thick') {
        neck_line = [
            {x: -10, y: -10},
            {x: -10, y: -9},
            {x: -9, y: 0},
            {x: -8, y: 9},
            {x: -8, y: 10},

            {x: 8, y: 10},
            {x: 8, y: 9},
            {x: 9, y: 0},
            {x: 10, y: -9},
            {x: 10, y: -10}
        ];

        scale_y = (zone.bottom - zone.top) / 2.3;
        scale_x = (f.face.right - f.face.left) / 3.5;

        if (face_options.gender == 'Female') {
            scale_x *= .9;
        }
        if (face_options.face_shape == 'Inverted Triangle') {
            scale_x *= .8;
        }

        neck_line = a.transformPathFromLocalCoordinates(neck_line, scale_x, scale_y, x, y);
        neck_line = a.constrainPolyLineToBox(neck_line, {tl: image_tl, br: image_br});
        neck = a.createPath(neck_line, neck_draw_options);

        lines.push({name: 'neck', line: neck_line, shape: neck});
        shapes = shapes.concat(neck);

    }

    x = zone.x;
    y = zone.y + (f.thick_unit * 225);
    if (face_options.gender == 'Male') {
        var darker_skin = net.brehaut.Color(face_options.skin_colors.skin).darkenByRatio(0.2).toString();
        var neck_apple_line = a.transformShapeLine({type: 'circle', radius: 0.5}, face_options);
        scale_x = (zone.right - zone.left);
        scale_y = (zone.bottom - zone.top) * apple_height;

        var neck_apple = a.createPathFromLocalCoordinates(neck_apple_line, {close_line: true, line_color: face_options.skin_colors.skin, fill_color: darker_skin}, scale_x, scale_y);
        neck_apple.x = x;
        neck_apple.y = y;
        neck_apple.alpha = apple_transparency;
        lines.push({name: 'neck_apple', line: neck_apple_line, shape: neck_apple, scale_x: scale_x, scale_y: scale_y, x: x, y: y});
        shapes.push(neck_apple);
    }
    a.namePoint(avatar, 'middle neck adams apple', {x: x, y: y});


    var neck_x = a.comparePoints(neck_line, 'crosses y', y);
    a.namePoint(avatar, 'neck mid left', {x: neck_x, y: y});

    var neck_line_left = a.lineSegmentCompared(neck_line, x, 'right');
    neck_x = a.comparePoints(neck_line_left, 'crosses y', y);
    a.namePoint(avatar, 'neck mid right', {x: neck_x, y: y});

    return shapes;
}});

//ears
new Avatar('add_render_function', {style: 'lines', feature: 'ears', renderer: function (face_zones, avatar) {
    var f = face_zones;
    var a = avatar._private_functions;
    var face_options = avatar.face_options;
    var lines = avatar.lines;
    var shapes = [];

    var zone = f.ears;
    var width = 0.5 * (zone.right - zone.left);
    var height = 0.6 * (zone.bottom - zone.top);

    var ear_height_adjust = 1; //.3-1.2
    var ear_width_adjust = 1; //.7-2
    var right_lobe_height = 0; //0-3
    var left_lobe_height = 0; //0-3
    var inner_cavity_size_adjust = .2; //.3-.6
    var ear_inset_adjust = 2;  //0-5
    var ear_head_height_adjust = 0;  //-20 - 20
    ear_head_height_adjust -= 10;

    if (face_options.ear_thickness == "Wide") {
        ear_width_adjust = 1.5;
        ear_height_adjust = 1.1;
    } else if (face_options.ear_thickness == "Big") {
        ear_width_adjust = 1.9;
        ear_height_adjust = 1.3;

    } else if (face_options.ear_thickness == "Tall") {
        ear_width_adjust = 1.4;
        ear_height_adjust = 1.2;
        ear_head_height_adjust = 5;
    } else if (face_options.ear_thickness == "Small") {
        ear_width_adjust = .8;
        ear_height_adjust = .7;
    } else if (face_options.ear_thickness == "Tiny") {
        ear_width_adjust = .7;
        ear_height_adjust = .4;
        inner_cavity_size_adjust = .25;
    } else if (face_options.ear_thickness == "Splayed") {
        ear_width_adjust = 2;
        ear_height_adjust = 1.2;
        inner_cavity_size_adjust = .3;
    }

    if (face_options.ear_lobe_left == "Hanging") {
        left_lobe_height = 3;
    } else if (face_options.ear_lobe_left == "Attached") {
        left_lobe_height = 0;
    }

    if (face_options.ear_lobe_right == "Hanging") {
        right_lobe_height = 3;
    } else if (face_options.ear_lobe_right == "Attached") {
        right_lobe_height = 0;
    } else if (face_options.ear_lobe_right == "Same") {
        right_lobe_height = left_lobe_height;
    }

    var ear_line_side;
    if (face_options.ear_shape == 'Pointed') {
        ear_line_side = [
            {x: -3, y: -4},
            {x: -5, y: -6, line: true},
            {x: 3, y: -12, line: true},
            {x: 9, y: -6, line: true},
            {x: 3, y: -0},
            {x: 6, y: 4},
            {x: 3, y: 5},
            {x: -3, y: 3}
        ];
    } else {
        ear_line_side = [
            {x: -3, y: -4},
            {x: -5, y: -6},
            {x: 3, y: -8},
            {x: 9, y: -6},
            {x: 3, y: -0},
            {x: 6, y: 4},
            {x: 3, y: 5},
            {x: -3, y: 3}
        ];
    }
    var ear_line_l = [];
    var ear_line_r = [];
    var y;
    for (var i = 0; i < ear_line_side.length; i++) {
        y = ear_height_adjust * ear_line_side[i].y;
        var l_offset = 0;
        var r_offset = 0;
        if (i == ear_line_side.length - 1) {
            l_offset = left_lobe_height;
            r_offset = right_lobe_height;
        }
        ear_line_l.push({x: ear_width_adjust * ear_line_side[i].x, y: y + l_offset});
        ear_line_r.push({x: -ear_width_adjust * ear_line_side[i].x, y: y + r_offset});
    }

    var ear_r = a.createPathFromLocalCoordinates(ear_line_r, {close_line: true, thickness: f.thick_unit, fill_color: face_options.skin_colors.skin, color: face_options.skin_colors.deepshadow}, width, height);
    var x = zone.left_x - (f.thick_unit * ear_inset_adjust);
    y = zone.y - (f.thick_unit * ear_head_height_adjust);
    ear_r.x = x;
    ear_r.y = y;
    lines.push({name: 'ear right line', line: ear_line_r, shape: ear_r, scale_x: width, scale_y: height, x: x, y: y});
    shapes.push(ear_r);

    a.namePoint(avatar, 'middle left ear', {x: x, y: y});


    var ear_l = a.createPathFromLocalCoordinates(ear_line_l, {close_line: true, thickness: f.thick_unit, fill_color: face_options.skin_colors.skin, color: face_options.skin_colors.deepshadow}, width, height);
    x = zone.right_x + (f.thick_unit * ear_inset_adjust);
    y = zone.y - (f.thick_unit * ear_head_height_adjust);
    ear_l.x = x;
    ear_l.y = y;
    lines.push({name: 'ear left line', line: ear_line_l, shape: ear_l, scale_x: width, scale_y: height, x: x, y: y});
    shapes.push(ear_l);

    a.namePoint(avatar, 'middle right ear', {x: x, y: y});


    var in_scale = .7;
    var in_x_offset = 2;
    var in_y_offset = -8;
    var darker_ear = net.brehaut.Color(face_options.skin_colors.skin).darkenByRatio(0.2).toString();
    var ear_r_in_top = a.createPathFromLocalCoordinates(ear_line_r, {close_line: true, thickness: f.thick_unit, fill_color: darker_ear, color: face_options.skin_colors.deepshadow}, width * in_scale, height * in_scale);
    x = zone.left_x - (f.thick_unit * ear_inset_adjust) + (f.thick_unit * in_x_offset);
    y = zone.y - (f.thick_unit * ear_head_height_adjust) + (f.thick_unit * in_y_offset);
    ear_r_in_top.x = x;
    ear_r_in_top.y = y;
    lines.push({name: 'ear right line top in', line: ear_line_r, shape: ear_r_in_top, scale_x: width * in_scale, scale_y: height * in_scale, x: x, y: y});
    shapes.push(ear_r_in_top);

    var ear_l_in_top = a.createPathFromLocalCoordinates(ear_line_l, {close_line: true, thickness: f.thick_unit, fill_color: darker_ear, color: face_options.skin_colors.deepshadow}, width * in_scale, height * in_scale);
    x = zone.right_x + (f.thick_unit * ear_inset_adjust) - (f.thick_unit * in_x_offset);
    y = zone.y - (f.thick_unit * ear_head_height_adjust) + (f.thick_unit * in_y_offset);
    ear_l_in_top.x = x;
    ear_l_in_top.y = y;
    lines.push({name: 'ear left line top in', line: ear_line_l, shape: ear_l_in_top, scale_x: width * in_scale, scale_y: height * in_scale, x: x, y: y});
    shapes.push(ear_l_in_top);


    width *= inner_cavity_size_adjust;
    height *= inner_cavity_size_adjust;
    in_x_offset = 4;
    in_y_offset = 6;

    var ear_r_in = a.createPathFromLocalCoordinates(ear_line_r, {close_line: true, thickness: f.thick_unit, fill_color: face_options.skin_colors.darkflesh, color: face_options.skin_colors.deepshadow}, width, height);
    x = zone.left_x - (f.thick_unit * ear_inset_adjust) + (f.thick_unit * in_x_offset);
    y = zone.y - (f.thick_unit * ear_head_height_adjust) + (f.thick_unit * in_y_offset);
    ear_r_in.x = x;
    ear_r_in.y = y;
    ear_r_in.rotation = 6;
    lines.push({name: 'ear right line in', line: ear_line_r, shape: ear_r_in, scale_x: 1, scale_y: 1, x: x, y: y});
    shapes.push(ear_r_in);

    var ear_l_in = a.createPathFromLocalCoordinates(ear_line_l, {close_line: true, thickness: f.thick_unit, fill_color: face_options.skin_colors.darkflesh, color: face_options.skin_colors.deepshadow}, width, height);
    x = zone.right_x + (f.thick_unit * ear_inset_adjust) - (f.thick_unit * in_x_offset);
    y = zone.y - (f.thick_unit * ear_head_height_adjust) + (f.thick_unit * in_y_offset);
    ear_l_in.x = x;
    ear_l_in.y = y;
    ear_l_in.rotation = -6;
    lines.push({name: 'ear left line in', line: ear_line_l, shape: ear_l_in, scale_x: 1, scale_y: 1, x: x, y: y});
    shapes.push(ear_l_in);

    return shapes;
}});

//eye_positioner
new Avatar('add_render_function', {style: 'lines', feature: 'eye_position', renderer: function (face_zones, avatar) {
    //This doesn't draw anything, just pre-generates the positions that othes will use to guide off of
    var f = face_zones;
    var a = avatar._private_functions;
    var face_options = avatar.face_options;
    var lines = avatar.lines;

    var rotation_amount = 4; //-6 to 15, sets emotion
    if (face_options.eye_rotation == "Flat") {
        rotation_amount = -2;
    } else if (face_options.eye_rotation == "Small") {
        rotation_amount = 2;
    } else if (face_options.eye_rotation == "Medium") {
        rotation_amount = 4;
    } else if (face_options.eye_rotation == "Large") {
        rotation_amount = 7;
    } else if (face_options.eye_rotation == "Slanted") {
        rotation_amount = 11;
    }

    var eye_squint = 1.4;
    var width_eye = (f.eyes.right - f.eyes.left);
    var height_eye = (f.eyes.bottom - f.eyes.top) * eye_squint;

    var zone = f.eyes;
    var eye_radius = 4.2;
    var x = zone.left_x;
    var y = zone.y;
    var left_eye_line = [];
    if (face_options.eye_shape == 'Almond') {
        left_eye_line = a.transformShapeLine([
            {type: 'almond-horizontal', modifier: 'left', radius: eye_radius},
            {type: 'pinch', pinch_amount: 0.6, starting_step: -3, ending_step: 4},
            {type: 'pinch', pinch_amount: 0.9, starting_step: -3, ending_step: 9}
        ], face_options);
    }

    var left_eye = a.createPathFromLocalCoordinates(left_eye_line, {close_line: true}, width_eye, height_eye);
    left_eye.x = x;
    left_eye.y = y;
    left_eye.rotation = rotation_amount;
    lines.push({name: 'left eye', line: left_eye_line, shape: left_eye, scale_x: width_eye, scale_y: height_eye, x: x, y: y, rotation: rotation_amount});


    zone = f.eyes;
    x = zone.right_x;
    y = zone.y;
    var right_eye_line = a.transformShapeLine({type: 'reverse', direction: 'horizontal', axis: 0}, face_options, left_eye_line);
    var right_eye = a.createPathFromLocalCoordinates(right_eye_line, {close_line: true}, width_eye, height_eye);

    right_eye.x = x;
    right_eye.y = y;
    right_eye.rotation = -rotation_amount;
    lines.push({name: 'right eye', line: right_eye_line, shape: right_eye, scale_x: width_eye, scale_y: height_eye, x: x, y: y, rotation: -rotation_amount});

    var inner_point_x = a.comparePoints(right_eye_line, 'x', 'lowest');
    var inner_point_y = a.comparePoints(right_eye_line, 'y', 'middle');
    inner_point_x = x + (inner_point_x * width_eye / 2 / eye_radius);
    inner_point_y = y + (inner_point_y * height_eye / 2 / eye_radius);
    a.namePoint(avatar, 'right eye innermost', {x: inner_point_x, y: inner_point_y});

    inner_point_x = a.comparePoints(right_eye_line, 'x', 'highest');
    inner_point_y = a.comparePoints(right_eye_line, 'y', 'middle');
    inner_point_x = x + (inner_point_x * width_eye / 2 / eye_radius);
    inner_point_y = y + (inner_point_y * height_eye / 2 / eye_radius);
    a.namePoint(avatar, 'right eye outermost', {x: inner_point_x, y: inner_point_y});

}});

//eyes
new Avatar('add_render_function', {style: 'lines', feature: 'eyes', renderer: function (face_zones, avatar) {
    var f = face_zones;
    var a = avatar._private_functions;
    var face_options = avatar.face_options;
    var lines = avatar.lines;
    var shapes = [];

    if (!face_options.eye_shape) {
        console.error("ERROR - face_options.eye_shape not set - likely no face_options were set");
    }

    var rotation_amount = 4; //-6 to 15, sets emotion
    if (face_options.eye_rotation == "Flat") {
        rotation_amount = -2;
    } else if (face_options.eye_rotation == "Small") {
        rotation_amount = 2;
    } else if (face_options.eye_rotation == "Medium") {
        rotation_amount = 4;
    } else if (face_options.eye_rotation == "Large") {
        rotation_amount = 7;
    } else if (face_options.eye_rotation == "Slanted") {
        rotation_amount = 11;
    }

    var iris_size = 3.6;  // 3.5 to 3.9
    var iris_lift = 1.3;
    var pupil_transparency = 0.7; //.1 - .9 for weird eyes, but .7 works best
    var iris_transparency = 0.5; //.1 - .9 for weird eyes, but .5 works best
    var pupil_color = face_options.pupil_color; //best dark colors, black or dark blue. red looks freaky
    var eyebrow_thick_start = 4;
    var eyebrow_thick_stop = 2 * f.thick_unit;
    var eye_squint = 1.4;
    var iris_side_movement = -0; // -8 - 8  //TODO: Can go farther once eyes are overdrawn

    var eyebrow_height = 20; //15 - 40
    var eyebrow_transparency = 0.9;
    var eyebrow_rotation = -6; //-6 to 10
    var eyeline_transparency = 0.8;

    if (face_options.gender == 'Female') {
        eyebrow_thick_start *= 1.2;
        eyebrow_thick_stop *= 1.2;
    }

    eyebrow_thick_start += parseInt(face_options.age / 12);

    var eye_fill_colors = ["#fff", "#cbb", "#444"];
    var eye_fill_steps = [0, .92, 1];
    if (face_options.eye_cloudiness == 'Clear') {
        eye_fill_colors = ["#fff", "#edd", "#444"];
    } else if (face_options.eye_cloudiness == 'Pink') {
        eye_fill_colors = ["#fcc", "#e88", "#833"];
    } else if (face_options.eye_cloudiness == 'Dark') {
        eye_fill_colors = ["#fff", "#988", "#444"];
    } else if (face_options.eye_cloudiness == 'Misty') {
        eye_fill_colors = ["#fff", "#baa", "#444"];
    } else if (face_options.eye_cloudiness == 'Blue') {
        eye_fill_steps = [0, .8, .92, 1];
        eye_fill_colors = ["#fff", "#99e", "#ddf", "#444"];
    }

    //Scales
    var width_eye = (f.eyes.right - f.eyes.left);
    var height_eye = (f.eyes.bottom - f.eyes.top) * eye_squint;
    var width_pupil = (f.eyes.pupil.right - f.eyes.pupil.left);
    var height_pupil = (f.eyes.pupil.bottom - f.eyes.pupil.top);
    var width_iris = (f.eyes.iris.right - f.eyes.iris.left);
    var height_iris = (f.eyes.iris.bottom - f.eyes.iris.top);

    eyebrow_thick_start *= f.thick_unit;

    var eyeliner_color = face_options.skin_colors.darkflesh;
    var eyeliner_alpha = eyeline_transparency;
    var eyeliner_thickness = f.thick_unit * 5;
    if (face_options.gender == "Female") {
        eyeliner_color = '#000';
        eyeliner_alpha = .6;
        eyeliner_thickness = f.thick_unit * 2;
    }

    var sunken_color = '#500';
    var sunken_amount = 0.6;
    var socket_size = 65;
    var socket_y_offset = 1;
    if (face_options.eye_sunken == "Cavernous") {
        sunken_color = '#A00';
        sunken_amount = 0.8;
        socket_size = 72;
        socket_y_offset = 3;
    } else if (face_options.eye_sunken == "Deep") {
        sunken_color = '#400';
        sunken_amount = 0.6;
        socket_size = 73;
        socket_y_offset = 2;
    } else if (face_options.eye_sunken == "Dark") {
        sunken_color = '#000';
        sunken_amount = 0.55;
        socket_size = 85;
        socket_y_offset = 1;
    } else if (face_options.eye_sunken == "Smooth") {
        sunken_color = '#100';
        sunken_amount = 0.2;
        socket_size = 70;
        socket_y_offset = 0;
    } else if (face_options.eye_sunken == "None") {
        sunken_amount = 0;
        socket_y_offset = 0;
    }


    //Eye background color ovals
    var right_eyesocket_oval = a.transformShapeLine({type: 'oval', radius: width_eye * .75});

    var skin_lighter = net.brehaut.Color(face_options.skin_colors.skin).blend(net.brehaut.Color(sunken_color), 0.05).toString();
    skin_lighter = maths.hexColorToRGBA(skin_lighter, .8);
    var skin_darker = net.brehaut.Color(face_options.skin_colors.skin).blend(net.brehaut.Color(sunken_color), sunken_amount).toString();
    skin_lighter = maths.hexColorToRGBA(skin_lighter, .02);

    var fill_colors = [skin_darker, skin_lighter, 'rgba(0,0,0,0)'];
    var fill_steps = [0, .85, 1];

    var left_eyesocket = a.createPath(right_eyesocket_oval, {
        close_line: true, thickness: f.thick_unit,
        line_color: 'rgba(0,0,0,0)',
        fill_colors: fill_colors, fill_method: 'radial',
        fill_steps: fill_steps, radius: (f.thick_unit * socket_size)
    });
    left_eyesocket.x = f.eyes.left_x;
    left_eyesocket.y = f.eyes.y + (socket_y_offset * f.thick_unit);
    left_eyesocket.scaleY = .6;
    shapes.push(left_eyesocket);


    var right_eyesocket = a.createPath(right_eyesocket_oval, {
        close_line: true, thickness: f.thick_unit,
        line_color: 'rgba(0,0,0,0)',
        fill_colors: fill_colors, fill_method: 'radial',
        fill_steps: fill_steps, radius: (f.thick_unit * socket_size)
    });
    right_eyesocket.x = f.eyes.right_x;
    right_eyesocket.y = f.eyes.y + (socket_y_offset * f.thick_unit);

    right_eyesocket.scaleY = .6;
    shapes.push(right_eyesocket);


    //Left Eye
    var zone = f.eyes;
    var eye_radius = 4.2;
    var x = zone.left_x;
    var y = zone.y;
    var left_eye_line = [];
    if (face_options.eye_shape == 'Almond') {
        left_eye_line = a.transformShapeLine([
            {type: 'almond-horizontal', modifier: 'left', radius: eye_radius},
            {type: 'pinch', pinch_amount: 0.6, starting_step: -3, ending_step: 4},
            {type: 'pinch', pinch_amount: 0.9, starting_step: -3, ending_step: 9}
        ], face_options);
    }

    var left_eye = a.createPathFromLocalCoordinates(left_eye_line, {
            close_line: true, line_color: face_options.skin_colors.darkflesh,
            fill_colors: eye_fill_colors, fill_method: 'radial',
            fill_steps: eye_fill_steps, radius: width_eye * .37, x_offset: -(2 * f.thick_unit)},
        width_eye, height_eye);
    left_eye.x = x;
    left_eye.y = y;
    left_eye.rotation = rotation_amount;
    lines.push({name: 'left eye', line: left_eye_line, shape: left_eye, scale_x: width_eye, scale_y: height_eye, x: x, y: y, rotation: rotation_amount});
    shapes.push(left_eye);

    var inner_point_x = a.comparePoints(left_eye_line, 'x', 'highest');
    var inner_point_y = a.comparePoints(left_eye_line, 'y', 'middle');
    inner_point_x = x + (inner_point_x * width_eye / 2 / eye_radius);
    inner_point_y = y + (inner_point_y * height_eye / 2 / eye_radius);
    a.namePoint(avatar, 'left eye innermost', {x: inner_point_x, y: inner_point_y});

    inner_point_x = a.comparePoints(left_eye_line, 'x', 'lowest');
    inner_point_y = a.comparePoints(left_eye_line, 'y', 'middle');
    inner_point_x = x + (inner_point_x * width_eye / 2 / eye_radius);
    inner_point_y = y + (inner_point_y * height_eye / 2 / eye_radius);
    a.namePoint(avatar, 'left eye outermost', {x: inner_point_x, y: inner_point_y});

    x = zone.left_x;
    y = zone.y - (f.thick_unit * 4);
    var left_eye_line_top = [];
    if (face_options.eye_shape == 'Almond') {
        left_eye_line_top = a.transformShapeLine({type: 'almond-horizontal', modifier: 'left', radius: eye_radius, starting_step: 11, ending_step: 19}, face_options);
    }
    var left_eye_top = a.createPathFromLocalCoordinates(left_eye_line_top, {close_line: false, line_color: face_options.skin_colors.cheek, thickness: f.thick_unit * 5}, width_eye, height_eye);
    left_eye_top.x = x;
    left_eye_top.y = y;
    left_eye_top.alpha = eyeline_transparency;
    left_eye_top.rotation = rotation_amount;
    lines.push({name: 'left eye top', line: left_eye_line_top, shape: left_eye_top, scale_x: width_eye, scale_y: height_eye, x: x, y: y, rotation: rotation_amount});
    shapes.push(left_eye_top);


    x = zone.left_x + f.thick_unit;
    y = zone.y + (f.thick_unit * 1.5);
    var left_eye_line_bottom = [];
    if (face_options.eye_shape == 'Almond') {
        left_eye_line_bottom = a.transformShapeLine([
                {type: 'almond-horizontal', modifier: 'left', radius: eye_radius, starting_step: 0, ending_step: 9},
                {type: 'pinch', pinch_amount: 0.7, starting_step: -3, ending_step: 4}
            ]
            , face_options);
    }
    var left_eye_bottom = a.createPathFromLocalCoordinates(left_eye_line_bottom, {close_line: false, line_color: face_options.skin_colors.darkflesh}, width_eye, height_eye);
    left_eye_bottom.x = x;
    left_eye_bottom.y = y;
    left_eye_bottom.alpha = eyeline_transparency;
    left_eye_bottom.rotation = rotation_amount;
    lines.push({name: 'left eye bottom', line: left_eye_line_bottom, shape: left_eye_bottom, scale_x: width_eye, scale_y: height_eye, x: x, y: y, rotation: rotation_amount});
    shapes.push(left_eye_bottom);

    var left_eyebrow_line_top = [
        {x: 10, y: 2},
        {x: -2, y: -6},
        {x: -10, y: 1}
    ];
    if (face_options.eyebrow_shape == "Slim") {
        left_eyebrow_line_top = [
            {x: 10, y: 1},
            {x: -2, y: -6},
            {x: -10, y: 1}
        ];
        eyebrow_thick_start /= 2;
    } else if (face_options.eyebrow_shape == "Squiggle") {
        left_eyebrow_line_top = [
            {x: 12, y: -1},
            {x: 4, y: 2},
            {x: -2, y: -5},
            {x: -10, y: 1}
        ];
    } else if (face_options.eyebrow_shape == "Squiggle Flip") {
        left_eyebrow_line_top = [
            {x: 12, y: 1},
            {x: 4, y: -4},
            {x: -2, y: -2},
            {x: -10, y: -3}
        ];
    } else if (face_options.eyebrow_shape == "Arch") {
        left_eyebrow_line_top = [
            {x: 11, y: 0},
            {x: 4, y: -3, thickness: 8 * f.thick_unit},
            {x: -2, y: -5, thickness: 8 * f.thick_unit},
            {x: -10, y: 2}
        ];
    } else if (face_options.eyebrow_shape == "Caterpiller") {
        left_eyebrow_line_top = [
            {x: 11, y: 6},
            {x: -1, y: -2},
            {x: -6, y: -2},
            {x: -10, y: 1},
            {x: -13, y: 5}
        ];
        eyebrow_thick_stop = eyebrow_thick_start *= 1.5;
    } else if (face_options.eyebrow_shape == "Wide Caterpiller") {
        left_eyebrow_line_top = [
            {x: 11, y: 6},
            {x: 2, y: -2},
            {x: -6, y: -2},
            {x: -13, y: 7}
        ];
        eyebrow_thick_stop = eyebrow_thick_start * 1.5;
    } else if (face_options.eyebrow_shape == "Thick Arch") {
        left_eyebrow_line_top = [
            {x: 11, y: 6},
            {x: -5, y: -2},
            {x: -14, y: 7}
        ];
        eyebrow_thick_stop = eyebrow_thick_start * 1.5;
    } else if (face_options.eyebrow_shape == "Unibrow") {
        left_eyebrow_line_top = [
            {x: 20, y: 6},
            {x: 11, y: 6},
            {x: -5, y: -2},
            {x: -14, y: 7}
        ];
        eyebrow_thick_stop = eyebrow_thick_start * 1.5;
    }

    x = zone.left_x;
    y = zone.y - (f.thick_unit * 1.5 * eyebrow_height);
    var width_eyebrow = width_eye / 2.5;
    var height_eyebrow = height_eye / 4;

    var eyebrow_fade_color = net.brehaut.Color(face_options.hair_color).desaturateByRatio(.1);
    eyebrow_fade_color.alpha = .5;
    eyebrow_fade_color = eyebrow_fade_color.toString();

    var left_eyebrow_top = a.createMultiPathFromLocalCoordinates(left_eyebrow_line_top, {
        break_line_every: 5,
        line_color_gradients: [face_options.hair_color, eyebrow_fade_color],
        thickness_gradients: [eyebrow_thick_start, eyebrow_thick_stop],
        x: x, y: y, rotation: rotation_amount + eyebrow_rotation
    }, width_eyebrow, height_eyebrow);
    lines.push({name: 'left eyebrow top set', line: left_eyebrow_line_top, shape: left_eyebrow_top, scale_x: width_eye, scale_y: height_eye, x: x, y: y, rotation: rotation_amount + eyebrow_rotation, alpha: eyebrow_transparency});
    shapes = shapes.concat(left_eyebrow_top);

    inner_point_x = a.comparePoints(left_eyebrow_line_top, 'x', 'highest');
    inner_point_y = a.comparePoints(left_eyebrow_line_top, 'y', 'middle');
    inner_point_x = x + (inner_point_x * width_eyebrow / 2 / eye_radius);
    inner_point_y = y + (inner_point_y * height_eyebrow / 2 / eye_radius);
    a.namePoint(avatar, 'left eyebrow innermost', {x: inner_point_x, y: inner_point_y});

    var eyebrow_y = inner_point_y;
    var eyebrow_x = inner_point_x;

    x = zone.left_x + (f.thick_unit * 4);
    y = zone.y - (f.thick_unit * 8);
    var left_eyebrow_line_inside = a.transformShapeLine({type: 'almond-horizontal', modifier: 'left', radius: eye_radius, starting_step: 14, ending_step: 19}, face_options);
    var left_eyebrow_inside = a.createPathFromLocalCoordinates(left_eyebrow_line_inside, {close_line: false, line_color: face_options.skin_colors.darkflesh}, width_eye, height_eye);
    left_eyebrow_inside.x = x;
    left_eyebrow_inside.y = y;
    left_eyebrow_inside.alpha = eyeline_transparency;
    left_eyebrow_inside.rotation = rotation_amount + 10;
    lines.push({name: 'left eyebrow inside', line: left_eyebrow_line_inside, shape: left_eyebrow_inside, scale_x: width_eye, scale_y: height_eye, x: x, y: y, rotation: rotation_amount + 10});
    shapes.push(left_eyebrow_inside);


    zone = f.eyes.iris;
    x = zone.left_x + (f.thick_unit * iris_side_movement);
    y = zone.y - (f.thick_unit * iris_lift);
    var left_iris_line = a.transformShapeLine({type: 'circle', radius: iris_size}, face_options);
    var left_iris = a.createPathFromLocalCoordinates(left_iris_line, {close_line: true, fill_color: face_options.eye_color}, width_iris, height_iris);
    left_iris.x = x;
    left_iris.y = y;
    left_iris.alpha = iris_transparency;
    lines.push({name: 'left iris', line: left_iris_line, shape: left_iris, scale_x: width_iris, scale_y: height_iris, x: x, y: y, alpha: iris_transparency});
    shapes.push(left_iris);


    zone = f.eyes;
    x = zone.left_x;
    y = zone.y;
    var left_eye_round = a.createPathFromLocalCoordinates(left_eye_line, {
        close_line: true, line_color: eyeliner_color, thickness: eyeliner_thickness
    }, width_eye, height_eye);
    left_eye_round.x = x;
    left_eye_round.y = y;
    left_eye_round.alpha = eyeliner_alpha;
    left_eye_round.rotation = rotation_amount;
    lines.push({name: 'left eye round', line: left_eye_line, shape: left_eye_round, scale_x: width_eye, scale_y: height_eye, x: x, y: y});
    shapes.push(left_eye_round);

    a.namePoint(avatar, 'left eye center', {x: x, y: y});

    zone = f.eyes.pupil;
    x = zone.left_x + (f.thick_unit * iris_side_movement);
    y = zone.y - (6 * f.thick_unit) - (iris_lift * f.thick_unit);
    var left_pupil = new createjs.Shape();
    left_pupil.graphics.beginFill(pupil_color).drawEllipse(zone.left, zone.top, zone.right, zone.bottom);
    left_pupil.x = x;
    left_pupil.y = y;
    left_pupil.alpha = pupil_transparency;
    lines.push({name: 'left pupil', line: [], shape: left_pupil, scale_x: width_pupil, scale_y: height_pupil, x: x, y: y});
    shapes.push(left_pupil);


    //Right Eye
    zone = f.eyes;
    x = zone.right_x;
    y = zone.y;
    var right_eye_line = a.transformShapeLine({type: 'reverse', direction: 'horizontal', axis: 0}, face_options, left_eye_line);
    var right_eye = a.createPathFromLocalCoordinates(right_eye_line, {
            close_line: true, line_color: face_options.skin_colors.darkflesh,
            fill_colors: eye_fill_colors, fill_steps: eye_fill_steps, radius: width_eye * .37, x_offset: +(2 * f.thick_unit)},
        width_eye, height_eye);

    right_eye.x = x;
    right_eye.y = y;
    right_eye.rotation = -rotation_amount;
    lines.push({name: 'right eye', line: right_eye_line, shape: right_eye, scale_x: width_eye, scale_y: height_eye, x: x, y: y, rotation: -rotation_amount});
    shapes.push(right_eye);


    x = zone.right_x;
    y = zone.y - (f.thick_unit * 4);
    var right_eye_line_top = a.transformShapeLine({type: 'reverse', direction: 'horizontal', axis: 0}, face_options, left_eye_line_top);
    var right_eye_top = a.createPathFromLocalCoordinates(right_eye_line_top, {close_line: false, line_color: face_options.skin_colors.cheek, thickness: f.thick_unit * 5}, width_eye, height_eye);
    right_eye_top.x = x;
    right_eye_top.y = y;
    right_eye_top.rotation = -rotation_amount;
    right_eye_top.alpha = eyeline_transparency;
    lines.push({name: 'right eye top', line: right_eye_line_top, shape: right_eye_top, scale_x: width_eye, scale_y: height_eye, x: x, y: y, rotation: -rotation_amount});
    shapes.push(right_eye_top);


    x = zone.right_x - f.thick_unit;
    y = zone.y + (f.thick_unit * 1.5);
    var right_eye_line_bottom = a.transformShapeLine({type: 'reverse', direction: 'horizontal', axis: 0}, face_options, left_eye_line_bottom);
    var right_eye_bottom = a.createPathFromLocalCoordinates(right_eye_line_bottom, {close_line: false, line_color: face_options.skin_colors.darkflesh, thickness: f.thick_unit}, width_eye, height_eye);
    right_eye_bottom.x = x;
    right_eye_bottom.y = y;
    right_eye_bottom.rotation = -rotation_amount;
    right_eye_bottom.alpha = eyeline_transparency;
    lines.push({name: 'right eye bottom', line: right_eye_line_bottom, shape: right_eye_bottom, scale_x: width_eye, scale_y: height_eye, x: x, y: y, rotation: -rotation_amount});
    shapes.push(right_eye_bottom);


    x = zone.right_x;
    y = zone.y - (f.thick_unit * 1.5 * eyebrow_height);
    var right_eyebrow_line_top = a.transformShapeLine({type: 'reverse', direction: 'horizontal', axis: 0}, face_options, left_eyebrow_line_top);
    var right_eyebrow_top = a.createMultiPathFromLocalCoordinates(right_eyebrow_line_top, {
        break_line_every: 5,
        line_color_gradients: [face_options.hair_color, eyebrow_fade_color],
        thickness_gradients: [eyebrow_thick_start, eyebrow_thick_stop],
        x: x, y: y, rotation: -rotation_amount - eyebrow_rotation, alpha: eyebrow_transparency
    }, width_eyebrow, height_eyebrow);
    lines.push({name: 'right eyebrow top set', line: right_eyebrow_line_top, shape: right_eyebrow_top, scale_x: width_eye, scale_y: height_eye, x: x, y: y, rotation: -rotation_amount - eyebrow_rotation, alpha: eyebrow_transparency});
    shapes = shapes.concat(right_eyebrow_top);


    inner_point_x = a.comparePoints(right_eyebrow_line_top, 'x', 'lowest');
    inner_point_y = a.comparePoints(right_eyebrow_line_top, 'y', 'middle');
    inner_point_x = x + (inner_point_x * width_eyebrow / 2 / eye_radius);
    inner_point_y = y + (inner_point_y * height_eyebrow / 2 / eye_radius);
    a.namePoint(avatar, 'right eyebrow innermost', {x: inner_point_x, y: inner_point_y});

    eyebrow_x += inner_point_x;
    a.namePoint(avatar, 'eyebrow midpoint', {x: (eyebrow_x/2), y: eyebrow_y});;


    x = zone.right_x - (f.thick_unit * 4);
    y = zone.y - (f.thick_unit * 8);
    var right_eyebrow_line_inside = a.transformShapeLine({type: 'reverse', direction: 'horizontal', axis: 0}, face_options, left_eyebrow_line_inside);
    var right_eyebrow_inside = a.createPathFromLocalCoordinates(right_eyebrow_line_inside, {close_line: false, line_color: face_options.skin_colors.darkflesh}, width_eye, height_eye);
    right_eyebrow_inside.x = x;
    right_eyebrow_inside.y = y;
    right_eyebrow_inside.rotation = -rotation_amount - 10;
    right_eyebrow_inside.alpha = eyeline_transparency;
    lines.push({name: 'right eyebrow inside', line: right_eyebrow_line_inside, shape: right_eyebrow_inside, scale_x: width_eye, scale_y: height_eye, x: x, y: y, rotation: -rotation_amount - 10});
    shapes.push(right_eyebrow_inside);


    zone = f.eyes.iris;
    x = zone.right_x + (f.thick_unit * iris_side_movement);
    y = zone.y - (f.thick_unit * iris_lift);
    var right_iris_line = a.transformShapeLine({type: 'circle', radius: iris_size}, face_options);
    var right_iris = a.createPathFromLocalCoordinates(right_iris_line, {close_line: true, fill_color: face_options.eye_color}, width_iris, height_iris);
    right_iris.x = x;
    right_iris.y = y;
    right_iris.alpha = iris_transparency;
    lines.push({name: 'right iris', line: right_iris_line, shape: right_iris, scale_x: width_iris, scale_y: height_iris, x: x, y: y, alpha: iris_transparency});
    shapes.push(right_iris);


    zone = f.eyes;
    x = zone.right_x;
    y = zone.y;
    var right_eye_round = a.createPathFromLocalCoordinates(right_eye_line, {
        close_line: true, line_color: eyeliner_color, thickness: eyeliner_thickness
    }, width_eye, height_eye);
    right_eye_round.x = x;
    right_eye_round.y = y;
    right_eye_round.alpha = eyeliner_alpha;
    right_eye_round.rotation = -rotation_amount;
    lines.push({name: 'right eye round', line: right_eye_line, shape: right_eye_round, scale_x: width_eye, scale_y: height_eye, x: x, y: y, rotation: -rotation_amount});
    shapes.push(right_eye_round);

    a.namePoint(avatar, 'right eye center', {x: x, y: y});


    zone = f.eyes.pupil;
    x = zone.right_x + (f.thick_unit * iris_side_movement);
    y = zone.y - (6 * f.thick_unit) - (iris_lift * f.thick_unit);
    var right_pupil = new createjs.Shape();
    right_pupil.graphics.beginFill(pupil_color).drawEllipse(zone.left, zone.top, zone.right, zone.bottom);
    right_pupil.x = x;
    right_pupil.y = y;
    right_pupil.alpha = pupil_transparency;
    lines.push({name: 'right pupil', line: [], shape: right_pupil, scale_x: width_pupil, scale_y: height_pupil, x: x, y: y, alpha: pupil_transparency});
    shapes.push(right_pupil);

    return shapes;
}});

//nose
new Avatar('add_render_function', {style: 'lines', feature: 'nose', renderer: function (face_zones, avatar) {
    var f = face_zones;
    var a = avatar._private_functions;
    var face_options = avatar.face_options;
    var lines = avatar.lines;
    var shapes = [];

    var zone = f.nose;

    var width = zone.radius;
    var height = zone.radius * 1.5;
    var nose_side_offset = 1;
    if (face_options.nose_shape == 'Flat') {
        width *= 0.8;
        nose_side_offset /= 2;
    } else if (face_options.nose_shape == 'Wide') {
        width *= 1.1;
    } else if (face_options.nose_shape == 'Thin') {
        width *= 0.9;
    } else if (face_options.nose_shape == 'Bulbous') {
        width *= 1.2;
        height *= 1.3;
        nose_side_offset++;
    } else if (face_options.nose_shape == 'Giant Nostrils') {
        width *= 1.3;
        height *= 0.8;
        nose_side_offset++;
    }

    var nose_length = 5;
    var thickness = f.thick_unit;
    if (face_options.nose_size == 'Small') {
        nose_length = 4;
    } else if (face_options.nose_size == 'Tiny') {
        nose_length = 3;
    } else if (face_options.nose_size == 'Large') {
        nose_length = 6;
        width *= 1.1;
        height *= 1.1;
        thickness *= 1.1;
    } else if (face_options.nose_size == 'Big') {
        nose_length = 7;
        width *= 1.15;
        height *= 1.3;
        thickness *= 1.4;
        nose_side_offset++;
    } else if (face_options.nose_size == 'Giant') {
        nose_length = 8;
        width *= 1.2;
        height *= 1.4;
        thickness *= 1.5;
        nose_side_offset += 2;
    } else if (face_options.nose_size == 'Huge') {
        nose_length = 9;
        width *= 1.3;
        height *= 1.6;
        thickness *= 2;
        nose_side_offset += 3;
    }

    //Nose bottom line
    var nose_line = [
        {x: 5, y: 5},
        {x: 10, y: 5},
        {x: 8, y: 2},
        {x: 5, y: 5},
        {x: 0, y: 8},
        {x: -5, y: 5},
        {x: -8, y: 2},
        {x: -10, y: 5},
        {x: -5, y: 5},
        {x: 0, y: 8}

    ];
    var x = zone.x;
    var y = zone.y;
    var nose_bottom_squiggle = a.createPathFromLocalCoordinates(nose_line, {
        close_line: true, thickness: 1.2 * thickness,
        color: face_options.skin_colors.deepshadow, fill_color: face_options.skin_colors.deepshadow
    }, width, height);
    nose_bottom_squiggle.x = x;
    nose_bottom_squiggle.y = y;
    lines.push({name: 'nose bottom line', line: nose_line, shape: nose_bottom_squiggle, x: x, y: y, scale_x: width, scale_y: height});

    var inner_point_x = a.comparePoints(nose_line, 'x', 'middle');
    var inner_point_y = a.comparePoints(nose_line, 'y', 'highest');
    inner_point_x = x + (inner_point_x * width / 10);
    inner_point_y = y + (inner_point_y * height / 10);
    a.namePoint(avatar, 'nose squiggle bottom middle', {x: inner_point_x, y: inner_point_y});


    //Sides of nose, that get taller based on size
    var nose_line_side = [
        {x: 12, y: 8},
        {x: 16, y: 3},
        {x: 9, y: -4},
        {x: 7, y: -7},
        {x: 7, y: -12},
        {x: 6, y: -14},
        {x: 7, y: -16},
        {x: 8, y: -18},
        {x: 8, y: -24}
    ];
    var nose_line_l = [];
    var nose_line_r = [];
    var nose_line_l_full = [];
    var nose_line_r_full = [];

    //Find the left eye point, convert it into the nose coordinate scheme, add it to the nose line
    var right_eye_in_point = a.findPoint(avatar, 'right eye innermost');
    right_eye_in_point = a.transformPathFromGlobalCoordinates(right_eye_in_point, width, height, zone.x, zone.y);
    nose_line_side = nose_line_side.concat(right_eye_in_point);

    //Start building the two nose shapes (lines as well as fill)
    for (var i = 0; i < nose_line_side.length; i++) { //Only draw as many points as nose_size
        if (i < nose_length) {
            nose_line_r.push({x: nose_side_offset + nose_line_side[i].x, y: nose_line_side[i].y});
            nose_line_l.push({x: -nose_side_offset + (-1 * nose_line_side[i].x), y: nose_line_side[i].y});
        }
        nose_line_r_full.push({x: nose_side_offset + nose_line_side[i].x, y: nose_line_side[i].y});
        nose_line_l_full.push({x: -nose_side_offset + (-1 * nose_line_side[i].x), y: nose_line_side[i].y});
    }

    var nose_full_line = nose_line_l_full.concat(nose_line_r_full.reverse());
    var full_nose_line = a.transformShapeLine({type: 'smooth'}, face_options, nose_full_line);
    var alpha = 1;

    var nose_top_color = net.brehaut.Color(face_options.skin_colors.skin).lightenByRatio(0.07).toString();
    var face_bright_color = net.brehaut.Color(face_options.skin_colors.skin).lightenByRatio(0.03).toString();
    var nose_fill_colors = [
        face_options.skin_colors.highlights,
        maths.hexColorToRGBA(nose_top_color, .6),
        maths.hexColorToRGBA(face_bright_color, .25)];
    var nose_fill_steps = [0, .7, 1];

    var full_nose = a.createPathFromLocalCoordinates(full_nose_line, {
        close_line: true, thickness: f.thick_unit * .2, line_color: 'rgba(0,0,0,0)',
        fill_colors: nose_fill_colors, fill_method: 'radial',
        fill_steps: nose_fill_steps, y_offset: (5 * f.thick_unit), radius: (50 * f.thick_unit)
    }, width, height);
    full_nose.x = zone.x;
    full_nose.y = zone.y;
    full_nose.alpha = alpha;
    lines.push({name: 'full nose', line: full_nose_line, shape: full_nose, x: zone.x, y: zone.y, scale_x: width, scale_y: height, alpha: alpha});
    shapes = shapes.concat(full_nose);

    shapes.push(nose_bottom_squiggle);

    var l_r = a.createPathFromLocalCoordinates(nose_line_r, {thickness: thickness, color: face_options.skin_colors.cheek}, width, height);
    l_r.x = zone.x;
    l_r.y = zone.y;
    lines.push({name: 'nose right line', line: nose_line_r, shape: l_r, x: zone.x, y: zone.y, scale_x: width, scale_y: height});
    shapes.push(l_r);

    var l_l = a.createPathFromLocalCoordinates(nose_line_l, {thickness: thickness, color: face_options.skin_colors.cheek}, width, height);
    l_l.x = zone.x;
    l_l.y = zone.y;
    lines.push({name: 'nose left line', line: nose_line_l, shape: l_l, x: zone.x, y: zone.y, scale_x: width, scale_y: height});
    shapes.push(l_l);


    var point = a.comparePoints(nose_line_l, 'x', 'lowest', true);
    inner_point_x = x + (point.x * width/10);
    inner_point_y = y + (point.y * height/10);
    a.namePoint(avatar, 'nose left line flaring point', {x: inner_point_x, y: inner_point_y});

    point = a.comparePoints(nose_line_r, 'x', 'highest', true);
    inner_point_x = x + (point.x * width/10);
    inner_point_y = y + (point.y * height/10);
    a.namePoint(avatar, 'nose right line flaring point', {x: inner_point_x, y: inner_point_y});


    //Add point from nose point intersects face
    var face_line = a.transformLineToGlobalCoordinates(lines, 'face');
    var nose_face_x = a.comparePoints(face_line, 'crosses y', inner_point_y);
    a.namePoint(avatar, 'nose - face right point', {x: nose_face_x, y: inner_point_y});

    var mid_face_x = a.comparePoints(face_line, 'x', 'middle');
    var face_line_left = a.lineSegmentCompared(face_line, mid_face_x, 'left');
    nose_face_x = a.comparePoints(face_line_left, 'crosses y', inner_point_y);
    a.namePoint(avatar, 'nose - face left point', {x: nose_face_x, y: inner_point_y});


    //TODO: These should connect to nose
    var mouth_high_left_line = [
        {x: -3.5, y: -4},
        {x: -4, y: -2},
        {x: -3.7, y: 0},
        {x: -3.5, y: 2}
    ];
    x = f.mouth.x;
    y = f.mouth.y - (f.thick_unit * 24);

    var l5 = a.createPathFromLocalCoordinates(mouth_high_left_line, {close_line: false, thickness: 0, color: face_options.skin_colors.deepshadow, fill_color: 'pink'}, width, height);
    l5.x = x;
    l5.y = y;
    l5.alpha = 0.5;
    lines.push({name: 'above lip left line', line: mouth_high_left_line, shape: l5, x: f.mouth.x, y: f.mouth.y - (f.thick_unit * 24), scale_x: width, scale_y: height});
    shapes.push(l5);

    var mouth_high_right_line = a.transformShapeLine({type: 'reverse'}, face_options, mouth_high_left_line);
    var l6 = a.createPathFromLocalCoordinates(mouth_high_right_line, {close_line: false, thickness: 0, color: face_options.skin_colors.deepshadow, fill_color: 'pink'}, width, height);
    l6.x = x;
    l6.y = y;
    l6.alpha = 0.5;
    lines.push({name: 'above lip right line', line: mouth_high_right_line, shape: l6, x: f.mouth.x, y: f.mouth.y - (f.thick_unit * 24), scale_x: width, scale_y: height});
    shapes.push(l6);


    point = a.comparePoints(mouth_high_left_line, 'x', 'lowest', true);
    inner_point_x = x + (point.x * width/10);
    inner_point_y = y + (point.y * height/10);
    a.namePoint(avatar, 'nose-lip left line middle point', {x: inner_point_x, y: inner_point_y});

    point = a.comparePoints(mouth_high_right_line, 'x', 'highest', true);
    inner_point_x = x + (point.x * width/10);
    inner_point_y = y + (point.y * height/10);
    a.namePoint(avatar, 'nose-lip right line middle point', {x: inner_point_x, y: inner_point_y});

    return shapes;
}});

//wrinkles
new Avatar('add_render_function', {style: 'lines', feature: 'wrinkles', renderer: function (face_zones, avatar) {
    var f = face_zones;
    var a = avatar._private_functions;
    var face_options = avatar.face_options;
    var lines = avatar.lines;
    var shapes = [];

    var wrinkle_resistance = a.turnWordToNumber(face_options.wrinkle_resistance, 50, -100);
    var wrinkle_age = face_options.age + wrinkle_resistance;

    var wrinkle_lines = parseInt(wrinkle_age / 15);
    var head_line = a.transformLineToGlobalCoordinates(lines, 'face');
    var left_eye_line = a.transformLineToGlobalCoordinates(lines, 'left eye');

    head_line = a.hydratePointsAlongLine(head_line, f.thick_unit * 30);

    var hair_line = a.lineSegmentCompared(head_line, left_eye_line, 'above');

    if (hair_line && hair_line.length) {
//        var hair_dot_array = a.createPath(hair_line, {close_line: true, thickness: f.thick_unit * 5, line_color: face_options.hair_color});
//        lines.push({name: 'hair dot line', line: hair_line, shape: hair_dot_array, x: 0, y: 0, scale_x: 1, scale_y: 1});
//            shapes = shapes.concat(hair_dot_array);

        var mid_x = a.comparePoints(hair_line, 'x', 'middle');
        var mid_y = a.comparePoints(hair_line, 'y', 'middle') + (f.thick_unit * 30);
        var base_width = (f.thick_unit * 220);
        var height = (f.thick_unit * 100);

        a.namePoint(avatar, 'hair line mid point', {x: mid_x, y: mid_y});

        var forehead_wrinkle_line = [
            {x: -4, y: 0},
            {x: -3, y: -.5},
            {x: -1, y: 0},
            {x: -.5, y: -.5},
            {x: 0, y: -.5},
            {x: .5, y: -.5},
            {x: 1, y: 0},
            {x: 3, y: -.5},
            {x: 4, y: 0}
        ];

        var x, y, width;
        var alpha = .2;

        if (face_options.gender == 'Female') {
            alpha /= 3;
        }

        for (var i = 0; i < wrinkle_lines; i++) {
            width = base_width - (f.thick_unit * i * 25);
            var forehead_wrinkle = a.createPathFromLocalCoordinates(forehead_wrinkle_line, {close_line: false, thickness: (f.thick_unit * 2), color: face_options.skin_colors.deepshadow}, width, height);
            x = mid_x;
            y = mid_y - (f.thick_unit * i * 15);
            forehead_wrinkle.x = x;
            forehead_wrinkle.y = y;
            forehead_wrinkle.alpha = alpha;
            lines.push({name: 'forehead wrinkle line ' + i, line: forehead_wrinkle_line, shape: forehead_wrinkle, x: x, y: y, alpha: alpha, scale_x: width, scale_y: height});
            shapes.push(forehead_wrinkle);
        }
    }

    var right_eye_line = a.transformLineToGlobalCoordinates(lines, 'right eye');
    mid_x = a.comparePoints(head_line, 'x', 'middle');
    mid_y = right_eye_line[0].y;
    x = mid_x - (f.thick_unit * 10);
    y = mid_y - (f.thick_unit * 25);

    var mid_nose_divot_line = [
        {x: -1, y: -3},
        {x: 0, y: -1.5},
        {x: -.5, y: 3}
    ];

    height /= 1.2;
    var divot_line = a.createPathFromLocalCoordinates(mid_nose_divot_line, {close_line: false, thickness: (f.thick_unit * 2), color: face_options.skin_colors.deepshadow}, width, height);
    alpha = (wrinkle_age / 350);
    divot_line.x = x;
    divot_line.y = y;
    divot_line.alpha = alpha;
    lines.push({name: 'mid nose divot line', line: mid_nose_divot_line, shape: divot_line, x: x, y: y, alpha: alpha, scale_x: width, scale_y: height});
    shapes.push(divot_line);

    var divot_line_r_2 = a.transformShapeLine({type: 'reverse', direction: 'horizontal'}, face_options, mid_nose_divot_line);
    var divot_line_2 = a.createPathFromLocalCoordinates(divot_line_r_2, {close_line: false, thickness: (f.thick_unit * 2), color: face_options.skin_colors.deepshadow}, width, height);
    x = mid_x + (f.thick_unit * 10);
    divot_line_2.x = x;
    divot_line_2.y = y;
    divot_line_2.alpha = alpha;
    lines.push({name: 'mid nose divot line 2', line: divot_line_r_2, shape: divot_line_2, x: x, y: y, alpha: alpha, scale_x: width, scale_y: height});
    shapes.push(divot_line_2);

    var nose_divot_line = [
        {x: 0, y: -3},
        {x: 0, y: -1.5},
        {x: 0, y: 1.5},
        {x: 0, y: 3}
    ];
    height *= (wrinkle_age / 50);
    var divot_line_3 = a.createPathFromLocalCoordinates(nose_divot_line, {close_line: false, thickness: (f.thick_unit), color: face_options.skin_colors.deepshadow}, width, height);
    x = mid_x;
    y = mid_y - (f.thick_unit * 35);
    alpha = (wrinkle_age / 400);
    divot_line_3.x = x;
    divot_line_3.y = y;
    divot_line_3.alpha = alpha;
    lines.push({name: 'mid nose divot line', line: nose_divot_line, shape: divot_line_3, x: x, y: y, alpha: alpha, scale_x: width, scale_y: height});
    shapes.push(divot_line_3);

    var mouth_line = a.transformLineToGlobalCoordinates(lines, 'lips');
    var mouth_left_point = a.comparePoints(mouth_line, 'x', 'lowest', true);
    var mouth_right_point = a.comparePoints(mouth_line, 'x', 'highest', true);

    var mouth_side_lines_height_up = 6;
    if (face_options.mouth_upturn == "Large") {
        mouth_side_lines_height_up = 6;
    } else if (face_options.mouth_upturn == "Short") {
        mouth_side_lines_height_up = 4;
    } else if (face_options.mouth_upturn == "Small") {
        mouth_side_lines_height_up = 2;
    } else if (face_options.mouth_upturn == "Tiny") {
        mouth_side_lines_height_up = 0;
    }
    var mouth_side_lines_height_down = 6;
    if (face_options.mouth_upturn == "Large") {
        mouth_side_lines_height_down = 6;
    } else if (face_options.mouth_upturn == "Short") {
        mouth_side_lines_height_down = 4;
    } else if (face_options.mouth_upturn == "Small") {
        mouth_side_lines_height_down = 2;
    } else if (face_options.mouth_upturn == "Tiny") {
        mouth_side_lines_height_down = 0;
    }


    var mouth_side_lines_width = 1;
    if (mouth_side_lines_height_up + mouth_side_lines_height_down > 0) {
        //TODO: Convert to path
        var left_mouth_wrinkle = [];
        left_mouth_wrinkle.push({x: mouth_left_point.x - (f.thick_unit * mouth_side_lines_width), y: mouth_left_point.y - (f.thick_unit * mouth_side_lines_height_up)});
        left_mouth_wrinkle.push({x: mouth_left_point.x - (f.thick_unit * mouth_side_lines_width), y: mouth_left_point.y - (f.thick_unit * mouth_side_lines_height_up * .5)});
        left_mouth_wrinkle.push({x: mouth_left_point.x + (f.thick_unit), y: mouth_left_point.y});
        left_mouth_wrinkle.push({x: mouth_left_point.x - (f.thick_unit * mouth_side_lines_width), y: mouth_left_point.y + (f.thick_unit * mouth_side_lines_height_down * .5)});
        left_mouth_wrinkle.push({x: mouth_left_point.x - (f.thick_unit * mouth_side_lines_width), y: mouth_left_point.y + (f.thick_unit * mouth_side_lines_height_down)});

        var left_mouth_curve1 = a.createPath(left_mouth_wrinkle, {
            thickness: 2 * f.thick_unit, line_color: face_options.skin_colors.darkflesh
        });
        shapes.push(left_mouth_curve1);

        var right_mouth_wrinkle = [];
        right_mouth_wrinkle.push({x: mouth_right_point.x + (f.thick_unit * mouth_side_lines_width), y: mouth_right_point.y - (f.thick_unit * mouth_side_lines_height_up)});
        right_mouth_wrinkle.push({x: mouth_right_point.x + (f.thick_unit * mouth_side_lines_width), y: mouth_right_point.y - (f.thick_unit * mouth_side_lines_height_up * .5)});
        right_mouth_wrinkle.push({x: mouth_right_point.x - (f.thick_unit), y: mouth_right_point.y});
        right_mouth_wrinkle.push({x: mouth_right_point.x + (f.thick_unit * mouth_side_lines_width), y: mouth_right_point.y + (f.thick_unit * mouth_side_lines_height_down * .5)});
        right_mouth_wrinkle.push({x: mouth_right_point.x + (f.thick_unit * mouth_side_lines_width), y: mouth_right_point.y + (f.thick_unit * mouth_side_lines_height_down)});

        var right_mouth_curve1 = a.createPath(right_mouth_wrinkle, {
            thickness: 2 * f.thick_unit, line_color: face_options.skin_colors.darkflesh
        });
        shapes.push(right_mouth_curve1);


    }

    //Lines to nose-mouth wrinkles uses wrinkle_mouth_width/height
    var chin_top_line = a.transformLineToGlobalCoordinates(lines, 'chin top line');
    var left_chin_line_point = a.comparePoints(chin_top_line, 'x', 'lowest', true);
    var right_chin_line_point = a.comparePoints(chin_top_line, 'x', 'highest', true);
    var nose_full_line = a.transformLineToGlobalCoordinates(lines, 'full nose');
    if (wrinkle_age > 16) {
        var mouth_line_curve_alpha = (wrinkle_age - 15) / 150;
        if (face_options.gender == 'Female') {
            mouth_line_curve_alpha /= 3;
        }

        //Left chin mouth line
        var left_nose_round_top_point = nose_full_line[2];

        var left_nose_mouth_wrinkle = [];

        left_nose_round_top_point.x -= (f.thick_unit * .5);
        left_nose_round_top_point.y -= (f.thick_unit * 5);
        left_nose_mouth_wrinkle.push(_.clone(left_nose_round_top_point));

        left_nose_round_top_point.x -= (f.thick_unit * 8);
        left_nose_round_top_point.y -= (f.thick_unit * 5);
        left_nose_mouth_wrinkle.push(_.clone(left_nose_round_top_point));

        mouth_left_point.x -= (f.thick_unit * 25);
        mouth_left_point.y += (f.thick_unit * 8);
        if (face_options.wrinkle_mouth_width == "Far Out") {
            mouth_left_point.x -= (f.thick_unit * 8)
        } else if (face_options.wrinkle_mouth_width == "Out") {
            mouth_left_point.x -= (f.thick_unit * 3)
        } else if (face_options.wrinkle_mouth_width == "In") {
            mouth_left_point.x += (f.thick_unit * 3)
        } else if (face_options.wrinkle_mouth_width == "Far In") {
            mouth_left_point.x += (f.thick_unit * 8)
        }

        var mid_point;
        mid_point = (mouth_left_point.y + left_nose_round_top_point.y) / 2 - (f.thick_unit * 5);
        left_nose_mouth_wrinkle.push({x: mouth_left_point.x - (f.thick_unit), y: mid_point});

        mid_point = (mouth_left_point.y + left_nose_round_top_point.y) / 2;
        left_nose_mouth_wrinkle.push({x: mouth_left_point.x, y: mid_point});


        if (face_options.wrinkle_mouth_height == "Far Up") {
            mouth_left_point.y -= (f.thick_unit * 10)
        } else if (face_options.wrinkle_mouth_height == "Up") {
            mouth_left_point.y -= (f.thick_unit * 5)
        } else if (face_options.wrinkle_mouth_height == "Down") {
            mouth_left_point.y += (f.thick_unit * 5)
        } else if (face_options.wrinkle_mouth_height == "Far Down") {
            mouth_left_point.y += (f.thick_unit * 10)
        }
        left_nose_mouth_wrinkle.push(mouth_left_point);

        left_chin_line_point.x -= (f.thick_unit * 4);
        left_nose_mouth_wrinkle.push(left_chin_line_point);


        //Right chin mouth line
        var right_nose_round_top_point = nose_full_line[nose_full_line.length - 3];

        var right_nose_mouth_wrinkle = [];

        right_nose_round_top_point.x += (f.thick_unit * .5);
        right_nose_round_top_point.y -= (f.thick_unit * 5);
        right_nose_mouth_wrinkle.push(_.clone(right_nose_round_top_point));

        right_nose_round_top_point.x += (f.thick_unit * 8);
        right_nose_round_top_point.y -= (f.thick_unit * 5);
        right_nose_mouth_wrinkle.push(_.clone(right_nose_round_top_point));

        mouth_right_point.x += (f.thick_unit * 25);
        mouth_right_point.y += (f.thick_unit * 8);
        if (face_options.wrinkle_mouth_width == "Far Out") {
            mouth_right_point.x += (f.thick_unit * 8)
        } else if (face_options.wrinkle_mouth_width == "Out") {
            mouth_right_point.x += (f.thick_unit * 3)
        } else if (face_options.wrinkle_mouth_width == "In") {
            mouth_right_point.x -= (f.thick_unit * 3)
        } else if (face_options.wrinkle_mouth_width == "Far In") {
            mouth_right_point.x -= (f.thick_unit * 8)
        }

        mid_point = (mouth_right_point.y + right_nose_round_top_point.y) / 2 - (f.thick_unit * 5);
        right_nose_mouth_wrinkle.push({x: mouth_right_point.x + (f.thick_unit), y: mid_point});

        mid_point = (mouth_right_point.y + right_nose_round_top_point.y) / 2;
        right_nose_mouth_wrinkle.push({x: mouth_right_point.x, y: mid_point});

        if (face_options.wrinkle_mouth_height == "Far Up") {
            mouth_right_point.y -= (f.thick_unit * 10)
        } else if (face_options.wrinkle_mouth_height == "Up") {
            mouth_right_point.y -= (f.thick_unit * 5)
        } else if (face_options.wrinkle_mouth_height == "Down") {
            mouth_right_point.y += (f.thick_unit * 5)
        } else if (face_options.wrinkle_mouth_height == "Far Down") {
            mouth_right_point.y += (f.thick_unit * 10)
        }
        right_nose_mouth_wrinkle.push(mouth_right_point);

        right_chin_line_point.x += (f.thick_unit * 4);
        right_nose_mouth_wrinkle.push(right_chin_line_point);

        // Add 3 lines of different thickness to each side
        //                  -thick---   -alpha-  -movex-
        var alpha_widths = [16, 8, 10, 5, 4, .5, 10, 2, 1];

        var curve_thick1 = alpha_widths[0] * f.thick_unit;
        var curve_thick3 = alpha_widths[2] * f.thick_unit;

        if (face_options.gender == 'Female') {
            curve_thick1 /= 4;
            curve_thick3 /= 4;
        }

        var curve_thicknessess = [1, .5, .2, .1, 0, .05, 0];

        if (face_options.wrinkle_pattern_mouth == "None") {
            curve_thicknessess = [0];
        } else if (face_options.wrinkle_pattern_mouth == "Gentle") {
            curve_thicknessess = [.4, .3, .2, .1, .1, .05, .1];
        } else if (face_options.wrinkle_pattern_mouth == "Straight") {
            curve_thicknessess = [1, .7, .6, .4, .5, .4, .3];
        } else if (face_options.wrinkle_pattern_mouth == "Middle") {
            curve_thicknessess = [.3, .2, .7, .7, .6, .1, 0];
        } else if (face_options.wrinkle_pattern_mouth == "Bottom") {
            curve_thicknessess = [.3, .1, 0, .3, .3, .7, .6];
        } else if (face_options.wrinkle_pattern_mouth == "Heavy") {
            curve_thicknessess = [1, .9, .8, .9, .7, .8, .4];
        }
        for (var piece = 0; piece < curve_thicknessess.length; piece++) {
            curve_thicknessess[piece] *= (wrinkle_age / 200);
        }

        var curve_thicknessess1 = _.map(curve_thicknessess, function (b) {
            return maths.clamp(b * curve_thick1, 0, 8)
        });
        var curve_thicknessess3 = _.map(curve_thicknessess, function (b) {
            return maths.clamp(b * curve_thick3, 0, 5)
        });

        var curve_settings1 = {
            break_line_every: 5,
            thickness_gradients: curve_thicknessess1,
            alpha: maths.clamp(mouth_line_curve_alpha / alpha_widths[3], 0, .6),
            line_color: face_options.skin_colors.darkflesh
        };
        var curve_settings3 = {
            break_line_every: 20,
            thickness_gradients: curve_thicknessess3,
            alpha: maths.clamp(mouth_line_curve_alpha / alpha_widths[5], 0, .5),
            line_color: face_options.skin_colors.cheek
        };

        var left_nose_curve1 = a.createMultiPath(left_nose_mouth_wrinkle, curve_settings1);
        left_nose_curve1.x = -(alpha_widths[6] * f.thick_unit);
        var left_nose_curve3 = a.createMultiPath(left_nose_mouth_wrinkle, curve_settings3);
        left_nose_curve3.x = -(alpha_widths[8] * f.thick_unit);

        var right_nose_curve1 = a.createMultiPath(right_nose_mouth_wrinkle, curve_settings1);
        right_nose_curve1.x = (alpha_widths[6] * f.thick_unit);
        var right_nose_curve3 = a.createMultiPath(right_nose_mouth_wrinkle, curve_settings3);
        right_nose_curve3.x = (alpha_widths[8] * f.thick_unit);

        shapes.push(left_nose_curve1);
        shapes.push(left_nose_curve3);
        shapes.push(right_nose_curve1);
        shapes.push(right_nose_curve3);
    }


    // Cheekbones
    var chin_bottom_line = a.transformLineToGlobalCoordinates(lines, 'chin bottom line');
    var right_cheekbone_wrinkle = [];
    var right_cheekbone_wrinkle_curve1;
    var chin_bottom_line_right = _.clone(a.comparePoints(chin_bottom_line, 'x', 'highest', true));
    var left_cheekbone_wrinkle = [];
    var left_cheekbone_wrinkle_curve1;
    var axis;
    var eye_right_right = a.comparePoints(right_eye_line, 'x', 'highest');
    var eye_left_left = a.comparePoints(left_eye_line, 'x', 'lowest');


    //Cheek color ovals
    var right_cheek_oval = head_line;//a.transformShapeLine({type: 'oval',radius: 60 * f.thick_unit});
    var skin_lighter = maths.hexColorToRGBA(face_options.skin_colors.skin, .1);
    var cheek_darker = maths.hexColorToRGBA(face_options.skin_colors.skin, 1);

    var fill_colors = [cheek_darker, skin_lighter];
    var fill_steps = [.1, 1];

    var nose_bottom_y = a.comparePoints(nose_full_line, 'y', 'highest');
    var cheek_y = (nose_bottom_y + mid_y) / 2;

    var right_cheek = a.createPath(right_cheek_oval, {
        close_line: true, thickness: f.thick_unit,
        line_color: 'rgba(0,0,0,0)',
        fill_colors: fill_colors, fill_method: 'radial',
        x_offset_start: eye_right_right - (f.thick_unit * 5),
        x_offset_end: eye_right_right - (f.thick_unit * 5),
        y_offset_start: cheek_y,
        y_offset_end: cheek_y,
        fill_steps: fill_steps, radius: (f.thick_unit * 75)
    });
    shapes.push(right_cheek);

    var left_cheek = a.createPath(right_cheek_oval, {
        close_line: true, thickness: f.thick_unit,
        line_color: 'rgba(0,0,0,0)',
        fill_colors: fill_colors, fill_method: 'radial',
        x_offset_start: eye_left_left + (f.thick_unit * 5),
        x_offset_end: eye_left_left + (f.thick_unit * 5),
        y_offset_start: cheek_y,
        y_offset_end: cheek_y,
        fill_steps: fill_steps, radius: (f.thick_unit * 75)
    });
    shapes.push(left_cheek);


    a.namePoint(avatar, 'right cheek', {x: eye_right_right, y: cheek_y});
    a.namePoint(avatar, 'left cheek', {x: eye_left_left, y: cheek_y});


    //Cheek lines
    mid_y = right_eye_line[0].y;
    var cheekbone_lines = [];

    if (face_options.gender == 'Male') {
        cheekbone_lines.push("140-180");
    }
    if (face_options.gender == 'Female') {
//        cheekbone_lines.push("L");
    }

    if (_.indexOf(cheekbone_lines, 'J') > -1) {

        mid_x = a.comparePoints(head_line, 'x', 'highest');
        right_cheekbone_wrinkle.push({x: mid_x, y: mid_y});

        x = mid_x - (f.thick_unit * 30);
        y = mid_y + (f.thick_unit * 25);

        right_cheekbone_wrinkle.push({x: x, y: y});
        right_cheekbone_wrinkle.push({x: x, y: y}); //TODO: Play with these

        right_cheekbone_wrinkle.push({x: eye_right_right, y: mouth_right_point.y});

        var chin_point = _.clone(chin_bottom_line_right);
        chin_point.y += 20 * f.thick_unit;
        var newPoint = a.comparePoints(head_line, 'closest', chin_point);
        right_cheekbone_wrinkle.push(newPoint);

        right_cheekbone_wrinkle_curve1 = a.createPath(right_cheekbone_wrinkle, {
            break_line_every: 20,
            thickness_gradients: [16 * f.thick_unit, 3.5 * f.thick_unit, 0],
            line_color: face_options.skin_colors.darkflesh,
            alpha: .25
        });
        shapes.push(right_cheekbone_wrinkle_curve1);


        axis = a.comparePoints(chin_bottom_line, 'x', 'middle');
        left_cheekbone_wrinkle = a.transformShapeLine({type: 'reverse', axis: axis}, face_options, right_cheekbone_wrinkle);
        left_cheekbone_wrinkle_curve1 = a.createPath(left_cheekbone_wrinkle, {
            break_line_every: 20,
            thickness_gradients: [16 * f.thick_unit, 3.5 * f.thick_unit, 0],
            line_color: face_options.skin_colors.darkflesh,
            alpha: .25
        });
        shapes.push(left_cheekbone_wrinkle_curve1);

    }


//TODO: Have a "half-to" or "fifth-to" function
    var cheek_line_options = {
        break_line_every: 20, dot_array: false,
        thickness_gradients: [12 * f.thick_unit, 3.5 * f.thick_unit, 0],
        line_color: face_options.skin_colors.darkflesh,
        alpha: wrinkle_age / 200
    };

    if (_.indexOf(cheekbone_lines, '140-180') > -1) {

        mid_x = a.comparePoints(head_line, 'x', 'highest');

        right_cheekbone_wrinkle.push({x: mid_x - (5 * f.thick_unit), y: mid_y + (3 * f.thick_unit)});
        right_cheekbone_wrinkle.push({x: mid_x - (10 * f.thick_unit), y: mid_y - (1 * f.thick_unit)});

        right_nose_round_top_point = nose_full_line[nose_full_line.length - 3];

        right_cheekbone_wrinkle.push({x: eye_right_right, y: right_nose_round_top_point.y});
        right_cheekbone_wrinkle.push({x: eye_right_right - (10 * f.thick_unit), y: right_nose_round_top_point.y + (6 * f.thick_unit) });

        //Curves 1
        right_cheekbone_wrinkle_curve1 = a.createPath(right_cheekbone_wrinkle, cheek_line_options);
        shapes.push(right_cheekbone_wrinkle_curve1);
        axis = a.comparePoints(chin_bottom_line, 'x', 'middle');
        left_cheekbone_wrinkle = a.transformShapeLine({type: 'reverse', axis: axis}, face_options, right_cheekbone_wrinkle);
        left_cheekbone_wrinkle_curve1 = a.createPath(left_cheekbone_wrinkle, cheek_line_options);
        shapes.push(left_cheekbone_wrinkle_curve1);


        var right_cheekbone_wrinkle2 = [];
        right_cheekbone_wrinkle2.push({x: eye_right_right, y: right_nose_round_top_point.y});

        right_cheekbone_wrinkle2.push({x: eye_right_right, y: right_nose_round_top_point.y});

        right_cheekbone_wrinkle2.push({x: eye_right_right - (1 * f.thick_unit), y: mouth_right_point.y});


        var chin_point = _.clone(chin_bottom_line_right);
        chin_point.y += 20 * f.thick_unit;
        var newPoint = a.comparePoints(head_line, 'closest', chin_point);
        right_cheekbone_wrinkle2.push({x: newPoint.x, y: newPoint.y - (2 * f.thick_unit)});

        //Curves 2
        var right_cheekbone_wrinkle_curve2 = a.createPath(right_cheekbone_wrinkle2, cheek_line_options);
        shapes.push(right_cheekbone_wrinkle_curve2);
        axis = a.comparePoints(chin_bottom_line, 'x', 'middle');
        left_cheekbone_wrinkle = a.transformShapeLine({type: 'reverse', axis: axis}, face_options, right_cheekbone_wrinkle2);
        var left_cheekbone_wrinkle_curve2 = a.createPath(left_cheekbone_wrinkle, cheek_line_options);
        shapes.push(left_cheekbone_wrinkle_curve2);


    }


    if (_.indexOf(cheekbone_lines, 'L') > -1) {

        mid_x = a.comparePoints(head_line, 'x', 'highest');
        x = mid_x - (f.thick_unit * 10);
        right_cheekbone_wrinkle.push({x: x, y: mid_y});

        right_cheekbone_wrinkle.push({x: eye_right_right, y: mouth_right_point.y});

        chin_bottom_line_right.x += 10 * f.thick_unit;
        right_cheekbone_wrinkle.push(chin_bottom_line_right);

        right_cheekbone_wrinkle_curve1 = a.createPath(right_cheekbone_wrinkle, {
            break_line_every: 20,
            thickness_gradients: [12 * f.thick_unit, 3.5 * f.thick_unit, 0],
            line_color: face_options.skin_colors.darkflesh,
            alpha: .25
        });
        shapes.push(right_cheekbone_wrinkle_curve1);

        axis = a.comparePoints(chin_bottom_line, 'x', 'middle');
        left_cheekbone_wrinkle = a.transformShapeLine({type: 'reverse', axis: axis}, face_options, right_cheekbone_wrinkle);
        left_cheekbone_wrinkle_curve1 = a.createPath(left_cheekbone_wrinkle, {
            break_line_every: 20,
            thickness_gradients: [12 * f.thick_unit, 3.5 * f.thick_unit, 0],
            line_color: face_options.skin_colors.darkflesh,
            alpha: .25
        });
        shapes.push(left_cheekbone_wrinkle_curve1);
    }


    return shapes;
}});

//chin
new Avatar('add_render_function', {style: 'lines', feature: 'chin', renderer: function (face_zones, avatar) {
    var f = face_zones;
    var a = avatar._private_functions;
    var face_options = avatar.face_options;
    var lines = avatar.lines;
    var shapes = [];

    var mouth_width = 1; //.6 - 1.3
    var width = (f.mouth.right - f.mouth.left) / 2.6 * mouth_width;
    var height = (f.mouth.bottom - f.mouth.top);

    var chin_line = [
        {x: -5, y: 0},
        {x: 0, y: 1},
        {x: 5, y: 0}
    ];
    var chin_top_line = a.createPathFromLocalCoordinates(chin_line, {close_line: false, thickness: (f.thick_unit * 2), color: face_options.skin_colors.deepshadow}, width, height);
    var x = f.mouth.x;
    var y = f.mouth.y + (f.thick_unit * 30);
    var alpha = .5;
    chin_top_line.x = x;
    chin_top_line.y = y;
    chin_top_line.alpha = alpha;
    lines.push({name: 'chin top line', line: chin_line, shape: chin_top_line, x: x, y: y, alpha: alpha, scale_x: width, scale_y: height});
    shapes.push(chin_top_line);

    a.namePoint(avatar, 'chin top line', {x: x, y: y});


    var chin_mid_line = a.createPathFromLocalCoordinates(chin_line, {close_line: false, thickness: (f.thick_unit * 7), color: face_options.skin_colors.deepshadow}, width * .9, height);
    x = f.mouth.x;
    y = f.mouth.y + (f.thick_unit * 32);
    alpha = .2;
    chin_mid_line.x = x;
    chin_mid_line.y = y;
    chin_mid_line.alpha = alpha;
    lines.push({name: 'chin mid line', line: chin_line, shape: chin_mid_line, x: x, y: y, alpha: alpha, scale_x: width * .9, scale_y: height});
    shapes.push(chin_mid_line);

    var chin_line_lower = [
        {x: -5, y: 1},
        {x: 0, y: 0},
        {x: 5, y: 1}
    ];
    width *= 1.5;
    var chin_under_line = a.createPathFromLocalCoordinates(chin_line_lower, {close_line: false, thickness: (f.thick_unit * 1.5), color: face_options.skin_colors.deepshadow}, width, height);
    x = f.mouth.x;
    y = f.mouth.y + (f.thick_unit * 45);
    alpha = .15;
    chin_under_line.x = x;
    chin_under_line.y = y;
    chin_under_line.alpha = alpha;
    lines.push({name: 'chin bottom line', line: chin_line_lower, shape: chin_under_line, x: x, y: y, alpha: alpha, scale_x: width, scale_y: height});
    shapes.push(chin_under_line);

    a.namePoint(avatar, 'chin bottom line', {x: x, y: y});

    var head_line = a.transformLineToGlobalCoordinates(lines, 'face');
    var chin_mid_line_piece = a.transformLineToGlobalCoordinates(lines, 'chin mid line');
    var chin = a.lineSegmentCompared(head_line, chin_mid_line_piece, 'below', f.thick_unit * -5);

    var chin_fill_colors = [face_options.skin_colors.cheek, face_options.skin_colors.skin];
    var chin_fill_steps = [0, 1];
    var chin_height, chin_shape;
    if (face_options.chin_shape == 'Pronounced') {
        //TODO: This could use some work to make it look more realistic

        if (chin && chin.length && chin.length > 2 && face_options.age < 20) {
            chin = a.transformShapeLine({type: 'contract', multiplier: 0.7}, face_options, chin);
            chin_height = a.comparePoints(chin, 'height');

            chin_shape = a.createPath(chin, {
                close_line: true, thickness: f.thick_unit, smooth: true, line_color: face_options.skin_colors.skin,
                fill_colors: chin_fill_colors, fill_method: 'radial',
                fill_steps: chin_fill_steps, radius: chin_height / 1.5
            });
            chin_shape.y = (f.thick_unit * 10);
            shapes.push(chin_shape);
        }

    } else if (face_options.chin_shape == 'Oval') {

        if (chin && chin.length && chin.length > 2 && face_options.age < 20) {
            chin_height = a.comparePoints(chin, 'height');

            chin_shape = a.createPath(chin, {
                close_line: true, thickness: f.thick_unit, smooth: true, line_color: face_options.skin_colors.skin,
                fill_colors: chin_fill_colors, fill_method: 'radial',
                fill_steps: chin_fill_steps, radius: chin_height / 2
            });
            chin_shape.y = -f.thick_unit;
            shapes.push(chin_shape);
        }
    }

    var draw_divot = false;
    if (face_options.chin_divot == 'Small') {
        draw_divot = true;
        height /= 2;
    } else if (face_options.chin_divot == 'Large') {
        draw_divot = true;
    } else if (face_options.chin_divot == 'Double') {
        draw_divot = true;
    }

    if (draw_divot && face_options.age < 20) {
        var mid_x = a.comparePoints(chin, 'x', 'middle');
        var mid_y = a.comparePoints(chin, 'y', 'middle');

        var chin_divot_line = [
            {x: 0, y: -3},
            {x: 0, y: 0},
            {x: -.5, y: 3}
        ];

        var divot_line = a.createPathFromLocalCoordinates(chin_divot_line, {close_line: false, thickness: (f.thick_unit * 5), color: face_options.skin_colors.deepshadow}, width, height);
        x = mid_x - (f.thick_unit);
        y = mid_y + (f.thick_unit * 8);
        alpha = .1;
        divot_line.x = x;
        divot_line.y = y;
        divot_line.alpha = alpha;
        lines.push({name: 'chin divot line', line: chin_divot_line, shape: divot_line, x: x, y: y, alpha: alpha, scale_x: width, scale_y: height});
        shapes.push(divot_line);

        if (face_options.chin_divot == 'Double') {
            chin_divot_line = a.transformShapeLine({type: 'reverse', direction: 'horizontal'}, face_options, chin_divot_line);
            var divot_line_2 = a.createPathFromLocalCoordinates(chin_divot_line, {close_line: false, thickness: (f.thick_unit * 5), color: face_options.skin_colors.deepshadow}, width, height);
            divot_line_2.x = x + (f.thick_unit * 6);
            divot_line_2.y = y;
            divot_line_2.alpha = alpha;
            divot_line_2.name = 'chin divot line 2';
            lines.push({name: 'chin divot line 2', line: chin_divot_line, shape: divot_line_2, x: x, y: y, alpha: alpha, scale_x: width, scale_y: height});
            shapes.push(divot_line_2);
        }
    }

    //Add point from nose point intersects face
    var face_line = a.transformLineToGlobalCoordinates(lines, 'face');
    var chin_bottom = a.comparePoints(face_line, 'y', 'highest', true);

    a.namePoint(avatar, 'chin bottom point', {x: x, y:chin_bottom.y});



    return shapes;
}});

//mouth
new Avatar('add_render_function', {style: 'lines', feature: 'mouth', renderer: function (face_zones, avatar) {
    var f = face_zones;
    var a = avatar._private_functions;
    var face_options = avatar.face_options;
    var lines = avatar.lines;
    var shapes = [];

    //These can change expression alot
    var mouth_width = 1; //.6 - 1.3
    if (face_options.mouth_width == "Tiny") {
        mouth_width = .7;
    } else if (face_options.mouth_width == "Small") {
        mouth_width = .8;
    } else if (face_options.mouth_width == "Short") {
        mouth_width = .9;
    } else if (face_options.mouth_width == "Normal") {
        mouth_width = 1;
    } else if (face_options.mouth_width == "Big") {
        mouth_width = 1.05;
    } else if (face_options.mouth_width == "Wide") {
        mouth_width = 1.1;
    }

    var lip_bottom_height = 0.5; // 0 - 2
    if (face_options.lip_bottom_height == "Down") {
        lip_bottom_height = 0;
    } else if (face_options.lip_bottom_height == "Low") {
        lip_bottom_height = .25;
    } else if (face_options.lip_bottom_height == "Raised") {
        lip_bottom_height = 1;
    } else if (face_options.lip_bottom_height == "High") {
        lip_bottom_height = 1.3;
    }

    var lip_bottom_bottom = 1.5; // 1-5
    if (face_options.lip_bottom_bottom == "Down") {
        lip_bottom_bottom = 1;
    } else if (face_options.lip_bottom_bottom == "Low") {
        lip_bottom_bottom = 1.2;
    } else if (face_options.lip_bottom_bottom == "Raised") {
        lip_bottom_bottom = 2;
    } else if (face_options.lip_bottom_bottom == "High") {
        lip_bottom_bottom = 2.5;
    }

    var lip_top_height = 1.5; //.2 - 1.5
    if (face_options.lip_top_height == "Down") {
        lip_top_height = .5;
    } else if (face_options.lip_top_height == "Low") {
        lip_top_height = 1;
    } else if (face_options.lip_top_height == "Raised") {
        lip_top_height = 1.75;
    } else if (face_options.lip_top_height == "High") {
        lip_top_height = 2;
    }

    var lip_top_top = 1; //.2 - 2
    if (face_options.lip_top_top == "Down") {
        lip_top_top = .2;
    } else if (face_options.lip_top_top == "Low") {
        lip_top_top = .5;
    } else if (face_options.lip_top_top == "Raised") {
        lip_top_top = 1.3;
    } else if (face_options.lip_top_top == "High") {
        lip_top_top = 1.5;
    }

    var mouth_left_lift = 0;
    if (face_options.mouth_left_upturn == "Down") {
        mouth_left_lift = -2;
    } else if (face_options.mouth_left_upturn == "Low") {
        mouth_left_lift = -1;
    } else if (face_options.mouth_left_upturn == "Raised") {
        mouth_left_lift = 1;
    } else if (face_options.mouth_left_upturn == "High") {
        mouth_left_lift = 2;
    }
    var mouth_right_lift = 0;
    if (face_options.mouth_right_upturn == "Down") {
        mouth_right_lift = -2;
    } else if (face_options.mouth_right_upturn == "Low") {
        mouth_right_lift = -1;
    } else if (face_options.mouth_right_upturn == "Raised") {
        mouth_right_lift = 1;
    } else if (face_options.mouth_right_upturn == "High") {
        mouth_right_lift = 2;
    }

    lip_top_top += lip_top_height;

    if (face_options.face_shape == "Inverted Triangle") {
        mouth_width *= .7;
    }

    var lip_thickness = f.thick_unit * 2;
    var width = (f.mouth.right - f.mouth.left) / 2.6 * mouth_width;
    var height = (f.mouth.bottom - f.mouth.top);

    if (face_options.gender == 'Female') {
        lip_thickness *= 1.4;
        lip_bottom_bottom += 1.5;
        lip_bottom_height += 1;
        lip_top_top += 1;
    }

    //Mouth top and bottom line
    var mouth_top_line = [
        {x: -13, y: -2 - mouth_left_lift},
        {x: -10, y: -1 - (mouth_left_lift / 2)},
        {x: -5, y: -(lip_top_top * 2)},
        {x: -1, y: -lip_top_top},
        {x: 1, y: -lip_top_top},
        {x: 5, y: -(lip_top_top * 2)},
        {x: 10, y: -1 - (mouth_right_lift / 2) },
        {x: 13, y: -2 - mouth_right_lift},

        {x: 12, y: 0 - mouth_right_lift},
        {x: 10, y: 1 - (mouth_right_lift / 2) },
        {x: 4, y: lip_bottom_height + lip_bottom_bottom},
        {x: 1, y: lip_bottom_height + lip_bottom_bottom - 1},
        {x: -1, y: lip_bottom_height + lip_bottom_bottom - 1},
        {x: -4, y: lip_bottom_height + lip_bottom_bottom},
        {x: -10, y: 1 - (mouth_left_lift / 2)},
        {x: -12, y: 0 - mouth_left_lift}
    ];
    if (face_options.lip_shape == "Thin") {
        mouth_top_line = [
            {x: -13, y: -2 - (mouth_left_lift * .5)},
            {x: -5, y: -(lip_top_top)},
            {x: -1, y: -(lip_top_top * .8)},
            {x: 1, y: -(lip_top_top * .8)},
            {x: 5, y: -(lip_top_top)},
            {x: 13, y: -2 - (mouth_right_lift * .5)},

            {x: 12, y: -2.5 - (mouth_right_lift * .5)},
            {x: 4, y: (lip_bottom_height + lip_bottom_bottom) * .5},
            {x: 1, y: (lip_bottom_height + lip_bottom_bottom) * .7},
            {x: -1, y: (lip_bottom_height + lip_bottom_bottom) * .7},
            {x: -4, y: (lip_bottom_height + lip_bottom_bottom) * .5},
            {x: -12, y: -2.5 - (mouth_left_lift * .5)}
        ];
    } else if (face_options.lip_shape == "Thick") {
        mouth_top_line = [
            {x: -13, y: -2 - (mouth_left_lift * .7)},
            {x: -5, y: -(lip_top_top * 1.2)},
            {x: -1, y: -(lip_top_top * 1.1)},
            {x: 1, y: -(lip_top_top * 1.1)},
            {x: 5, y: -(lip_top_top * 1.2)},
            {x: 13, y: -2 - (mouth_right_lift * .7)},

            {x: 12, y: -2.5 - (mouth_right_lift * .5)},
            {x: 4, y: (lip_bottom_height + lip_bottom_bottom) * .9},
            {x: 1, y: (lip_bottom_height + lip_bottom_bottom) * 1.1},
            {x: -1, y: (lip_bottom_height + lip_bottom_bottom) * 1.1},
            {x: -4, y: (lip_bottom_height + lip_bottom_bottom) * .9},
            {x: -12, y: -2.5 - (mouth_left_lift * .5)}
        ];
    }

    var lip_top_color, lip_mid_color, lip_line_color;
    if (face_options.gender == 'Male') {
        var skin_color = net.brehaut.Color(face_options.skin_colors.skin);
        lip_top_color = net.brehaut.Color(face_options.lip_color).blend(skin_color, 1).toString();
        lip_mid_color = net.brehaut.Color(face_options.lip_color).darkenByRatio(0.3).toString();
        lip_line_color = 'blank';
    } else {
        lip_top_color = net.brehaut.Color(face_options.lip_color).darkenByRatio(0.1).toString();
        lip_mid_color = net.brehaut.Color(face_options.lip_color).darkenByRatio(0.3).toString();
        lip_line_color = face_options.skin_colors.deepshadow;
    }

    var l = a.createPathFromLocalCoordinates(mouth_top_line, {
        close_line: true, thickness: lip_thickness,
        line_color: lip_line_color, fill_method: 'linear',
        fill_colors: [lip_top_color, lip_mid_color, lip_top_color],
        fill_steps: [0, .5, 1], y_offset_start: -height / 2, y_offset_end: height / 2,
        x_offset_start: 0, x_offset_end: 0
    }, width, height);
    l.x = f.mouth.x;
    l.y = f.mouth.y;
    l.name = 'lips';
    lines.push({name: 'lips', line: mouth_top_line, shape: l, x: f.mouth.x, y: f.mouth.y, scale_x: width, scale_y: height});
    shapes.push(l);


    var mouth_line = a.transformLineToGlobalCoordinates(lines, 'lips');
    var mouth_left_point = a.comparePoints(mouth_line, 'x', 'lowest', true);
    var mouth_right_point = a.comparePoints(mouth_line, 'x', 'highest', true);
    var mouth_mid_x = a.comparePoints(mouth_line, 'x', 'middle');
    var mouth_mid_y = mouth_left_point.y + (height/2);

    a.namePoint(avatar, 'left mouth wedge', mouth_left_point);
    a.namePoint(avatar, 'right mouth wedge', mouth_right_point);
    a.namePoint(avatar, 'mouth bottom middle', {x: mouth_mid_x, y:mouth_mid_y});


    //Add point from nose point intersects face
    var face_line = a.transformLineToGlobalCoordinates(lines, 'face');
    var mouth_face_x = a.comparePoints(face_line, 'crosses y', mouth_right_point.y);
    a.namePoint(avatar, 'mouth - face right point', {x: mouth_face_x, y: mouth_right_point.y});

    var mid_face_x = a.comparePoints(face_line, 'x', 'middle');
    var face_line_left = a.lineSegmentCompared(face_line, mid_face_x, 'left');
    mouth_face_x = a.comparePoints(face_line_left, 'crosses y', mouth_left_point.y);
    a.namePoint(avatar, 'mouth - face left point', {x: mouth_face_x, y: mouth_left_point.y});


    var tongue_line = a.transformShapeLine({type: 'midline of loop'}, face_options, mouth_top_line);
    var l2 = a.createPathFromLocalCoordinates(tongue_line, {close_line: false, thickness: 1, color: face_options.skin_colors.deepshadow}, width, height);
    l2.x = f.mouth.x;
    l2.y = f.mouth.y;
    l2.alpha = 0.5;
    l2.name = 'tongue';
    lines.push({name: 'tongue', line: tongue_line, shape: l2, x: f.mouth.x, y: f.mouth.y, scale_x: width, scale_y: height});
    shapes.push(l2);


    return shapes;
}});


//=====Circle Styles==========
new Avatar('add_render_function', {style: 'circles', feature: 'neck', renderer: function (face_zones, avatar) {
    var f = face_zones;
    var face_options = avatar.face_options;
    var shapes = [];
    var neck = new createjs.Shape();
    var zone = f.neck;
    neck.graphics.beginStroke(face_options.skin_colors.highlights).beginFill(face_options.skin_colors.skin).drawRect(zone.left, zone.top, zone.right, zone.bottom);
    neck.x = zone.x;
    neck.y = zone.y;
    shapes.push(neck);
    return shapes;
}});

new Avatar('add_render_function', {style: 'circles', feature: 'ears', renderer: function (face_zones, avatar) {
    var f = face_zones;
    var face_options = avatar.face_options;
    var shapes = [];

    var left_ear = new createjs.Shape();
    var zone = f.ears;
    left_ear.graphics.beginStroke(face_options.skin_colors.deepshadow).beginFill(face_options.skin_colors.cheek).drawEllipse(zone.left, zone.top, zone.right, zone.bottom);
    left_ear.x = zone.left_x;
    left_ear.y = zone.y;
    shapes.push(left_ear);

    var right_ear = new createjs.Shape();
    zone = f.ears;
    right_ear.graphics.beginStroke(face_options.skin_colors.deepshadow).beginFill(face_options.skin_colors.cheek).drawEllipse(zone.left, zone.top, zone.right, zone.bottom);
    right_ear.x = zone.right_x;
    right_ear.y = zone.y;
    shapes.push(right_ear);
    return shapes;
}});

new Avatar('add_render_function', {style: 'circles', feature: 'face', renderer: function (face_zones, avatar) {
    var f = face_zones;
    var face_options = avatar.face_options;
    var shapes = [];

    var face = new createjs.Shape();
    var zone = f.face;
    face.graphics.beginStroke(face_options.skin_colors.highlights).beginFill(face_options.skin_colors.skin).drawEllipse(zone.left, zone.top, zone.right, zone.bottom);
    face.x = zone.x;
    face.y = zone.y;
    shapes.push(face);
    return shapes;
}});

new Avatar('add_render_function', {style: 'circles', feature: 'eyes', renderer: function (face_zones, avatar) {
    var f = face_zones;
    var face_options = avatar.face_options;
    var shapes = [];

    var left_eye = new createjs.Shape();
    var zone = f.eyes;
    left_eye.graphics.beginStroke(face_options.skin_colors.deepshadow).beginFill('white').drawEllipse(zone.left, zone.top, zone.right, zone.bottom);
    left_eye.x = zone.left_x;
    left_eye.y = zone.y;
    shapes.push(left_eye);

    var left_iris = new createjs.Shape();
    zone = f.eyes.iris;
    left_iris.graphics.beginStroke(face_options.skin_colors.deepshadow).beginFill(face_options.eye_color).drawEllipse(zone.left, zone.top, zone.right, zone.bottom);
    left_iris.x = zone.left_x;
    left_iris.y = zone.y;
    shapes.push(left_iris);

    var left_pupil = new createjs.Shape();
    zone = f.eyes.pupil;
    left_pupil.graphics.beginFill('black').drawEllipse(zone.left, zone.top, zone.right, zone.bottom);
    left_pupil.x = zone.left_x;
    left_pupil.y = zone.y;
    shapes.push(left_pupil);

    var right_eye = new createjs.Shape();
    zone = f.eyes;
    right_eye.graphics.beginStroke(face_options.skin_colors.deepshadow).beginFill('white').drawEllipse(zone.left, zone.top, zone.right, zone.bottom);
    right_eye.x = zone.right_x;
    right_eye.y = zone.y;
    shapes.push(right_eye);

    var right_iris = new createjs.Shape();
    zone = f.eyes.iris;
    right_iris.graphics.beginStroke(face_options.skin_colors.deepshadow).beginFill(face_options.eye_color).drawEllipse(zone.left, zone.top, zone.right, zone.bottom);
    right_iris.x = zone.right_x;
    right_iris.y = zone.y;
    shapes.push(right_iris);

    var right_pupil = new createjs.Shape();
    zone = f.eyes.pupil;
    right_pupil.graphics.beginFill('black').drawEllipse(zone.left, zone.top, zone.right, zone.bottom);
    right_pupil.x = zone.right_x;
    right_pupil.y = zone.y;
    shapes.push(right_pupil);

    return shapes;
}});

new Avatar('add_render_function', {style: 'circles', feature: 'nose', renderer: function (face_zones, avatar) {
    var f = face_zones;
    var face_options = avatar.face_options;
    var shapes = [];
    var nose = new createjs.Shape();
    var zone = f.nose;
    nose.graphics.beginStroke(face_options.skin_colors.deepshadow).drawEllipse(zone.left, zone.top, zone.right, zone.bottom);
    nose.x = zone.x;
    nose.y = zone.y;
    shapes.push(nose);
    return shapes;
}});

new Avatar('add_render_function', {style: 'circles', feature: 'mouth', renderer: function (face_zones, avatar) {
    var f = face_zones;
    var face_options = avatar.face_options;
    var shapes = [];

    var mouth = new createjs.Shape();
    var zone = f.mouth;
    mouth.graphics.beginStroke(face_options.skin_colors.deepshadow).beginFill(face_options.lip_color).drawEllipse(zone.left, zone.top, zone.right, zone.bottom);
    mouth.x = zone.x;
    mouth.y = zone.y;
    shapes.push(mouth);

    var mouth_line = new createjs.Shape();
    zone = f.mouth;
    mouth_line.graphics.setStrokeStyle(.5 * f.thick_unit).beginStroke('black').moveTo(zone.x + zone.left, zone.y).lineTo(zone.x + zone.right / 2, zone.y);
    shapes.push(mouth_line);

    return shapes;
}});
(function (AvatarClass) {

    var _face_options = {
        style: 'lines',
        race: 'Human',
        rand_seed: 0,

        //----------------------------------------
        //'Living' settings that can change over time
        //NOTE: Items that aren't null are ones that haven't been implemented yet
        age: 30,
        era: 'Industrial',
        thickness: 0,
        cleanliness: 0,

        hair_style: null,
        hair_pattern: null,
        hair_texture: 'Smooth',
        hair_color: null,

        beard_color: null,
        beard_style: null,
        stubble_style: null,
        mustache_style: null,
        mustache_width: null,
        mustache_height: null,
        acne_style: null,
        acne_amount: null,
        skin_texture: 'Normal',
        teeth_condition: 'Normal',
        lip_color: null,

        emotionality: 0,
        emotion_shown: 'none', //TODO: Have an array of current emotions?
        augmentations: null,

        //----------------------------------------
        //DNA settings that don't change easily
        gender: null,
        height: 0,

        skin_shade_tint: null,
        skin_shade: null,
        skin_colors: null,
        face_shape: null,
        skull_thickness: 'Normal',
        chin_divot: null,
        chin_shape: null,

        neck_size: null,

        eye_color: null,
        eye_shape: null,
        eye_spacing: null,
        eye_size: null,
        eye_rotation: null,
        eyelid_shape: null,
        eye_cloudiness: null,
        eyebrow_shape: null,
        pupil_color: null,
        eye_sunken: null,

        head_size: 'Normal',
        hairiness: null,
        forehead_height: null,
        hair_color_roots: null,

        nose_shape: null,
        nose_size: null,
        nose_height: null,

        teeth_shape: 'Normal',
        lip_shape: null,
        mouth_height: null,
        mouth_left_upturn: null,
        mouth_right_upturn: null,
        mouth_width: null,
        mouth_upturn: null,
        mouth_downturn: null,
        lip_bottom_height: null,
        lip_top_height: null,
        lip_bottom_bottom: null,
        lip_top_top: null,

        ear_shape: null,
        ear_thickness: null,
        ear_lobe_left: null,
        ear_lobe_right: null,

        wrinkle_pattern_mouth: null,
        wrinkle_mouth_width: null,
        wrinkle_mouth_height: null,
        wrinkle_resistance: null
    };

    var _human_options = {
        rendering_order: [
            {decoration: "box-behind"},
            {feature: "shoulders", style: "lines"},
            {feature: "neck", style: "lines"},
            {feature: "face", style: "lines"},
            {feature: "eye_position", style: "lines"},
            {feature: "nose", style: "lines"}, //Uses: right eye intermost
            {feature: "chin", style: "lines"}, //Uses: chin mid line, face
            {feature: "mouth", style: "lines", hide:true}, //NOTE: Shown twice to predraw positions
            {feature: "wrinkles", style: "lines"}, //Uses: face, left eye, right eye, lips, full nose, chin top line
            {feature: "augmentations", style: "lines"},
            {feature: "beard", style: "lines"}, //Uses: face, left eye
            {feature: "mouth", style: "lines"},
            {feature: "mustache", style: "lines"},
            {feature: "eyes", style: "lines"},
            {feature: "hair", style: "lines"}, //Uses: face, left eye
            {feature: "ears", style: "lines"},
            {decoration: "name-plate"}
        ],
        use_content_packs: ['all'],

        //If Preset, then use one of the skin_color_options and change tint, otherwise calculate by tint and lightness
        skin_shade_options: "Light,Dark,Preset".split(","),
        skin_shade_tint_options: "Darkest,Darker,Dark,Very Low,Low,Less,Below,Reduce,Raised,Above,More,High,Very High,Bright,Brighter,Brightest".split(","),
        skin_colors_options: [
            {name: 'Fair', highlights: 'rgb(254,202,182)', skin: 'rgb(245,185,158)', cheek: 'rgb(246,171,142)', darkflesh: 'rgb(217,118,76)', deepshadow: 'rgb(202,168,110'},
            {name: 'Brown', highlights: 'rgb(229,144,90)', skin: 'rgb(228,131,86)', cheek: ' rgb(178,85,44)', darkflesh: 'rgb(143,70,29)', deepshadow: 'rgb(152,57,17'},
            {name: 'Tanned', highlights: 'rgb(245,194,151)', skin: 'rgb(234,154,95)', cheek: 'rgb(208,110,56)', darkflesh: 'rgb(168,66,17)', deepshadow: 'rgb(147,68,27'},
            {name: 'White', highlights: 'rgb(250,220,196)', skin: 'rgb(245,187,149)', cheek: 'rgb(239,165,128)', darkflesh: 'rgb(203,137,103)', deepshadow: 'rgb(168,102,68'},
            {name: 'Medium', highlights: 'rgb(247,188,154)', skin: 'rgb(243,160,120)', cheek: 'rgb(213,114,75)', darkflesh: 'rgb(154,79,48)', deepshadow: 'rgb(127,67,41'},
            {name: 'Yellow', highlights: 'rgb(255,218,179)', skin: 'rgb(250,187,134)', cheek: 'rgb(244,159,104)', darkflesh: 'rgb(189,110,46)', deepshadow: 'rgb(138,67,3'},
            {name: 'Pink', highlights: 'rgb(253,196,179)', skin: 'rgb(245,158,113)', cheek: 'rgb(236,134,86)', darkflesh: 'rgb(182,88,34)', deepshadow: 'rgb(143,60,18'},
            {name: 'Bronzed', highlights: 'rgb(236,162,113)', skin: 'rgb(233,132,86)', cheek: 'rgb(219,116,75)', darkflesh: 'rgb(205,110,66)', deepshadow: 'rgb(173,83,46'},
            {name: 'Light Brown', highlights: 'rgb(242,207,175)', skin: 'rgb(215,159,102)', cheek: 'rgb(208,138,86)', darkflesh: 'rgb(195,134,80)', deepshadow: 'rgb(168,112,63'},
            {name: 'Peach', highlights: 'rgb(247,168,137)', skin: 'rgb(221,132,98)', cheek: 'rgb(183,90,57)', darkflesh: 'rgb(165,87,51)', deepshadow: 'rgb(105,29,15'},
            {name: 'Black', highlights: 'rgb(140,120,110)', skin: 'rgb(160,90,66)', cheek: 'rgb(140,80,40)', darkflesh: 'rgb(120,90,29)', deepshadow: 'rgb(30,30,30'},
            {name: 'Deep Black', highlights: 'rgb(40,40,50)', skin: 'rgb(80,80,80)', cheek: 'rgb(70,70,70)', darkflesh: 'rgb(80,70,29)', deepshadow: 'rgb(30,30,30'}
        ],

        gender_options: "Male,Female".split(","),
        thickness_options: [-1.5, -1, -.5, 0, .5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6],  //TODO: Turn these to word options

        face_shape_options: "Oblong,Oval,Round,Rectangular,Square,Triangular,Diamond,Inverted Triangle,Heart".split(","),
        acne_style_options: "None,Very Light,Light,Medium,Heavy".split(","),
        acne_amount_options: 'None,Very Light,Light,Few,Some,Spattering,Speckled,Heavy,Very Heavy'.split(","),
        chin_divot_options: "Double,Small,Large,Smooth".split(","),
        chin_shape_options: "Pronounced,Smooth".split(","),

        hair_color_roots_options: "Midnight Black,Off Black,Darkest Brown,Medium Dark Brown,Chestnut Brown,Light Chestnut Brown,Dark Golden Brown,Light Golden Brown,Dark Honey Blond,Bleached Blond,Light Ash Blond,Light Ash Brown,Lightest Blond,Pale Golden Blond,Strawberry Blond,Light Auburn,Dark Auburn,Darkest Gray,Medium Gray,Light Gray,White Blond,Platinum Blond,Toasted Wheat,Melted Butter,Wheat Milk,Cake Two,Poor Jean,Shoe Brown,Cookie,Tree Bark,Russet Red,Terra Cotta".split(","), //Yellow,Brown,Black,White,Gray,Dark Brown,Dark Yellow,Red
        hair_style_options: "Bald,Droopy".split(","),
        hair_pattern_options: "Mid Bump,Side Part,Eye Droop,Receding,Bowl,Bowl with Peak,Bowl with Big Peak,Side Part2,Twin Peaks".split(","),
        hairiness_options: "Bald,Thin Hair,Thick Hair,Hairy,Fuzzy,Bearded,Covered in Hair,Fury".split(","), //TODO

        beard_color_options: "Hair,Black,Gray".split(","),
        beard_style_options: "None,Full Chin,Chin Warmer,Soup Catcher,Thin Chin Wrap,Thin Low Chin Wrap".split(","),
        mustache_style_options: "None,Propeller,Butterfly,Fu Manchu,Lower Dali,Dali,Sparrow,Zappa,Anchor,Copstash,Handlebar,Low Handlebar,Long Curled Handlebar,Curled Handlebar".split(","),
        mustache_width_options: "Small,Short,Medium,Long,Large".split(","),
        mustache_height_options: "Small,Short,Medium,Long,Large".split(","),
        stubble_style_options: "None,Light,Medium,Heavy".split(","),
        neck_size_options: "Thick,Concave".split(","),

        nose_shape_options: "Flat,Wide,Thin,Turned up/perky,Normal,Hooked down,Bulbous,Giant Nostrils".split(","),
        nose_size_options: "Tiny,Small,Normal,Large,Big,Giant,Huge".split(","),
        nose_height_options: "Low,Normal,Raised".split(","),

        eye_spacing_options: "Pinched,Thin,Normal,Wide".split(","),
        eye_size_options: "Small,Normal,Big".split(","),
        eye_shape_options: "Almond".split(","),
        eye_color_options: "Hazel,Amber,Green,Blue,Gray,Brown,Dark Brown,Black".split(","),
        eye_lids_options: "None,Smooth,Folded,Thick".split(","), //TODO
        eye_cloudiness_options: "Normal,Clear,Misty".split(","),
        eyebrow_shape_options: "Straight,Squiggle,Squiggle Flip,Slim,Lifted,Arch,Thick Arch,Caterpiller,Wide Caterpiller,Unibrow".split(","),
        eye_rotation_options: "Flat,Small,Medium,Large,Slanted".split(","),
        pupil_color_options: "Black".split(","),
        eye_sunken_options: "Cavernous,Deep,Dark,Light,Smooth,None".split(","),

        ear_shape_options: "Round".split(","),
        ear_thickness_options: "Wide,Normal,Big,Tall,Splayed".split(","),
        ear_lobe_left_options: "Hanging,Attached".split(","),
        ear_lobe_right_options: "Hanging,Attached,Same".split(","),

        mouth_height_options: "Low,Normal,Raised,High".split(","),
        mouth_left_upturn_options: "Down,Low,Normal,Raised,High".split(","),
        mouth_right_upturn_options: "Down,Low,Normal,Raised,High".split(","),
        mouth_width_options: "Wide,Big,Normal,Short,Small,Tiny".split(","),
        mouth_upturn_options: "Large,Short,Small,Tiny".split(","),
        mouth_downturn_options: "Large,Short,Small,Tiny".split(","),

        lip_color_options: "#f00,#e00,#d00,#c00,#f10,#f01,#b22,#944".split(","),
        lip_bottom_height_options: "Down,Low,Normal,Raised,High".split(","),
        lip_top_height_options: "Down,Low,Normal,Raised,High".split(","),
        lip_bottom_bottom_options: "Down,Low,Normal,Raised,High".split(","),
        lip_top_top_options: "Down,Low,Normal,Raised,High".split(","),
        lip_shape_options: "Puckered,Thin,Thick".split(","),

        wrinkle_pattern_mouth_options: "None,Gentle,Straight,Top,Middle,Bottom,Heavy".split(","),
        wrinkle_resistance_options: "Very Low,Low,Less,Below,Reduce,Raised,Above,More,High,Very High".split(","),
        wrinkle_mouth_width_options: "Far Out,Out,Middle,In,Far In".split(","),
        wrinkle_mouth_height_options: "Far Up,Up,Middle,Down,Far Down".split(","),

        forehead_height_options: "Under,Low,Less,Normal,Above,Raised,High,Floating".split(","),

        augmentations_options: [
//            [],
//            [],[],[],[], //NOTE:Quick way to reduce chance of augmentations
//            [{feature: 'glasses', name: '3 goggles', options: {color: 'blue'}, ignore_filters:true}],
//            [{feature: 'glasses', ignore_filters:true}],
//            [{feature: 'scar'}]
//            [{feature: 'scar', name: 'sewn right cheek wound'},{feature: 'glasses'}]
        ],

        decorations: [
            {name: "box-behind", type: 'rectangle', p1: 'facezone topleft', p2: 'facezone bottomright',
                fill_color: 'blue', alpha: 0.3, line_color: 'light blue', size: '2', forceInBounds: true},
            {name: "name-plate", type: 'rectangle', height: 16, docked: 'bottom', forceInBounds: true, font_size: 9,
                text: '{{name}}', text_color: 'black', line_color: 'brown', fill_color: 'white', alpha: 0.8}
        ]
    };

    AvatarClass.initializeOptions(_face_options, _human_options);

})(Avatar);
(function (Avatar, net) {
    //TODO: Have textures be removed based on face_options modified

    var a = new Avatar('get_private_functions');

    //-----------------------------
    //Texture creation
    a.generateTextures = function (avatar) {
        //TODO: Have Some of these run for the entire class?

        avatar.textures = _.without(avatar.textures, function (tex) {
            return tex.type == 'single use'
        });
        avatar.textures = []; //TODO: have this dynamically remove ones that have source variables changed

        var height_object = a.getHeightOfStage(avatar);
        var resolution = height_object.resolution;


        //Build stubble colors
        var hair_tinted_gray = avatar.face_options.beard_color;
        var hair_tinted_gray2 = avatar.face_options.beard_color;

        if (avatar.face_options.hair_color && hair_tinted_gray && hair_tinted_gray == 'Hair') {
            hair_tinted_gray = avatar.face_options.hair_color;
            hair_tinted_gray2 = avatar.face_options.hair_color;
        }
        if (!hair_tinted_gray) {
            hair_tinted_gray = net.brehaut.Color('#666666').toString();
            hair_tinted_gray2 = net.brehaut.Color('#888888').toString();
        }
        hair_tinted_gray = net.brehaut.Color('#444444').blend(net.brehaut.Color(hair_tinted_gray), .1).toString();
        hair_tinted_gray2 = net.brehaut.Color('#666666').blend(net.brehaut.Color(hair_tinted_gray2), .2).toString();

        var canvas_size = 64;
        //Build Stubble texture
        var canvas = document.createElement('canvas');
        canvas.width = canvas_size;
        canvas.height = canvas_size;
        var context = canvas.getContext('2d');

        addRandomLines(context, avatar.face_options, canvas_size, resolution * 80, resolution * 4, resolution / 2, hair_tinted_gray);
        addRandomLines(context, avatar.face_options, canvas_size, resolution * 140, resolution, resolution / 2, hair_tinted_gray2);
        addRandomLines(context, avatar.face_options, canvas_size, resolution * 300, resolution * 8, resolution / 2, '#444');
        avatar.textures.push({type: 'single use', name: 'stubble lines', canvas: canvas, context: context});


        var canvas3 = document.createElement('canvas');
        canvas3.width = canvas_size;
        canvas3.height = canvas_size;
        var context3 = canvas.getContext('2d');

        addRandomLines(context3, avatar.face_options, canvas_size, resolution * 80, resolution / 2, resolution * 4, hair_tinted_gray);
        addRandomLines(context3, avatar.face_options, canvas_size, resolution * 140, resolution / 2, resolution, hair_tinted_gray2);
        avatar.textures.push({type: 'single use', name: 'hair horizontal lines', canvas: canvas3, context: context3});


        var skin_color = avatar.face_options.skin_colors.skin;
        var skin_lighter_2 = net.brehaut.Color(skin_color).lightenByRatio(.02).toString();
        var skin_darker_1 = net.brehaut.Color(skin_color).darkenByRatio(.01).toString();

        //Build Skin texture
        var canvas2 = document.createElement('canvas');
        canvas2.width = canvas_size;
        canvas2.height = canvas_size;
        var context2 = canvas2.getContext('2d');
        addRandomSpots(context2, avatar.face_options, canvas_size, resolution * 10, resolution * 1.5, skin_lighter_2);
        addRandomSpots(context2, avatar.face_options, canvas_size, resolution * 10, resolution * 1.5, skin_darker_1);
        avatar.textures.push({type: 'single use', name: 'face bumps', canvas: canvas2, context: context2});


        //Build Acne texture
        var acne_amount = a.turnWordToNumber(avatar.face_options.acne_amount, 0, 9, 'None,Very Light,Light,Few,Some,Spattering,Speckled,Heavy,Very Heavy');

        var face_reddish = net.brehaut.Color(skin_color).blend(net.brehaut.Color('#f00'), .15).toString();
        var canvas4 = document.createElement('canvas');
        canvas4.width = canvas_size * 5;
        canvas4.height = canvas_size * 5;
        var context4 = canvas4.getContext('2d');
        addRandomSpots(context4, avatar.face_options, canvas_size * 5, resolution * acne_amount, resolution * 2, face_reddish);
        avatar.textures.push({type: 'single use', name: 'face spots', canvas: canvas4, context: context4});

    };

    function addRandomSpots(context, face_options, context_size, number, radius, color) {
        context.strokeStyle = color;
        for (var i = 0; i < number; i++) {
            var x = a.randInt(context_size, face_options);
            var y = a.randInt(context_size, face_options);
            var rad = a.randInt(radius, face_options);

            context.fillStyle = color;
            context.beginPath();
            context.moveTo(x, y);
            context.arc(x, y, parseInt(rad), 0, 2 * Math.PI);
            context.closePath();
            context.fill();
            context.stroke();
        }
        return context;
    }

    function addRandomLines(context, face_options, context_size, number, length_y, length_x, color) {
        context.strokeStyle = color;
        for (var i = 0; i < number; i++) {
            var x = a.randInt(context_size, face_options);
            var y = a.randInt(context_size, face_options);
            var x_off = parseInt(a.randInt(length_x * 2, face_options) - length_x);
            var y_off = parseInt(a.randInt(length_y * 2, face_options) - length_y);

            context.beginPath();
            context.moveTo(x, y);
            context.lineTo(x + x_off, y + y_off);
            context.closePath();
            context.stroke()
        }
        return context;
    }

})(Avatar, net);
var content_pack_data = {
    image: '../js/content_packs/female_eyes_1/woman-eyes-collection-vector-illustration-8573624.jpg',
    frames: [
        {name: '1 hazel eyes with medium lashes', x: 39, y: 58, width: 617, height: 194, filter: {},
            coordinates: [
                {point: 'left eye center', x: 156, y: 180},
                {point: 'right eye center', x: 540, y: 180},
                {point: 'eyebrow midpoint', x: 348, y: 90},
                {point: 'left eyebrow innermost', x: 292, y: 116}
            ],
            zones: [
                {x: 51, y: 64, width: 560, height: 64, color: 'hair_color'}
            ]
        },
        {name: '2 grey eyes with thick eyebrows', x: 72, y: 260, width: 562, height: 176, filter: {},
            coordinates: [
                {point: 'left eye center', x: 173, y: 393},
                {point: 'right eye center', x: 519, y: 393},
                {point: 'eyebrow midpoint', x: 352, y: 320},
                {point: 'left eyebrow innermost', x: 241, y: 340}
            ],
            zones: [
                {x: 72, y: 260, width: 562, height: 89, color: 'hair_color'}
            ]
        },
        {name: '3 red eyes with medium eyebrows', x: 49, y: 500, width: 571, height: 156, filter: {},
            coordinates: [
                {point: 'left eye center', x: 178, y: 606},
                {point: 'right eye center', x: 500, y: 606},
                {point: 'eyebrow midpoint', x: 340, y: 521},
                {point: 'left eyebrow innermost', x: 274, y: 544}
            ],
            zones: [
                {x: 49, y: 500, width: 571, height: 55, color: 'hair_color'}
            ]
        },
        {name: '4 grey eyes with thin eyebrows', x: 78, y: 706, width: 519, height: 148, filter: {},
            coordinates: [
                {point: 'left eye center', x: 180, y: 796},
                {point: 'right eye center', x: 487, y: 796},
                {point: 'eyebrow midpoint', x: 327, y: 715},
                {point: 'left eyebrow innermost', x: 253, y: 748}
            ],
            zones: [
                {x: 78, y: 706, width: 519, height: 46, color: 'hair_color'}
            ]
        },
        {name: '5 light green eyes with thin eyebrows', x: 723, y: 79, width: 526, height: 132, filter: {},
            coordinates: [
                {point: 'left eye center', x: 830, y: 179},
                {point: 'right eye center', x: 1152, y: 179},
                {point: 'eyebrow midpoint', x: 988, y: 110},
                {point: 'left eyebrow innermost', x: 926, y: 121}
            ],
            zones: [
                {x: 723, y: 79, width: 526, height: 51, color: 'hair_color'}
            ]
        },
        {name: '6 light blue eyes with thin eyebrows', x: 717, y: 260, width: 533, height: 188, filter: {},
            coordinates: [
                {point: 'left eye center', x: 825, y: 390},
                {point: 'right eye center', x: 1128, y: 388},
                {point: 'eyebrow midpoint', x: 980, y: 300},
                {point: 'left eyebrow innermost', x: 914, y: 337}
            ],
            zones: [
                {x: 717, y: 260, width: 533, height: 81, color: 'hair_color'}
            ]
        },
        {name: '7 brown eyes with diamond eyebrows', x: 715, y: 481, width: 542, height: 172, filter: {},
            coordinates: [
                {point: 'left eye center', x: 818, y: 599},
                {point: 'right eye center', x: 1126, y: 597},
                {point: 'eyebrow midpoint', x: 988, y: 509},
                {point: 'left eyebrow innermost', x: 895, y: 544}
            ],
            zones: [
                {x: 715, y: 481, width: 542, height: 66, color: 'hair_color'}
            ]
        },
        {name: '8 bright green eyes with thin round eyebrows', x: 708, y: 676, width: 541, height: 166, filter: {},
            coordinates: [
                {point: 'left eye center', x: 809, y: 790},
                {point: 'right eye center', x: 1126, y: 788},
                {point: 'eyebrow midpoint', x: 965, y: 705},
                {point: 'left eyebrow innermost', x: 895, y: 544}
            ],
            zones: [
                {x: 708, y: 676, width: 541, height: 74, color: 'hair_color'}
            ]
        }
    ],
    animations: {},
    removeBackgroundColor: 'white',
    removeBackgroundNoise: 4
};

new Avatar('register_content_pack', 'female_eyes_1', {
    style: 'lines', replace_features: ['eyes'], use_frequency: 0.5, filter: {gender: 'Female'},
//    custom_renderer: function (face_zones, avatar, pack, frame) {},

    data: content_pack_data
});


var content_pack_data = {
    image: '../js/content_packs/mouths_1/25468547-vector-lips-and-mouth-silhouette-and-glossy-open-and-close-up-man-and-woman-face-parts-tran.png',
    frames: [
        {name: '1 lips closed', x: 57, y: 70, width: 254, height: 126, filter: {},
            coordinates: [
                {point: 'left mouth wedge', x: 71, y: 98},
                {point: 'right mouth wedge', x: 296, y: 98},
                {point: 'mouth bottom middle', x: 184, y: 152}
            ],
            zones: [
                { all: true, color: 'lip_color'}
            ]
        },
        {name: '2 lips closed', x: 391, y: 66, width: 242, height: 131, filter: {},
            coordinates: [
                {point: 'left mouth wedge', x: 406, y: 91},
                {point: 'right mouth wedge', x: 618, y: 91},
                {point: 'mouth bottom middle', x: 510, y: 153}
            ],
            zones: [
                { all: true, color: 'lip_color'}
            ]
        },
        {name: '3 lips smiling', x: 675, y: 70, width: 267, height: 129, filter: {},
            coordinates: [
                {point: 'left mouth wedge', x: 690, y: 108},
                {point: 'right mouth wedge', x: 924, y: 108},
                {point: 'mouth bottom middle', x: 805, y: 158}
            ],
            zones: [
                { all: true, color: 'lip_color'}
            ]
        },
        {name: '4 lips smiling', x: 990, y: 84, width: 238, height: 108, filter: {},
            coordinates: [
                {point: 'left mouth wedge', x: 1002, y: 105},
                {point: 'right mouth wedge', x: 1218, y: 105},
                {point: 'mouth bottom middle', x: 1107, y: 169}
            ],
            zones: [
                { all: true, color: 'lip_color'}
            ]
        },
        {name: '5 lips smiling big top lip', x: 58, y: 306, width: 252, height: 131, filter: {},
            coordinates: [
                {point: 'left mouth wedge', x: 74, y: 336},
                {point: 'right mouth wedge', x: 297, y: 336},
                {point: 'mouth bottom middle', x: 184, y: 397}
            ],
            zones: [
                { all: true, color: 'lip_color'}
            ]
        },
        {name: '6 lips smiling big top lip', x: 391, y: 327, width: 250, height: 91, filter: {},
            coordinates: [
                {point: 'left mouth wedge', x: 407, y: 358},
                {point: 'right mouth wedge', x: 618, y: 358},
                {point: 'mouth bottom middle', x: 514, y: 408}
            ],
            zones: [
                { all: true, color: 'lip_color'}
            ]
        },
        {name: '7 lips smiling big top lip', x: 683, y: 322, width: 246, height: 100, filter: {},
            coordinates: [
                {point: 'left mouth wedge', x: 697, y: 337},
                {point: 'right mouth wedge', x: 917, y: 337},
                {point: 'mouth bottom middle', x: 808, y: 389}
            ],
            zones: [
                { all: true, color: 'lip_color'}
            ]
        },
        {name: '8 lips smiling big top lip', x: 994, y: 312, width: 237, height: 123, filter: {},
            coordinates: [
                {point: 'left mouth wedge', x: 1005, y: 334},
                {point: 'right mouth wedge', x: 1216, y: 334},
                {point: 'mouth bottom middle', x: 1106, y: 398}
            ],
            zones: [
                { all: true, color: 'lip_color'}
            ]
        },
        {name: '9 balloon lips wide', x: 52, y: 521, width: 267, height: 125, filter: {gender: 'Female'},
         coordinates: [
             {point: 'left mouth wedge', x: 65, y: 559},
             {point: 'right mouth wedge', x: 305, y: 559},
             {point: 'mouth bottom middle', x: 189, y: 632}
         ], zones: [{ all: true, color: 'lip_color'}]
        },
        {name: '10 balloon lips down', x: 386, y: 519, width: 242, height: 118, filter: {gender: 'Female'},
         coordinates: [
             {point: 'left mouth wedge', x: 409, y: 579},
             {point: 'right mouth wedge', x: 616, y: 579},
             {point: 'mouth bottom middle', x: 510, y: 628}
         ], zones: [{ all: true, color: 'lip_color'}]
        },
        {name: '11 balloon lips v', x: 694, y: 521, width: 230, height: 115, filter: {gender: 'Female'},
         coordinates: [
             {point: 'left mouth wedge', x: 708, y: 568},
             {point: 'right mouth wedge', x: 906, y: 568},
             {point: 'mouth bottom middle', x: 809, y: 621}
         ], zones: [{ all: true, color: 'lip_color'}]
        },
        {name: '12 balloon lips wide', x: 977, y: 523, width: 260, height: 108, filter: {gender: 'Female'},
         coordinates: [
             {point: 'left mouth wedge', x: 990, y: 580},
             {point: 'right mouth wedge', x: 1229, y: 579},
             {point: 'mouth bottom middle', x: 1110, y: 623}
         ], zones: [{ all: true, color: 'lip_color'}]
        },
        {name: '13 full round lips', x: 69, y: 725, width: 224, height: 107, filter: {gender: 'Female'},
         coordinates: [
             {point: 'left mouth wedge', x: 85, y: 775},
             {point: 'right mouth wedge', x: 284, y: 773},
             {point: 'mouth bottom middle', x: 189, y: 821}
         ], zones: [{ all: true, color: 'lip_color'}]
        },
        {name: '14 full short round lips', x: 396, y: 732, width: 222, height: 81, filter: {gender: 'Female'},
         coordinates: [
             {point: 'left mouth wedge', x: 409, y: 765},
             {point: 'right mouth wedge', x: 616, y: 764},
             {point: 'mouth bottom middle', x: 514, y: 809}
         ], zones: [{ all: true, color: 'lip_color'}]
        },
        {name: '15 full lips', x: 684, y: 721, width: 240, height: 107, filter: {gender: 'Female'},
         coordinates: [
             {point: 'left mouth wedge', x: 696, y: 748},
             {point: 'right mouth wedge', x: 918, y: 745},
             {point: 'mouth bottom middle', x: 806, y: 799}
         ], zones: [{ all: true, color: 'lip_color'}]
        },
        {name: '16 lips smiling big both lip with teeth', x: 991, y: 708, width: 240, height: 129, filter: {gender: 'Female'},
            coordinates: [
                {point: 'left mouth wedge', x: 1001, y: 745},
                {point: 'right mouth wedge', x: 1221, y: 745},
                {point: 'mouth bottom middle', x: 1109, y: 824}
            ],
            zones: [
                { all: true, color: 'lip_color'}
            ]
        },
        {name: '17 lips smiling big both lip with teeth', x: 47, y: 924, width: 278, height: 106, filter: {gender: 'Female'},
            coordinates: [
                {point: 'left mouth wedge', x: 60, y: 940},
                {point: 'right mouth wedge', x: 313, y: 940},
                {point: 'mouth bottom middle', x: 184, y: 1010}
            ],
            zones: [
                { all: true, color: 'lip_color'}
            ]
        },
        {name: '21 big fluffy lips ', x: 78, y: 1113, width: 228, height: 118, filter: {gender: 'Female'},
            coordinates: [
                {point: 'left mouth wedge', x: 85, y: 1172},
                {point: 'right mouth wedge', x: 288, y: 1172},
                {point: 'mouth bottom middle', x: 183, y: 1226}
            ],
            zones: [
                { all: true, color: 'lip_color'}
            ]
        },
        {name: '22 big fluffy lips with teeth', x: 415, y: 1133, width: 228, height: 106, filter: {gender: 'Female'},
            coordinates: [
                {point: 'left mouth wedge', x: 422, y: 1154},
                {point: 'right mouth wedge', x: 625, y: 1154},
                {point: 'mouth bottom middle', x: 523, y: 1231}
            ],
            zones: [
                { all: true, color: 'lip_color'}
            ]
        },
        {name: '23 teethy lips', x: 693, y: 1132, width: 233, height: 99, filter: {gender: 'Female'},
         coordinates: [
             {point: 'left mouth wedge', x: 706, y: 1168},
             {point: 'right mouth wedge', x: 920, y: 1167},
             {point: 'mouth bottom middle', x: 816, y: 1229}
         ], zones: [{ all: true, color: 'lip_color'}]
        },
        {name: '24 full round lips', x: 993, y: 1139, width: 219, height: 93, filter: {gender: 'Female'},
         coordinates: [
             {point: 'left mouth wedge', x: 1001, y: 1189},
             {point: 'right mouth wedge', x: 1206, y: 1188},
             {point: 'mouth bottom middle', x: 1102, y: 1228}
         ], zones: [{ all: true, color: 'lip_color'}]
        }
    ],
    animations: {},
    removeBackgroundColor: '#E5D9C8',
    removeBackgroundNoise: 20
};

new Avatar('register_content_pack', 'mouths_1', {
    style: 'lines', replace_features: ['mouth'], use_frequency: 0.5, filter: {},
    data: content_pack_data, show_reference_points: false
});


var content_pack_data = {
    image: '../js/content_packs/scars_1/scars1-tran.png',
    frames: [

        {name: 'sewn right cheek wound', x: 41, y: 12, width: 253, height: 101, filter: {},
            coordinates: [
                {point: 'right mouth wedge', x: 49, y: 135},
                {point: 'right cheek', x: 290, y: 95},
                {point: 'nose - face right point', x: 206, y: 0}
            ], zones: []
        },

        {name: 'sewn left cheek wound', x: 41, y: 12, width: 253, height: 101, filter: {},
            coordinates: [
                {point: 'left mouth wedge', x: 49, y: 135},
                {point: 'left cheek', x: 290, y: 95},
                {point: 'nose - face left point', x: 206, y: 0}
            ], zones: []
        },

        {name: 'bite mark right cheek', x: 433, y: 277, width: 148, height: 149, filter: {},
            coordinates: [
                {point: 'right mouth wedge', x: 300, y: 300},
                {point: 'right cheek', x: 578, y: 294},
                {point: 'nose - face right point', x: 571, y: 500}
            ], zones: []
        },
        {name: 'bite mark left cheek', x: 433, y: 277, width: 148, height: 149, filter: {},
            coordinates: [
                {point: 'left mouth wedge', x: 300, y: 300},
                {point: 'left cheek', x: 578, y: 294},
                {point: 'nose - face left point', x: 571, y: 500}
            ], zones: []
        },

        {name: 'bloody point right cheek', x: 437, y: 482, width: 152, height: 43, filter: {},
         coordinates: [
             {point: 'right mouth wedge', x: 569, y: 685},
             {point: 'nose - face right point', x: 671, y: 385},
             {point: 'mouth - face right point', x: 360, y: 379}
         ], zones: []
        },

        {name: 'bloody point right neck', x: 437, y: 482, width: 152, height: 43, filter: {},
         coordinates: [
             {point: 'middle neck adams apple', x: 680, y: 685},
             {point: 'mouth - face right point', x: 671, y: 335},
             {point: 'neck mid right', x: 360, y: 379}
         ], zones: []
        }

    ]
};

new Avatar('register_content_pack', 'scars_1', {
    style: 'lines', replace_features: ['scar'], use_frequency: 1, filter: {},
    data: content_pack_data
});


var image = '../js/content_packs/woman_face_parts_1/woman-face-parts-eye-glasses-hat-lips-hair-head-character-40398911-tran.png'
var content_pack_data_glasses = {
    image: image,
    frames: [
        {name: '1 round rims', x: 18, y: 292, width: 160, height: 72, filter: {},
            coordinates: [
                {point: 'left eye center', x: 65, y: 332},
                {point: 'right eye center', x: 135, y: 333},
                {point: 'eyebrow midpoint', x: 100, y: 305}
            ], zones: []
        },
        {name: '2 horn rimmed', x: 204, y: 296, width: 170, height: 65, filter: {},
            coordinates: [
                {point: 'left eye center', x: 254, y: 332},
                {point: 'right eye center', x: 327, y: 332},
                {point: 'eyebrow midpoint', x: 289, y: 309}
            ], zones: []
        },
        {name: '3 goggles', x: 386, y: 307, width: 155, height: 61, filter: {},
            coordinates: [
                {point: 'left eye center', x: 429, y: 337},
                {point: 'right eye center', x: 496, y: 339},
                {point: 'eyebrow midpoint', x: 464, y: 309}
            ], zones: []
        },
        {name: '4 wide glasses', x: 554, y: 289, width: 180, height: 60, filter: {},
            coordinates: [
                {point: 'left eye center', x: 603, y: 320},
                {point: 'right eye center', x: 685, y: 321},
                {point: 'eyebrow midpoint', x: 645, y: 304}
            ], zones: []
        },
        {name: '5 pointey-edged glasses', x: 9, y: 375, width: 183, height: 56, filter: {},
            coordinates: [
                {point: 'left eye center', x: 65, y: 404},
                {point: 'right eye center', x: 136, y: 404},
                {point: 'eyebrow midpoint', x: 104, y: 385}
            ], zones: []
        },
        {name: '6 D-shaped rims', x: 216, y: 371, width: 149, height: 62, filter: {},
            coordinates: [
                {point: 'left eye center', x: 257, y: 403},
                {point: 'right eye center', x: 328, y: 404},
                {point: 'eyebrow midpoint', x: 290, y: 380}
            ], zones: []
        },

        {name: '7 boxy rims', x: 384, y: 373, width: 150, height: 63, filter: {},
            coordinates: [
                {point: 'left eye center', x: 422, y: 405},
                {point: 'right eye center', x: 491, y: 404},
                {point: 'eyebrow midpoint', x: 457, y: 380}
            ], zones: []
        },
        {name: '8 oval glasses', x: 565, y: 364, width: 159, height: 64, filter: {},
            coordinates: [
                {point: 'left eye center', x: 611, y: 396},
                {point: 'right eye center', x: 685, y: 397},
                {point: 'eyebrow midpoint', x: 645, y: 369}
            ], zones: []
        },
        {name: '9 v-like rims', x: 744, y: 358, width: 170, height: 63, filter: {},
            coordinates: [
                {point: 'left eye center', x: 793, y: 389},
                {point: 'right eye center', x: 869, y: 389},
                {point: 'eyebrow midpoint', x: 829, y: 364}
            ], zones: []
        }
    ],
    animations: {},
    removeBackgroundColor: '#white',
    removeBackgroundNoise: 20
};

new Avatar('register_content_pack', 'woman_face_parts_1_glasses', {
    style: 'lines', replace_features: ['glasses'], use_frequency: 1, filter: {},
    data: content_pack_data_glasses, show_reference_points: false
});


var content_pack_data_eyes = {
    image: image,
    frames: [
        {name: '2 surprised eyes', x: 280, y: 32, width: 206, height: 72, filter: {},
            coordinates: [
                {point: 'left eye center', x: 326, y: 85},
                {point: 'right eye center', x: 438, y: 85},
                {point: 'eyebrow midpoint', x: 378, y: 51}
            ], zones: []
        },
        {name: '3 arched thick brows', x: 540, y: 24, width: 225, height: 77, filter: {},
            coordinates: [
                {point: 'left eye center', x: 590, y: 79},
                {point: 'right eye center', x: 714, y: 81},
                {point: 'eyebrow midpoint', x: 653, y: 63}
            ], zones: []
        },
        {name: '4 squinted thick eyes', x: 21, y: 108, width: 216, height: 75, filter: {},
            coordinates: [
                {point: 'left eye center', x: 68, y: 171},
                {point: 'right eye center', x: 190, y: 169},
                {point: 'eyebrow midpoint', x: 130, y: 147}
            ], zones: []
        },
        {name: '5 wide lashes with thick brows', x: 269, y: 121, width: 227, height: 62, filter: {},
            coordinates: [
                {point: 'left eye center', x: 318, y: 168},
                {point: 'right eye center', x: 449, y: 167},
                {point: 'eyebrow midpoint', x: 384, y: 148}
            ], zones: []
        },
        {name: '6 thick brows with many eyelashes', x: 537, y: 121, width: 224, height: 67, filter: {},
            coordinates: [
                {point: 'left eye center', x: 593, y: 168},
                {point: 'right eye center', x: 712, y: 169},
                {point: 'eyebrow midpoint', x: 652, y: 141}
            ], zones: []
        },
        {name: '7 wide eyes with thick brows', x: 18, y: 200, width: 228, height: 67, filter: {},
            coordinates: [
                {point: 'left eye center', x: 72, y: 251},
                {point: 'right eye center', x: 194, y: 251},
                {point: 'eyebrow midpoint', x: 132, y: 229}
            ], zones: []
        },
        {name: '8 pointy almond eyes', x: 272, y: 204, width: 224, height: 67, filter: {},
            coordinates: [
                {point: 'left eye center', x: 325, y: 257},
                {point: 'right eye center', x: 440, y: 257},
                {point: 'eyebrow midpoint', x: 380, y: 221}
            ], zones: []
        },
        {name: '9 upturned eyes', x: 534, y: 205, width: 227, height: 72, filter: {},
            coordinates: [
                {point: 'left eye center', x: 586, y: 257},
                {point: 'right eye center', x: 714, y: 257},
                {point: 'eyebrow midpoint', x: 648, y: 227}
            ], zones: []
        }
    ],
    animations: {},
    removeBackgroundColor: 'white',
    removeBackgroundNoise: 20
};

new Avatar('register_content_pack', 'woman_face_parts_1_eyes', {
    style: 'lines', replace_features: ['eyes'], use_frequency: .5, filter: {gender: 'Female'},
    data: content_pack_data_eyes, show_reference_points: false
});

var image = '../js/content_packs/woman_hair_1/daily_sketch___dat_hair_by_hyunit-d6xbcyr.png'
var content_pack_data_glasses = {
    image: image,
    frames: [

    ],
    animations: {},
    removeBackgroundColor: 'white',
    removeBackgroundNoise: 20
};

new Avatar('register_content_pack', 'woman_hair_1', {
    style: 'lines', replace_features: ['hair'], use_frequency: 1, filter: {},
    data: content_pack_data_glasses, show_reference_points: false
});


new Avatar('add_render_function', {style: 'lines', feature: 'horns', renderer: function (face_zones, avatar) {
    var f = face_zones;
    var a = avatar._private_functions;
    var face_options = avatar.face_options;
    var lines = avatar.lines;
    var shapes = [];
    var horn_squint = .8;

    var width_horn = (f.thick_unit * 60);
    var horn_radius = .6; //.5-0.9
    var x = f.eyes.left_x - (f.thick_unit * 5);
    var y = f.eyes.y - (f.thick_unit * 120);
    var rotation_amount = -10;

    var horn_fill_colors = ['#fff', '#eee', '#ddd'];
    var horn_fill_steps = [.1, .5, 1];

    var horn_size = 6;
    if (face_options.horn_size == 'Small') {
        horn_size = 0;
        horn_squint = .7;
    } else if (face_options.horn_size == 'Large') {
        horn_size = 12;
        horn_squint = .9;
    }


    var left_horn_base_line = a.transformShapeLine([
        {type: 'oval', radius_x: horn_radius * width_horn, radius_y: horn_radius * width_horn * horn_squint}
    ], face_options);
    var left_horn_base = a.createPath(left_horn_base_line, {
        close_line: true, line_color: face_options.skin_colors.darkflesh
    });
    left_horn_base.x = x;
    left_horn_base.y = y;
    left_horn_base.rotation = rotation_amount;
    lines.push({name: 'left horn base', line: left_horn_base_line, shape: left_horn_base, scale_x: 1, scale_y: 1, x: x, y: y, rotation: rotation_amount});
//    shapes.push(left_horn_base);


    x = f.eyes.right_x + (f.thick_unit * 5);
    var right_horn_base_line = a.transformShapeLine({type: 'reverse', direction: 'horizontal', axis: 0}, face_options, left_horn_base_line);
    var right_horn_base = a.createPath(right_horn_base_line, {
        close_line: true, line_color: face_options.skin_colors.darkflesh
    });
    right_horn_base.x = x;
    right_horn_base.y = y;
    right_horn_base.rotation = -rotation_amount;
    lines.push({name: 'right horn base', line: right_horn_base_line, shape: right_horn_base, scale_x: 1, scale_y: 1, x: x, y: y, rotation: -rotation_amount});
//    shapes.push(right_horn_base);


    var thickness = 2;
    //Horn
    var horn_point_x_offset = width_horn * .9;  //TODO: Adjust by age?
    var horn_point_y_offset = width_horn * 1.2;

    var left_horn_leftmost = a.comparePoints(left_horn_base_line, 'x', 'lowest', true);
    var left_horn_rightmost = a.comparePoints(left_horn_base_line, 'x', 'highest', true);
    var left_horn_bottommost = a.comparePoints(left_horn_base_line, 'y', 'highest', true);

    var horn_thickness = .3;
    if (face_options.horn_thickness == 'Thin') {
        horn_thickness = .4;
    } else if (face_options.horn_thickness == 'Thick') {
        horn_thickness = .2;
    }

    left_horn_rightmost.x += (f.thick_unit * horn_size);

    var horn_line = [];
    horn_line.push({x: left_horn_leftmost.x - horn_point_x_offset, y: left_horn_leftmost.y - horn_point_y_offset});
    horn_line.push({x: left_horn_leftmost.x - (horn_point_x_offset * (.9 - horn_thickness)), y: left_horn_rightmost.y - (horn_point_y_offset * (.7 - horn_thickness))});
    horn_line.push(left_horn_rightmost);
    horn_line.push(left_horn_bottommost);
    horn_line.push({x: left_horn_leftmost.x - (horn_point_x_offset * .9), y: left_horn_leftmost.y - (horn_point_y_offset * .3)});
    horn_line.push({x: left_horn_leftmost.x - horn_point_x_offset, y: left_horn_leftmost.y - horn_point_y_offset});

    var horn_draw_options = {
        close_line: true, thickness: 1.2 * thickness,
        fill_steps: horn_fill_steps, fill_colors: horn_fill_colors,
        x_offset: a.comparePoints(horn_line, "x", "highest"),
        y_offset: a.comparePoints(horn_line, "y", "highest"),
        radius: a.comparePoints(horn_line, 'height'),
        line_color: horn_fill_colors[0]
    };

    var left_horn_line = a.createPath(horn_line, horn_draw_options);
    left_horn_line.x = left_horn_base.x;
    left_horn_line.y = left_horn_base.y;
    lines.push({name: 'nose bottom line', line: horn_line, shape: left_horn_line});
    shapes.push(left_horn_line);


    x = f.eyes.right_x + (f.thick_unit * 5);
    var right_horn_line = a.transformShapeLine({type: 'reverse', direction: 'horizontal', axis: 0}, face_options, horn_line);
    var right_horn = a.createPath(right_horn_line, horn_draw_options);
    right_horn.x = x;
    right_horn.y = y;
    lines.push({name: 'right horn', line: right_horn_line, shape: right_horn, scale_x: 1, scale_y: 1, x: x, y: y, rotation: -rotation_amount});
    shapes.push(right_horn);


    return shapes;
}});

var demonTemplate = new Avatar('copy_data_template', 'Human');

demonTemplate.eye_size_options = ['Big', 'Massive', 'Large'];
demonTemplate.eye_color_options = ['Red', 'Pink', 'Purple'];
demonTemplate.eye_cloudiness_options = ['Pink'];
demonTemplate.pupil_color_options = ['Maroon', 'Red'];
demonTemplate.horn_thickness_options = ['Thick', 'Medium', 'Thin'];
demonTemplate.horn_size_options = ['Small', 'Medium', 'Large'];

demonTemplate.thickness_options = [3, 4, 5, 6];

demonTemplate.hair_style_options = ['Bald'];
demonTemplate.beard_style_options = ['None'];
demonTemplate.stubble_style_options = ['None'];
demonTemplate.wrinkle_resistance_options = ['Very Low', 'Low', 'Less'];

demonTemplate.skin_shade_options = ['Preset'];
demonTemplate.skin_colors_options = [
    {name: 'Dark', highlights: 'rgb(255,30,30)', skin: 'rgb(200,30,30)'}
];

demonTemplate.rendering_order.push({feature: 'horns', style: 'lines'});


new Avatar('set_data_template', 'Demon', demonTemplate);

var naviTemplate = new Avatar('copy_data_template', 'Human');

naviTemplate.ear_shape_options.push('Pointed');

naviTemplate.eye_cloudiness = ['Pink'];

naviTemplate.skin_colors_options = [
    {skin: '#8888EE', cheek: '#898acc'},
    {skin: '#8888CC', cheek: '#898add'},
    {skin: '#8080DD', cheek: '#898aee'},
    {skin: '#9090DD', cheek: '#898add'}
];
naviTemplate.skin_shade_options = ['Preset'];
naviTemplate.beard_style_options = ['None'];
naviTemplate.stubble_style_options = ['None'];

naviTemplate.thickness_options = [-1, .5, 0, .5, 1];

naviTemplate.face_shape_options = "Oval,Rectangular,Diamond".split(",");

new Avatar('set_data_template', 'Navi', naviTemplate);

var ogreTemplate = new Avatar('copy_data_template', 'Human');

ogreTemplate.ear_shape_options.push('Pointed');

ogreTemplate.eye_color_options = ['Red', 'Pink', 'Purple', 'Yellow'];
ogreTemplate.eye_cloudiness_options = ['Pink', 'Blue', 'Misty'];

ogreTemplate.skin_colors_options = [
    {name: 'Fair', highlights: 'rgb(40,202,30)', skin: 'rgb(50,185,50)'},
    {name: 'Dark', highlights: 'rgb(80,80,80)', skin: 'rgb(80,185,70)'}
];

ogreTemplate.skin_shade_options = ['Preset'];

new Avatar('set_data_template', 'Ogre', ogreTemplate);
