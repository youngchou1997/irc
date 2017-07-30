var log = function () {
    console.log.apply(console, arguments)
}
var rightName = function (str) {
	var str = str || ''
	var len = str.length
	if (len > 0 && len < 16) {
		return true
	} else {
		return false
}
}
var checkMessage = function (s) {
	if (s != undefined) {
		var len = s.length
	} else {
		var len = 0
	}
	return (len > 0 && len < 400)
}
var setCookie = function (name, value) {
	var Days = 14;
	var exp = new Date();
	exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
	document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
}
var getCookie = function (name) {
	var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
	if (arr = document.cookie.match(reg)) {
		return unescape(arr[2]);
	} else {
		return null;
	}
}
var delCookie = function (name) {
	var exp = new Date();
	exp.setTime(exp.getTime() - 1);
	var cval = getCookie(name);
	if (cval != null)
		document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
}

var rename = function() {
	$('#my-prompt').modal({
		relatedTarget: this,
		onConfirm: function (e) {
			delCookie('username')
			$(".am-list").empty()
			$('#id-profile').html('离线')
			var inputName = e.data || ''
			setCookie('username', inputName)
			logIn()
		},
		onCancel: function (e) {
		}
	})
}

var logIn = function () {
    var socket = io.connect()
    socket.on('connect', function () {
        $('#id-message').prepend(`<div class="am-alert alert-blue" data-am-alert><button type="button" class="am-close">&times;</button>
  已连接上服务器，正在进入
</div>`);
        $(".alert-blue").fadeOut(2000);
    })
    socket.on('whoAreYou', function () {
	    var name = getCookie('username')

	    if(rightName(name)) {
		    socket.emit('name', name)
	    } else {
		    $('#id-message').prepend(`<div class="am-alert am-alert-warning" data-am-alert><button type="button" class="am-close">&times;</button>
用户名长度在0 到 16 之间,请在右下角更换用户名
</div>`);
		    $(".am-alert-warning").fadeOut(4000);
	    }
    })
    socket.on('message', function (time, user, msg) {
        if (user != getCookie('username')) {
            var templete = `
                <div class="template">
                    <div class="am-panel-hd am-cf">
                        <span class="message-time am-center">${time}</span>
                    </div>
                    <div class="am-panel-bd am-panel-default am-cf">

                        <span class="messege-name am-fl  am-monospace text-overflow">${user}</span>
                        <span class="message-data1">${msg}</span>

                </div>`
        } else {
            var templete = `
                <div class="template">
                    <div class="am-panel-hd am-cf">
                        <span class="message-time am-center">${time}</span>
                    </div>
                    <div class="am-panel-bd  am-panel-default am-cf">
                        <span class="messege-name am-fr  am-monospace">我</span>
                        <span class="message-data2">${msg}</span>

                </div>`
        }
        $('#id-message').append(templete)
        var h = $('#id-message').height()
        $('#id-message').scrollTop(h)
    })
    socket.on('system', function (userName, userList, type) {
        if (type === 'login') {
            $('#id-message').prepend(`<div class="am-alert am-alert-success" data-am-alert><button type="button" class="am-close">&times;</button>
  ${userName}进入聊天室
</div>`);
            $(".am-alert-success").fadeOut(2000);
            var templete = ''
            for (i in userList) {
                var userName = userList[i]
                var css = 'name-' + `${userName}`
                if (document.querySelector('.' + css) === null) {
                    templete += `<li class="${css}"><a class="am-text-truncate" href="#">${userName}</a></li>`
                }
            }
            $('.am-list').append(templete)
        } else if (type === 'logout') {
            $('#id-message').prepend(`<div class="am-alert am-alert-secondary" data-am-alert><button type="button" class="am-close">&times;</button>
  ${userName}离开聊天室
</div>`);
            $(".am-alert-secondary").fadeOut(2000);
            $('li').remove(`.name-${userName}`)
	        $('#id-profile').html('离线')
        }
    })
    socket.on('loginSuccess', function () {
        $('#id-message').prepend(`<div class="am-alert" data-am-alert><button type="button" class="am-close">&times;</button>
  您已成功进入聊天室
</div>`);
        $(".am-alert").fadeOut(2000)
	    $('#id-profile').html('在线')
    })
    socket.on('warnning', function (flag) {
        if (flag == 'exited') {
			socket.emit('logOut', this.name)
            $('#id-message').prepend(`<div class="am-alert am-alert-danger" data-am-alert><button type="button" class="am-close">&times;</button>
 已在其他地方登录，请勿重复登录
</div>`);
            $(".am-alert-danger").fadeOut(4000)
	        $('#id-profile').html('强制离线')
	        $('#id-switch').attr('disabled', 'disabled')
	        delCookie('username')
        } else if (flag = "illegal") {
	    socket.emit('logOut', socket.name)
            $('#id-message').prepend(`<div class="am-alert am-alert-danger" data-am-alert><button type="button" class="am-close">&times;</button>
illegal
</div>`);
            $(".am-alert-danger").fadeOut(2000);
        } else {
            $('#id-message').prepend(`<div class="am-alert am-alert-danger" data-am-alert><button type="button" class="am-close">&times;</button>
 ${flag}
</div>`);
            $(".am-alert-danger").fadeOut(2000);
        }
    })
    socket.on('recieved', function (msg) {
        $('#id-input').val('')
    })

    $('#id-send-message').click(function () {
        var inputValue = $('#id-input').val()
		if (checkMessage(inputValue)) {
	            socket.emit('message', inputValue)
	        } else {
	            $('#id-message').prepend(`<div class="am-alert am-alert-danger" data-am-alert><button type="button" class="am-close">&times;</button>
	消息长度应该在0到400之间
	</div>`);
            $(".am-alert-danger").fadeOut(2000);
        }
    })
	$('#id-switch').click(function () {
		socket.emit('logOut', socket.name)
		socket.disconnect()
	})
}
$('#id-clear').click(function () {
	$('#id-message').empty()
})
$('#id-switch').click(function () {
	rename()
})
$('#id-input').keypress(function (e) {
	var keyCode = e.keyCode ? e.keyCode : e.which ? e.which : e.charCode;
	if (keyCode == 13) {
		$("#id-send-message").click();
	}
});
$(function () {
	var progress = $.AMUI.progress;
	$('#id-clear').on('click', function () {
		progress.set(3);
	})
	$('#id-switch').on('click', function () {
		progress.set(2);
	})
})
logIn()