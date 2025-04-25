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
    
class ClientListResource(AuthResource):
    @jwt_required()
    def get(self):
        query = request.args.get('q', '')
        clients = Client.query.filter(
            (Client.first_name.ilike(f'%{query}%')) | 
            (Client.last_name.ilike(f'%{query}%')) |
            (Client.contact_number.ilike(f'%{query}%'))
        ).all()
        
        return [{
            'id': c.id,
            'first_name': c.first_name,
            'last_name': c.last_name,
            'date_of_birth': str(c.date_of_birth) if c.date_of_birth else None,
            'contact_number': c.contact_number
        } for c in clients]
    
    @jwt_required()
    def post(self):
        current_user = self.get_current_user()
        if not current_user:
            return {'message': 'Unauthorized'}, 401
            
        data = request.get_json()
        client = Client(
            first_name=data['first_name'],
            last_name=data['last_name'],
            date_of_birth=data.get('date_of_birth'),
            gender=data.get('gender'),
            contact_number=data.get('contact_number'),
            address=data.get('address')
        )
        db.session.add(client)
        db.session.commit()
        return {'id': client.id}, 201

class ClientResource(AuthResource):
    @jwt_required()
    def get(self, client_id):
        client = Client.query.get_or_404(client_id)
        return {
            'id': client.id,
            'first_name': client.first_name,
            'last_name': client.last_name,
            'date_of_birth': str(client.date_of_birth) if client.date_of_birth else None,
            'gender': client.gender,
            'contact_number': client.contact_number,
            'address': client.address,
            'programs': [{
                'id': p.id,
                'name': p.name,
                'enrollment_date': str(cp.enrollment_date),
                'status': cp.status
            } for p, cp in zip(client.programs, client.client_programs)]
        }
    
    @jwt_required()
    def put(self, client_id):
        current_user = self.get_current_user()
        if not current_user:
            return {'message': 'Unauthorized'}, 401
            
        client = Client.query.get_or_404(client_id)
        data = request.get_json()
        client.first_name = data.get('first_name', client.first_name)
        client.last_name = data.get('last_name', client.last_name)
        client.date_of_birth = data.get('date_of_birth', client.date_of_birth)
        client.gender = data.get('gender', client.gender)
        client.contact_number = data.get('contact_number', client.contact_number)
        client.address = data.get('address', client.address)
        db.session.commit()
        return {'message': 'Client updated'}, 200
    
    @jwt_required()
    def delete(self, client_id):
        current_user = self.get_current_user()
        if not current_user or current_user.role != 'admin':
            return {'message': 'Unauthorized'}, 403
            
        client = Client.query.get_or_404(client_id)
        db.session.delete(client)
        db.session.commit()
        return {'message': 'Client deleted'}, 200
    
class EnrollmentResource(AuthResource):
    @jwt_required()
    def post(self):
        current_user = self.get_current_user()
        if not current_user:
            return {'message': 'Unauthorized'}, 401
            
        data = request.get_json()
        enrollment = ClientProgram(
            client_id=data['client_id'],
            program_id=data['program_id'],
            enrollment_date=data.get('enrollment_date'),
            status=data.get('status', 'Active')
        )
        db.session.add(enrollment)
        try:
            db.session.commit()
            return {'message': 'Enrollment successful'}, 201
        except:
            db.session.rollback()
            return {'message': 'Client already enrolled in this program'}, 400
        
class DoctorRegistrationResource(AuthResource):
    @jwt_required()
    def post(self):
        current_user = self.get_current_user()
        if not current_user or current_user.role != 'admin':
            return {'message': 'Unauthorized - Admin only'}, 403
            
        data = request.get_json()
        
        # Validate required fields
        if not data.get('username') or not data.get('password'):
            return {'message': 'Username and password are required'}, 400
            
        # Check if username exists
        if User.query.filter_by(username=data['username']).first():
            return {'message': 'Username already exists'}, 400
            
        # Create new doctor user
        doctor = User(
            username=data['username'],
            role='doctor'
        )
        doctor.set_password(data['password'])
        
        db.session.add(doctor)
        db.session.commit()
        
        return {
            'message': 'Doctor registered successfully',
            'id': doctor.id,
            'username': doctor.username
        }, 201