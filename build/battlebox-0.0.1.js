/*
------------------------------------------------------------------------------------
-- battlebox.js - v0.0.1 - Built on 2015-11-05 by Jay Crossler using Grunt.js
------------------------------------------------------------------------------------
-- Using rot.js (ROguelike Toolkit) which is Copyright (c) 2012-2015 by Ondrej Zara 
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

    //-----------------------------
    //Private Global variables
    var version = '0.0.1',
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

        if (!game.data.gui_drawn && game._private_functions.initialize_display && game._private_functions.load) {
            var game_was_loaded = game._private_functions.load(game, 'localStorage');
            game._private_functions.initialize_data(game);
            if (!game_was_loaded) {
                game._private_functions.initialize_display(game);
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
    };

    function random(game_options) {
        game_options = game_options || {};
        game_options.rand_seed = game_options.rand_seed || Math.random();
        var x = Math.sin(game_options.rand_seed++) * 300000;
        return x - Math.floor(x);
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
    function randRange (minVal, maxVal, game_options, floatVal) {
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
    var _c = new Battlebox('get_private_functions');
    var $pointers = {};

    _c.draw_initial_display = function(game, options) {
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


})(Battlebox);
(function (Battlebox) {
    var _c = new Battlebox('get_private_functions');
    _c.initialize_data = function (game, data) {


    };

    _c.initialize_display = function (game) {
        var options = {};

        _c.draw_initial_display(game, options)
    };

    _c.redraw_data = function (game) {


    };

    _c.start_game_loop = function (game) {

    };

    _c.stop_game_loop = function (game) {

    };


})(Battlebox);
(function (Battlebox) {

    var _game_options = {
        rand_seed: 0,
        tick_time: 1000,

        functions_on_setup:[],
        functions_each_tick:[],

        buildings:[]

    };



    Battlebox.initializeOptions('game_options', _game_options);

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
            _c.initialize_display(game);
            _c.redraw_data(game);
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