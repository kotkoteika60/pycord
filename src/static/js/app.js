var base_url = location.protocol + '//' + document.domain + ':' + location.port;
templates = {}
hljs.configure({ ignoreUnescapedHTML: true })
templates.message = (msgid, avatar, username, content, timestamp) => `
<li class="message" id="M_${msgid}">
    <button class="reply-btn btn-small" onclick="reply_to(${msgid}, '${username}')">ответить</button>
    <span style="height: auto">
        <img src="${avatar}" class="avatar">
    </span>
    <span class="username_block">
        <span style="font-weight: bold;">${username}</span>
        <span style="margin-left: 3px; color: #dddddd;">${timestamp}</span>
    </span>
    <div class="umessage_content" style="">${content.replace("\n", "<br/>")}</div>
</li>
`
templates.guild_icon = (id, name, img) => `
<div class="listItem" title="${name}" style="cursor: pointer;" id="G_${id}" onclick="setGuild('${id}')">
    <img class="listImg" src="${img}"/>
</div>
`
templates.channel_btn = (ch_id, ch_name) => `<button id="CH_${ch_id}" data-id="${ch_id}" data-name="${ch_name}" class="channel_btn" onclick="join_channel('${ch_id}')">${ch_name}<span class="ch-btn" style="float: right;" onclick="editChannel(${ch_id})">@</button>`
templates.channel_btn_disabled = (name) => `<button class="channel_btn off" style="border: 1px solid white" disabled>${name}</button>`
templates.fwnd = (title, cnt) => `
<div style="background: #1d1d1d; height: 20px;"><span>${title}</span><button class="btn-small close-btn" onclick="fwnd.hide()">x</button></div>
${cnt}
`
templates.fwnd_new_guild = () => `
<input type="text" class="dark" id="fwnd_name" placeholder="Название"><br>
<input type="text" class="dark" id="fwnd_avatar" placeholder="ссылка на аватар"><br>
<input type="text" class="dark" id="fwnd_i_code" placeholder="код для приглашения"><br>
<button class="dark" onclick="create_guild_btn()">создать</button>
<div style="font-size: 16px; margin: 10px;">или</div>
<input type="text" class="dark" id="fwnd_invite" placeholder="приглашение"><br>
<button class="dark" onclick="join_guild_btn()">присоединиться</button>
`
templates.fwnd_new_channel = () => `
<input type="text" class="dark" id="fwnd_name" placeholder="Название"><br>
<button class="dark" onclick="create_channel_btn()">создать</button>
`
templates.fwnd_settings = () => `
<span style="font-size: 16px; margin: 10px;">Пользователь</span><span style="color: red; font-size: 10px; cursor: pointer;" onclick="logout()">выйти</span><br>
<span style="font-size: 10px; white-space: pre-wrap;">имя     </span><input type="text" class="dark" style="width: 200px;" id="fwnd_username" placeholder="имя" value="${username}"><br>
<span style="font-size: 10px;">аватар</span><input type="text" class="dark" style="width: 200px;" id="fwnd_avatar" placeholder="ссылка на аватар" value=${avatar}><br>
<span style="font-size: 10px;">отправка сообщений</span>
<select id="fwnd_send_type">
  <option value="enter">enter</option>
  <option value="shiftenter">shift+enter</option>
</select>
<button class="dark" onclick="set_user_settings()">Применить</button>
`
templates.member = (id, name, avatar) => `
<div class="message disabled" id="M_${id}">
    <img src="${avatar}" class="avatar" style="zoom: 80%;">
    <span class="sb-username" style="">${name}</span>
</div>
`
templates.fwnd_smiles = function () {
    let smiles = ["kek", "bad", "ban", "yo", "hohol", "read", "eblan", "yes", "idk", "smile", "blaaaa", "secret", "porridge", "de_bil", "puk", "superstition", "facepalm", "confused", "cool", "sarcasm", "help", "bravo", "kuku", "bonk", "test", "elita", "sun"]
    let bbcodes = ["[b]жирно[/b]", "[s]спойлер[/s]", "[u]подчёркнуто[/u]", "[i]курсив[/i]", "x[sup]2[/sup]", "x[sub]2[/sub]", "[c=#ff0000]цветасто[/c]", "[code=c]int x = 1;[/code]", "[img]/static/yes3.gif[/img]", "[url=/static/yes3.gif]ссылка[/url]"]
    let g = $("<div/>")
    let c = $("<div/>").appendTo(g)
    let b = $("<table style='background: #111; width: 240px;'/>").appendTo(g)
    let smtmpl = (n) => `<span style="cursor: pointer"><img src="static/img/smiles/${n}.gif" title=":${n}:" onclick="$('#message_content').append(':${n}:')"/></span>`
    let bbctmpl = (n) => `<tr class="selectable" onclick="$('#message_content').append('${n}')"><td><span style="font-size: 10px;">${n}</span></td><td>${bbcode.parse(n)}</td></tr>`
    for (let e of smiles) { $(smtmpl(e)).appendTo(c) }
    for (let e of bbcodes) {
        $(bbctmpl(e)).appendTo(b)
    }

    return g.toString()
}
templates.fwnd_edit_channel = (ch_id) => `
<span style="font-size: 10px; white-space: pre-wrap;">id      </span><input type="text" class="dark" style="width: 200px;" id="fwnd_ch_id" disabled value="${ch_id}"><br>
<span style="font-size: 10px;">name</span><input type="text" class="dark" style="width: 200px;" id="fwnd_ch_name" placeholder="название канала" value="${$("#CH_" + ch_id).attr("data-name")}"><br>
<button class="dark" onclick="set_channel_settings()">Применить</button>
`
templates.fwnd_attachments = () => `
<input type="file" id="fwnd_loc_file"/><br/>
<button onclick="uploadAttachments()">загрузить</buttton>
`

function getCaret(el) {
    if (el.selectionStart) {
        return el.selectionStart;
    } else if (document.selection) {
        el.focus();
        var r = document.selection.createRange();
        if (r == null) {
            return 0;
        }
        var re = el.createTextRange(), rc = re.duplicate();
        re.moveToBookmark(r.getBookmark());
        rc.setEndPoint('EndToStart', re);
        return rc.text.length;
    }
    return 0;
}


function smilesParse(text) {
    let regex = /:([a-z0-9_]+?):/igms, replacement = '<img src="/static/img/smiles/$1.gif">'
    return text.replace(regex, replacement)
}

function highlightAll() {
    $('code').each(function (i, el) {
        hljs.highlightElement(el);
    })
}

var socket = io()
var guilds = {}
var current_guild

Number.prototype.zeroPad = Number.prototype.zeroPad ||
    function (base) {
        var nr = this, len = (String(base).length - String(nr).length) + 1;
        return len > 0 ? new Array(len).join('0') + nr : nr;
    }

$.fn.toString = function () {
    return $(this).prop('outerHTML');
}

function clearChannelHistory() {
    $("#messagesContainer").html("")
}

var username = ""
var avatar = ""
var user_tag = "#0000"

function setAvatar(t) {
    avatar = t
    $("#avatar").attr("src", t)
}

function setUsername(t) {
    username = t
    $("#username").html(t)
}

function setTag(t) {
    user_tag = "#" + t.zeroPad(1000)
    $("#user_tag").html(user_tag)
}

function reply_to(msgid, username) {
    $('#message_content').append(`[reply=${msgid}]&gt;&gt;${msgid}@${username}[/reply]`)
}

function msgFocus(msgid) {
    $('#M_' + msgid).animate({ backgroundColor: "#444" }, 500).delay(500).animate({backgroundColor: "transparent"}, 500)
}

function setCurrentUser(req_data) {
    console.log(req_data)
    if (req_data.anon) return;
    setAvatar(req_data.avatar)
    setUsername(req_data.username)
    setTag(req_data.id)
}

function clearMessage() {
    $("#message_content").html("")
}

function join_channel(ch_id) {
    socket.emit("join_channel", {
        channel_id: ch_id
    })
    clearChannelHistory()
    $("#channel_name").html(ch_id)
    $(".channel_btn").removeClass("active")
    if ($("#CH_" + ch_id)) $("#CH_" + ch_id).addClass("active")
}

function sendMessage() {
    let msgContent = $.trim($("#message_content").html()) //smilesParse(bbcode.parse($("#message_content").html()))
    //let msgHTML = $(templates.message(Date.now(), avatar, username, msgContent, "сёдня"))
    //msgHTML.appendTo("#messagesContainer")
    socket.emit("message", {"content": msgContent,})
    clearMessage()
}

function addMessage(message) {
    console.log(message)
    let msgHTML = $(templates.message(message.id, message.avatar, message.username, smilesParse(bbcode.parse(message.content)), message.timestamp))
    msgHTML.appendTo("#messagesContainer")
    highlightAll()
}

function setChannelHistory(message) {
    let _addmsg = cnt => $(templates.message(cnt.id, cnt.user.avatar, cnt.user.username, smilesParse(bbcode.parse(cnt.content)), cnt.date)).appendTo("#messagesContainer")
    for (e of message.history) {
        _addmsg(e)
    }
    console.log(message)
    highlightAll()
    setTimeout(() => $("#messagesWrapper").scrollTop(69420 * 9000), 50)  // костыльЛенд
}

function addGuilds(lst) {
    $("#guild_list").html("")
    for (let e of lst.guilds) {
        guilds[e.id] = e
        gtempl = $(templates.guild_icon(e.id, e.name, e.img))
        gtempl.appendTo("#guild_list")
    }
}

function setGuild(g_id) {
    current_guild = guilds[g_id]
    $("#channel_list").html("")
    $(templates.channel_btn_disabled(current_guild.name)).appendTo("#channel_list")
    for (let e of current_guild.channels) {
        ch_btn = $(templates.channel_btn(e.id, e.name))
        ch_btn.appendTo("#channel_list")
    }
    $.getJSON("/api/members_list/" + current_guild.id, (data) => {
        $("#sidebar_members").html("")
        for (let e of data.members) {
            $(templates.member(e.id, e.username, e.avatar)).appendTo("#sidebar_members")
        }
    })
    join_channel(guilds[g_id].channels[0].id)
}

function showNotification(message) {
    SnackBar({
        message: "тестовый сервер #канал: новое сообщение",
        status: "warning"
    })
}

//-------------------------------------
fwnd = {}
fwnd.content = (cnt) => $("#draggable").html(cnt)
fwnd.show = () => $("#draggable").show()
fwnd.hide = () => $("#draggable").hide()
fwnd.pos = (x, y) => $("#draggable").css({ left: x + "px", top: y + "px" })
fwnd.size = (x, y) => $("#draggable").width(x).height(y)
//-------------------------------------


function newGuildBtnDown(event) {
    let pos = $("#new_guild_btn").position()
    fwnd.size(250, 200)
    fwnd.pos(pos.left + 60, pos.top + $("#draggable").height() / 2 - 30)
    fwnd.content(templates.fwnd("Создание сервера", templates.fwnd_new_guild()))
    fwnd.show()
}

function openAttachmentsMenu() {
    let pos = $("#sidebar_members").position()
    let pos2 = $("#user_block").position()
    fwnd.size(250, 350)
    fwnd.pos(pos.left - 300, pos2.top - 350)
    fwnd.content(templates.fwnd("Вложения", templates.fwnd_attachments()))
    $("#fwnd_loc_file").change(function () {
        console.log(this.files[0].name, this.files[0].size / 1024)
    })
    fwnd.show()
}

function newChannelBtnDown() {
    let pos = $("#new_channel_btn").position()
    fwnd.size(250, 100)
    fwnd.pos(pos.left, pos.top)
    fwnd.content(templates.fwnd("Создание канала", templates.fwnd_new_channel()))
    fwnd.show()
}

function editChannel(ch_id) {
    let pos = $("#new_channel_btn").position()
    fwnd.size(250, 200)
    fwnd.pos(pos.left, pos.top)
    fwnd.content(templates.fwnd("Редактировать канал", templates.fwnd_edit_channel(ch_id)))
    fwnd.show()
}

function create_guild_btn() {
    let name = $("#fwnd_name").val()
    let img = $("#fwnd_avatar").val()
    let invite_code = $("#fwnd_avatar").val()
    if (name && img && invite_code) create_guild(name, invite_code, img)
    else console.warn("не получилось создать сервер")
    fwnd.hide()
}
function create_channel_btn() {
    let name = $("#fwnd_name").val()
    if (name) create_channel(current_guild.id, name)
    else console.warn("не получилось создать канал")
    fwnd.hide()
}
function join_guild_btn() {
    let invite_code = $("#fwnd_invite").val()
    if(invite_code) join_guild(invite_code)
}

function userSettingsDialog() {
    let pos = $("#user_block").position()
    fwnd.size(250, 150)
    fwnd.pos(pos.left, pos.top - 300)
    fwnd.content(templates.fwnd("Настройки", templates.fwnd_settings()))
    fwnd.show()
}

function openSmilesMenu() {
    let pos = $("#sidebar_members").position()
    let pos2 = $("#user_block").position()
    fwnd.size(250, 420)
    fwnd.pos(pos.left - 300, pos2.top - 420)
    fwnd.content(templates.fwnd("Смайлы", templates.fwnd_smiles()))
    fwnd.show()
}

//---------------------------------------

function create_guild(name, invite_code, img) {
    $.ajax("/api/create_guild", {
        data: JSON.stringify({ name: name, invite_code: invite_code, img: img }),
        contentType: 'application/json',
        type: 'POST',
    }).done(() => $.getJSON("/api/guilds", addGuilds))
}
function join_guild(invite_code) {
    $.ajax("/api/join_guild", {
        data: JSON.stringify({invite_code: invite_code}),
        contentType: 'application/json',
        type: 'POST',
    }).done(() => $.getJSON("/api/guilds", addGuilds))
}
function create_channel(g_id, name) {
    $.ajax("/api/create_channel", {
        data: JSON.stringify({ g_id: g_id, name: name}),
        contentType: 'application/json',
        type: 'POST',
    }).done(() => { $.getJSON("/api/guilds", addGuilds).done(() => setGuild(current_guild.id));})
}

function set_channel_settings() {
    $.ajax("/api/edit_channel", {
        data: JSON.stringify({ ch_id: $("#fwnd_ch_id").val(), name: $("#fwnd_ch_name").val() }),
        contentType: 'application/json',
        type: 'POST',
    }).done(() => { $.getJSON("/api/guilds", addGuilds).done(() => setGuild(current_guild.id)); })
}

function set_user_settings() {
    let uname = $("#fwnd_username").val()
    let av = $("#fwnd_avatar").val()
    if (!(uname && av)) return console.log("не получилось применить настройки");
    $.ajax("/api/current_user", {
        data: JSON.stringify({ username: uname, avatar: av }),
        contentType: 'application/json',
        type: 'POST',
    }).done(() => $.getJSON("/api/current_user", setCurrentUser))
}

function uploadAttachments() {
    let formData = new FormData();
    formData.append('file', $("#fwnd_loc_file")[0].files[0]);
    $.ajax({
        type: "POST",
        url: '/upload_file',
        cache: false,
        contentType: false,
        processData: false,
        data: formData,
        dataType: 'json',
        success: function (data) {
            if (data.err == "err") return
            $('#message_content').append(`[attachment=${data.path}]${data.filename}[/attachment]`)
        }
    });
}

function logout() {
    location.href = "/logout"
}

//----------------------------------------
function onDocumentReady() {
    if (window.location.pathname != '/layout') return
    socket = io.connect(base_url + "/channels");
    socket.on("pong", function () { console.log("pong") })
    socket.on("forbidden", function (m) { console.error(`доступ к каналу ${m.channel_id} запрещён (или не существует)`); $("#channel_name").html("") })
    socket.on("new_message", addMessage)
    socket.on("channel_history", setChannelHistory)
    $("#message_content").on('DOMSubtreeModified', function (event) {
        $("#post_form").attr("style", `bottom: ${$("#message_content").height() - $("#post_form").attr("data-min_height")}px`)
    }).keypress(function (event) {
        if (event.keyCode == 13) {
            var content = $(this).html();
            var caret = getCaret(this);
            if (event.shiftKey) {
                this.value = content.substring(0, caret - 1) + "\n" + content.substring(caret, content.length);
                event.stopPropagation();
            } else {
                this.value = content.substring(0, caret - 1) + content.substring(caret, content.length);
                sendMessage()
                setTimeout(clearMessage, 5)
            }
        }
    });
    $("#draggable").draggable()
    $("#draggable-paint").draggable({
        cancel: 'canvas',
        handle: '.titlebar'
    })
    $.getJSON("/api/current_user", setCurrentUser)
    $.getJSON("/api/guilds", addGuilds)
}

$(document).ready(onDocumentReady)