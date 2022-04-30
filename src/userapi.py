from flask import Blueprint, render_template, redirect, url_for, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from data import db_session
import uuid
from base64 import b64decode
import os
from werkzeug.utils import secure_filename
from data.models import *

userapi = Blueprint('userapi', __name__)

@login_required
@userapi.route("/api/current_user", methods=["GET"])
def _current_user():
    try:
        return jsonify({
                "username": current_user.username,
                "id": current_user.id,
                "avatar": current_user.avatar,
                "joined_guilds": current_user.get_joined_guilds(),
            }
        )
    except Exception as e:
    	print(e)
    	return jsonify({"anon": True})


@login_required
@userapi.route("/api/current_user", methods=["POST"])
def set_current_user():
    args = request.json
    db_sess = db_session.create_session()
    current_user.username = args["username"]
    current_user.avatar = args["avatar"]
    db_sess.commit()
    return "ok"


@login_required
@userapi.route("/api/create_guild", methods=["POST"])
def create_guild():
    args = request.json
    new_guild = Guild(name=args["name"], invite_code=args["invite_code"], img=args["img"])
    db_sess = db_session.create_session()
    db_sess.add(new_guild)
    obj = db_sess.query(Guild).order_by(Guild.id.desc()).first()
    current_user.join_guild(obj.id)
    db_sess.commit()
    return "ok"


@login_required
@userapi.route("/api/join_guild", methods=["POST"])
def join_guild():
    args = request.json
    db_sess = db_session.create_session()
    g = db_sess.query(Guild).filter(Guild.invite_code == args["invite_code"]).first()
    if not g:
        return "oh no"
    curr_user = db_sess.query(User).filter(User.id == current_user.id).first() # костыльЛенд
    if not current_user.in_guild(g.id):
        current_user.join_guild(g.id)
        curr_user.join_guild(g.id)
    db_sess.commit()
    return "ok"


@login_required
@userapi.route("/invite/<icode>", methods=["GET"])
def join_guild_b(icode):
    db_sess = db_session.create_session()
    g = db_sess.query(Guild).filter(Guild.invite_code == icode).first()
    if not g:
        return redirect("/layout")
    curr_user = db_sess.query(User).filter(User.id == current_user.id)
    if not current_user.in_guild(g.id):
        current_user.join_guild(g.id)
        curr_user.join_guild(g.id)
    db_sess.commit()
    return redirect("/layout")



@login_required
@userapi.route("/api/create_channel", methods=["POST"])
def create_channel():
    args = request.json
    db_sess = db_session.create_session()

    g = db_sess.query(Guild).filter(Guild.id == args["g_id"]).first()
    if not g or not current_user.in_guild(g.id):
        print("oh no", args)
        return "oh no"

    new_channel = Channel(name=args["name"], guild_id=g.id, guild=g)
    db_sess.add(new_channel)
    db_sess.commit()
    return "ok"


@login_required
@userapi.route("/api/edit_channel", methods=["POST"])
def edit_channel():
    args = request.json
    db_sess = db_session.create_session()

    ch = db_sess.query(Channel).filter(Channel.id == args["ch_id"]).first()
    if not ch:
        return "oh no"
    ch.name = args["name"]
    db_sess.commit()
    return "ok"


@login_required
@userapi.route("/api/guilds")
def guild_list():
	db_sess = db_session.create_session()
	guilds = db_sess.query(Guild).filter(Guild.id.in_(tuple(current_user.get_joined_guilds()))).all()
	return jsonify({"guilds": [g.to_dict() for g in guilds]})


@userapi.route("/api/members_list/<int:g_id>")
def members_list(g_id):
    db_sess = db_session.create_session()
    members = db_sess.query(User).all()
    for idx, m in enumerate(members): # костыльЛенд №2
        if not m.in_guild(g_id):
            del members[idx]
    return jsonify({"members": [m.to_mdict() for m in members]})


@userapi.route('/upload_file', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"err": "err"})
    file = request.files['file']
    if file.filename == '':
        return jsonify({"err": "err"})

    filename = secure_filename(file.filename)
    uid = uuid.uuid4().hex[:4]
    dn = os.path.dirname(os.path.abspath(__file__))
    path = f"static/attachments/{uid}"
    os.mkdir(os.path.join(dn, path))
    file.save(os.path.join(dn, os.path.join(path, filename)))
    return jsonify({"err": "ok", "filename": filename, "path": f"{uid}/{filename}"})