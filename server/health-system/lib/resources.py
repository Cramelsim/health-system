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
    
class UserResource(AuthResource):
    @jwt_required()
    def get(self, user_id):
        current_user = self.get_current_user()
        if not current_user or (current_user.id != user_id and current_user.role != 'admin'):
            return {'message': 'Unauthorized'}, 403
            
        user = User.query.get_or_404(user_id)
        return {
            'id': user.id,
            'username': user.username,
            'role': user.role
        }
    
class ProgramResource(Resource):
    @jwt_required()
    def get(self, program_id):
        program = HealthProgram.query.get_or_404(program_id)
        return {
            'id': program.id,
            'name': program.name,
            'description': program.description,
            'clients': [{
                'id': c.id,
                'name': f"{c.first_name} {c.last_name}"
            } for c in program.clients]
        }
    
    @jwt_required()
    def put(self, program_id):
        current_user = self.get_current_user()
        if not current_user:
            return {'message': 'Unauthorized'}, 401
            
        program = HealthProgram.query.get_or_404(program_id)
        data = request.get_json()
        program.name = data.get('name', program.name)
        program.description = data.get('description', program.description)
        db.session.commit()
        return {'message': 'Program updated'}, 200
    
    @jwt_required()
    def delete(self, program_id):
        current_user = self.get_current_user()
        if not current_user or current_user.role != 'admin':
            return {'message': 'Unauthorized'}, 403
            
        program = HealthProgram.query.get_or_404(program_id)
        db.session.delete(program)
        db.session.commit()
        return {'message': 'Program deleted'}, 200