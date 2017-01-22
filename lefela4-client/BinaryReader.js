'use strict';
/*
 * Simple BinaryReader is a minimal tool to read binary stream.
 * Useful for binary deserialization.
 *
 * Copyright (c) 2016 Barbosik
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function BinaryReader(buffer) {
    this.offset = 0;
    this.buffer = new Buffer(buffer);
}

module.exports = BinaryReader;

BinaryReader.prototype.readUInt8 = function () {
    var value = this.buffer.readUInt8(this.offset);
    this.offset += 1;
    return value;
};

BinaryReader.prototype.readInt8 = function () {
    var value = this.buffer.readInt8(this.offset);
    this.offset += 1;
    return value;
};

BinaryReader.prototype.readUInt16 = function () {
    var value = this.buffer.readUInt16LE(this.offset);
    this.offset += 2;
    return value;
};

BinaryReader.prototype.readInt16 = function () {
    var value = this.buffer.readInt16LE(this.offset);
    this.offset += 2;
    return value;
};

BinaryReader.prototype.readUInt32 = function (offset) {
    var value = this.buffer.readUInt32LE(offset);
    this.offset += 4;
    return value;
};

BinaryReader.prototype.readInt32 = function () {
    var value = this.buffer.readInt32LE(this.offset);
    this.offset += 4;
    return value;
};

BinaryReader.prototype.readFloat = function () {
    var value = this.buffer.readFloatLE(this.offset);
    this.offset += 4;
    return value;
};

BinaryReader.prototype.readDouble = function () {
    var value = this.buffer.readDoubleLE(this.offset);
    this.offset += 8;
    return value;
};

BinaryReader.prototype.readBytes = function (length) {
    return this.buffer.slice(this.offset, this.offset + length);
    this.offset += length;
};

BinaryReader.prototype.skipBytes = function (length) {
    this.offset += length;
};

BinaryReader.prototype.readStringUtf8 = function (length) {
    if (length == null) length = this.buffer.length - this.offset;
    length = Math.max(0, length);
    var value = this.buffer.toString('utf8', this.offset, this.offset + length);
    this.offset += length;
    return value;
};

BinaryReader.prototype.readStringUnicode = function (length) {
    if (length == null) length = this.buffer.length - this.offset;
    length = Math.max(0, length);
    var safeLength = length - (length % 2);
    safeLength = Math.max(0, safeLength);
    var value = this.buffer.toString('ucs2', this.offset, this.offset + safeLength);
    this.offset += length;
    return value;
};

BinaryReader.prototype.readStringZeroUtf8 = function () {
    var length = 0;
    var terminatorLength = 0;
    for (var i = this.offset; i < this.buffer.length; i++) {
        if (this.buffer.readUInt8(i) == 0) {
            terminatorLength = 1;
            break;
        }
        length++;
    }
    var value = this.readStringUtf8(length);
    this.offset += terminatorLength;
    return value;
};

BinaryReader.prototype.readStringZeroUnicode = function () {
    var length = 0;
    var terminatorLength = ((this.buffer.length - this.offset) & 1) != 0 ? 1 : 0;
    for (var i = this.offset; i + 1 < this.buffer.length; i += 2) {
        if (this.buffer.readUInt16LE(i) == 0) {
            terminatorLength = 2;
            break;
        }
        length += 2;
    }
    var value = this.readStringUnicode(length);
    this.offset += terminatorLength;
    return value;
};
