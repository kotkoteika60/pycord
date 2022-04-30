from flask_login import UserMixin
import datetime
import sqlalchemy as sa
from sqlalchemy.ext.hybrid import hybrid_method, hybrid_property
from sqlalchemy import orm
from .utils import message_timestamp
from .db_session import SqlAlchemyBase


class User(UserMixin, SqlAlchemyBase):
    __tablename__ = "users"
    id = sa.Column(sa.Integer, primary_key=True)
    username = sa.Column(sa.String, unique=True)
    avatar = sa.Column(sa.String)
    password = sa.Column(sa.String)
    roles = sa.Column(sa.Text, default="[]")
    created_date = sa.Column(sa.DateTime, default=datetime.datetime.now)
    messages = orm.relation("Message", back_populates='user')
    joined_guilds = sa.Column(sa.Text, default="[]")

    @hybrid_method
    def in_guild(self, guild_id):
        return guild_id in self.guilds

    @hybrid_property
    def guilds(self):
        return eval(str(self.joined_guilds))

    @in_guild.expression
    def in_guild(cls, guild_id):
        return guild_id in cls.guilds

    @hybrid_method
    def get_joined_guilds(self):
        return eval(str(self.joined_guilds))

    @hybrid_method
    def join_guild(self, guild_id):
        a = eval(self.joined_guilds)
        a.append(guild_id)
        self.joined_guilds = str(a)

    @hybrid_method
    def leave_guild(self, guild_id):
        a = eval(self.joined_guilds)
        if guild_id in a:
            a.pop(a.index(guild_id))
        self.joined_guilds = str(a)

    @hybrid_method
    def to_mdict(self):
        return {
            "id": self.id,
            "username": self.username,
            "avatar": self.avatar,
            "created_date": self.created_date.strftime("%d.%m.%y, %H:%M")
        }



    def __repr__(self):
        return f"<models.User id={self.id} username={self.username}>"


class Message(SqlAlchemyBase):
    __tablename__ = "messages"
    id = sa.Column(sa.Integer, primary_key=True)
    channel_id = sa.Column(sa.Integer, sa.ForeignKey("channels.id"), nullable=False)
    channel = orm.relation('Channel')
    user_id = sa.Column(sa.Integer, sa.ForeignKey("users.id"), nullable=False)
    user = orm.relation('User')
    date = sa.Column(sa.DateTime, default=datetime.datetime.now)
    content = sa.Column(sa.Text, nullable=False)

    def __repr__(self):
        return "<models.Message %r>" % self.id

    @hybrid_method
    def to_dict(self):
        return {
            "id": self.id,
            "channel_id": self.channel_id,
            "user": self.user.to_mdict(),
            "content": self.content,
            "date": message_timestamp(self.date)
        }


class Channel(SqlAlchemyBase):
    __tablename__ = "channels"
    id = sa.Column(sa.Integer, primary_key=True)
    name = sa.Column(sa.String, default="Новый канал")
    guild_id = sa.Column(sa.Integer, sa.ForeignKey("guilds.id"), nullable=False)
    guild = orm.relation('Guild')
    msgs = orm.relation("Message", back_populates='channel')

    @hybrid_method
    def history(self):
        return [msg.to_dict() for msg in self.msgs]

    @hybrid_method
    def to_dict(self):
        return {
           "id": self.id,
           "name": self.name,
           "guild_id": self.guild_id,
        }


class Guild(SqlAlchemyBase):
    __tablename__ = "guilds"
    id = sa.Column(sa.Integer, primary_key=True)
    invite_code = sa.Column(sa.Text, nullable=False, unique=True)
    name = sa.Column(sa.Text, nullable=False)
    img = sa.Column(sa.Text, nullable=False)
    channels = orm.relation("Channel", back_populates='guild')

    @hybrid_method
    def to_dict(self):
        return {
            "id": self.id,
            "invite_code": self.invite_code,
            "name": self.name,
            "img": self.img,
            "channels": [e.to_dict() for e in self.channels],
        }