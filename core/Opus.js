const { Transform } = require("stream");
const { OpusEncoder } = require("@discordjs/opus");

const CTL = {
  BITRATE: 4002,
  FEC: 4012,
  PLP: 4014
};

let Opus = {
  Encoder: OpusEncoder
};

/**
 * PCM s16le stream to opus Object mode stream converter
 * @extends TransformStream
 * @protected
 */
class OpusStream extends Transform {
  /**
   * Creates a new Opus transformer.
   * @private
   * @param {Object} [options] options that you would pass to a regular Transform stream
   */
  constructor(options = {}) {
    super(Object.assign({readableObjectMode: true}, options));
    this.encoder = new Opus.Encoder(options.rate, options.channels, options.application);

    this._options = options;
    this._required = this._options.frameSize * this._options.channels * 2;
  }

  _encode(buffer) {
    return this.encoder.encode(buffer, this._options.frameSize);
  }

  _decode(buffer) {
    return this.encoder.decode(buffer, this._options.frameSize);
  }

  /**
   * Sets the bitrate of the stream.
   * @param {number} bitrate the bitrate to use use, e.g. 48000
   * @public
   */
  setBitrate(bitrate) {
    (this.encoder.applyEncoderCTL || this.encoder.encoderCTL)
      .apply(this.encoder, [CTL.BITRATE, Math.min(128e3, Math.max(16e3, bitrate))]);
  }

  /**
   * Enables or disables forward error correction.
   * @param {boolean} enabled whether or not to enable FEC.
   * @public
   */
  setFEC(enabled) {
    (this.encoder.applyEncoderCTL || this.encoder.encoderCTL)
      .apply(this.encoder, [CTL.FEC, enabled ? 1 : 0]);
  }

  /**
   * Sets the expected packet loss over network transmission.
   * @param {number} [percentage] a percentage (represented between 0 and 1)
   */
  setPLP(percentage) {
    (this.encoder.applyEncoderCTL || this.encoder.encoderCTL)
      .apply(this.encoder, [CTL.PLP, Math.min(100, Math.max(0, percentage * 100))]);
  }

  _final(cb) {
    this._cleanup();
    cb();
  }

  _destroy(err, cb) {
    this._cleanup();
  }

  /**
   * Cleans up the Opus stream when it is no longer needed
   * @private
   */
  _cleanup() {
    this.encoder = null;
  }
}

/**
 * Opus stream encoder
 * @extends OpusStream
 */
class Encoder extends OpusStream {
  /**
   * Creates a new Opus encoder stream.
   * @param {Object} options options that you would pass to a regular OpusStream, plus a few more:
   * @param {number} options.frameSize the frame size in bytes to use (e.g. 960 for stereo audio at 48KHz with a frame
   * duration of 20ms)
   * @param {number} options.channels the number of channels to use
   * @param {number} options.rate the sampling rate in Hz
   */
  constructor(options) {
    super(options);
    this._buffer = Buffer.alloc(0);
  }

  _transform(chunk, encoding, done) {
    this._buffer = Buffer.concat([this._buffer, chunk]);
    let n = 0;
    while (this._buffer.length >= this._required * (n + 1)) {
      const buf = this._encode(this._buffer.slice(n * this._required, (n + 1) * this._required));
      this.push(buf);
      n++;
    }
    if (n > 0) this._buffer = this._buffer.slice(n * this._required);
    return done();
  }

  _destroy(err, cb) {
    super._destroy(err, cb);
    this._buffer = null;
  }
}

module.exports = Encoder;
