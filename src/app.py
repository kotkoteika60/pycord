import datetime
from flask import Flask, render_template, request, redirect
from flask_login.utils import login_required
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, current_user
from data import db_session
from data.models import *
from auth import auth
from userapi import userapi
from flask_socketio import SocketIO, Namespace, emit, disconnect, join_room, rooms, leave_room, close_room

db_session.global_init("app.db")

app = Flask(__name__)
app.config["SECRET_KEY"] = "SUS_sdhfvjkdfnhidhfwuidpgvndosvmkdasj"
app.register_blueprint(auth)
app.register_blueprint(userapi)
socketio = SocketIO(app, async_mode=None)
login_manager = LoginManager()
login_manager.login_view = '/login'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

login_manager.init_app(app)

def background_thread():
	count = 0
	while True:
		socketio.sleep(10)
		count += 1
thread = None

session_data = {}

@app.route('/')
def index():
    return render_template("index.html")


@login_required
@app.route('/layout')
def layout_test():
    return render_template("layout.html")

class WebServer(Namespace):
    def on_connect(self):
        global thread
        print(f"Client {request.sid} {current_user} присоединился")
        session_data[request.sid] = {
            "user": current_user,
            "joined_channel": -1
        }
        if thread is None:
            thread = socketio.start_background_task(target=background_thread)
    def on_disconnect(self):
        del session_data[request.sid]
        print(f"Client {request.sid} {current_user} отключился")

    def on_join_channel(self, message):
        join_room(str(message['channel_id']))
        db_sess = db_session.create_session()
        ch = None
        try:
            ch = db_sess.query(Channel).filter(Channel.id == int(message['channel_id'])).first()
        except Exception as e:
            print(e)
        if not ch:
            return emit("forbidden", {"channel_id": message['channel_id']})
        if current_user.in_guild(ch.guild.id):
            session_data[request.sid]["joined_channel"] = str(message['channel_id'])
            emit("channel_history", {
                "channel_id": message['channel_id'],
                "history": ch.history()
            })
        else:
            emit("forbidden", {"channel_id": message['channel_id']})

    def on_message(self, message):
        print(f"Client {request.sid}: message:", message)
        db_sess = db_session.create_session()
        msg = {
            "user_id": current_user.id,
            "channel_id": session_data[request.sid]["joined_channel"],
            "username": current_user.username,
            "avatar": current_user.avatar,
            "content": message["content"],
            "timestamp": datetime.datetime.now().strftime("сегодня, %H:%M"),
            "timestamp_raw": "",
            "id": len(db_sess.query(Message).all()) + 13,
        }
        
        ch = db_sess.query(Channel).filter(Channel.id == int(session_data[request.sid]["joined_channel"])).first()
        new_message = Message(channel_id=ch.id, channel=ch, user_id=current_user.id, content=message["content"])
        db_sess.add(new_message)
        db_sess.commit()
        emit("new_message", msg, room=session_data[request.sid]["joined_channel"])

    def on_ping(self):
       emit('pong')


socketio.on_namespace(WebServer('/channels'))

if __name__ == "__main__":
    socketio.run(app, debug=True, port=5000)