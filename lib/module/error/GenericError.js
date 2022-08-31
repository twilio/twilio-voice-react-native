function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Generic error that the SDK will raise when encountering an error. Can be
 * used to describe backend errors.
 *
 * @public
 */
export class GenericError extends Error {
  constructor(message, code) {
    super(message);

    _defineProperty(this, "code", void 0);

    this.code = code;
    Object.setPrototypeOf(this, GenericError.prototype);
    this.name = GenericError.name;
  }

}
//# sourceMappingURL=GenericError.js.map