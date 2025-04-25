from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), default='doctor')  # 'doctor' or 'admin'
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def get_token(self):
        return create_access_token(identity={
            'id': self.id,
            'username': self.username,
            'role': self.role
        })
    
class HealthProgram(db.Model):
    __tablename__ = 'health_programs'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text)
    
    clients = db.relationship('Client', secondary='client_programs', back_populates='programs')

class Client(db.Model):
    __tablename__ = 'clients'
    
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    date_of_birth = db.Column(db.Date)
    gender = db.Column(db.String(10))
    contact_number = db.Column(db.String(20))
    address = db.Column(db.Text)
    
    programs = db.relationship('HealthProgram', secondary='client_programs', back_populates='clients')

class ClientProgram(db.Model):
    __tablename__ = 'client_programs'
    
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('clients.id'), nullable=False)
    program_id = db.Column(db.Integer, db.ForeignKey('health_programs.id'), nullable=False)
    enrollment_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), default='Active')
    
    __table_args__ = (
        db.UniqueConstraint('client_id', 'program_id', name='unique_client_program'),
    )
