from flask import request, jsonify
from flask_restful import Resource, reqparse
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request, get_jwt, create_access_token
from models import db, User, HealthProgram, Client, ClientProgram
import re
from marshmallow import Schema, fields, ValidationError
from marshmallow.validate import Length
from sqlalchemy import func
from datetime import datetime
from functools import wraps

class LoginResource(Resource):
    def post(self):
        data = request.get_json()
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()

        user = User.query.filter_by(username=username).first()
        if not user or not user.check_password(password):
            return {"message": "Invalid credentials"}, 401

        access_token = create_access_token(identity={
            'id': user.id,
            'username': user.username,
            'role': user.role
        })

        return {
            'access_token': access_token,
            'user': {
                'id': user.id,
                'username': user.username,
                'role': user.role
            }
        }, 200

class UserResource(Resource):
    @jwt_required()
    def get(self, user_id):
        identity = get_jwt_identity()
        if identity['id'] != user_id and identity['role'] != 'admin':
            return {'message': 'Unauthorized'}, 403

        user = User.query.get_or_404(user_id)
        return {
            'id': user.id,
            'username': user.username,
            'role': user.role
        }

class ProgramSchema(Schema):
    name = fields.Str(required=True, validate=Length(min=3))
    description = fields.Str()

class ProgramResource(Resource):
    @jwt_required()
    def get(self, program_id):
        program = HealthProgram.query.get_or_404(program_id)
        return {
            'id': program.id,
            'name': program.name,
            'description': program.description,
            'clients': [{
                'id': cp.client.id,
                'name': f"{cp.client.first_name} {cp.client.last_name}"
            } for cp in program.client_programs]
        }

    @jwt_required()
    def put(self, program_id):
        identity = get_jwt_identity()
        if identity['role'] not in ['admin', 'doctor']:
            return {'message': 'Unauthorized'}, 403

        program = HealthProgram.query.get_or_404(program_id)
        data = request.get_json()
        program.name = data.get('name', program.name)
        program.description = data.get('description', program.description)
        db.session.commit()
        return {'message': 'Program updated'}, 200

    @jwt_required()
    def delete(self, program_id):
        identity = get_jwt_identity()
        if identity['role'] != 'admin':
            return {'message': 'Unauthorized'}, 403

        program = HealthProgram.query.get_or_404(program_id)
        db.session.delete(program)
        db.session.commit()
        return {'message': 'Program deleted'}, 200
    

class ProgramListResource(Resource):
    parser = reqparse.RequestParser()
    parser.add_argument('name', type=str, required=True, help='Name cannot be blank')
    parser.add_argument('description', type=str)

    def get(self):
        """Handle GET requests for listing all programs"""
        try:
            programs = HealthProgram.query.all()
            return {
                'success': True,
                'programs': [{
                    'id': p.id,
                    'name': p.name,
                    'description': p.description,
                    'created_at': p.created_at.isoformat() if p.created_at else None
                } for p in programs]
            }, 200
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to fetch programs'
            }, 500

    def post(self):
        """Handle POST requests for creating new programs"""

    def post(self):
        try:
            if not request.is_json:
                return {'error': 'Content-Type must be application/json'}, 415

            data = self.parser.parse_args()
            
            # Check for existing program
            existing = HealthProgram.query.filter(
                func.lower(HealthProgram.name) == func.lower(data['name'])
            ).first()
            
            if existing:
                return {
                    'success': False,
                    'message': 'Program already exists',
                    'existing_program': {
                        'id': existing.id,
                        'name': existing.name
                    }
                }, 409
                
            # Create new program
            program = HealthProgram(
                name=data['name'],
                description=data.get('description')
            )
            db.session.add(program)
            db.session.commit()
            
            # Return success response with created program data
            return {
                'success': True,
                'message': 'Program created successfully',
                'program': {
                    'id': program.id,
                    'name': program.name,
                    'description': program.description,
                    'created_at': program.created_at.isoformat() if program.created_at else None
                }
            }, 201
            
        except Exception as e:
            db.session.rollback()
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to create program'
            }, 500
        
class ClientSchema(Schema):
    first_name = fields.Str(required=True)
    last_name = fields.Str(required=True)
    date_of_birth = fields.Date()
    gender = fields.Str()
    contact_number = fields.Str()
    address = fields.Str()

def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        claims = get_jwt()
        if claims['role'] != 'admin':
            return {'message': 'Admins only!'}, 403
        return fn(*args, **kwargs)
    return wrapper

class ClientListResource(Resource):
    def get(self):
        try:
            clients = Client.query.all()
            return [{
                "id": client.id,
                "first_name": client.first_name,
                "last_name": client.last_name
            } for client in clients], 200
        except Exception as e:
            return {
                "message": "Failed to process request",
                "error": str(e)
            }, 422

    def post(self):
        try:
            schema = ClientSchema()
            data = schema.load(request.get_json())
            
            client = Client(**data)
            db.session.add(client)
            db.session.commit()
            
            return {
                'id': client.id,
                'first_name': client.first_name,
                'last_name': client.last_name
            }, 201
        except ValidationError as err:
            return {'error': err.messages}, 400
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500

class ClientResource(Resource):
    @jwt_required()
    def get(self, client_id):
        try:
            client = Client.query.get_or_404(client_id)
            client_programs = ClientProgram.query.filter_by(client_id=client_id).all()
            
            client_data = {
                'id': client.id,
                'first_name': client.first_name,
                'last_name': client.last_name,
                'date_of_birth': client.date_of_birth.isoformat() if client.date_of_birth else None,
                'gender': client.gender,
                'contact_number': client.contact_number,
                'address': client.address,
                'client_programs': []
            }
            
            for cp in client_programs:
                program = HealthProgram.query.get(cp.program_id)
                if program:
                    client_data['client_programs'].append({
                        'program_id': program.id,
                        'program_name': program.name,
                        'status': cp.status,
                        'enrollment_date': cp.enrollment_date.isoformat(),
                        'notes': cp.notes
                    })
            
            return client_data, 200
        except Exception as e:
            return {
                'message': 'Failed to fetch client details',
                'error': str(e)
            }, 500

class ClientSearchResource(Resource):
    @jwt_required()
    def get(self):
        search_term = request.args.get('q', '').strip()
        
        # Explicitly allow empty searches
        if not search_term:
            return {'results': []}, 200
        
        try:
            clients = Client.query.filter(
                db.or_(
                    Client.first_name.ilike(f'%{search_term}%'),
                    Client.last_name.ilike(f'%{search_term}%'),
                    Client.contact_number.ilike(f'%{search_term}%')
                )
            ).all()
            
            return {
                'results': [{
                    'id': client.id,
                    'first_name': client.first_name,
                    'last_name': client.last_name,
                    'contact_number': client.contact_number,
                    'date_of_birth': client.date_of_birth.isoformat() if client.date_of_birth else None
                } for client in clients]
            }, 200
        except Exception as e:
            return {
                'message': 'Search failed',
                'error': str(e),
                'results': []
            }, 500

class ClientPublicResource(Resource):
    def get(self):
        clients = Client.query.with_entities(
            Client.id,
            Client.first_name,
            Client.last_name
        ).all()
        return [dict(c) for c in clients]

class EnrollmentResource(Resource):
    parser = reqparse.RequestParser()
    parser.add_argument('client_id', type=int, required=True, help='Client ID is required and must be an integer')
    parser.add_argument('program_id', type=int, required=True, help='Program ID is required and must be an integer')
    parser.add_argument('status', type=str)
    parser.add_argument('notes', type=str)
    parser.add_argument('subject', type=str, required=True, help='Subject is required')  # Added subject field

    @jwt_required()
    def post(self):
        try:
            data = self.parser.parse_args()
            user_id = get_jwt_identity()
            
            try:
                user_id = int(user_id)
            except (ValueError, TypeError):
                return {'message': 'Invalid user ID in token'}, 400

            # Verify client exists
            client = Client.query.get(data['client_id'])
            if not client:
                return {'message': 'Client not found'}, 404
                
            # Verify program exists
            program = HealthProgram.query.get(data['program_id'])
            if not program:
                return {'message': 'Program not found'}, 404
            
            # Check for duplicate enrollment
            existing = ClientProgram.query.filter_by(
                client_id=data['client_id'],
                program_id=data['program_id']
            ).first()
            
            if existing:
                return {
                    'message': 'Client already enrolled in this program',
                    'enrollment_id': existing.id
                }, 409
                
            # Create new enrollment with subject
            enrollment = ClientProgram(
                client_id=data['client_id'],
                program_id=data['program_id'],
                status=data.get('status', 'Active'),
                notes=data.get('notes'),
                subject=data['subject'], 
                created_by=user_id
            )
            
            db.session.add(enrollment)
            db.session.commit()
            
            return {
                'success': True,
                'message': 'Enrollment successful',
                'enrollment': enrollment.serialize()  
            }, 201
            
        except Exception as e:
            db.session.rollback()
            return {
                'success': False,
                'message': 'Enrollment failed',
                'error': str(e)
            }, 500
class DoctorSelfRegistrationResource(Resource):
    def post(self):
        try:
            data = request.get_json()
            required_fields = ['username', 'password', 'first_name', 'last_name', 'email', 'license_number']
            if not all(field in data for field in required_fields):
                return {"error": "All fields are required"}, 400

            if not re.match(r"[^@]+@[^@]+\.[^@]+", data['email']):
                return {"error": "Invalid email format"}, 400

            if User.query.filter_by(username=data['username']).first():
                return {"error": "Username already exists"}, 400

            if User.query.filter_by(email=data['email']).first():
                return {"error": "Email already registered"}, 400

            new_user = User(
                username=data['username'],
                role='doctor',
                email=data['email'],
                first_name=data['first_name'],
                last_name=data['last_name'],
                license_number=data['license_number'],
                is_approved=False
            )
            new_user.set_password(data['password'])
            db.session.add(new_user)
            db.session.commit()

            return {
                "message": "Doctor registration successful. Pending admin approval.",
                "doctor": {
                    "id": new_user.id,
                    "first_name": new_user.first_name,
                    "last_name": new_user.last_name
                }
            }, 201

        except Exception as e:
            db.session.rollback()
            return {
                "error": "Registration failed",
                "details": str(e)
            }, 500