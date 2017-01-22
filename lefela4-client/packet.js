//This files is fixed by lefela4.

function Packet(e) {
	this.rawdata = e.data;
	this.e = e;
    if(e instanceof Buffer) {
        this.data   = e;
        this.length = this.data.length;
    }else if((typeof Buffer) != 'undefined' && e.data instanceof Buffer) {
        this.data   = e.data;
        this.length = this.data.length;
    }else{
        this.data   = new DataView(e.data);
        this.length = this.data.byteLength;
    }

    this.offset = 0;
}

Packet.prototype = {
    readUInt8: function(p) {
        var offset = (typeof p) == 'number' ? p : this.offset;
        var ret;
        if(this.data.getUint8) {
            ret = this.data.getUint8(offset);
        }else{
            ret = this.data.readUInt8(offset);
        }
        if(p === undefined) this.offset += 1;

        return ret;
    },

    readUInt16BE: function(p) {
        var offset = (typeof p) == 'number' ? p : this.offset;
        var ret;
        if(this.data.getUint16) {
            ret = this.data.getUint16(offset, false);
        }else{
            ret = this.data.readUInt16BE(offset);
        }
        if(p === undefined) this.offset += 2;

        return ret;
    },
	readBytes: function(length, y) {
		var offset = (typeof p) == 'number' ? p : this.offset;
		if (y == true) {
			
			offset = 5;
			
		}
		
		//console.log(offset);
		var str = this.toString('hex');
		var d = str.replace(/\s/g, '');
		var h = new Buffer(d, "hex");
		
		//console.log(h.slice(offset, offset + length));
		return h.slice(offset, offset + length);
		
		this.offset = this.offset + length;
		
	},
	skipBytes: function(length) {
		
		this.offset = this.offset + length;
	
	},

    readUInt16LE: function(p) {
        var offset = (typeof p) == 'number' ? p : this.offset;
        var ret;
        if(this.data.getUint16) {
            ret = this.data.getUint16(offset, true);
        }else{
            ret = this.data.readUInt16LE(offset);
        }
        if(p === undefined) this.offset += 2;

        return ret;
    },

    readSInt16LE: function(p) {
        var offset = (typeof p) == 'number' ? p : this.offset;
        var ret;
        if(this.data.getInt16) {
            ret = this.data.getInt16(offset, true);
        }else{
            ret = this.data.readInt16LE(offset);
        }
        if(p === undefined) this.offset += 2;

        return ret;
    },

    readUInt32LE: function(p) {
        var offset = (typeof p) == 'number' ? p : this.offset;
        var ret;
        if(this.data.getUint32) {
            ret = this.data.getUint32(offset, true);
        }else{
            ret = this.data.readUInt32LE(offset);
        }
        if(p === undefined) this.offset += 4;

        return ret;
    },

    readUInt32BE: function(p) {
        var offset = (typeof p) == 'number' ? p : this.offset;
        var ret;
        if(this.data.getUint32) {
            ret = this.data.getUint32(offset, false);
        }else{
            ret = this.data.readUInt32BE(offset);
        }
        if(p === undefined) this.offset += 4;

        return ret;
    },

    readSInt32LE: function(p) {
        var offset = (typeof p) == 'number' ? p : this.offset;
        var ret;
        if(this.data.getInt32) {
            ret = this.data.getInt32(offset, true);
        }else{
            ret = this.data.readInt32LE(offset);
        }
        if(p === undefined) this.offset += 4;

        return ret;
    },

    readSInt32BE: function(p) {
        var offset = (typeof p) == 'number' ? p : this.offset;
        var ret;
        if(this.data.getInt32) {
            ret = this.data.getInt32(offset, false);
        }else{
            ret = this.data.readInt32BE(offset);
        }
        if(p === undefined) this.offset += 4;

        return ret;
    },

    readFloat32LE: function(p) {
        var offset = (typeof p) == 'number' ? p : this.offset;
        var ret;
        if(this.data.getFloat32) {
            ret = this.data.getFloat32(offset, true);
        }else{
            ret = this.data.readFloatLE(offset);
        }
        if(p === undefined) this.offset += 4;

        return ret;
    },

    readFloat32BE: function(p) {
        var offset = (typeof p) == 'number' ? p : this.offset;
        var ret;
        if(this.data.getFloat32) {
            ret = this.data.getFloat32(offset, false);
        }else{
            ret = this.data.readFloatBE(offset);
        }
        if(p === undefined) this.offset += 4;

        return ret;
    },

    readFloat64LE: function(p) {
        var offset = (typeof p) == 'number' ? p : this.offset;
        var ret;
        if(this.data.getFloat64) {
            ret = this.data.getFloat64(offset, true);
        }else{
            ret = this.data.readDoubleLE(offset);
        }
        if(p === undefined) this.offset += 8;

        return ret;
    },
	
	readFloat64: function(p, o) {

		var r = new DataView(this.e);
		
		console.log(this.data);
		
        var offset = (typeof p) == 'number' ? p : this.offset;
        var ret;
		
        if (o == 1) {
			
			ret = this.data.getFloat64(p);
			
		}else{
			
			//ret = this.data.readFloat64(p);
			
		}
		
        
        
        if(p === undefined) this.offset += 8;

        return ret;
    },
	
	readDoubleLE: function(p) {
        var offset = (typeof p) == 'number' ? p : this.offset;
		var ret;
		
        ret = this.data.readDoubleLE(offset);
        
        if(p === undefined) this.offset += 8;

        return ret;
    },

    readFloat64BE: function(p) {
        var offset = (typeof p) == 'number' ? p : this.offset;
        var ret;
        if(this.data.getFloat64) {
            ret = this.data.getFloat64(offset, false);
        }else{
            ret = this.data.readDoubleBE(offset);
        }
        if(p === undefined) this.offset += 8;

        return ret;
    },
	readStringUnicode: function (length) {
		if (length == null) length = this.length - this.offset;
			length = Math.max(0, length);
			var safeLength = length - (length % 2);
			safeLength = Math.max(0, safeLength);
			var value = this.toString('ucs2', this.offset, this.offset + safeLength);
			this.offset += length;
		return value;
	},
	readStringZeroUnicode: function(length2) {
		var length = 0;
		var terminatorLength = ((length2 - this.offset) & 1) != 0 ? 1 : 0;
		for (var i = this.offset; i + 1 < length2; i += 2) {
			if (this.readUInt16LE(i) == 0) {
				terminatorLength = 2;
				break;
			}
			length += 2;
		}
		var value = this.readStringUnicode(length);
		this.offset += terminatorLength;
		return value;
		
	},
	readStringUtf8: function(length) {
		if (length == null) length = this.length - this.offset;
			length = Math.max(0, length);
			var value = this.toString('utf8', this.offset, this.offset + length);
			this.offset += length;
		return value;
	},
	readStringZeroUtf8: function(p) {
		var length = 0;
		var terminatorLength = 0;
		for (var i = p; i < this.length; i++) {
			if (this.data.readUInt8(i) == 0) {
				terminatorLength = 1;
				break;
			}
			length++;
		}
		var value = this.readStringUtf8(length);
		this.offset += terminatorLength;
		return value;
	},

    toString: function() {
        var out = '';
        for(var i=0;i<this.length;i++) {
            if(out) out += ' ';
            var char = this.readUInt8(i).toString(16);
            if(char.length == 1) out += '0';
            out += char;
        }

        return out;
    }
};

module.exports = Packet;

