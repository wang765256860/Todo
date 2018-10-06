from flask import render_template, request, Blueprint, jsonify
from flask_login import current_user, login_required

from .. import db
from ..models import Item

todo = Blueprint('todo', __name__)


@todo.route('/app')
@login_required
def app():
    all_count = Item.query.with_parent(current_user).count()
    active_count = Item.query.with_parent(current_user).filter_by(done=False).count()
    completed_count = Item.query.with_parent(current_user).filter_by(done=True).count()
    return render_template('_app.html', items = current_user.items,
                           all_count=all_count, active_count=active_count, completed_count=completed_count)


@todo.route('/item/new', methods=['POST'])
@login_required
def new_item():
    data = request.get_json()
    if data is None or data['body'].strip() == '':
        return jsonify(message='内容无效'), 400
    item = Item(body=data['body'], author=current_user._get_current_object())
    db.session.add(item)
    db.session.commit()
    return jsonify(html=render_template('_item.html', item=item), message='+1')


@todo.route('/item/<int:item_id>/edit', methods=['PUT'])
@login_required
def edit_item(item_id):
    item = Item.query.get_or_404(item_id)
    if current_user != item.author:
        return jsonify(message='没有权限'), 403

    data = request.get_json()
    if data is None or data['body'].strip() == '':
        return jsonify(message='内容无效'), 400
    item.body = data['body']
    db.session.commit()
    return jsonify(message='待办事项已更新')


@todo.route('/item/<int:item_id>/toggle', methods=['PATCH'])
@login_required
def toggle_item(item_id):
    item = Item.query.get_or_404(item_id)
    if current_user != item.author:
        return jsonify(message='没有权限'), 403

    item.done = not item.done
    db.session.commit()
    return jsonify(message='切换待办事项')


@todo.route('/item/<int:item_id>/delete', methods=['DELETE'])
@login_required
def delete_item(item_id):
    item = Item.query.get_or_404(item_id)
    if current_user != item.author:
        return jsonify(message='没有权限'), 403

    db.session.delete(item)
    db.session.commit()
    return jsonify(message='删除待办事项')


@todo.route('/item/clear', methods=['DELETE'])
@login_required
def clear_item():
    items = Item.query.with_parent(current_user).filter_by(done=True).all()
    for item in items:
        db.session.delete(item)
    db.session.commit()
    return jsonify(message='清除已完成的待办事项')

