from flask import render_template, Blueprint

home = Blueprint('home', __name__)


@home.route('/')
def index():
    return render_template('index.html')


@home.route('/intro')
def intro():
    return render_template('_intro.html')