const through2 = require('through2');
const pumpify = require('pumpify');
const split2 = require('split2');
const Type = require('type-of-is');
const concat = require('concat-stream');
const BufferList = require('bl');

//const logger = require('./loadLogger').logger;
//logger.level = 'debug';

let nucleotides = /^[ACTG]+$/;
let quals = /^[!"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}~]+/;

function fastqParser(){
    let cacheBuf;
    let openId = Buffer.from('{"id":"');
    let closeIDOpenSeq = Buffer.from('","seq":"');
    let closeSeqOpenComment = Buffer.from('","comment":"');
    let closeCommentOpenQual = Buffer.from('","qual":"');
    let close = Buffer.from('"}\n');
    let stream = through2(transform, flush);
    let seqlength = 0;
    return stream;

    function transform(buf, enc, next){
	if (buf[0] === 64) { // This is an id
	    if (cacheBuf) { // If a previous object in the cache, push it
		cacheBuf.append(close);
		this.push(cacheBuf.slice());
	    }
	    let id = buf.toString().slice(1).trim().replace(/"/g, '\\"');
	    //logger.debug(`New id ${id}`);
	    cacheBuf = new BufferList();
	    cacheBuf.append(openId);
	    cacheBuf.append(id);
	    cacheBuf.append(closeIDOpenSeq);
	} else if (buf.toString().match(nucleotides))  { // This line is a sequence
	    //logger.debug(`Sequence: ${buf.toString()}`);
	    seqlength = buf.toString().length;
	    cacheBuf.append(buf);
	    cacheBuf.append(closeSeqOpenComment);
	} else if (buf.toString().match(quals) && buf.length === seqlength) { // This line is a quality strig
	    //logger.debug(`Qualities: ${buf.toString()}`);
	    cacheBuf.append(buf);
	} else if (buf[0] === 43) { // This line is not a quality line AND is likely a comment line
	    let comment = buf.toString().slice(1).trim();
	    //logger.debug(`Comment: ${comment}`);
	    cacheBuf.append(comment);
	    cacheBuf.append(closeCommentOpenQual);
	} else if (!cacheBuf) {
	    this.emit('error', {msg: 'Failed fastq parsing', buf: buf});
	} else if (buf.length === 0) { 
	    // Ignore empty lines
	} else {
	    this.emit('error', {msg: 'Failed fastq parsing', buf: buf});
	}
	next();
    }
    
    function flush(){
	if (cacheBuf) {
	    cacheBuf.append(close);
	    this.push(cacheBuf.slice());
	}
	this.push(null);
    }
}


function paramsParser(arg1, arg2, arg3){
    let params = {options: {}};
    if (Type.is(arg1, Object)) params.options = arg1;
    else if (Type.is(arg1, String)) params.filename = arg1;
    if (Type.is(arg2, String)) params.filename = arg2;
    else if (Type.is(arg2, Function)) params.callback = arg2;
    if (Type.is(arg3, Function)) params.callback = arg3;
    return params;
}

function jsParse(){
    let stream = through2.obj(transform, function(){this.push(null);});
    function transform(obj, enc, next){
	if (Buffer.isBuffer(obj)) obj = obj.toString();
	//logger.debug(obj);
	JSON.parse(obj);
	this.push(JSON.parse(obj));
	next();
    }
    return stream;
}


module.exports.obj = function(arg1, arg2, arg3){
    let params = paramsParser(arg1, arg2, arg3);
    params.options.objectMode = true;
    let stream = pumpify.obj(split2(), fastqParser(), jsParse());
    if (params.callback) {
	stream.on('error', params.callback);
	stream.pipe(concat(function(data){params.callback(null, data);}));
    }
    return stream;
};

