from flask import Flask
from flask_restful import Api
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_migrate import Migrate
from models import db, User
from resources import (
    LoginResource, UserResource,
    ProgramListResource, ProgramResource,
    ClientListResource, ClientResource, ClientSearchResource, 
    EnrollmentResource, DoctorSelfRegistrationResource
)
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
        "expose_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True,
        "max_age": 600
    }
})

# Initialize extensions
db.init_app(app)
jwt = JWTManager(app)
migrate = Migrate(app, db)

# Create the API instance ONCE
api = Api(app)



# Create database tables (using app context)
with app.app_context():
    db.create_all()
    
    # Create admin user if not exists
    if not User.query.filter_by(username='admin').first():
        admin = User(username='admin', role='admin')
        admin.set_password('admin123')
        db.session.add(admin)
        db.session.commit()

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# Add resources 
api.add_resource(LoginResource, '/api/auth/login')
api.add_resource(UserResource, '/users/<int:user_id>')
api.add_resource(ProgramListResource, '/programs')
api.add_resource(ProgramResource, '/programs/<int:program_id>')
api.add_resource(ClientListResource, '/clients')
api.add_resource(ClientResource, '/clients/<int:client_id>')
api.add_resource(ClientSearchResource, '/clients/search')
api.add_resource(DoctorSelfRegistrationResource, '/api/auth/register/doctor')
api.add_resource(EnrollmentResource, '/enrollments', '/enrollments/<int:enrollment_id>')

if __name__ == '__main__':
    app.run(debug=True)