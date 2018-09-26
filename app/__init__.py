import os
from flask import Flask
from .config import config

from flask_sqlalchemy import SQLAlchemy
from flask_bootstrap import Bootstrap
from flask_login import LoginManager
from flask_moment import Moment


db = SQLAlchemy()
moment = Moment()
bootstrap = Bootstrap()
login_manager = LoginManager()
login_manager.login_view = 'auth.login'


def create_app(config_name=None):
    if config_name is None:
        config_name = os.getenv('FLASK_CONFIG', 'development')

    app = Flask(__name__)
    app.config.from_object(config[config_name])

    register_blueprints(app)
    register_extensions(app)

    return app


def register_blueprints(app):
    from .blueprints.auth import auth
    app.register_blueprint(auth)


def register_extensions(app):
    db.init_app(app)
    moment.init_app(app)
    login_manager.init_app(app)
    bootstrap.init_app(app)




