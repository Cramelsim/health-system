from flask import request
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, HealthProgram, Client, ClientProgram
from config import Config

class AuthResource(Resource):
    @classmethod
    def get_current_user(cls):
        identity = get_jwt_identity()
        if not identity:
            return None
        return User.query.get(identity['id'])
    
class LoginResource(Resource):
    def post(self):
        data = request.get_json()
        user = User.query.filter_by(username=data['username']).first()
        
        if not user or not user.check_password(data['password']):
            return {'message': 'Invalid credentials'}, 401
            
        return {'access_token': user.get_token()}, 200