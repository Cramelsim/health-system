from flask import Flask
from flask_restful import Api
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from models import db, User
from resources import (
    LoginResource, UserResource,
    ProgramListResource, ProgramResource,
    ClientListResource, ClientResource,
    EnrollmentResource
)
from config import Config

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

# Initialize extensions
db.init_app(app)
jwt = JWTManager(app)
api = Api(app)

# Create tables and admin user
@app.before_first_request
def initialize_database():
    db.create_all()
    
    # Create admin user if not exists
    if not User.query.filter_by(username='admin').first():
        admin = User(username='admin', role='admin')
        admin.set_password('admin123')
        db.session.add(admin)
        db.session.commit()

# Add resources
api.add_resource(LoginResource, '/api/auth/login')
api.add_resource(UserResource, '/api/users/<int:user_id>')
api.add_resource(ProgramListResource, '/api/programs')
api.add_resource(ProgramResource, '/api/programs/<int:program_id>')
api.add_resource(ClientListResource, '/api/clients')
api.add_resource(ClientResource, '/api/clients/<int:client_id>')
api.add_resource(EnrollmentResource, '/api/enrollments')

if __name__ == '__main__':
    app.run(debug=True)