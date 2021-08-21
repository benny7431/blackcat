const ChildProcess = require('child_process');
const { Duplex } = require('stream');

/**
 * FFmpeg media processor
 */
class FFmpeg extends Duplex {
  /**
   * Creates a new FFmpeg transform stream
   * @param {Array<string>} args FFmpeg args
   */
  constructor(args) {
    super();
    this.process = this.create(args);
    const EVENTS = {
      readable: this._reader,
      data: this._reader,
      end: this._reader,
      unpipe: this._reader,
      finish: this._writer,
      drain: this._writer,
    };

    this._readableState = this._reader._readableState;
    this._writableState = this._writer._writableState;

    this._copy(['write', 'end'], this._writer);
    this._copy(['read', 'setEncoding', 'pipe', 'unpipe'], this._reader);

    for (const method of ['on', 'once', 'removeListener', 'removeListeners', 'listeners']) {
      this[method] = (ev, fn) => EVENTS[ev] ? EVENTS[ev][method](ev, fn) : Duplex.prototype[method].call(this, ev, fn);
    }

    const processError = error => this.emit('error', error);
    this._reader.on('error', processError);
    this._writer.on('error', processError);
  }

  get _reader() {
    return this.process.stdout;
  }

  get _writer() {
    return this.process.stdin;
  }

  _copy(methods, target) {
    for (const method of methods) {
      this[method] = target[method].bind(target);
    }
  }

  _destroy(err, cb) {
    this._cleanup();
  }

  _final(cb) {
    this._cleanup();
    cb();
  }

  /**
   * Kill FFmpeg process
   * @private
   */
  _cleanup() {
    if (this.process) {
      this.once('error', () => { });
      this.process.kill('SIGKILL');
      this.process = null;
    }
  }

  /**
   * Creates a new FFmpeg instance.
   * @param {Array<String>} args FFmpeg args
   * @returns {ChildProcessWithoutNullStreams}
   * @private
   */
  create(args) {
    return ChildProcess.spawn("./ffmpeg", args.concat("pipe:1"));
  }
}

module.exports = FFmpeg;
