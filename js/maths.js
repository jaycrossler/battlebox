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