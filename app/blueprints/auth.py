from flask import render_template, redirect, url_for, request, jsonify, Blueprint
from flask_login import login_user, logout_user, login_required, current_user
from ..models import User, Todo
from .. import db
from faker import Faker

auth = Blueprint('auth', __name__)
fake = Faker()


@auth.route('/login', methods=['GET', 'POST'])
def login():
    print('data是什么', request.get_json())
    # if current_user.is_authenticated:
    #     return redirect(url_for('todo.index'))

    if request.method == 'POST':
        data = request.get_json()
        username = data['username']
        password = data['password']
        user = User.query.filter_by(username=username).first()

        if user is not None and user.verify_password(password):
            login_user(user)
            return jsonify(message='登录成功')
        return jsonify(message='无效的用户名或密码'), 400
    return render_template('_login.html')


@auth.route('/logout')
@login_required
def logout():
    logout_user()
    return jsonify(message='登出成功')


@auth.route('/register')
def register():
    username = fake.user_name()
    while User.query.filter_by(username=username).first() is not None:
        username = fake.user_name()
    password = fake.word()
    user = User(username=username, password=password)
    db.session.add(user)
    db.session.commit()

    # 生成默认的todo项目
    todo = Todo(body='这是一条默认的 todo ', author=user)
    todo2 = Todo(body='这是一条完成了的 todo ', done=True, author=user)
    db.session.add_all([todo, todo2])
    db.session.commit()

    return jsonify(username=username, password=password, message='生成成功')
