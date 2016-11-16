const Fs = require('fs');
const GetPixels = require('get-pixels');
const NdArray = require('ndarray');
const Path = require('path');
const SavePixels = require('save-pixels');

const Rotate = require('./rotate');

const DEFAULT_IMAGE_DIR = 'images';
const DEFAULT_IMAGE_FILE = 'test.jpg';
const VALID_IMAGE_TYPES = ['jpeg', 'png', 'gif'];

/**
* Image class with helper utilites and attached transform methods
* @constructor
* @param {Object} [image]
* @param {String} [image.dir='images'] - the directory where images are
*   retrieved and stored
* @param {String} [image.fileName='test.jpg'] - process this image
*/
module.exports = class Image {
  constructor(image={}) {
    [this.dir, this.fileName, this.type] = this._validateImage(image);
    this.original = {}; // will be original ndarray from get-pixels, just in case
    this.buffer = undefined;
    this.shape = {
      width: 0,
      height: 0,
      channels: 0
    };
    this.stride = {
      bytes: 0,
      length: 0,
      padding: 0 // not 100% sure this will be padding
    };
    this.offset = 0;
    this.matrix = [];
    this.ndArray = {}; // { buffer, shape, stride }
  }

  /**
  * Build image path
  * @param {String} [fileName] - the image file name
  * @return {String} path from Path.resolve
  */
  _buildPath(fileName) {
    return Path.resolve(this.dir, fileName || this.fileName);
  }

  /**
  * Check if dir is a string
  * @param {String} dir - directory of images
  * @return {Boolean} is valid directory
  */
  _isValidDir(dir) {
    return typeof dir === 'string';
  }

  /**
  * Check if file name is a string and has extension
  * @param {String} fileName - expects format like `name.ext`
  * @return {Boolean} is valid file name
  */
  _isValidFileName(fileName) {
    return fileName && typeof fileName === 'string' || fileName.indexOf('.') >= 0;
  }

  /**
  * Check if file type is valid
  * @param {String} type - file extension
  * @return {Boolean} is valid file name
  */
  _isValidFileType(type) {
    if (type) type = type.toLowerCase();
    if (type === 'jpg') type = 'jpeg';
    return type && VALID_IMAGE_TYPES.indexOf(type) >= 0;
  }

  /**
  * Check if `image` is correctly entered
  * @param {Object} image - See constructor
  * @throws {String} error message
  * @return {Array} this
  */
  _validateImage(image) {
    // no image
    if (!image) throw '\`image\` object is required';

    // no image.dir/image.file, use defaults
    if (!image.dir) image.dir = DEFAULT_IMAGE_DIR;
    if (!image.file) image.file = DEFAULT_IMAGE_FILE;

    if (!this._isValidDir(image.dir)) throw 'Invalid image directory';
    if (!this._isValidFileName(image.file)) throw 'Invalid file name';

    let [ , type=null] = image.file.split('.');
    if (type === 'jpg') type = 'jpeg';
    if (!this._isValidFileType(type)) throw 'Invalid file type';

    return [image.dir, image.file, type];
  }

  /**
  * Build a matrix from image buffer
  */
  _buildMatrix() {
    let pixelIndex = this.offset || 0; // not sure this is where `offset` goes?

    for (let y = 0; y < this.shape.height; ++y) {
      let row = [];

      for (let x = 0; x < this.shape.width; ++x) {
        let pixel = this.buffer.slice(pixelIndex, pixelIndex + this.stride.bytes);
        row.push(pixel);
        pixelIndex += this.stride.bytes;
      }

      this.matrix.push(row);
    }
  }

  /**
  * Build matrix, in place, from image buffer
  */
  _buildMatrixInPlace() {
    // TODO
  }

  /**
  * Build buffer array from matrix, overwrites original buffer
  */
  _rebuildBuffer() {
    this.buffer = Buffer.concat(this.matrix.reduce((p, c) => p.concat(c), []));
  }

  /**
  * Build ndarray from modified pixels
  */
  _buildNdArray() {
    const shape = [this.shape.width, this.shape.height, this.shape.channels];
    const stride = [this.stride.bytes, this.stride.length, this.stride.padding];
    this.ndArray = NdArray(this.buffer, shape, stride, this.offset);
  }

  /**
  * Update shape, stride, buffer, and ndarray after modifying
  */
  _update() {
    [this.shape.width, this.shape.height] = [this.matrix[0].length, this.matrix.length];
    this.stride.length = this.shape.width * this.stride.bytes;
    this._rebuildBuffer();
    this._buildNdArray();
  }

  /**
  * Get image pixels
  * @param {Function} done - callback
  * @callback {Function} error, this
  */
  get(done) {
    GetPixels(this._buildPath(), (err, pixels) => {
      if (err) return done(err);

      this.original = pixels.data;
      this.buffer = pixels.data;
      [this.shape.width, this.shape.height, this.shape.channels] = pixels.shape;
      [this.stride.bytes, this.stride.length, this.stride.padding] = pixels.stride;
      this.offset = pixels.offset;

      this._buildMatrix();
      this._buildNdArray();

      return done(null, this);
    });
  }

  /**
  * Save image pixels
  * @param {String} fileName - The name of the file to write to
  * @param {String} [type] - The file type to save
  * @param {Function} done - callback
  * @callback {Function} error, true (successful)
  */
  save(fileName, type, done) {
    if (!this._isValidFileName(fileName)) {
      return done('Invalid file name');
    }

    if (!this._isValidFileType(fileName.split('.')[1])) {
      return done('Invalid file type');
    }

    if (typeof type === 'function') {
      [done, type] = [type, undefined];
    }

    const path = this._buildPath(fileName);

    SavePixels(this.ndArray, type || this.type)
      .pipe(Fs.createWriteStream(path))
      .on('error', (err) => done(err))
      .on('finish', () => {
        console.info('Image written to', `\`${path}\``);
        return done(null, true);
      });
  }

  /**
  * Rotate an image based on options
  * @param {Number} degrees - See Rotate
  * @param {Object} options - See Rotate
  * @return {Object} this
  */
  rotate(degrees, options) {
    Rotate.call(this, degrees, options);
    return this;
  }
};
