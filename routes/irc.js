const express = require('express');
const irc = express.Router();
const { log } = require('../util')

var sendHtml = function(path, response) {
    var fs = require('fs')
    var options = {
        encoding: 'utf-8'
    }
    path = 'views/' + path
    fs.readFile(path, options, function(err, data) {
        // console.log(`读取的html文件 ${path} 内容是`, typeof(data))
        response.send(data)
    })
}

var sendData = function(path, response, script) {
	var fs = require('fs')
	var options = {
		encoding: 'utf-8'
	}
	path = 'views/' + path
	fs.readFile(path, options, function(err, data) {
		// console.log(`读取的html文件 ${path} 内容是`, typeof(data))
		response.send(data + script)
	})
}

var http = require('http');
var url  = require('url');
var parsequery = require('querystring').parse;
var OAuth2 = require('oauth').OAuth2;
// var exec = require('child_process').exec;
// exec("ipset flush ZYPC");
var oauth = new OAuth2(
	clientId,
	secret,
	'https://zypc.xupt.edu.cn/',
	null, 'oauth/token', null);
irc.get('/', function(request, resp) {
		var req = url.parse(request.url);
		var query = parsequery(req.query);
		if(query.code) {
			oauth.getOAuthAccessToken(query.code, {'grant_type':'authorization_code','redirect_uri':'http://irc.xupt.org/'}, function(e, access_token) {
				// log("Permitting access from " + request.connection.remoteAddress);
				// exec("ipset add ZYPC " + request.connection.remoteAddress);
				if(e != null|| access_token == undefined) {
					var path = '404.html'
					sendHtml(path, resp)
				} else {
					oauth.get('https://zypc.xupt.edu.cn/oauth/userinfo', access_token, function(e, data) {
						var path = 'index.html'
						data = JSON.parse(data)
						var script = `<script> var setCookie = function (name, value) {
												var Days = 14;
												var exp = new Date();
												exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
												document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
											}
											setCookie('username', '${data.username}')
											var state = { 'page_id': 1, 'user_id': 5 }
											history.pushState(state, '', '/')
										</script></body>
</html>`
						// log(data);
						sendData(path, resp, script)
					});
				}
			});
		} else {
			var uri = oauth.getAuthorizeUrl({'redirect_uri':'http://127.0.0.1/','response_type':'code'});
			var data = `<script>window.location.href = "${uri}";</script>`
			resp.send(data)
		}
})

irc.post('/img', function(req, res) {
	var path = '404.html'
	sendHtml(path, res)
});
irc.get('/oauth', function(req, res) {
	var path = '404.html'
	sendHtml(path, res)
})
irc.get('/login', function(req, res) {
	var path = '404.html'
	sendHtml(path, res)
})
module.exports = irc