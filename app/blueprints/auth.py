from flask import render_template, redirect, url_for, request
from flask_login import login_user, logout_user, login_required, current_user
from ..models import User, Todo
from .. import db
from flask import Blueprint


auth = Blueprint('auth', __name__)


@auth.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('todo.index'))

    if request.method == 'POST':
        data = request.get_json()
        username = data['username']
        password = data['password']
        user = User.query.filter_by(username=username).first()

        if user is not None and user.verify_password(password):
            login_user(user)
            return redirect(url_for('todo.index'))
        return redirect(url_for('.login'))
    return render_template('login.html')


@auth.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('todo.index'))


@auth.route('/', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('todo.index'))

    if request.method == 'POST':
        print('request是什么', request.form)
        username = request.form['username']
        user = User.query.filter_by(username=username).first()
        if user is not None:
            return redirect(url_for('.login'))

        password = request.form['password']
        user = User(username=username, password=password)
        db.session.add(user)
        db.session.commit()
        login_user(user, remember=True)
        return redirect(url_for('todo.index'))
    return render_template('register.html')
