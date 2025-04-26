from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), default='doctor')
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    email = db.Column(db.String(120), unique=True)
    license_number = db.Column(db.String(50))
    is_approved = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def get_token(self):
        return create_access_token(identity=str(self.id))
           

class HealthProgram(db.Model):
    __tablename__ = 'health_programs'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    client_programs = db.relationship('ClientProgram', back_populates='program')

    def __repr__(self):
        return f'<HealthProgram {self.name}>'

class Client(db.Model):
    __tablename__ = 'clients'
    
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    date_of_birth = db.Column(db.Date)
    gender = db.Column(db.String(10))
    contact_number = db.Column(db.String(20))
    address = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    client_programs = db.relationship('ClientProgram', back_populates='client')

    def __repr__(self):
        return f'<Client {self.first_name} {self.last_name}>'
    
    def get_token(self):
   
       return create_access_token(identity=str(self.id))
        
class ClientProgram(db.Model):
    __tablename__ = 'client_programs'
    
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('clients.id'), nullable=False)
    program_id = db.Column(db.Integer, db.ForeignKey('health_programs.id'), nullable=False)
    status = db.Column(db.String(20), default='Active')
    notes = db.Column(db.Text)
    enrollment_date = db.Column(db.DateTime, default=datetime.utcnow)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    subject = db.Column(db.String(255), nullable=False)
    client = db.relationship('Client', back_populates='client_programs')
    program = db.relationship('HealthProgram', back_populates='client_programs')
    created_by_user = db.relationship('User')
    
    __table_args__ = (
        db.UniqueConstraint('client_id', 'program_id', name='unique_client_program'),
    )

    def serialize(self):
        return {
            'id': self.id,
            'client_id': self.client_id,
            'program_id': self.program_id,
            'status': self.status,
            'notes': self.notes,
            'enrollment_date': self.enrollment_date.isoformat() if self.enrollment_date else None,
            'created_by': self.created_by,
            'subject': self.subject,
        }
