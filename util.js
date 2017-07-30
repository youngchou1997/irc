const fs = require('fs')

// 格式化时间的函数
const formattedTime = () => {
	const d = new Date()
	// 这里需要注意, js 中 month 是从 0 开始计算的, 所以要加 1
	const month = d.getMonth() + 1
	const date = d.getDate()
	const hours = d.getHours()
	const minutes = d.getMinutes()
	const seconds = d.getSeconds()

	const t = `${hours}:${minutes}:${seconds}`
	return t
}

var ensure = function(condition, message) {
	if(!condition) {
	}
}


var ascii = function(char) {
	return char.charCodeAt(0)
}

var charFromAscii = function(code) {
	return String.fromCharCode(code)
}


var binary = function(n) {
	var s = ''
	while(n != 0) {
		//  二进制等于不断对 2 取余
		var digit = n % 2
		// 新取的在最高位
		s = String(digit) + s
		// 除 2 取整
		n = Math.floor(n / 2)
	}
	var b = rjust(s, 8, fillchar='0')
	return b
}

var rjust = function(s, width, fillchar=' ') {
	var nChar = function(char, n) {
		var s = ''
		for (var i = 0; i < n; i++) {
			s += char
		}
		return s
	}

	var len = width - s.length
	return nChar(fillchar, len) + s
}

var int = function(bin) {
	var n = 0
	for (var i = 0; i < bin.length; i++) {
		// 得到这个位上面的数字
		var digit = Number(bin[i])
		var m = bin.length - i - 1
		n += (digit * Math.pow(2, m))
	}
	return n
}
var binaryStream = function(s) {
	var str = ''
	for(var i = 0; i < s.length; i ++) {
		var c = s[i]
		var code = ascii(c)
		var bin = binary(code)
		str += bin
	}
	return str
}

var stringFromBinary = function(bins) {
	var s = ''
	for(var i = 0; i < bins.length; i += 8) {
		var bin = bins.slice(i, i+8)
		var n = int(bin)
		var c = charFromAscii(n)
		s += c
	}
	return s
}
var base64Encode = function(s) {
	var dict = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
	// 字符串转为二进制字符串
	var str = binaryStream(s)
	var codes = []
	var base64 = []
	var value = ''
	if(s.length % 3 == 1) {
		str = str + '0000000000000000'
	} else if(s.length % 3 ==2) {
		str = str + '00000000'
	}
	for(var i = 0; i < str.length; i += 6) {
		var code = str.slice(i, i+6)
		codes.push(code)
	}
	for(var i = 0; i < codes.length; i++) {
		var b = int(codes[i])
		base64.push(b)
	}
	for(var i = 0; i < base64.length; i++) {
		var v = base64[i]
		value += dict[v]
	}
	return value
}

var base64Decode = function(s) {
	var list = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
	var array = []
	var base64 = []
	var str = ''
	var codes = ''
	var base = []
	for(var i = 0; i < s.length; i++) {
		for(var j = 0; j < list.length; j++) {
			if(s[i] == list[j]) {
				array.push(j)
				// base64.push(binary(array[i]))
				var bin = binary(array[i])
				base64.push(bin)
				break
			}
		}
	}

	for(i = 0; i < base64.length; i++) {
		str += base64[i]
	}
	for(i = 0; i < str.length; i += 8) {
		var code = str.slice(i, i+8)
		code = delFront0(code, 2)
		codes += code
	}
	for(i = 0; i < codes.length; i += 8) {
		array[i/8] = codes.slice(i, i + 8)
		base.push(int(array[i/8]))
	}
	str = ''
	for(i = 0; i < base.length; i++) {
		str += charFromAscii(base[i])
	}
	remove(str, " ")
	return str
}

var delFront0 = function(s, num) {
	var str = ''
	var m = 0
	for(var i = 0; i < num; i++) {
		if(s[i] == '0') {
			m++
		}
		else {
			break;
		}
	}
	str = s.slice(m, s.length)
	return str
}


// 用 log 函数把所有输出写入到文件中, 这样就能方便地掌控全局了
// 即便你关掉程序, 也能再次打开来看看, 这就是个时光机
const log = (...args) => {
	const t = formattedTime()
	const arg = [t].concat(args)
	// 打印出来的结果带上时间
	console.log.apply(console, arg)
	// log 出来的结果写入到文件中
	const content = t + ' ' + args + '\n'
	fs.writeFileSync('log.txt', content, {
		flag: 'a',
	})
}

module.exports = {
	log: log,
	bs64En: base64Encode
}