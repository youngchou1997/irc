// 引入包
const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const session = require('cookie-session')

const { log, bs64En } = require('./util')
const { secretKey } = require('./config')

const app = express()
// 引入中间件

// 设置 bodyParser 解析 json 格式的数据 application/json
app.use(bodyParser.json())
// 设置 bodyParser application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}));
// 设置 session, 这里的 secretKey 是从 config.js 文件中拿到的
app.use(session({
	secret: secretKey,
}))

// 配置静态资源文件，比如 js css img
app.use(express.static(path.join(__dirname, 'static')))

const irc = require('./routes/irc')

app.use('/', irc)

var server = app.listen(80, function() {
    var host = server.address().address
    var port = server.address().port
    log("聊天室访问地址为 http://%s:%s", host, port)
})

var rightName = function(str) {
	var str = str || '' 
	var len = str.length
	return (len > 0 && len < 16)
}
// 用户列表
var userList = []
var exited = function (name) {
	for( i in userList) {
		if(name === userList[i]) {
			return true
		}
	}
	return false
}
io = require('socket.io').listen(server)

io.on('connection', function(socket) {
    console.log('new client connected')
    socket.emit('whoAreYou')
    socket.on('name', function(data) {
		var userName = data || ''
		if(rightName(userName)) {
			if(! exited(userName)) {
				socket.name = userName
				userList.push(userName)
	            socket.emit('loginSuccess')
	            io.sockets.emit('system', userName, userList, 'login');
	            log('在线用户: '+userList)
			} else {
				socket.emit('warnning', 'exited')
				socket.disconnect()
			}} else {
				socket.emit('warnning', 'illegal')
				socket.disconnect()
		}
    });
    socket.on('message', function(msg) {
        if (msg !== '') {
            var user = socket.name
            var time = new Date().toTimeString().slice(0, 8).toLocaleString()
            var len = msg.length
            msg = msg.replace(/</g, '&lt;')
            msg = msg.replace(/>/g, '&gt;')
            log(time, user, msg)
            socket.emit('recieved', msg)
            io.sockets.emit('message', time, user, msg)
        } else {
            var warnning = '输入为空'
            socket.emit('warnning', warnning)
        }
    })
   socket.on('logOut', function(name) {
		var name = name || ''
	   log(name, '登出')
       socket.disconnect()
   })
    socket.on('disconnect', () => {
        if (socket.name) {
            log(socket.name, 'disconnect登出')
            userList.splice(userList.indexOf(socket.name), 1)
            log('在线用户: '+userList)
            io.sockets.emit('system', socket.name, userList, 'logout');
        } else {
			log( '用户名非法')
        }
        socket.disconnect()
    })
})
