## Color Models

#### Gamma

  - Gamma correction is used to encode and decode luminance, which optimizes the usage of bits when encoding an image
  - Compressed when less than 1 and expanded when greater than 1

### CIE xyY Color Model

#### Chromaticity

These values are defined by the CIE xyY color space where _Y_ is the perceived luminance (or brightness) and should be equal to 1 (but is often 100) and white point (_W_) acts to define what "white" is (basically white balance).

&nbsp; | Red    | Green  | Blue   | White Point
:-----:|--------|--------|--------|-------------
_x_	   | 0.6400 | 0.3000 | 0.1500 | 0.3127
_y_	   | 0.3300 | 0.6000 | 0.0600 | 0.3290
_Y_	   | 0.2126 | 0.7152 | 0.0722 | 1.0000

### CIE XYZ Color Model

  - Made by the International Commission on Illumination (CIE) in 1931
  - Additive color model; _R_ for red, _G_ for green, and _B_ for blue
  - Includes all colors the average person can see

#### Tristimulus Values

These are the amounts of the three primary colors in a color model and are obtained by using the CIE xyY chromaticity values with color matching functions.

&nbsp; | Formula | Description
:-----:|---------| ------------
_Y_    | Point [_R_&#124;_G_&#124;_B_,_Y_]  | A mix of cone response curves
_X_    | _Y_ \* ( _x_ / _y_ )               | Approximately equivalent to blue stimulation
_Z_    | _Y_ \* ( ( 1 - _x_ - _y_ ) / _y_ ) | The luminance or brightness

Collectively, these functions are known as the "CIE standard observer".

### sRGB Color Model

  - Also known as "true color"
  - RGB is 8 bits * 3 bytes = 24 bits; 3 channels
  - RGBA is 8 bits * 4 bytes = 32 bits; 4 channels, the last being alpha (opacity)
  - 256 total colors per channel (often not a good enough range when it comes to printing) or 256<sup>3</sup> (~16.7 million colors)
  - Uses gamma=~2.2

#### CIE XYZ to sRGB

Uses CIE XYZ tristimulus values with the numbers below from the sRGB specification to linearly transform via matrix multiplication.

&nbsp; | Formula | Equivalent
:-----:|---------|------------
[ _R_<sub>_L_</sub> ]<br /><span>[ _G_<sub>_L_</sub> ]</span><br /><span>[ _B_<sub>_L_</sub> ]</span> | [ +3.2406, -1.5372, -0.4986 ] [ _X_ ]<br/ >[ -0.9689, +1.8758, +0.0415 ] [ _Y_ ]<br />[ +0.0557, -0.2040, +1.0570 ] [ _Z_ ] | [ ( +3.2406 \* _X_ ) + ( -1.5372 \* _Y_ ) + ( -0.4986 \* _Z_ ) ]<br />[ ( -0.9689 \* _X_ ) + ( +1.8758 \* _Y_ ) + ( +0.0415 \* _Z_ ) ]<br />[ ( +0.0557 \* _X_ ) + ( -0.2040 \* _Y_ ) + ( +1.0570 \* _Z_ ) ]

This results in linear RGB values _C_<sub>L</sub> (where _C_ is equal to each primary color) and then needs to be gamma corrected with a piecewise function.

&nbsp; | Formula   | Condition
:-----:|-----------|------------
_C_<sub>_sRGB_</sub> | 12.92 \* _C_<sub>_L_</sub> | if _C_<sub>_L_</sub> <= 0.0031308
_C_<sub>_sRGB_</sub> | ( 1 + 0.055 ) \* ( _C_<sub>_L_</sub><sup>( 1 / 2.4 )</sup> ) | if _C_<sub>_L_</sub> > 0.0031308

If _C_<sub>SRGB</sub> needs to be in [0,255] range instead of [0,1], then multiply by 255 and round to nearest integer.

### Greyscale

  - Only carries luminance information
  - 1 byte (_Y_), or 8 bits

#### sRGB to Greyscale

  - Also known as "colorimetric conversion"

The first step is gamma expansion, because luminance is gamma compressed. To use the values in [0,1] gamma range when colors are in range [0,255], divide by 255.

&nbsp; | Formula   | Condition
:-----:|-----------|------------
_C_<sub>_L_</sub> | _C_<sub>_sRGB_</sub> / 12.92 | if _C_<sub>_sRGB_</sub> <= 0.04045
_C_<sub>_L_</sub> | ( ( _C_<sub>_sRGB_</sub> + 0.055 ) / 1.055 )<sup>2.4</sup> | if _C_<sub>_sRGB_</sub> > 0.04045

Then use the following formula to convert to greyscale. It can also be used without gamma correction for a simple, not as nice way of converting.

&nbsp; | Formula
:-----:|---------
_Y_<sub>_L_</sub> | ( 0.2126 \* _R_<sub>_L_</sub> ) + ( 0.7152 \* _G_<sub>_L_</sub> ) + ( 0.722 \* _B_<sub>_L_</sub> )

And compress again to get back to a non-linear representation.

&nbsp; | Formula   | Condition
:-----:|-----------|------------
_Y_<sub>_sRGB_</sub> | 12.92 \* _Y_<sub>_L_</sub> | if _Y_<sub>_L_</sub> <= 0.0031308
_Y_<sub>_sRGB_</sub> | ( 1.055 \* _Y_<sub>_L_</sub><sup>( 1 / 2.4 )</sup> ) - 0.055 | if _Y_<sub>_L_</sub> > 0.0031308

The resulting values can be stored as _Y_<sub>sRGB</sub> in all channels, or just a single one.
