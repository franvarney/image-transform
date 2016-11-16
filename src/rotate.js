/**
* Rotate 90 degrees clockwise
* @this Image
*/
function rotate90Clockwise() {
  const matrix = [];

  for (let x = 0; x < this.matrix[0].length; ++x) {
    let row = [];

    for (let y = 0; y < this.matrix.length; ++y) {
      let pixel = this.matrix[this.matrix.length - 1 - y][x];
      row.push(pixel);
    }

    matrix.push(row);
  }

  this.matrix = matrix;
}

/**
* Rotate methods
* @this Image
* @param {Number} degrees - amount to rotate
* @param {Object} [options]
* @param {Boolean} [options.clockwise=true] - counter-clockwise if false
* @param {Boolean} [options.inPlace=false] - rotate in place
* @param {Boolean} [options.cropAfter=false] - crop after rotating
* @return void
*/
module.exports = function (degrees=90, options={}) {
  if (!degrees || typeof degrees !== 'number') throw 'Invalid degrees';

  const {
    clockwise=true,
    inPlace=false,
    cropAfter=false // only will work with arbitrary rotate
  } = options;

  switch(true) {
    case (degrees === 90 && clockwise && !inPlace):
      rotate90Clockwise.call(this);
      break;
    case (degrees === 90 && clockwise && inPlace):
      // TODO 90 degree clockwise rotate, in place
      break;
    case (degrees === 90 && !clockwise):
      // TODO 90 degree counter-clockwise rotate
      break;
    case (degrees === 180):
      // TODO 180 degree rotate
      break;
    case (degrees !== 90 && degrees !== 180 && clockwise):
      // TODO arbitrary clockwise rotate
      break;
    case (degrees !== 90 && degrees !== 180 && !clockwise):
      // TODO arbitrary counter-clockwise rotate
      break;
    // TODO maybe try rotating ndarray?
    default:
      // nadda
      break;
  }

  this._update();
  // TODO if cropAfter, then crop
};
