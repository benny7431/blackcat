const { Transform } = require('stream');

/**
 * Transforms a stream of PCM s16le volume.
 * @extends TransformStream
 */
class VolumeController extends Transform {
  /**
   * @param {number} volume The output volume of the stream
   */
  constructor(volume) {
    super();
    this._readInt = (buffer, index) => buffer.readInt16LE(index);
    this._writeInt = (buffer, int, index) => buffer.writeInt16LE(int, index);
    this._bits = 16;
    this._bytes = this._bits / 8;
    this._extremum = Math.pow(2, this._bits - 1);
    this.volume = volume || 1;
    this._chunk = Buffer.alloc(0);
  }

  _readInt(buffer, index) {
    return index;
  }
  _writeInt(buffer, int, index) {
    return index;
  }

  _transform(chunk, encoding, done) {
    if (this.volume === 1) {
      this.push(chunk);
      return done();
    }

    const { _bytes, _extremum } = this;

    chunk = this._chunk = Buffer.concat([this._chunk, chunk]);
    if (chunk.length < _bytes) return done();

    const complete = Math.floor(chunk.length / _bytes) * _bytes;

    for (let i = 0; i < complete; i += _bytes) {
      const int = Math.min(_extremum - 1, Math.max(-_extremum, Math.floor(this.volume * this._readInt(chunk, i))));
      this._writeInt(chunk, int, i);
    }

    this._chunk = chunk.slice(complete);
    this.push(chunk.slice(0, complete));
    return done();
  }

  _destroy(err, cb) {
    super._destroy(err, cb);
    this._chunk = null;
  }

  /**
   * Set volume
   * @param {number} volume The volume that you want to set
   */
  setVolume(volume) {
    this.volume = volume;
  }
}

module.exports = VolumeController;
