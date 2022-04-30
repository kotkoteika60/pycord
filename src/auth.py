from flask import Blueprint, render_template, redirect, url_for, request
from flask_login import login_user, logout_user, login_required
from werkzeug.security import generate_password_hash, check_password_hash
from data import db_session
from data.models import *

auth = Blueprint('auth', __name__)

@auth.route('/login')
def login():
    return render_template("login_form.html")

@auth.route('/login', methods=['POST'])
def login_post():
    username = request.form.get('username')
    password = request.form.get('password')
    remember = not not request.form.get('remember')
    if not (username and password):
        return redirect("/login")

    user = User.query.filter_by(username=username).first()
    if not user or not check_password_hash(user.password, password):
        return redirect("/login")
    login_user(user, remember=remember)
    if request.args.get("next"):
        return redirect(request.args.get("next"))
    return redirect("/layout")

@auth.route('/signup')
def signup():
    return render_template("signup_form.html")

@auth.route('/signup', methods=['POST'])
def signup_post():
    username = request.form.get('username')
    avatar = request.form.get('avatar')
    password = request.form.get('password')
    if not (username and password):
        return redirect("/signup")

    user = User.query.filter_by(username=username).first()

    if user:
        print(user, user.username, user.avatar)
        return redirect("/login")

    new_user = User(username=username, avatar=avatar, password=password)
    print(new_user, "new")
    db_sess = db_session.create_session()
    db_sess.add(new_user)
    db_sess.commit()

    return redirect("/login")

@auth.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect("/login")