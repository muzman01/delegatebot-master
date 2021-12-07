"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.STREAM_MODE = void 0;

var _dsteem = require("dsteem");

var _config = require("../config");

let opts= {};
  
   opts.addressPrefix = 'TST'
   opts.chainId ='d043ab83d223f25f37e1876fe48a240d49d8e4b1daa2342064990a8036a8bb5b'

const client = new _dsteem.Client(_config.STEEM_API_URLS[12],opts);
const STREAM_MODE = _dsteem.BlockchainMode;


exports.STREAM_MODE = STREAM_MODE;
var _default = client;
exports.default = _default;