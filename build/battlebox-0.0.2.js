/*
------------------------------------------------------------------------------------
-- battlebox.js - v0.0.2 - Built on 2015-11-11 by Jay Crossler using Grunt.js
------------------------------------------------------------------------------------
-- Using rot.js (ROguelike Toolkit) which is Copyright (c) 2012-2015 by Ondrej Zara 
-- Packaged with color.js - Copyright (c) 2008-2013, Andrew Brehaut, Tim Baumann,  
--                          Matt Wilson, Simon Heimler, Michel Vielmetter 
-- colors.js - Copyright 2012-2013 Matt Jordan - https://github.com/mbjordan/Colors 
------------------------------------------------------------------------------------
*/
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

    for (i = 0; i < input.length; i++) {
        item = input[i];
        if (item.after || item.above) { //TODO: Also implement item.before || item.behind
            remaining.push(item);
        } else {
            out.push(item);
        }
    }

    //Look through each item, order them by their conditions
    var unmatched = 0;
    for (i = 0; i < remaining.length; i++) {
        item = remaining[i];
        after = item.after || item.above;
        if (!_.isArray(after)) after = [after];
        highest = 0;
        var conditions_met = 0;
        for (c = 0; c < after.length; c++) {
            condition = after[c];
            for (t = 0; t < out.length; t++) {
                to = out[t];
                if (condition == to[val_name]) {
                    if ((t + 1) > highest) highest = t + 1;
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
    for (i = (out.length - unmatched); i < out.length; i++) {
        item = out[i];
        after = item.after || item.above;
        if (!_.isArray(after)) after = [after];
        highest = 0;
        for (c = 0; c < after.length; c++) {
            condition = after[c];
            for (t = 0; t < out.length; t++) {
                to = out[t];
                if (condition == to[val_name]) {
                    if (t > highest) highest = t + 1;
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
Helpers.expandExponential = function (value) {
    //Modified from: http://stackoverflow.com/questions/16066793/javascript-display-really-big-numbers-rather-than-displaying-xen
    if (value < 100000000000000000000) {
        return value;
    } else {
        var value = value + "";
        value = value.replace(/^([+-])?(\d+).?(\d*)[eE]([-+]?\d+)$/, function (x, s, n, f, c) {
            var l = +c < 0, i = n.length + +c, x = (l ? n : f).length,
                c = ((c = Math.abs(c)) >= x ? c - x + l : 0),
                z = (new Array(c + 1)).join("0"), r = n + f;
            return (s || "") + (l ? r = z + r : r += z).substr(0, i += l ? z.length : 0) + (i < r.length ? "." + r.substr(i) : "");
        });
        return value;
    }
};
Helpers.abbreviateNumber = function (value, useLongSuffixes, hide_decimals) {
    //Modified From: http://stackoverflow.com/questions/10599933/convert-long-number-into-abbreviated-string-in-javascript-with-a-special-shortn
    if (value < 1000000) {
        if (hide_decimals) {
            value = parseInt(value);
        } else {
            value = Helpers.round(value,1);
        }
    }
    var newValue = value;
    if (value >= 10000) {
        value = Helpers.expandExponential(value);
        var suffixes = useLongSuffixes ? ["", " thousand", " million", " billion", " trillion", " quadrillion", " pentillion", " sextillion", " septillion"] : ["", "k", "m", "b", "t", "q", "p", "s", "ss"];
        var suffixNum = Math.floor(("" + value).length / 3);
        var shortValue = '';
        for (var precision = 2; precision >= 1; precision--) {
            shortValue = parseFloat((suffixNum != 0 ? (value / Math.pow(1000, suffixNum) ) : value).toPrecision(precision));
            var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g, '');
            if (dotLessShortValue.length <= 2) {
                break;
            }
        }
        newValue = shortValue + suffixes[suffixNum];
    } else {
        newValue = newValue.toLocaleString();
    }
    return newValue;
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
    if (rgb[0] == "#") {
        rgb = rgb.substr(1);
    }
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
        'equipment', 'information', 'rice', 'money', 'species', 'series', 'gold',
        'fish', 'sheep', 'moose', 'deer', 'news', 'food', 'wood', 'ore', 'piety', 'land'
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

(function () {

    if ("performance" in window == false) {
        window.performance = {};
    }

    Date.now = (Date.now || function () {  // thanks IE8
        return new Date().getTime();
    });

    if ("now" in window.performance == false) {

        var nowOffset = Date.now();

        if (performance.timing && performance.timing.navigationStart) {
            nowOffset = performance.timing.navigationStart
        }

        window.performance.now = function now() {
            return Date.now() - nowOffset;
        }
    }

})();
var Battlebox = (function ($, _, Helpers, maths) {
    //Uses jquery and Underscore

    //TODO: Move rot random functions into all game systems
    //TODO: rename "funcs" to "callbacks"
    //TODO: Add note of why hex skips alternate y xs
    //TODO: Have better way to track free-cells, or pick places on sides of screen

    //-----------------------------
    //Private Global variables
    var version = '0.0.2',
        summary = 'HTML game engine to simulate a battlefield for multiple troops to combat upon.',
        author = 'Jay Crossler - http://github.com/jaycrossler',
        file_name = 'battlebox.js';

    var _data = {};
    var _game_options = {};

    //-----------------------------
    //Initialization
    function BattleboxClass(option1, option2, option3) {
        this.version = file_name + ' (version ' + version + ') - ' + summary + ' by ' + author;
        this.timing_log = [];
        this.game_options = null;
        this.times_game_drawn = 0;
        this.initialization_seed = null;

        this.display = null;
        this.engine = null;
        this.map = {};
        this.open_space = [];
        this.entities = [];

        return this.api(option1, option2, option3);
    }

    BattleboxClass.prototype.api = function (option1, option2, option3) {
        if (option1 == 'get_private_functions') {
            return this._private_functions;
        } else if (option1 == 'add_game_option') {
            _game_options[option2] = _game_options[option2] || [];
            if (_.isArray(option3)) {
                _game_options[option2] = _game_options[option2].concat(option3);
            } else {
                _game_options[option2].push(option3);
            }
        } else if (option1 == 'set_game_option') {
            _game_options[option2] = option3;
        } else if (option1 == 'get_game_options') {
            return _game_options;
        } else if (option1 == 'get_game_option_category') {
            return _game_options[option2];
        } else if (option1 == '') {
            //Class initialized
        } else {
            this.drawOrRedraw(option1, option2, option3);
        }
    };

    BattleboxClass.prototype.data = _data;

    BattleboxClass.prototype.initializeOptions = function (option_type, options) {
        if (option_type == 'game_options') {
            _game_options = options;
        }
    };

    BattleboxClass.prototype.drawOrRedraw = function (game_options) {
        //Begin timing loop
        var timing_start = window.performance.now();
        var game = this;

        //Set up initialization data if not previously set
        if (game.game_options === null) {
            game.initialization_seed = null;
        }
        game.initialization_options = game_options || game.initialization_options || {};
        game.game_options = $.extend({}, game.game_options || _game_options, game_options || {});

        //Determine the random seed to use.  Either use the one passed in, the existing one, or a random one.
        game_options = game_options || {};
        var rand_seed = game_options.rand_seed || game.initialization_seed || Math.floor(Math.random() * 100000);
        game.initialization_seed = rand_seed;
        game.initialization_options.rand_seed = rand_seed;
        game.randomSetSeed(rand_seed);

        if (!game.data.gui_drawn && game._private_functions.initialize_ui_display && game._private_functions.load) {
            var game_was_loaded = game._private_functions.load(game, 'localStorage');
            game._private_functions.initialize_data(game);
            if (!game_was_loaded) {
                game._private_functions.initialize_ui_display(game);
            }
            game.data.gui_drawn = true;
        }

        //Run all functions added by plugins
        _.each(game.game_options.functions_on_setup, function (func) {
            func(game);
        });

        //Begin Game Simulation
        game.start(game.game_options);

        //Log timing information
        var timing_end = window.performance.now();
        var time_elapsed = (timing_end - timing_start);
        game.timing_log.push({name: "Game UI built", elapsed: time_elapsed, times_redrawn: game.times_game_drawn});
    };

    //-----------------------------
    //Supporting functions
    BattleboxClass.prototype.log = function (showToConsole, showHTML) {
        var log = "Battlebox: [seed:" + this.game_options.rand_seed + " #" + this.times_game_drawn + "]";
        _.each(this.timing_log, function (log_item) {
            if (log_item.name == 'exception') {
                if (log_item.ex && log_item.ex.name) {
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
    BattleboxClass.prototype.logMessage = function (msg, showToConsole) {
        if (_.isString(msg)) msg = {name: msg};

        this.timing_log.push(msg);
        if (showToConsole) {
            console.log(JSON.stringify(msg));
        }
        if (this._private_functions.log_display) {
            this._private_functions.log_display(this);
        }
    };
    BattleboxClass.prototype.lastTimeDrawn = function () {
        var time_drawn = 0;
        var last = _.last(this.timing_log);
        if (last) time_drawn = last.elapsed;

        return time_drawn;
    };

    BattleboxClass.prototype.getSeed = function (showAsString) {
        var result = this.initialization_options || {};
        return showAsString ? JSON.stringify(result) : result;
    };

    BattleboxClass.prototype.start = function (game_options) {
        if (this._private_functions.start_game_loop) {
            this._private_functions.start_game_loop(this, game_options);
        } else {
            throw "Game loop not found";
        }
    };
    BattleboxClass.prototype.stop = function () {
        if (this._private_functions.stop_game_loop) {
            this._private_functions.stop_game_loop(this);
        }
    };

    //----------------------
    //Random numbers
    BattleboxClass.prototype.randomSetSeed = function (seed) {
        this.game_options = this.game_options || {};
        this.game_options.rand_seed = seed || Math.random();

        //Also set the Rot.JS seed
        ROT.RNG.setSeed(this.game_options.rand_seed);
    };

    function random(game_options) {
        return ROT.RNG.getUniform();

//        game_options = game_options || {};
//        game_options.rand_seed = game_options.rand_seed || Math.random();
//        var x = Math.sin(game_options.rand_seed++) * 300000;
//        return x - Math.floor(x);
    }

    function randInt(max, game_options) {
        max = max || 100;
        return parseInt(random(game_options) * max + 1);
    }

    function randOption(options, game_options, dontUseVal) {
        var len = options.length;
        var numChosen = randInt(len, game_options) - 1;
        var result = options[numChosen];
        if (dontUseVal) {
            if (result == dontUseVal) {
                numChosen = (numChosen + 1) % len;
                result = options[numChosen];
            }
        }
        return result;
    }

    function randHistogram(center, tries, game_options, min, max) {
        //NOTE: This breaks down when 'center' is below 5% or above 95% (depending on how many tries are used), for that use randAverage
        var closest = 1;
        min = min || 0;
        max = max || 1;
        var multiplier = max - min;
        var modified_center = (center - min) / multiplier;

        for (var i = 0; i < tries; i++) {
            var roll = random(game_options);
            if (Math.abs(roll - modified_center) < Math.abs(closest - modified_center)) {
                closest = roll;
            }
        }
        return (closest * multiplier) + min;
    }

    function randAverage(rolls, chance, stddev, game_options) {
        stddev = stddev || 5;
        var expected = chance * rolls;
        var expected_modifier = randHistogram(.5, stddev, game_options);

        return expected * expected_modifier * 2;
    }

    function randRange(minVal, maxVal, game_options, floatVal) {
        //optional Floatval specifies number of decimal points
        var randVal = minVal + (random(game_options) * (maxVal - minVal + 1));
        return (floatVal !== undefined) ? Math.round(randVal - .5) : randVal.toFixed(floatVal);
    }

    function randManyRolls(rolls, chance, game_options) {
        var successes = 0;
        if (rolls < 100) {
            for (var i = 0; i < rolls; i++) {
                if (random(game_options) < chance) successes++;
            }
        } else {
            //Note, using two different randomization options for large numbers, both have different accuracies/stddevs
            if (chance < .07 || chance > .93) {
                successes = randAverage(rolls, chance, 3, game_options);
            } else {
                successes = randHistogram(rolls * chance, Math.pow(rolls, 1 / 2), game_options, 0, rolls);
            }
        }

        return Math.round(successes);
    }

    BattleboxClass.prototype._private_functions = {
        random: random,
        randInt: randInt,
        randOption: randOption,
        randRange: randRange,
        randManyRolls: randManyRolls,
        randHistogram: randHistogram
    };

    return BattleboxClass;
})($, _, Helpers, maths);

Battlebox.initializeOptions = function (option_type, options) {
    var civ_pointer = new Battlebox('');
    civ_pointer.initializeOptions(option_type, options);
};
(function (Battlebox) {

    //TODO: Game is over if all of the forces on a defender's side are killed.  How to handle monsters?
    //TODO: Should there be a list of sides that matter in a conflict?

    var _c = new Battlebox('get_private_functions');

    _c.entity_attacks_entity = function (game, attacker, defender, callback) {
        attacker._data.troops = attacker._data.troops || {};
        defender._data.troops = defender._data.troops || {};
        callback = callback || _c.log_message_to_user;

        var a_name = attacker._data.name || "Attacker";
        var a_side = attacker._data.side || "Side 1";
        var a_count = (attacker._data.troops.soldiers || 0) + (attacker._data.troops.cavalry || 0) + (attacker._data.troops.siege || 0) + (1000 * (attacker._data.troops.adult_dragon || 0));

        var d_name = defender._data.name || "Defender";
        var b_side = defender._data.side || "Side 2";
        var d_count = (defender._data.troops.soldiers || 0) + (defender._data.troops.cavalry || 0) + (defender._data.troops.siege || 0) + (1000 * (defender._data.troops.adult_dragon || 0));

        var enemies_alive;
        var message = "";
        var game_over_side;

        if (a_count >= d_count) {
            defender.is_dead = true;
            _c.remove_entity(game, defender);

            message = "<b>" +a_name + " ("+a_side+", size "+a_count+")</b> wins attacking "+ d_name + " ("+b_side+", power "+d_count+")";

            enemies_alive = _c.find_unit_by_filters(game, attacker, {side: 'enemy', return_multiple:true, only_count_forces:true});
            if (enemies_alive.target.length == 0) {
                game_over_side = attacker._data.side;
            }
            callback(game, message, 3, a_side);

        } else {
            attacker.is_dead = true;
            _c.remove_entity(game, attacker);

            message = a_name + " ("+a_side+", size "+a_count+") loses attacking <b>"+ d_name + " ("+b_side+", power "+d_count+")</b>";

            enemies_alive = _c.find_unit_by_filters(game, defender, {side: 'enemy', return_multiple:true});
            if (enemies_alive.target.length == 0) {
                game_over_side = defender._data.side;
            }

            callback(game, message, 3, b_side);
        }

        if (game_over_side) {
            _c.game_over(game, game_over_side);
        }

    }



})(Battlebox);
(function (Battlebox) {
    var _c = new Battlebox('get_private_functions');
    var $pointers = {};

    //TODO: Pass in a length of rounds before game is over

    _c.draw_initial_display = function (game, options) {
        $pointers.canvas_holder = $('#container');

        $pointers.message_display = $('#message_display');

        game.display = new ROT.Display({
            transpose: game.game_options.transpose,
            width: _c.cols(game),
            height: _c.rows(game),
            fontSize: game.game_options.cell_size,
            layout: "hex",
//            fontFamily: "droid sans mono",
            border: game.game_options.cell_border || 0.1,
            spacing: game.game_options.cell_spacing || .88
        });
        var container_canvas = game.display.getContainer();

        $pointers.canvas_holder
            .append(container_canvas);

        $pointers.info_box = $('<div>')
            .appendTo($pointers.canvas_holder);

        _c.generate_base_map(game);

        _c.generate_buildings(game);

        _c.draw_whole_map(game);

        ROT.RNG.setSeed(game.data.fight_seed || game.data.rand_seed);
        _c.build_units_from_list(game, game.data.forces);

        _c.build_scheduler(game);

        _c.add_screen_scheduler(game);

        $pointers.logs = $("<div>")
            .css({color: 'gray'})
            .appendTo($pointers.message_display);

        game.logMessage(game.log());

        $pointers.play_pause_button = $('<button>')
            .text('Pause')
            .on('click', function () {
                if ($pointers.play_pause_button.text() == 'Pause') {
                    $pointers.play_pause_button.text('Play');
                    _c.stop_game_loop(game);
                } else {
                    $pointers.play_pause_button.text('Pause');
                    _c.start_game_loop(game);
                }
            })
            .appendTo($pointers.canvas_holder);

        return container_canvas;
    };

    _c.rows = function (game) {
        return game.game_options.transpose ? game.game_options.cols : game.game_options.rows;
    };
    _c.cols = function (game) {
        return game.game_options.transpose ? game.game_options.rows : game.game_options.cols;
    };

    _c.draw_whole_map = function (game) {
        //Draw every tile
        for (var y = 0; y < _c.rows(game); y++) {
            for (var x = y % 2; x < _c.cols(game); x += 2) {
                _c.draw_tile(game, x, y);
            }
        }
    };

    _c.draw_tile = function (game, x, y, text, color, bg_color) {
        //Cell is used to get color and symbol

        var draw_basic_cell = false;
        if (!color) {
            draw_basic_cell = true;
        }

        var cell = game.cells[x];
        if (cell) {
            cell = cell[y];
        }
        if (!cell) {
//            console.error('Tried to draw invalid tile:' + x + ":" + y);
            return;
        }

        if (draw_basic_cell) {
            //No information was passed in, assume it's the default cell draw without player in it
            if (cell.type == 'city') {
                bg_color = '#DE8275';
            }
            var num_farms = _c.tile_has(cell, 'farm', true);
            if (_c.tile_has(cell, 'mine')) {
                bg_color = '#4c362c';
            } else if (_c.tile_has(cell, 'dock')) {
                bg_color = '#86fffc';
                text = '=';
            } else if (num_farms) {
                var farm_darkness = Math.min(.4, num_farms * .03);
                bg_color = net.brehaut.Color('#CCC4B7').darkenByRatio(farm_darkness).toString();
            }

            var was_drawn = false;
            _.each(_c.entities(game), function (entity) {
                if (entity && entity.x == x && entity.y == y && entity._draw) {
                    entity._draw(entity.x, entity.y);
                    was_drawn = true;
                }
            });
            if (was_drawn) return;
        }

        var river_info = _c.tile_has(cell, 'river');
        if (draw_basic_cell && cell.name == 'lake') {
            text = cell.symbol || text;
            if (!bg_color) {
                var depth = cell.data.depth || 1;
                bg_color = net.brehaut.Color(cell.color || '#04e').darkenByRatio(depth * .2);
                //, color:['#06f','#08b','#05e']
            }
        } else if (draw_basic_cell && river_info) {
            text = text ||river_info.symbol;

            //Depth from 1-3 gets more blue
            if (!bg_color) {
                var depth = river_info.depth || 1;
                bg_color = net.brehaut.Color('#03f').darkenByRatio(depth * .2);
                //, color:['#06f','#08b','#05e']
            }
        }

        var population_darken_amount = 0;
        if (cell.population) {
            color = Helpers.blendColors('black', 'red', cell.population/300);
            if (cell.population > 1000) {
                color = 'orange';
                text = '█';
                population_darken_amount = .6;
            } else if (cell.population > 500) {
                color = 'orange';
                text = '▓';
                population_darken_amount = .5;
            } else if (cell.population > 300) {
                text = '▓';
                population_darken_amount = .4;
            } else if (cell.population > 150) {
                text = '▄';
                population_darken_amount = .3;
            } else if (cell.population > 50) {
                text = '▒';
                population_darken_amount = .2;
            } else if (cell.population > 10) {
                text = '░';
                population_darken_amount = .1;
            }
        }

        if (text === undefined) {
            text = cell ? cell.symbol || " " : " "
        }
        var bg = bg_color;
        if (!bg) {
            if (cell) {
                bg = cell.color || '#000';
            } else if (text == " ") {
                bg = ["#cfc", "#ccf0cc", "#dfd", "#ddf0dd"].random();
            } else {
                bg = "#000";
            }
        }

        if (!color && _c.tile_has(cell, 'unit corpse')) {
            text = "x";
        }


        var bridge = false;
        var path_info = _c.tile_has(cell, 'path');
        if (draw_basic_cell && path_info) {
            text = path_info.symbol || "";
            bg = net.brehaut.Color(bg).blend(net.brehaut.Color('#A2BB9B'), .7).toString();
            if (_c.tile_has(cell, 'river') || (cell.data && cell.data.water)) bridge = true;
        }
        var road_info = _c.tile_has(cell, 'road');
        if (draw_basic_cell && road_info) {
            text = road_info.symbol || ":";

            bg = net.brehaut.Color(bg).blend(net.brehaut.Color('#DF8274'), .8).toString();
            color = "#000";
            if (_c.tile_has(cell, 'river') || (cell.data && cell.data.water)) bridge = true;
        }

        if (draw_basic_cell && _c.tile_has(cell, 'storage')) {
            text = "o";
            bg = net.brehaut.Color(bg).blend(net.brehaut.Color('yellow'), .1).toString();
        }
        if (draw_basic_cell && _c.tile_has(cell, 'looted')) {
            text = ".";
            bg = net.brehaut.Color(bg).blend(net.brehaut.Color('black'), .8).toString();
        }
        if (draw_basic_cell && _c.tile_has(cell, 'pillaged')) {
            text = "'";
            bg = net.brehaut.Color(bg).blend(net.brehaut.Color('red'), .8).toString();
        }
        if (_c.tile_has(cell, 'looted') && _c.tile_has(cell, 'pillaged')) {
            text = ";";
        }
        if (bridge) {
            bg = net.brehaut.Color(bg).blend(net.brehaut.Color('brown'), .8).toString();
            text = "=";
            color = "#fff";
        }
        if (population_darken_amount) {
            bg = net.brehaut.Color(bg).blend(net.brehaut.Color('brown'), population_darken_amount).toString();
        }


        //First draw it black, then redraw it with the chosen color to help get edges proper color
        game.display.draw(x, y, text, color || "#000", bg);
    };

    _c.log_display = function (game) {
        if (!$pointers.logs) {
            $pointers.logs = $("#logs");
        }

        if ($pointers.logs) {
            var log = "<b>Battlebox: [seed:" + game.game_options.rand_seed + "]</b>";

            var head_log = _.last(game.timing_log, 5);
            _.each(head_log.reverse(), function (log_item) {
                if (log_item.name == 'exception') {
                    if (log_item.ex && log_item.ex.name) {
                        log += "<br/> -- EXCEPTION: " + log_item.ex.name + ", " + log_item.ex.message;
                    } else if (log_item.msg) {
                        log += "<br/> -- EXCEPTION: " + log_item.msg;
                    } else {
                        log += "<br/> -- EXCEPTION";
                    }
                } else if (log_item.elapsed) {
                    log += "<br/> - " + log_item.name + ": " + Helpers.round(log_item.elapsed, 4) + "ms";
                } else {
                    log += "<br/> - " + log_item.name;
                }
            });
            $pointers.logs.html(log);
        } else {
            console.log("NOTE: No Log div to write to.")
        }
    };

    var highlighted_hex = null;
    _c.highlight_position = function (game, location) {
        if (highlighted_hex && highlighted_hex.length == 2) {
            _c.draw_tile(game, highlighted_hex[0], highlighted_hex[1]);
        }

        if (location.length == 2) {
            highlighted_hex = location;
            _c.draw_tile(game, location[0], location[1], undefined, undefined, 'orange');
        } else {
            highlighted_hex = null;
        }

    };

    _c.log_message_to_user = function (game, message, importance, color) {
        if (importance < (game.game_options.log_level_to_show || 2)) return;

        var $msg = $('<div>')
            .html(message)
            .prependTo($pointers.message_display);

        if (importance == 4) {
            $msg.css({backgroundColor: color || 'red', color: 'black', border: '4px solid gold', fontSize: '1.3em'});
        }
        if (importance == 3) {
            $msg.css({backgroundColor: color || 'orange', color: 'black'});
        }
        if (importance == 2) {
            $msg.css({color: 'red'});
        }
        if (importance == 1) {
            $msg.css({color: 'orange'});
        }
    };


    _c.show_info = function (info) {
        var out;
        if (_.isString(info)) {
            out = info;
        } else {
            out = JSON.stringify(info);
        }
        $pointers.info_box
            .html(out);
    }

})(Battlebox);
(function (Battlebox) {
    var _c = new Battlebox('get_private_functions');

    _c.initialize_data = function (game, data) {
        game.data = game.data || {};

        var arrays_to_data_objects = game.game_options.arrays_to_map_to_objects || [];
        _.each(arrays_to_data_objects, function (game_options_name) {
            //Add objects for each game_objects array to the game data
            game.data[game_options_name] = game.data[game_options_name] || {};
            _.each(game.game_options[game_options_name], function (item) {
                game.data[game_options_name][item.name] = game.data[game_options_name][item.name] || item.initial || 0;
            });
        });

        var arrays_to_array_objects = game.game_options.arrays_to_map_to_arrays || [];
        _.each(arrays_to_array_objects, function (game_options_name) {
            //Add an array for game_objects to the game data
            if (game.data[game_options_name] !== undefined) {
                //Already exists, don't add it
            } else {
                game.data[game_options_name] = game.data[game_options_name] || [];
                _.each(game.game_options[game_options_name], function (item) {
                    game.data[game_options_name].push(JSON.parse(JSON.stringify(item)));
                });
            }
        });

        game.data.rand_seed = game.data.rand_seed || game.game_options.rand_seed;
        game.data.fight_seed = game.data.fight_seed || game.game_options.fight_seed || game.data.rand_seed;
        game.data.tick_count = game.data.tick_count || 0;
    };
    _c.info = function (game, kind, name, sub_var, if_not_listed) {
        //Usage:  var info = _c.info(game, 'buildings', resource.name);
        var val = _.find(game.game_options[kind], function (item) {
            return item.name == name
        });
        if (val && sub_var) {
            val = val[sub_var];
        }
        if (!val) val = if_not_listed;

        return val;
    };
    _c.variable = function (game, var_name, set_to) {
        if (set_to === undefined) {
            return game.data.variables[var_name];
        } else {
            game.data.variables[var_name] = set_to;
        }
    };

    _c.initialize_ui_display = function (game) {
        var canvas = _c.draw_initial_display(game, {});

        canvas.addEventListener("mousemove", function (ev) {
            var loc = game.display.eventToPosition(ev);
            _c.highlight_position(game, loc);

            _c.show_info(_c.tile_info(game, loc[0], loc[1]));
        });
    };

    _c.update_ui_display = function (game) {


    };

    _c.start_game_loop = function (game) {
        game.logMessage("Starting game loop");
        game.data.in_progress = true;
        game.engine.start();
    };

    _c.stop_game_loop = function (game) {
        game.logMessage("Stopping game loop");
        game.data.in_progress = false;
    };

    _c.build_scheduler = function (game) {
        var scheduler = new ROT.Scheduler.Speed();
        _.each(_c.entities(game), function (entity) {
            scheduler.add(entity, true);
        });
        game.scheduler = scheduler;
        game.engine = new ROT.Engine(scheduler);
    };

    _c.entities = function (game) {
        var entities = [];
        for (var i = 0; i < game.entities.length; i++) {
            if (game.entities[i]) {
                entities.push(game.entities[i]);
            }
        }
        return entities;
    };


    _c.game_over = function (game, side_wins) {
        game.engine.lock();
        if (!side_wins) {
            //TODO: Find the winning side based on amount of city destroyed and number of troops
            side_wins = "No one";
        }

        var msg = "Game Over!  " + side_wins + ' wins!';

        msg+= " ("+ game.data.tick_count + " rounds)";

        //Find ending loot retrieved via living armies
        var loot = {};
        _.each(game.entities, function(unit){
            if (unit && unit._data && unit._data.player) {
                if (unit.loot) {
                    for (var key in unit.loot) {
                        loot[key] = loot[key] || 0;
                        loot[key] += unit.loot[key];
                    }
                }
            }
        });
        var loot_msg = [];
        for (var key in loot) {
            loot_msg.push(loot[key] + " " + Helpers.pluralize(key))
        }


        //Calculate % of cities left
        var city_msg = [];
        var tiles_total = 0;
        var tiles_ruined = 0;
        _.each(game.data.buildings, function(city){
            if (city.type == 'city') {
                _.each(city.tiles || [], function (tile) {
                    tiles_total++;
                    if (_c.tile_has(tile, 'pillaged') || _c.tile_has(tile, 'looted')) {
                        tiles_ruined++;
                    }
                });
                var pct = Math.round((tiles_ruined/tiles_total) * 100);
                var msg_c = pct+"% of "+(city.title || city.name) +" destroyed";
                city_msg.push(msg_c);
            }
        });

        if (city_msg.length) {
            msg += "<hr/><b>Cities:</b><br/> " + city_msg.join("<br/>");
        }
        if (loot_msg.length) {
            msg += "<hr/><b>Loot:</b><br/>" + loot_msg.join("<br/>");
        }

        _c.log_message_to_user(game, msg, 4, (side_wins == "No one" ? 'gray' : side_wins));

        if (game.game_options.game_over_function) {
            game.game_options.game_over_function(game);
        }
    }


})(Battlebox);
(function (Battlebox) {

    function game_over_function(game) {
        console.log("GAME OVER:");
        //TODO: Make some handy reference functions to easily work with results
    }

    var _game_options = {
        rand_seed: 0,
        tick_time: 1000,
        game_over_time: 1000,

        arrays_to_map_to_objects: ''.split(','),
        arrays_to_map_to_arrays: 'terrain_options,water_options,forces,buildings'.split(','),

        delay_between_ticks: 50,
        log_level_to_show: 2,

        cols: 260,
        rows: 90,
        cell_size: 10,
        cell_spacing: 1,
        cell_border: .01,
        transpose: false, //TODO: If using transpose, a number of other functions for placement should be tweaked

        render_style: 'outdoors', //TODO
        height: 'mountainous', //TODO

        terrain_options: [
            {name: 'plains', ground: true, draw_type: 'flat', color: ["#d0efc6", "#cfefc6", "#d1eec6"], symbol: ''},
            {name: 'mountains', density: 'medium', smoothness: 3, not_center: true, color: ['#b1c3c3', '#b3c4c4', '#8b999c'], impassible: true, symbol: ' '},
            {name: 'forest', density: 'sparse', not_center: true, color: ['#85a982', '#7B947A', '#83A283'], data: {movement: 'slow'}, symbol: ' '}
        ],

        water_options: [
            {name: 'lake', density: 'medium', location: 'left', data: {lake: true}},
            {name: 'lake', density: 'large', location: 'mid left', data: {lake: true}},
            {name: 'lake', density: 'small', location: 'mid right', island: true, symbol: '~'},
            {name: 'river', density: 'small', thickness: 1, location: 'mid left'},
//            {name:'river', density:'small', thickness:1, location:'mid right'},
//            {name:'river', title: 'Snake River', density:'medium', thickness:2, location:'center'},
            {name: 'river', title: 'Snake River', density: 'medium', thickness: 2, location: 'center'}
        ],

        forces: [
            {name: 'Attacker Main Army Force', side: 'Yellow', location: 'left', player: true,
                plan: 'invade city', backup_strategy: 'run away', try_to_loot: true, try_to_pillage: true,
                troops: {soldiers: 520, cavalry: 230, siege: 50}},

            {name: 'Task Force Alpha', side: 'Yellow', symbol: '#A', location: 'left', player: true,
                plan: 'invade city', backup_strategy: 'run away', try_to_loot: true,
                troops: {soldiers: 80, cavalry: 20, siege: 10}},

            {name: 'Task Force Bravo', side: 'Yellow', symbol: '#B', location: 'left', player: true,
                plan: 'invade city', backup_strategy: 'vigilant',
                troops: {cavalry: 20}},

            {name: 'Task Force Charlie', side: 'Yellow', symbol: '#C', location: 'left', player: true,
                plan: 'invade city', backup_strategy: 'invade_city', try_to_loot: true, try_to_pillage: true,
                troops: {cavalry: 20}},


            {name: 'Defender City Force', side: 'Black', location: 'city',
                plan: 'seek closest', backup_strategy: 'vigilant',
                troops: {soldiers: 620, cavalry: 40, siege: 100}},

            {name: 'Defender Bowmen', side: 'Black', symbol: 'A', location: 'city',
                plan: 'seek closest', backup_strategy: 'vigilant',
                troops: {soldiers: 20, siege: 20}},

            {name: 'Defender Bowmen', side: 'Black', symbol: 'A', location: 'city',
                plan: 'seek closest', backup_strategy: 'vigilant',
                troops: {soldiers: 20, siege: 20}},
            {name: 'Defender Bowmen', side: 'Black', symbol: 'A', location: 'city',
                plan: 'seek closest', backup_strategy: 'vigilant',
                troops: {soldiers: 20, siege: 20}},
            {name: 'Defender Bowmen', side: 'Black', symbol: 'A', location: 'city',
                plan: 'seek closest', backup_strategy: 'vigilant',
                troops: {soldiers: 20, siege: 20}},

            {name: 'Defender Catapults', side: 'Black', symbol: 'B', location: 'city',
                plan: 'run away', backup_strategy: 'vigilant',
                troops: {soldiers: 20, siege: 40}},


            {name: 'Sleeping Dragon', side: 'Red', symbol: 'D', location: 'impassible', not_part_of_victory: true,
                plan: 'vigilant', backup_strategy: 'wait', size: 3, move_through_impassibles: true,
                troops: {adult_dragon: 1}}

        ],

        //TODO: Use these in strength calculations
        troop_types: [
            {name: 'soldiers', side: 'Yellow', range: 1, speed: 40, strength: 1, defense: 2, weapon: 'sword', armor: 'armor', carrying: 5},
            {name: 'soldiers', side: 'all', range: 1, speed: 30, strength: 1.2, defense: 1.8, weapon: 'rapiers', armor: 'armor', carrying: 5},
            {name: 'cavalry', side: 'all', range: 1, speed: 70, strength: 1.5, defense: 1.5, weapon: 'rapier', armor: 'shields', carrying: 2},
            {name: 'siege', title: 'siege units', side: 'all', range: 2, speed: 10, strength: 5, defense: .5, weapon: 'catapults', carrying: 1},
            {name: 'adult_dragon', side: 'all', range: 3, speed: 120, strength: 150, defense: 300, weapon: 'fire breath', armor: 'impenetrable scales', carrying: 2000}
        ],

        buildings: [
            {name: 'Large City', title: 'Anchorage', type: 'city2', population: 50000, fortifications: 20, location: 'center'},
            {name: 'Grain Storage', type: 'storage', resources: {food: 10000, gold: 2, herbs: 100}, location: 'random'},
            {name: 'Metal Storage', type: 'storage', resources: {metal: 1000, gold: 2, ore: 1000}, location: 'random'},
            {name: 'Cave Entrance', type: 'dungeon', requires: {mountains: true}, location: 'impassible'}
        ],

        variables: [
            {name: 'test', initial: 1}
        ],

        functions_on_setup: [],
        functions_each_tick: [],
        game_over_function: game_over_function
    };


    Battlebox.initializeOptions('game_options', _game_options);

})(Battlebox);
(function (Battlebox) {
    var _c = new Battlebox('get_private_functions');

    var movement_last_vertical_left = true;

    var key_map = {};
    key_map[ROT.VK_Y] = 0;
    key_map[ROT.VK_NUMPAD7] = 0;
    key_map[ROT.VK_U] = 1;
    key_map[ROT.VK_NUMPAD9] = 1;
    key_map[ROT.VK_L] = 2;
    key_map[ROT.VK_RIGHT] = 2;
    key_map[ROT.VK_NUMPAD6] = 2;
    key_map[ROT.VK_N] = 3;
    key_map[ROT.VK_NUMPAD3] = 3;
    key_map[ROT.VK_B] = 4;
    key_map[ROT.VK_NUMPAD1] = 4;
    key_map[ROT.VK_H] = 5;
    key_map[ROT.VK_LEFT] = 5;
    key_map[ROT.VK_NUMPAD4] = 5;
    key_map[ROT.VK_K] = 0;
    key_map[ROT.VK_UP] = 0;
    key_map[ROT.VK_NUMPAD8] = 0;
    key_map[ROT.VK_J] = 3;
    key_map[ROT.VK_DOWN] = 3;
    key_map[ROT.VK_NUMPAD2] = 3;
    key_map[ROT.VK_PERIOD] = -1;
    key_map[ROT.VK_CLEAR] = -1;
    key_map[ROT.VK_NUMPAD5] = -1;


    _c.interpret_command_from_keycode = function (key_code, unit_options) {
        var command = {movement: null, func: null, ignore: false};

        var code = key_code;
        if ((code == 13 || code == 32) && unit_options.execute_action) {
            //TODO: Have some array of commands per unit?
            command.func = unit_options.execute_action;
            return command;
        }
        if (!(code in key_map)) {
            command.ignore = true;
            return command;
        } else {
            code = key_map[code];
        }

        if (code == -1) {
            command.ignore = true;
            return command;
        }

        //Flip left/right walking so not always going top left or bot right with up/down arrows
        movement_last_vertical_left = !movement_last_vertical_left;
        if (key_code == ROT.VK_UP && movement_last_vertical_left) {
            code = 1;
        } else if (key_code == ROT.VK_UP && !movement_last_vertical_left) {
            code = 0;
        } else if (key_code == ROT.VK_DOWN && movement_last_vertical_left) {
            code = 3;
        } else if (key_code == ROT.VK_DOWN && !movement_last_vertical_left) {
            code = 4;
        }

        var dir = ROT.DIRS[6][code];
        if (dir) {
            command.movement = dir;
        }

        return command;
    }


})(Battlebox);
(function (Battlebox) {
    //TODO: Work with multiple save games

    var _c = new Battlebox('get_private_functions');
    var cookie_name = 'battlebox_1';

    function read_cookie(name) {
        var result = document.cookie.match(new RegExp(name + '=([^;]+)'));
        result && (result = JSON.parse(result[1]));
        return result;
    }

    function bake_cookie(name, value) {
        var exdate = new Date();
        exdate.setDate(exdate.getDate() + 30);
        var cookie = [name, '=', JSON.stringify(value), '; expires=.', exdate.toUTCString(), '; domain=.', window.location.host.toString(), '; path=/;'].join('');
        document.cookie = cookie;
    }

    _c.autosave_if_time = function (game) {
        if (game.game_options.autosave) {
            game.data.autosave_counter = game.data.autosave_counter || 0;
            game.data.autosave_counter += 1;
            if (game.data.autosave_counter >= game.game_options.autosave_every) {
                _c.save(game, 'auto');
                game.data.autosave_counter = 0;
            }
        }
    };
    _c.load = function (game, loadType) {
        var loaded_game_data;
        var game_was_loaded = false;

        if (loadType == 'cookie') {
            loaded_game_data = read_cookie(cookie_name);
            if (loaded_game_data) {
                game.logMessage('Loaded saved game from cookie. Save system switching to localStorage.');
            } else {
                console.info('Unable to find cookie');
                return false;
            }
        } else if (loadType == 'localStorage') {
            var loaded_game_data_str;
            try {
                loaded_game_data_str = localStorage.getItem(cookie_name);
                if (loaded_game_data_str) {
                    loaded_game_data = JSON.parse(loaded_game_data_str);
                }
            } catch (err) {
                console.info('Cannot access localStorage - browser may not support localStorage, or storage may be corrupt')
            }
            if (loaded_game_data) {
                game.logMessage('Loaded saved game from localStorage')
            } else {
                console.info('Unable to find variables in localStorage. Attempting to load cookie.')
                _c.load(game, 'cookie');
                return false;
            }
        } else if (loadType == 'import') {
            //take the import string, decompress and parse it
            var compressed = document.getElementById('impexpField').value;
            var decompressed = LZString.decompressFromBase64(compressed);

            loaded_game_data = JSON.parse(decompressed);
            game.logMessage('Imported saved game');
        }

        if (loaded_game_data && loaded_game_data.rand_seed && loaded_game_data.variables && loaded_game_data.resources && loaded_game_data.resources.food !== undefined) {
            //Seems like a valid data structure
            game.data = loaded_game_data;
            game_was_loaded = true;
            _c.initialize_ui_display(game);
            _c.update_ui_display(game);
        } else {
            game.logMessage('No valid saved game data available, starting with defaults');
        }

        return game_was_loaded;

    };
    _c.save = function (game, saveType) {
        bake_cookie(cookie_name, game.data);
        try {
            localStorage.setItem(cookie_name, JSON.stringify(game.data));
        } catch (err) {
            game.logMessage('Cannot access localStorage to save game - browser may be old or storage may be corrupt');
        }

        //Update console for debugging, also the player depending on the type of save (manual/auto)
        if (saveType == 'export') {
            var string_data = JSON.stringify(game.data);
            var compressed = LZString.compressToBase64(string_data);
            console.log('Compressed Save from ' + string_data.length + ' to ' + compressed.length + ' characters');
            document.getElementById('impexpField').value = compressed;
            game.logMessage('Saved game and exported to base64', true);
        }
        if (read_cookie(cookie_name) || localStorage.getItem(cookie_name)) {
//            console.log('Savegame exists');
            if (saveType == 'auto') {
                game.logMessage('Autosaved', false);
            } else if (saveType == 'manual') {
                game.logMessage('Saved game manually', true);
            }
        }
    };

    _c.toggleAutosave = function (game, saveType) {
        //TODO: Toggle autosave and have some visual indicator switch
    };
    _c.deleteSave = function (game) {
        bake_cookie(cookie_name, '');
        localStorage.setItem(cookie_name, '');
    };
    _c.reset = function (saveType) {
    };

})(Battlebox);
//var test = [];

(function (Battlebox) {
    var _c = new Battlebox('get_private_functions');

    //TODO: Add city center tile
    //TODO: Pass in a color set to try out different images/rendering techniques
    //TODO: Use hex images for terrain
    //TODO: Use colored large circle characters for forces, not full hex colors

    _c.tile = function (game, x, y) {
        var cell;
        if (!game.cells) {
            throw "Game Cells don't seem to exist, something went wrong with generating the map."
        }
        if (y === undefined) {
            //Assume that x is an array
            cell = game.cells[x[0]];
            if (cell) cell = cell[x[1]];
        } else {
            cell = game.cells[x];
            if (cell) cell = cell[y];
        }
        return cell;
    };

    /**
     * Returns an object that has tile basic info along with any entities or objects on tile
     * @param {object} game class data
     * @param {int} x
     * @param {int} y
     * @returns {object} cell and entity data
     */
    _c.tile_info = function (game, x, y) {
        var info = {};

        var cell = _c.tile(game, x, y);
        if (cell) {
            info = _.clone(cell);
        }

        _.each(_c.entities(game), function (entity, id) {
            if (entity.x == x && entity.y == y && entity._draw) {
                info.forces = info.forces || [];
                info.forces.push({id: id, data: entity._data});
            }
        });
        return info;
    };

    _c.surrounding_tiles = function (game, x, y) {
        var cells = [];

        var cell = _c.tile(game, x, y);
        if (!cell) {
            return cells;
        }
        _.each(ROT.DIRS[6], function (mods) {
            var new_x = x + mods[0];
            var new_y = y + mods[1];
            var new_cell = _c.tile(game, new_x, new_y);
            if (new_cell) {
                if (new_cell) cells.push(new_cell);
            }
        });

        return cells;
    };

    _c.tile_is_traversable = function (game, x, y, move_through_impassibles, only_impassible) {
        var valid_num = (x >= 0) && (y >= 0) && (x < _c.cols(game)) && (y < _c.rows(game));
        if (valid_num) {
            var cell = _c.tile(game, x, y);
            if (cell) {
                if (!move_through_impassibles && cell.impassible) {
                    valid_num = false;
                }
                if (only_impassible) {
                    valid_num = (cell.impassible);
                }
            } else {
                valid_num = false;
            }

        }
        return valid_num
    };


    _c.find_a_matching_tile = function (game, options) {
        var x, y, i, tries = 50, index = 0, key;
        if (options.location == 'center') {
            for (i = 0; i < tries; i++) {
                x = options.x || (_c.cols(game) / 2) + _c.randInt(_c.cols(game) / 6) - (_c.cols(game) / 12) - 1;
                y = options.y || (_c.rows(game) / 2) + _c.randInt(_c.rows(game) / 6) - (_c.rows(game) / 12) - 1;

                x = Math.floor(x);
                y = Math.floor(y);
                if (_c.tile_is_traversable(game, x, y, options.move_through_impassibles)) {
                    break;
                }
            }

        } else if (options.location == 'city') {
            var cities = _.filter(game.data.buildings, function (b) {
                return (b.type == 'city' || b.type == 'city2')
            });
            var city = _c.randOption(cities);

            var tile = _c.randOption(city.tiles);
            x = tile.x;
            y = tile.y;

        } else if (options.location == 'left') {
            for (i = 0; i < tries; i++) {
                x = options.x || _c.randOption([0, 1, 2]);
                if (options.y) {
                    y = _c.randOption([options.y - 1, options.x - 2, options.x - 3]);
                } else {
                    y = _c.randInt(_c.rows(game));
                }

                if (_c.tile_is_traversable(game, x, y, options.move_through_impassibles)) {
                    break;
                }
            }

        } else if (options.location == 'right') {
            var right = _c.cols(game);
            for (i = 0; i < tries; i++) {
                x = options.x || _c.randOption([right - 1, right - 2, right - 3]);
                if (options.y) {
                    y = _c.randOption([options.y - 1, options.x - 2, options.x - 3]);
                } else {
                    y = _c.randInt(_c.rows(game));
                }

                if (_c.tile_is_traversable(game, x, y, options.move_through_impassibles)) {
                    break;
                }
            }

        } else if (options.location == 'mid left') {
            var mid_left = Math.round(_c.cols(game) * .25);
            for (i = 0; i < tries; i++) {
                x = options.x || _c.randOption([mid_left - 2, mid_left - 1, mid_left, mid_left + 1, mid_left + 2]);
                y = options.y || _c.randInt(_c.rows(game));

                if (_c.tile_is_traversable(game, x, y, options.move_through_impassibles)) {
                    break;
                }
            }

        } else if (options.location == 'mid right') {
            var mid_right = Math.round(_c.cols(game) * .75);
            for (i = 0; i < tries; i++) {
                x = options.x || _c.randOption([mid_right - 2, mid_right - 1, mid_right, mid_right + 1, mid_right + 2]);
                y = options.y || _c.randInt(_c.rows(game));

                if (_c.tile_is_traversable(game, x, y, options.move_through_impassibles)) {
                    break;
                }
            }

        } else if (options.location == 'top') {
            for (i = 0; i < tries; i++) {
                if (options.x) {
                    x = _c.randOption([options.x - 2, options.x - 1, options.x, options.x + 1, options.x + 2]);
                } else {
                    x = _c.randInt(_c.cols(game));
                }
                y = _c.randOption([0, 1]);


                if (_c.tile_is_traversable(game, x, y, options.move_through_impassibles)) {
                    break;
                }
            }

        } else if (options.location == 'bottom') {
            var bottom = _c.rows(game);
            for (i = 0; i < tries; i++) {
                if (options.x) {
                    x = _c.randOption([options.x - 2, options.x - 1, options.x, options.x + 1, options.x + 2]);
                } else {
                    x = _c.randInt(_c.cols(game));
                }
                y = _c.randOption([bottom - 1, bottom - 2]);

                if (_c.tile_is_traversable(game, x, y, options.move_through_impassibles)) {
                    break;
                }
            }

        } else if (options.location == 'impassible') {
            for (i = 0; i < tries; i++) {
                y = options.x || (_c.randInt(_c.rows(game)));
                x = options.y || (y % 2) + (_c.randInt(_c.cols(game) / 2) * 2);

                var loc = _c.tile_is_traversable(game, x, y, true, true);
                if (loc) {
                    break;
                }
            }

        } else { //if (options.location == 'random') {
            index = Math.floor(ROT.RNG.getUniform() * game.open_space.length);
            key = game.open_space[index];
            x = parseInt(key[0]);
            y = parseInt(key[1]);
        }

        //Do a last final check for valid
        if (!_c.tile_is_traversable(game, x, y, true)) {
            index = Math.floor(ROT.RNG.getUniform() * game.open_space.length);
            key = game.open_space[index];
            x = parseInt(key[0]);
            y = parseInt(key[1]);
        }

        if (!game.open_space.length || x === undefined || y === undefined) {
            console.error("No open spaces, can't draw units");
            x = 0;
            y = game.randInt(_c.rows(gmae), game.game_options);
        }

        return {x: x, y: y};
    };

    /**
     * Returns whether a tile has a specific addition (either a simple text feature like 'field', or a complex object feature like {name:'road', symbol:'-'}
     * @param {cell} cell - tile to look at
     * @param {string} feature - a feature class, like 'field', or 'road'
     * @param {boolean} return_count - return just a count of features instead of feature details
     * @returns {object} null if no object, or the first feature info (string or object) if it was found, or count of objects if return_count specified
     */
    _c.tile_has = function (cell, feature, return_count) {
        var has = 0;

        if (cell.additions) {
            for (var i = 0; i < cell.additions.length; i++) {
                var a = cell.additions[i];
                if (a == feature || (a && a.name && a.name == feature)) {
                    if (return_count) {
                        has++;
                    } else {
                        has = a;
                        break;
                    }
                }
            }
        }
        return has;

    };

    //TODO: Work for distant tiles also
    /**
     * Returns a cardinal direction from one tile to an adjacent tile
     * @param {cell} tile_from
     * @param {cell} tile_to
     * @returns {object} angle, hex_dir_change_array, road_symbol, description
     */
    _c.direction_from_tile_to_tile = function (tile_from, tile_to) {
        var dir = {angle: null, rot_number: -1, hex_dir_change_array: [0, 0], road_symbol: '', description: ''};

        var offset_x = tile_to.x - tile_from.x;
        var offset_y = tile_to.y - tile_from.y;

        if (offset_x == -1 && offset_y == -1) {
            dir = {angle: 330, rot_number: 0, road_symbol: '╲', description: 'North West', abbr: 'NW'};
        } else if (offset_x == 1 && offset_y == -1) {
            dir = {angle: 30, rot_number: 1, road_symbol: '╱', description: 'North East', abbr: 'NE'};
        } else if (offset_x == 2 && offset_y == 0) {
            dir = {angle: 90, rot_number: 2, road_symbol: '━', description: 'East', abbr: 'E'};
        } else if (offset_x == 1 && offset_y == 1) {
            dir = {angle: 150, rot_number: 3, road_symbol: '╲', description: 'South East', abbr: 'SE'};
        } else if (offset_x == -1 && offset_y == 1) {
            dir = {angle: 210, rot_number: 4, road_symbol: '╱', description: 'South West', abbr: 'SW'};
        } else if (offset_x == -2 && offset_y == 0) {
            dir = {angle: 270, rot_number: 5, road_symbol: '━', description: 'West', abbr: 'W'};
        }
        dir.hex_dir_change_array = ROT.DIRS[6][dir.rot_number];

        return dir;
    };

    //-------------------------------------------------
    _c.generate_base_map = function (game) {
        game.data.terrain_options = game.data.terrain_options || [];
        if (game.data.terrain_options.length == 0) {
            game.data.terrain_options = [
                {name: 'plains', layer: 'ground'}
            ];
        }

        var cells = [];
        for (var y = 0; y < _c.rows(game); y++) {
            for (var x = y % 2; x < _c.cols(game); x += 2) {
                cells[x] = cells[x] || [];
                cells[x][y] = {};
            }
        }

        //Build each terrain layer using cellular algorithms
        _.each(game.data.terrain_options, function (terrain_layer) {
            cells = _c.generators.terrain_layer(game, terrain_layer, cells)
        });


        //Look for all free cells, and draw the map to be blank there
        var freeCells = [];
        var ground_layer = _.find(game.data.terrain_options, function (l) {
            return l.ground
        }) || game.data.terrain_options[0];

        for (var y = 0; y < _c.rows(game); y++) {
            for (var x = y % 2; x < _c.cols(game); x += 2) {

                if (cells[x][y] && cells[x][y].impassible) {
                    //Something in this cell that makes it not able to move upon
                } else {
                    freeCells.push([x, y]);
                    if (!cells[x][y].name) {
                        cells[x][y] = _.clone(ground_layer);
                        set_obj_color(cells[x][y]);
                        cells[x][y].x = x;
                        cells[x][y].y = y;
                    }
                }
            }
        }
        game.open_space = freeCells;
        game.cells = cells;


        //Build each water layer
        _.each(game.data.water_options, function (water_layer) {
            var location = _c.find_a_matching_tile(game, water_layer);
            if (water_layer.name == 'river') {
                _c.generators.river(game, water_layer, location);
            } else if (water_layer.name == 'lake') {
                _c.generators.lake(game, water_layer, location);
            } else if (water_layer.name == 'sea') {
                _c.generators.sea(game, water_layer, location);
            }
            water_layer.location = location;
        });

    };
    _c.generate_buildings = function (game) {
        _.each(game.data.buildings, function (building_layer) {
            var location = _c.find_a_matching_tile(game, building_layer);
            if (building_layer.type == 'city') {
                building_layer.tiles = _c.generators.city(game, location, building_layer);
            } else if (building_layer.type == 'city2') {
                building_layer.tiles = _c.generators.city2(game, location, building_layer);
            } else if (building_layer.type == 'storage') {
                _c.generators.storage(game, location, building_layer);
            } else if (building_layer.type == 'dungeon') {
                //TODO: Add    {name:'Cave Entrance', type:'dungeon', requires:{mountains:true}, location:'impassible'}
            }
            building_layer.location = location;
        });
    };
    _c.population_counter = function(game) {
        var count = 0;
        _.each(game.cells, function (x){
            _.each(x, function(cell){
                if (cell) count += cell.population || 0;
            })
        });
        return count;
    };
    //¬-----------------------------------------------------
    _c.generators = {};
    _c.generators.city2 = function (game, location, city_info) {

        //TODO: Cities build along roads only, not on roads
        //TODO: Cities build along side of river

        var building_tile_tries = Math.sqrt(city_info.population);
        var building_tile_radius_y = Math.pow(city_info.population, 1 / 3.1);
        var building_tile_radius_x = building_tile_radius_y * 1.5;
        var number_of_roads = city_info.road_count || Math.pow(city_info.population / 100, 1 / 4);

        var city_cells = [];

        //Build roads based on city size
        var road_tiles = _c.generators.roads_from(game, number_of_roads, location);
        road_tiles.sort(function(a,b){
            var dist_a = Helpers.distanceXY(location, a);
            var dist_b = Helpers.distanceXY(location, b);

            return dist_a > dist_b;
        });

        //Reset the city so it'll look the same independent of number of roads
        ROT.RNG.setSeed(game.data.fight_seed || game.data.rand_seed);

        var center = _c.tile(game, location.x, location.y);
        center.population = center.population || 0;
        center.population += building_tile_tries * 2;
        city_cells.push(center);

        //TODO: Not on water cells

        //Add population along roads
        for (var i = 0; i < building_tile_tries; i++) {
            var road_index = Math.round(_c.randHistogram(.05, 5) * road_tiles.length);
            var road_segment = road_tiles[road_index];

            //Assign population to all non-road/river/lake cells
            var road_neighbors = _c.surrounding_tiles(game, road_segment.x, road_segment.y);
            road_neighbors = _.filter(road_neighbors, function(r) {
                return (!_c.tile_has(r, 'road') && !_c.tile_has(r, 'river') && (r.name != 'lake'));
            });
            _.each(road_neighbors, function (neighbor) {
                neighbor.population = neighbor.population || 0;
                neighbor.population += building_tile_tries / (road_neighbors.length * 1.6423);

                if (_.indexOf(city_cells, neighbor) == -1) city_cells.push(neighbor);
            });
        }

        for (var i = 0; i < building_tile_tries; i++) {
            var x, y;
            x = location.x + (ROT.RNG.getNormal()*building_tile_radius_x/4);
            y = location.y + (ROT.RNG.getNormal()*building_tile_radius_y/4);
            x = Math.floor(x);
            y = Math.floor(y);

            var cell = game.cells[x][y];
            if (_c.tile_is_traversable(game, x, y, false) && !_c.tile_has(cell, 'road') && !_c.tile_has(cell, 'river') && (cell.name != 'lake')) {
                cell.population = cell.population || 0;
                cell.population += building_tile_tries / 4 + (ROT.RNG.getNormal()*building_tile_radius_x);
                if (!city_cells[x] || !city_cells[x][y]) city_cells.push(cell);

                var neighbors = _c.surrounding_tiles(game, x, y);
                neighbors = _.filter(road_neighbors, function(r) {
                    return (!_c.tile_has(r, 'road') && !_c.tile_has(r, 'river') && (r.name != 'lake'));
                });
                _.each(neighbors, function (neighbor) {
                    neighbor.population = neighbor.population || 0;
                    neighbor.population += building_tile_tries / (road_neighbors.length * 1.7);

                    if (_.indexOf(city_cells, neighbor) == -1) city_cells.push(neighbor);
                })
            }
        }

        //Turn cells with enough population into city cells
        var city_cells_final = [city_cells[0]]; //Start with the city center
        for (var i=0; i< city_cells.length; i++) {
            var cell = city_cells[i];
            x = cell.x;
            y = cell.y;

            var cell_population = Math.round(cell.population);
            if (cell_population>=70) {

                game.cells[x][y] = _.clone(city_info);
                game.cells[x][y].population = cell_population;
                game.cells[x][y].type = 'city';
                game.cells[x][y].x = x;
                game.cells[x][y].y = y;


                var neighbors = _c.surrounding_tiles(game, x, y);
                _.each(neighbors, function (neighbor) {
                    neighbor.additions = neighbor.additions || [];
                    if (neighbor.type != 'city') {
                        if (neighbor.name == 'mountains') {
                            neighbor.additions.push('mine');
                        } else if (neighbor.name == 'lake' || _c.tile_has(neighbor, 'river')) {
                            neighbor.additions.push('dock');
                        } else {
                            neighbor.additions.push('farm');
                        }
                    }
                });

                if (_.indexOf(city_cells_final, cell) == -1) city_cells_final.push(cell);

            } else {
                game.cells[x][y].population = cell_population;
            }
        }

        //Loop through cells with multiple farms and redistribute the farms further out
        //TODO: Use a spiral loop to move outward from city center
        var loops = 6;
        for (var l=0; l<loops; l++) {
            var cc_length = city_cells.length;
            for (var i=0; i< cc_length; i++) {
                var cell = city_cells[i];
                var num_farms = _c.tile_has(cell, 'farm', true);
                if (num_farms > 5) {
                    x = cell.x;
                    y = cell.y;
                    var neighbors = _c.surrounding_tiles(game, x, y);
                    _.each(neighbors, function (neighbor) {
                        neighbor.additions = neighbor.additions || [];
                        for (var f=0;f<(num_farms%5);f++) {
                            neighbor.additions.push('farm');
                        }
                        if (_.indexOf(city_cells, neighbor) == -1) city_cells.push(neighbor);
                    });
                    cell.additions = removeArrayItemNTimes(cell.additions, 'farm', 5 * (num_farms%5));
                }
            }
        }


        //TODO: Add city walls

        return city_cells_final;
    };

    function removeArrayItemNTimes(arr,toRemove,times){
        times = times || 10;
        for(var i = 0; i < arr.length; i++){
            if(arr[i]==toRemove) {
                arr.splice(i,1);
                i--; // Prevent skipping an item
                times--;
                if (times<=0) break;
            }
        }
        return arr;
    }

    _c.generators.terrain_layer = function (game, terrain_layer, cells) {
        var map_layer;
        if (terrain_layer.draw_type == 'digger') {
            map_layer = new ROT.Map.Digger(_c.cols(game), _c.rows(game));

        } else if (terrain_layer.draw_type != 'flat') {
            //Use Cellular generation style
            var born = [5, 6, 7];
            var survive = [3, 4, 5];

            //TODO: Add some more levels and drawing types
            if (terrain_layer.density == 'small') {
                born = [4];
                survive = [3];
            } else if (terrain_layer.density == 'sparse') {
                born = [4, 5];
                survive = [3, 4];
            } else if (terrain_layer.density == 'medium') {
                born = [4, 5];
                survive = [4, 5, 6];
            } else if (terrain_layer.density == 'high') {
                born = [4, 5, 6, 7];
                survive = [3, 4, 5, 6];
            }

            map_layer = new ROT.Map.Cellular(_c.cols(game), _c.rows(game), {
                //connected: true,
                topology: 6,
                born: born,
                survive: survive
            });


            // initialize with irregularly random values with less in middle
            if (terrain_layer.not_center) {
                for (var i = 0; i < _c.cols(game); i++) {
                    for (var j = 0; j < _c.rows(game); j++) {
                        var dx = i / _c.cols(game) - 0.5;
                        var dy = j / _c.rows(game) - 0.5;
                        var dist = Math.pow(dx * dx + dy * dy, 0.3);
                        if (ROT.RNG.getUniform() < dist) {
                            map_layer.set(i, j, 1);
                        }
                    }
                }
            } else {
                map_layer.randomize(terrain_layer.thickness || 0.5);
            }

            // generate a few smoothing iterations
            var iterations = terrain_layer.smoothness || 3;
            for (var i = iterations - 1; i >= 0; i--) {
                map_layer.create(i ? null : game.display.DEBUG);
            }
        }

        //For all cells not matched, add to a list
        if (map_layer && map_layer.create) {
            var digCallback = function (x, y, value) {
                if (value) {
                    cells[x] = cells[x] || [];
                    cells[x][y] = _.clone(terrain_layer);
                    set_obj_color(cells[x][y]);
                    cells[x][y].x = x;
                    cells[x][y].y = y;
                }
            };
            map_layer.create(digCallback.bind(game));
        }
        return cells;
    };

    function set_obj_color(obj) {
        if (obj.color && _.isArray(obj.color)) {
            obj.color = obj.color.random();
        }
    }

    _c.generators.storage = function (game, location, storage_info) {
        var size = 2;
        var loot_per = {};

        storage_info.resources = storage_info.resources || {};
        for (key in storage_info.resources) {
            loot_per[key] = Math.round(storage_info.resources[key] / (size * size));
        }


        //TODO: How to make a hex rectangle?
        for (var x = location.x; x <= location.x + size; x++) {
            for (var y = location.y; y < location.y + size; y++) {
                var tile = _c.tile(game, x, y);
                if (tile) {
                    tile.loot = tile.loot || {};
                    for (key in loot_per) {
                        tile.loot[key] = tile.loot[key] || 0;
                        tile.loot[key] += loot_per[key];
                    }
                    tile.additions = tile.additions || [];
                    tile.additions.push('storage');
                }
            }
        }

    };

    _c.generators.roads_from = function (game, number_of_roads, starting_tile) {
        var tries = 20;
        var last_side = '';
        var road_tiles = [];

        for (var i = 0; i < number_of_roads; i++) {
            var side = _c.randOption(['left', 'right', 'top', 'bottom'], {}, last_side);
            last_side = side;
            for (var t = 0; t < tries; t++) {
                var ending_tile = _c.find_a_matching_tile(game, {location: side});
                var path = _c.path_from_to(game, starting_tile.x, starting_tile.y, ending_tile.x, ending_tile.y);
                if (path && path.length) {
                    for (var step = 1; step < path.length; step++) {
                        var cell = _c.tile(game, path[step]);
                        var last_cell = _c.tile(game, path[step - 1]);
                        var dir = _c.direction_from_tile_to_tile(last_cell, cell);

                        if (cell) {
                            cell.additions = cell.additions || [];
                            cell.additions.push({name: 'road', symbol: dir.road_symbol});
                            road_tiles.push(cell);
                        }
                    }
                    break;
                }
            }
        }

        return road_tiles;
    };


    _c.generators.lake = function (game, water_layer, location) {
        var water_cells = [];
        var size = 30;
        if (water_layer.density == 'small') {
            size = 7;
        } else if (water_layer.density == 'medium') {
            size = 30;
        } else if (water_layer.density == 'large') {
            size = 60;
        } else if (_.isNumber(water_layer.density)) {
            size = parseInt(water_layer.density);
        }

        var building_tile_radius_y = Math.pow(size, 1 / 1.45);
        var building_tile_radius_x = building_tile_radius_y * 1.5;

        //TODO: Don't use recursion, instead just a for x-n to x+n loop

        function make_water(x, y, recursion) {

            if (!_c.tile_is_traversable(game, x, y, false)) {
                return;
            }
            var is_cell_in_water_cells = (game.cells[x][y].data && game.cells[x][y].data.water);

            if (is_cell_in_water_cells) {
            } else {
                var layer = _.clone(water_layer);
                layer.data = layer.data || {};
                layer.data.water = true;
                layer.data.depth = recursion;
                layer.x = x;
                layer.y = y;
                set_obj_color(layer);

                //TODO: Not sure why, but depth is first setting properly, then being overwritten to 1 for large lakes
//                test.push (x +','+y+' setting to ' + recursion);


                game.cells[x][y] = layer;

                water_cells.push(layer);

                if (recursion > 1) {
                    var neighbors = _c.surrounding_tiles(game, x, y);
                    _.each(neighbors, function (neighbor) {
                        make_water(neighbor.x, neighbor.y, recursion - 1);
                    });
                }
            }
        }

        for (var i = 0; i < size; i++) {
            var x, y;
            x = location.x + _c.randInt(building_tile_radius_x) - (building_tile_radius_x / 2) - 1;
            y = location.y + _c.randInt(building_tile_radius_y) - (building_tile_radius_y / 2) - 1;

            x = Math.floor(x);
            y = Math.floor(y);

            make_water(x, y, 3);

        }

        return water_cells;
    };

    _c.generators.river = function (game, water_layer, location) {
        var water_cells = [];

        var tries = 20;

        for (var t = 0; t < tries; t++) {
            var side = _c.randOption(['left', 'top']);
            var ending_tile, starting_tile;
            if (side == 'left') {
                starting_tile = _c.find_a_matching_tile(game, {location: 'left', y: location.y});
                ending_tile = _c.find_a_matching_tile(game, {location: 'right', y: location.y});
            } else {
                starting_tile = _c.find_a_matching_tile(game, {location: 'top', x: location.x});
                ending_tile = _c.find_a_matching_tile(game, {location: 'bottom', x: location.x});
            }

            var path = _c.path_from_to(game, starting_tile.x, starting_tile.y, ending_tile.x, ending_tile.y);
            if (path && path.length) {
                for (var step = 1; step < path.length; step++) {
                    for (var thick = 0; thick < (water_layer.thickness || 1); thick++) {

                        var y = path[step][1];
                        var x = path[step][0];

                        if (side == 'left' && thick) {
                            y += thick;
                        } else if (side == 'top' && thick) {
                            x += (2 * thick);
                        }

                        var cell = _c.tile(game, x, y);
                        if (_c.tile_is_traversable(game, x, y)) {
                            var last_cell = _c.tile(game, path[step - 1]);
                            var dir;
                            if (thick == 0) {
                                dir = _c.direction_from_tile_to_tile(last_cell, cell) || {road_symbol: ""};
                            } else {
                                dir = _c.direction_from_tile_to_tile(last_cell, _c.tile(game, path[step])) || {road_symbol: ""};
                            }

                            //TODO: Don't use pathfinding, instead make it snaking

                            var layer = _.clone(water_layer.data || {});
                            layer.name = 'river';
                            layer.x = x;
                            layer.y = y;
                            layer.water = true;
                            layer.depth = water_layer.thickness || 1;
                            layer.symbol = dir.road_symbol;
                            layer.title = water_layer.title || water_layer.name;

                            cell.additions = cell.additions || [];
                            cell.additions.push(layer);

                            set_obj_color(cell);
                        }
                    }
                }
                break;
            }
        }


        return water_cells;
    };

    _c.generators.sea = function (game, water_layer, location) {
        var water_cells = [];
        //TODO: Enter this

        return water_cells;
    };

    _c.generators.city = function (game, location, city_info) {

        var building_tile_tries = Math.sqrt(city_info.population);
        var building_tile_radius_y = Math.pow(city_info.population, 1 / 3.2);
        var building_tile_radius_x = building_tile_radius_y * 1.5;
        var number_of_roads = city_info.road_count || Math.pow(city_info.population / 100, 1 / 4);

        var city_cells = [];

        //Build roads based on city size
        var road_tiles = _c.generators.roads_from(game, number_of_roads, location);


        //Reset the city so it'll look the same independent of number of roads
        ROT.RNG.setSeed(game.data.fight_seed || game.data.rand_seed);


        //Generate city tiles & surrounding tiles
        for (var i = 0; i < building_tile_tries; i++) {
            var x, y;
            x = location.x + _c.randInt(building_tile_radius_x) - (building_tile_radius_x / 2) - 1;
            y = location.y + _c.randInt(building_tile_radius_y) - (building_tile_radius_y / 2) - 1;

            x = Math.floor(x);
            y = Math.floor(y);
            if (_c.tile_is_traversable(game, x, y, false)) {
                game.cells[x][y] = _.clone(city_info);
                game.cells[x][y].x = x;
                game.cells[x][y].y = y;
                city_cells.push(game.cells[x][y]);

                var neighbors = _c.surrounding_tiles(game, x, y);
                _.each(neighbors, function (neighbor) {
                    neighbor.additions = neighbor.additions || [];
                    if (neighbor.type != 'city') {
                        if (neighbor.name == 'mountains') {
                            neighbor.additions.push('mine');
                        } else if (neighbor.name == 'lake') {
                            neighbor.additions.push('dock');
                        } else {
                            neighbor.additions.push('farm');
                        }
                        if (city_cells[neighbor.x] && city_cells[neighbor.x][neighbor.y]) {
                            //Already in array
                        } else {
                            city_cells.push(neighbor);
                        }
                    }
                })
            }
        }

        //TODO: Add city walls

        return city_cells;
    };


})(Battlebox);
(function (Battlebox) {
    var _c = new Battlebox('get_private_functions');

    //TODO: Have a queue of plans, then when one can't complete, move to next
    //TODO: At end of game, spend x turns to look for nearby loot and pillage town
    //TODO: Have strategy to find nearby loot
    //TODO: Have units on nearby fortifications and defenders to go to fortifications if possible

    _c.tile_traversability_weight = function (game, x, y) {
        var cell = _c.tile(game, x, y);
        var weight = 0;

        if (cell.name == 'plains') weight += 2;
        if (cell.name == 'mountains') weight += 6;
        if (cell.name == 'forest') weight += 3;
        if (cell.density == 'medium') weight += 2;
        if (cell.density == 'large') weight += 4;
        if (cell.name == 'lake') weight += 4;
        if (_c.tile_has(cell, 'path')) weight -= 1;
        if (_c.tile_has(cell, 'road')) weight -= 2;
        if (_c.tile_has(cell, 'rail')) weight -= 4;
        if (_c.tile_has(cell, 'river')) weight += 2;

        return Math.max(0, weight);
    };

    _c.path_from_to = function (game, from_x, from_y, to_x, to_y) {

        var passableCallback = function (x, y) {
            var cell = game.cells[x];
            cell = (cell !== undefined) ? cell[y] : null;

            return (cell && !cell.impassible);
        };
        var astar = new ROT.Path.AStar(to_x, to_y, passableCallback, {topology: 6});
        var path = [];
        var pathCallback = function (x, y) {
            path.push([x, y]);
        };
        var weightingCallback = function (x, y) {
            return _c.tile_traversability_weight(game, x, y);
        };
        astar.compute(from_x, from_y, pathCallback, weightingCallback);
//        astar.compute(from_x, from_y, pathCallback);

        return path;
    };

    _c.find_unit_by_filters = function (game, current_unit, options) {

        var targets = _c.entities(game);

        if (options.range) {
            targets = _.filter(targets, function (t) {
                return (Helpers.distanceXY(current_unit, t) < options.range);
            });
        }
        if (options.only_count_forces) {
            targets = _.filter(targets, function (t) {
                return (!t._data.not_part_of_victory);
            });
        }
        if (options.location) {
            targets = _.filter(targets, function (t) {
                return (t.x == options.location.x && t.y == options.location.y);
            });
        }
        if (options.side) {
            targets = _.filter(targets, function (t) {
                return (options.side == 'enemy' ? (current_unit._data.side != t._data.side) : current_unit._data.side == t._data.side);
            });
        }
        if (options.filter) {
            if (options.filter == 'closest') {
                //TODO: Performance: First filter they are within a certain range. If too slow with many units, consider using a Dijkstra cached search each turn

                targets = targets.sort(function (a, b) {
                    var path_a = _c.path_from_to(game, current_unit.x, current_unit.y, a.x, a.y);
                    var path_b = _c.path_from_to(game, current_unit.x, current_unit.y, b.x, b.y);
                    var a_len = path_a ? path_a.length : 100;
                    var b_len = path_b ? path_b.length : 100;

                    return a_len > b_len;
                });
            }
        }

        var target, range, closest_path, x, y;
        if (options.return_multiple) {
            if (targets.length) {
                closest_path = _c.path_from_to(game, current_unit.x, current_unit.y, targets[0].x, targets[0].y);
                range = closest_path.length || 0;

                if (targets[0].getX) x = targets[0].getX();
                if (targets[0].getY) y = targets[0].getY();
                target = targets;
            } else {
                target = [];
                x = 0;
                y = 0;
                range = 0;
            }

        } else {
            target = targets[0];
            if (target) {
                closest_path = _c.path_from_to(game, current_unit.x, current_unit.y, target.x, target.y);
                range = closest_path.length || 0;

                if (target.getX) x = target.getX();
                if (target.getY) y = target.getY();
            }
        }

        return {target: target, x: x, y: y, range: range};
    };

    //--------------------------------------------
    _c.movement_strategies = _c.movement_strategies || {};
    _c.movement_strategies.vigilant = function (game, unit) {
        _c.log_message_to_user(game, unit.describe() + ' ' + "stays vigilant and doesn't move", 1);
    };

    _c.movement_strategies.wander = function (game, unit) {
        var code = Helpers.randOption([0, 1, 2, 3, 4, 5]);
        var dir = ROT.DIRS[6][code];
        var y = unit.y + dir[1];
        var x = unit.x + dir[0];

        var msg = unit.describe() + ' ';
        var moves = _c.try_to_move_to_and_draw(game, unit, x, y);
        if (moves) {
            _c.log_message_to_user(game, msg + "wanders a space", 1);
        } else {
            _c.movement_strategies.wait(game, unit);
        }
    };

    _c.movement_strategies.wait = function (game, unit) {
        _c.log_message_to_user(game, unit.describe() + " stays vigilant and doesn't move", 0);
    };

    _c.movement_strategies.seek = function (game, unit, target_status, options) {
        var x = target_status.target ? target_status.target.getX() : -1;
        var y = target_status.target ? target_status.target.getY() : -1;

        if (!_c.tile_is_traversable(game, x, y)) {
            if (options.backup_strategy == 'vigilant') {
                _c.movement_strategies.vigilant(game, unit);
                return;
            } else if (options.backup_strategy == 'wait') {
                _c.movement_strategies.wait(game, unit);
                return;
            } else { //wander
                _c.movement_strategies.wander(game, unit);
                return;
            }
        }

        var path = _c.path_from_to(game, unit.x, unit.y, x, y);

        //If too far, then just wander
        if (options.range && (path && path.length > options.range) || !path || (path && path.length == 0)) {
            if (options.backup_strategy == 'vigilant') {
                _c.movement_strategies.vigilant(game, unit);
                return;
            } else if (options.backup_strategy == 'wait') {
                _c.movement_strategies.wait(game, unit);
                return;
            } else { //if (options.backup_strategy == 'wander') {
                _c.movement_strategies.wander(game, unit);
                return;
            }
        }

        path.shift();
        if (path.length <= 1) {
            _c.log_message_to_user(game, unit.describe() + " attacks nearby target: " + target_status.target.describe(), 1);
            _c.entity_attacks_entity(game, unit, target_status.target, _c.log_message_to_user);

        } else if (path.length > 1) {
            //Walk towards the enemy
            x = path[0][0];
            y = path[0][1];
            var moves = _c.try_to_move_to_and_draw(game, unit, x, y);
            if (moves) {
                _c.log_message_to_user(game, unit.describe() + " moves towards their target: " + target_status.target.describe(), 1);
            } else {
                if (options.backup_strategy == 'vigilant') {
                    _c.movement_strategies.vigilant(game, unit);
                } else if (options.backup_strategy == 'wait') {
                    _c.movement_strategies.wait(game, unit);
                } else { //if (options.backup_strategy == 'wander') {
                    _c.movement_strategies.wander(game, unit);
                }
            }
        }
    };

    _c.movement_strategies.head_towards = function (game, unit, location, options) {
        var path;
        var to_loc = location.location && (location.location.x !== undefined) && (location.location.y !== undefined);
        if (!to_loc) {
            console.error('No valid location passed in to a "head towards" strategy');
            path = [];
        } else {
            path = _c.path_from_to(game, unit.x, unit.y, location.location.x, location.location.y);
            path.shift();
        }

        var moves = false;
        if (path.length <= 10) {
            options = {side: 'enemy', filter: 'closest', range: 6, plan: 'invade city', backup_strategy: unit._data.backup_strategy};
            var target_status = _c.find_unit_by_filters(game, unit, options);
            _c.movement_strategies.seek(game, unit, target_status, options);
            moves = true;

        } else if (path.length > 10) {
            //Walk towards the enemy
            var x = path[0][0];
            var y = path[0][1];
            moves = _c.try_to_move_to_and_draw(game, unit, x, y);
        }
        if (moves) {
            _c.log_message_to_user(game, unit.describe() + " moves towards their target: " + (location.title || location.name), 1);
        } else {
            if (options.backup_strategy == 'vigilant') {
                _c.movement_strategies.vigilant(game, unit);
            } else if (options.backup_strategy == 'wait') {
                _c.movement_strategies.wait(game, unit);
            } else { //wander
                _c.movement_strategies.wander(game, unit, options);
            }
        }
    };

    _c.movement_strategies.avoid = function (game, unit, target_status, options) {
        var x = target_status.target ? target_status.target.getX() : -1;
        var y = target_status.target ? target_status.target.getY() : -1;
        if (!_c.tile_is_traversable(game, x, y)) {
            if (options.backup_strategy == 'vigilant') {
                _c.movement_strategies.vigilant(game, unit);
                return;
            } else if (options.backup_strategy == 'wait') {
                _c.movement_strategies.wait(game, unit);
                return;
            } else { //wander
                _c.movement_strategies.wander(game, unit, options);
                return;
            }
        }

        var path = _c.path_from_to(game, unit.x, unit.y, x, y);

        //If too far, then just wander
        var moves = false;
        if (options.range && path && path.length <= options.range) {
            path.shift();
            if (path.length > 0) {

                //Walk away from the enemy
                x = path[0][0];
                y = path[0][1];

                x = unit.x - x;
                y = unit.y - y;

                x = unit.x + x;
                y = unit.y + y;

                //TODO: Pick alternate paths if can't move any more
                moves = _c.try_to_move_to_and_draw(game, unit, x, y);
            }
        }
        if (!moves) {
            if (options.backup_strategy == 'vigilant') {
                _c.movement_strategies.vigilant(game, unit);
            } else if (options.backup_strategy == 'wait') {
                _c.movement_strategies.wait(game, unit);
            } else { //if (options.backup_strategy == 'wander') {
                _c.movement_strategies.wander(game, unit);
            }
        }
    };


})(Battlebox);
(function (Battlebox) {

    var _c = new Battlebox('get_private_functions');

    var controlled_entity_id = 0;

    //TODO: Have icons for different units
    //TODO: SetCenter to have large map and redraw every movement
    //TODO: Have movement be based on values
    //TODO: Move faster over roads, and slower over water
    //TODO: Have enemy searching only look if within a likely radius
    //TODO: When placing troops, make sure there is a path from starting site to city. If not, make a path

    _c.build_units_from_list = function (game, list) {
        _.each(list || [], function (unit_info, id) {
            game.entities.push(_c.create_unit(game, unit_info, id))
        });
        return _c.entities(game);
    };
    _c.add_screen_scheduler = function (game) {
        game.scheduler.add(new TimeKeeper(game), true);
    };

    _c.create_unit = function (game, unit_info, id) {

        var location = _c.find_a_matching_tile(game, unit_info);

        var EntityType;
        if (unit_info.player) {
            EntityType = Player;
        } else {
            EntityType = OpForce;
        }
        return new EntityType(game, location.x, location.y, id, unit_info);
    };

    _c.raze_or_loot = function(game, unit, cell){

        cell.additions = cell.additions || [];
        unit.loot = unit.loot || {};

        var num_farms = _c.tile_has(cell, 'farm', true);

        if (unit._data.try_to_pillage) {
            //TODO: Unit gains health?
            //TODO: Takes time?

            if (num_farms && !_c.tile_has(cell, 'pillaged')) {
                unit.loot.food = unit.loot.food || 0;
                unit.loot.herbs = unit.loot.herbs || 0;
                unit.loot.food += (100 * num_farms);  //TODO: Random benefits based on technology and population
                unit.loot.herbs += (20 * num_farms);
            }

            cell.additions.push('pillaged');
        }
        if (unit._data.try_to_loot && (_c.tile_has(cell, 'storage') || cell.loot)) {

            unit.loot = unit.loot || {};
            for (var key in cell.loot) {
                unit.loot[key] = unit.loot[key] || 0;
                unit.loot[key] += cell.loot[key];
                cell.loot[key] = 0;
                //TODO: Only take as much loot as can carry
            }

            if (num_farms && !_c.tile_has(cell, 'pillaged') && !_c.tile_has(cell, 'looted')) {
                unit.loot.food = unit.loot.food || 0;
                unit.loot.herbs = unit.loot.herbs || 0;

                unit.loot.food += (25 * num_farms);
                unit.loot.herbs += (6 * num_farms);
            }
            cell.additions.push('looted');
        }

    };

    _c.try_to_move_to_and_draw = function (game, unit, x, y) {
        var can_move_to = _c.tile_is_traversable(game, x, y, unit._data.move_through_impassibles);
        if (can_move_to) {
            var is_unit_there = _c.find_unit_by_filters(game, unit, {location: {x: x, y: y}});
            if (is_unit_there) {
                if (is_unit_there.side != unit.side) {
                    can_move_to = _c.entity_attacks_entity(game, unit, is_unit_there, _c.log_message_to_user);
                } else {
                    //TODO: What to do if on same sides? Merge forces?
                }
            }

            if (can_move_to) {
                var previous_x = unit.x;
                var previous_y = unit.y;
                unit.x = x;
                unit.y = y;

                var cell = _c.tile(game, x, y);
                if (unit._data.try_to_loot || unit._data.try_to_pillage) {
                    if (cell.type == 'city' || _c.tile_has(cell, 'dock') || _c.tile_has(cell, 'farm') || _c.tile_has(cell, 'storage') || cell.loot) {
                        _c.raze_or_loot(game, unit, cell);
                    }
                }

                _c.draw_tile(game, previous_x, previous_y);
                unit._draw();
            }
        }
        return can_move_to;
    };

    _c.remove_entity = function (game, unit) {
        var entity_id = _.indexOf(game.entities, unit);
        if (entity_id > -1) {
            var x = unit.x;
            var y = unit.y;

            var cell = _c.tile(game, x, y);
            if (cell) {
                cell.additions = cell.additions || [];
                cell.additions.push({name:'unit corpse', unit:unit._data});
            }
            if (unit.loot) {
                cell.loot = cell.loot || {};
                for (var key in unit.loot) {
                    cell.loot[key] = cell.loot[key] || 0;
                    cell.loot[key] += unit.loot[key];
                }
            }

            game.scheduler.remove(game.entities[entity_id]);
            delete game.entities[entity_id];
            //TODO: Collapse entities

            _c.draw_tile(game, x, y);
        }
    };

    //--------------------
    var TimeKeeper = function (game) {
        this._game = game;
    };
    TimeKeeper.prototype.describe = function () {
        return "Screen";
    };
    TimeKeeper.prototype.getSpeed = function () {
        return 100;
    };
    TimeKeeper.prototype.act = function () {
        var time_keeper = this;
        var game = time_keeper._game;

        game.data.tick_count++;
//        console.log('Game Tick: ' + game.data.tick_count);

        if (game.data.tick_count > game.game_options.game_over_time) {
            _c.game_over(game);
        }

        var done = null;
        var promise = {
            then: function (cb) {
                done = cb;
            }
        };

        //Allow game to be paused
        //TODO: Needs to be reengineered, as it resumes the clock twice - and doubles game speed
        var next_tick = function (done) {
            if (game.data.in_progress) {
                done();
            } else {
                setTimeout(function () {
                    next_tick(done)
                }, game.game_options.delay_between_ticks || 500);
            }
        };

        setTimeout(function () {
            next_tick(done)
        }, game.game_options.delay_between_ticks || 500);

        return promise;
    };
    //--------------------
    var Entity = function (game, x, y, id, unit) {
        this.x = x;
        this.y = y;
        this._game = game;
        this._id = id;
        this._symbol = unit.symbol || "@";
        this._data = unit;
        this._draw();
    };

    Entity.prototype.describe = function () {
        return this._data.name + " (<span style='color:" + this._data.side + "'>" + this._symbol + "</span>)";
    };

    Entity.prototype.getSpeed = function () {
        return this._data.speed || 40;
    };

    Entity.prototype.setPosition = function (x, y) {
        this.x = x;
        this.y = y;
        return this;
    };

    Entity.prototype.getPosition = function () {
        return {x: this.x, y: this.y};
    };

    Entity.prototype.act = function () {
    };

    /* Other unit bumps into */
    Entity.prototype.bump = function (who, power) {
    };

    Entity.prototype._draw = function (x, y) {
        var use_x, use_y;
        if (x === undefined) {
            use_x = this.x;
        } else {
            use_x = x;
        }
        if (y === undefined) {
            use_y = this.y;
        } else {
            use_y = y;
        }
        _c.draw_tile(this._game, use_x, use_y, this._symbol || "@", "#000", this._data.color || this._data.side);
    };
    Entity.prototype.getX = function () {
        return this.x;
    };
    Entity.prototype.getY = function () {
        return this.y;
    };
    Entity.prototype.try_move = function (game, x, y) {
        var result = false;

        var cell = game.cells[x];
        if (cell) {
            cell = cell[y];
            if (cell && !cell.impassible) {
                result = true;
            }
        }
        return result;
    };
    Entity.prototype.execute_plan = function () {
        var unit = this;
        var game = unit._game;


        var plan = unit._data.plan || 'seek closest';
        var options, target_status;

        if (plan == 'seek closest') {
            options = {side: 'enemy', filter: 'closest', range: 20, plan: plan, backup_strategy: unit._data.backup_strategy};
            target_status = _c.find_unit_by_filters(game, unit, options);
            _c.movement_strategies.seek(game, unit, target_status, options)

        } else if (plan == 'vigilant') {
            options = {side: 'enemy', filter: 'closest', range: 3, plan: plan, backup_strategy: unit._data.backup_strategy};
            target_status = _c.find_unit_by_filters(game, unit, options);
            _c.movement_strategies.seek(game, unit, target_status, options)

        } else if (plan == 'seek weakest') {
            options = {side: 'enemy', filter: 'weakest', range: 20, plan: plan, backup_strategy: unit._data.backup_strategy};
            target_status = _c.find_unit_by_filters(game, unit, options);
            _c.movement_strategies.seek(game, unit, target_status, options)

        } else if (plan == 'run away') {
            options = {side: 'enemy', filter: 'closest', range: 12, plan: plan, backup_strategy: 'vigilant'};
            target_status = _c.find_unit_by_filters(game, unit, options);
            _c.movement_strategies.avoid(game, unit, target_status, options)

        } else if (plan == 'invade city') {
            //TODO: If no enemies and close to city, then try to loot and pillage
            var location = _.find(game.data.buildings, function(b){return b.type=='city' || b.type=='city2'});
            options = {side: 'enemy', filter: 'closest', range: 12, plan: plan, backup_strategy: unit._data.backup_strategy};
            _c.movement_strategies.head_towards(game, unit, location, options);

        } else if (plan == 'wait') {
            _c.movement_strategies.wait(game, unit)


        } else { //if (plan == 'wander') {
            _c.movement_strategies.wander(game, unit);
        }

    };


    //--------------------
    var Player = function (game, x, y, id, unit) {
        Entity.call(this, game, x, y, id, unit)
    };
    Player.extend(Entity);

    Player.prototype.act = function () {
        var unit = this;

        /* wait for user input; do stuff when user hits a key */
        if (unit._id == controlled_entity_id) {
//            unit._game.engine.lock();
            window.addEventListener("keydown", this);
        }
        if (!unit.is_dead && unit._data.plan) {
            unit.execute_plan();
        }

    };

    Player.prototype.handleEvent = function (e) {
        var unit = this;
        var game = this._game;
        var command = _c.interpret_command_from_keycode(e.keyCode, unit);

        if (command.ignore) {
            window.removeEventListener("keydown", unit);
            return;
        }

        //TODO: If tab, then switch controlled_entity_id

        if (command.func) {
            command.func(game, unit);
        }

        if (command.movement) {
            var x = unit.x + command.movement[0];
            var y = unit.y + command.movement[1];

            var can_move = unit.try_move(game, x, y);
            if (can_move) {
                _c.try_to_move_to_and_draw(game, unit, x, y);
            }

            window.removeEventListener("keydown", this);
//            game.engine.unlock();
        }

    };

    Player.prototype.execute_action = function (game, unit) {
        var cell = game.cells[unit.x][unit.y];
        console.log("Player at x: " + unit.x + ", y: " + unit.y);
        console.log("Cell value here is: [" + JSON.stringify(cell) + "]");
    };


    //----------------------------------
    var OpForce = function (game, x, y, id, unit) {
        Entity.call(this, game, x, y, id, unit);
    };
    OpForce.extend(Entity);


    OpForce.prototype.act = function () {
        var unit = this;

        if (!unit.is_dead && unit._data.plan) {
            unit.execute_plan()
        }

    };


})(Battlebox);