/**
 * An rgba color.
 * @constructor
 * @param {string} color Any legal CSS color value (hex, color keyword, rgb[a], hsl[a]).
 */
function Color(color){
    var parsed_color = {};
    if (color in cache){
        parsed_color = cache[color];
    } else {
        parsed_color = parseColor(color);
        cache[color] = parsed_color;
    }
    this.r = parsed_color.r;
    this.g = parsed_color.g;
    this.b = parsed_color.b;
    var alpha = parsed_color.a || 1;
    this.a = Math.floor(alpha * 255);
}
Color.prototype.toHSLA = function(){
    // TODO: Write this
    return;
}
/**
 * Lighten a color by percent amount.
 * @method
 * @param  {number} percent
 * @return {Color}
 */
Color.prototype.lighten = function(percent){
    // TODO: This function is temporary and its behavior will change.
    // It will use the yet to be written toHSL function above to achieve better results.
    // The results that it returns will change.
    var correctionFactor = (1 - percent) * .00000010000;

    var red = Math.floor((255 - this.r) * correctionFactor + this.r);
    var green = Math.floor((255 - this.g) * correctionFactor + this.g);
    var blue = Math.floor((255 - this.b) * correctionFactor + this.b);
    return new Color("rgb(" + red + "," + green + "," + blue + ")");
}
/**
 * Darken a color by percent amount.
 * @method
 * @param  {number} percent
 * @return {Color}
 */
Color.prototype.darken = function(percent){
    // TODO: This function is temporary and its behavior will change.
    // It will use the yet to be written toHSL function above to achieve better results.
    // The results that it returns will change.
    var correctionFactor = percent / 7;
    var red = Math.floor((255 - this.r) * correctionFactor + this.r);
    var green = Math.floor((255 - this.g) * correctionFactor + this.g);
    var blue = Math.floor((255 - this.b) * correctionFactor + this.b);
    return new Color("rgb(" + red + "," + green + "," + blue + ")");
}

/**
 * Parse a CSS color value and return an rgba color object.
 * @param  {string} color A legal CSS color value (hex, color keyword, rgb[a], hsl[a]).
 * @return {{r: number, g: number, b: number, a: number}}   rgba color object.
 * @throws {ColorError} If illegal color value is passed.
 */
function parseColor(color){
    // TODO: How cross-browser compatible is this? How efficient?
    // Make a temporary HTML element styled with the given color string
    // then extract and parse the computed rgb(a) value.
    var div = document.createElement('div');
    div.style.backgroundColor = color;
    var rgba = div.style.backgroundColor;
    // Convert string in form 'rgb[a](num, num, num[, num])' to array ['num', 'num', 'num'[, 'num']]
    rgba = rgba.slice(rgba.indexOf('(')+1).slice(0,-1).replace(/\s/g, '').split(',');
    var return_color = {};
    var color_spaces = ['r', 'g', 'b', 'a'];
    for (var i = 0; i < rgba.length; i++){
        var value = parseFloat(rgba[i]); // Alpha value will be floating point.
        if (isNaN(value)){
            throw "ColorError: Something went wrong. Perhaps " + color + " is not a legal CSS color value";
        }
        else {
            return_color[color_spaces[i]] = value;
        }
    }
    return return_color;
}

// Pre-warm the cache with named colors, as these are not
// converted to rgb values by the parseColor function above.
var cache = {
    "black": {"r": 0, "g": 0, "b": 0},
    "silver": {"r": 192, "g": 192, "b": 192},
    "gray": {"r": 128, "g": 128, "b": 128},
    "white": {"r": 255, "g": 255, "b": 255},
    "maroon": {"r": 128, "g": 0, "b": 0},
    "red": {"r": 255, "g": 0, "b": 0},
    "purple": {"r": 128, "g": 0, "b": 128},
    "fuchsia": {"r": 255, "g": 0, "b": 255},
    "green": {"r": 0, "g": 128, "b": 0},
    "lime": {"r": 0, "g": 255, "b": 0},
    "olive": {"r": 128, "g": 128, "b": 0},
    "yellow": {"r": 255, "g": 255, "b": 0},
    "navy": {"r": 0, "g": 0, "b": 128},
    "blue": {"r": 0, "g": 0, "b": 255},
    "teal": {"r": 0, "g": 128, "b": 128},
    "aqua": {"r": 0, "g": 255, "b": 255},
    "orange": {"r": 255, "g": 165, "b": 0},
    "aliceblue": {"r": 240, "g": 248, "b": 255},
    "antiquewhite": {"r": 250, "g": 235, "b": 215},
    "aquamarine": {"r": 127, "g": 255, "b": 212},
    "azure": {"r": 240, "g": 255, "b": 255},
    "beige": {"r": 245, "g": 245, "b": 220},
    "bisque": {"r": 255, "g": 228, "b": 196},
    "blanchedalmond": {"r": 255, "g": 235, "b": 205},
    "blueviolet": {"r": 138, "g": 43, "b": 226},
    "brown": {"r": 165, "g": 42, "b": 42},
    "burlywood": {"r": 222, "g": 184, "b": 135},
    "cadetblue": {"r": 95, "g": 158, "b": 160},
    "chartreuse": {"r": 127, "g": 255, "b": 0},
    "chocolate": {"r": 210, "g": 105, "b": 30},
    "coral": {"r": 255, "g": 127, "b": 80},
    "cornflowerblue": {"r": 100, "g": 149, "b": 237},
    "cornsilk": {"r": 255, "g": 248, "b": 220},
    "crimson": {"r": 220, "g": 20, "b": 60},
    "darkblue": {"r": 0, "g": 0, "b": 139},
    "darkcyan": {"r": 0, "g": 139, "b": 139},
    "darkgoldenrod": {"r": 184, "g": 134, "b": 11},
    "darkgray": {"r": 169, "g": 169, "b": 169},
    "darkgreen": {"r": 0, "g": 100, "b": 0},
    "darkgrey": {"r": 169, "g": 169, "b": 169},
    "darkkhaki": {"r": 189, "g": 183, "b": 107},
    "darkmagenta": {"r": 139, "g": 0, "b": 139},
    "darkolivegreen": {"r": 85, "g": 107, "b": 47},
    "darkorange": {"r": 255, "g": 140, "b": 0},
    "darkorchid": {"r": 153, "g": 50, "b": 204},
    "darkred": {"r": 139, "g": 0, "b": 0},
    "darksalmon": {"r": 233, "g": 150, "b": 122},
    "darkseagreen": {"r": 143, "g": 188, "b": 143},
    "darkslateblue": {"r": 72, "g": 61, "b": 139},
    "darkslategray": {"r": 47, "g": 79, "b": 79},
    "darkslategrey": {"r": 47, "g": 79, "b": 79},
    "darkturquoise": {"r": 0, "g": 206, "b": 209},
    "darkviolet": {"r": 148, "g": 0, "b": 211},
    "deeppink": {"r": 255, "g": 20, "b": 147},
    "deepskyblue": {"r": 0, "g": 191, "b": 255},
    "dimgray": {"r": 105, "g": 105, "b": 105},
    "dimgrey": {"r": 105, "g": 105, "b": 105},
    "dodgerblue": {"r": 30, "g": 144, "b": 255},
    "firebrick": {"r": 178, "g": 34, "b": 34},
    "floralwhite": {"r": 255, "g": 250, "b": 240},
    "forestgreen": {"r": 34, "g": 139, "b": 34},
    "gainsboro": {"r": 220, "g": 220, "b": 220},
    "ghostwhite": {"r": 248, "g": 248, "b": 255},
    "gold": {"r": 255, "g": 215, "b": 0},
    "goldenrod": {"r": 218, "g": 165, "b": 32},
    "greenyellow": {"r": 173, "g": 255, "b": 47},
    "grey": {"r": 128, "g": 128, "b": 128},
    "honeydew": {"r": 240, "g": 255, "b": 240},
    "hotpink": {"r": 255, "g": 105, "b": 180},
    "indianred": {"r": 205, "g": 92, "b": 92},
    "indigo": {"r": 75, "g": 0, "b": 130},
    "ivory": {"r": 255, "g": 255, "b": 240},
    "khaki": {"r": 240, "g": 230, "b": 140},
    "lavender": {"r": 230, "g": 230, "b": 250},
    "lavenderblush": {"r": 255, "g": 240, "b": 245},
    "lawngreen": {"r": 124, "g": 252, "b": 0},
    "lemonchiffon": {"r": 255, "g": 250, "b": 205},
    "lightblue": {"r": 173, "g": 216, "b": 230},
    "lightcoral": {"r": 240, "g": 128, "b": 128},
    "lightcyan": {"r": 224, "g": 255, "b": 255},
    "lightgoldenrodyellow": {"r": 250, "g": 250, "b": 210},
    "lightgray": {"r": 211, "g": 211, "b": 211},
    "lightgreen": {"r": 144, "g": 238, "b": 144},
    "lightgrey": {"r": 211, "g": 211, "b": 211},
    "lightpink": {"r": 255, "g": 182, "b": 193},
    "lightsalmon": {"r": 255, "g": 160, "b": 122},
    "lightseagreen": {"r": 32, "g": 178, "b": 170},
    "lightskyblue": {"r": 135, "g": 206, "b": 250},
    "lightslategray": {"r": 119, "g": 136, "b": 153},
    "lightslategrey": {"r": 119, "g": 136, "b": 153},
    "lightsteelblue": {"r": 176, "g": 196, "b": 222},
    "lightyellow": {"r": 255, "g": 255, "b": 224},
    "limegreen": {"r": 50, "g": 205, "b": 50},
    "linen": {"r": 250, "g": 240, "b": 230},
    "mediumaquamarine": {"r": 102, "g": 205, "b": 170},
    "mediumblue": {"r": 0, "g": 0, "b": 205},
    "mediumorchid": {"r": 186, "g": 85, "b": 211},
    "mediumpurple": {"r": 147, "g": 112, "b": 219},
    "mediumseagreen": {"r": 60, "g": 179, "b": 113},
    "mediumslateblue": {"r": 123, "g": 104, "b": 238},
    "mediumspringgreen": {"r": 0, "g": 250, "b": 154},
    "mediumturquoise": {"r": 72, "g": 209, "b": 204},
    "mediumvioletred": {"r": 199, "g": 21, "b": 133},
    "midnightblue": {"r": 25, "g": 25, "b": 112},
    "mintcream": {"r": 245, "g": 255, "b": 250},
    "mistyrose": {"r": 255, "g": 228, "b": 225},
    "moccasin": {"r": 255, "g": 228, "b": 181},
    "navajowhite": {"r": 255, "g": 222, "b": 173},
    "oldlace": {"r": 253, "g": 245, "b": 230},
    "olivedrab": {"r": 107, "g": 142, "b": 35},
    "orangered": {"r": 255, "g": 69, "b": 0},
    "orchid": {"r": 218, "g": 112, "b": 214},
    "palegoldenrod": {"r": 238, "g": 232, "b": 170},
    "palegreen": {"r": 152, "g": 251, "b": 152},
    "paleturquoise": {"r": 175, "g": 238, "b": 238},
    "palevioletred": {"r": 219, "g": 112, "b": 147},
    "papayawhip": {"r": 255, "g": 239, "b": 213},
    "peachpuff": {"r": 255, "g": 218, "b": 185},
    "peru": {"r": 205, "g": 133, "b": 63},
    "pink": {"r": 255, "g": 192, "b": 203},
    "plum": {"r": 221, "g": 160, "b": 221},
    "powderblue": {"r": 176, "g": 224, "b": 230},
    "rosybrown": {"r": 188, "g": 143, "b": 143},
    "royalblue": {"r": 65, "g": 105, "b": 225},
    "saddlebrown": {"r": 139, "g": 69, "b": 19},
    "salmon": {"r": 250, "g": 128, "b": 114},
    "sandybrown": {"r": 244, "g": 164, "b": 96},
    "seagreen": {"r": 46, "g": 139, "b": 87},
    "seashell": {"r": 255, "g": 245, "b": 238},
    "sienna": {"r": 160, "g": 82, "b": 45},
    "skyblue": {"r": 135, "g": 206, "b": 235},
    "slateblue": {"r": 106, "g": 90, "b": 205},
    "slategray": {"r": 112, "g": 128, "b": 144},
    "slategrey": {"r": 112, "g": 128, "b": 144},
    "snow": {"r": 255, "g": 250, "b": 250},
    "springgreen": {"r": 0, "g": 255, "b": 127},
    "steelblue": {"r": 70, "g": 130, "b": 180},
    "tan": {"r": 210, "g": 180, "b": 140},
    "thistle": {"r": 216, "g": 191, "b": 216},
    "tomato": {"r": 255, "g": 99, "b": 71},
    "turquoise": {"r": 64, "g": 224, "b": 208},
    "violet": {"r": 238, "g": 130, "b": 238},
    "wheat": {"r": 245, "g": 222, "b": 179},
    "whitesmoke": {"r": 245, "g": 245, "b": 245},
    "yellowgreen": {"r": 154, "g": 205, "b": 50}
};

module.exports = Color;