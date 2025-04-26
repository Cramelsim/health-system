from app import app
from models import db, User, HealthProgram, Client, ClientProgram
from datetime import datetime, date, timezone
from sqlalchemy import select

def seed_database():
    with app.app_context():
        print("Dropping all tables...")
        db.drop_all()
        print("Creating all tables...")
        db.create_all()

        print("Seeding users...")
        admin = User(
            username='admin',
            first_name='Admin',
            last_name='User',
            role='admin',
            email='admin@healthsystem.com',
            is_approved=True
        )
        admin.set_password('admin123')
        
        doctors = [
            User(
                username='dr_smith',
                first_name='John',
                last_name='Smith',
                role='doctor',
                email='dr.smith@healthsystem.com',
                license_number='MD12345',
                is_approved=True
            ),
            User(
                username='dr_jones',
                first_name='Sarah',
                last_name='Jones',
                role='doctor',
                email='dr.jones@healthsystem.com',
                license_number='MD67890',
                is_approved=True
            ),
            User(
                username='dr_wong',
                first_name='Emily',
                last_name='Wong',
                role='doctor',
                email='dr.wong@healthsystem.com',
                license_number='MD54321',
                is_approved=True
            )
        ]
        for doctor in doctors:
            doctor.set_password('doctor123')
        
        db.session.add(admin)
        db.session.add_all(doctors)
        db.session.commit()

        print("Seeding health programs...")
        programs = [
            HealthProgram(name='Diabetes Management', description='Comprehensive diabetes care program'),
            HealthProgram(name='Cardiac Rehab', description='Post-cardiac event rehabilitation'),
            HealthProgram(name='Pulmonary Care', description='Chronic respiratory disease management'),
            HealthProgram(name='Weight Management', description='Nutrition and exercise program'),
            HealthProgram(name='Mental Wellness', description='Behavioral health support')
        ]
        db.session.add_all(programs)
        db.session.commit()

        print("Seeding clients...")
        clients = [
            Client(
                first_name='Michael',
                last_name='Johnson',
                date_of_birth=date(1980, 5, 15),
                gender='Male',
                contact_number='555-0101',
                address='123 Main St'
            ),
            Client(
                first_name='Sarah',
                last_name='Williams',
                date_of_birth=date(1975, 8, 22),
                gender='Female',
                contact_number='555-0102',
                address='456 Oak Ave'
            ),
            Client(
                first_name='David',
                last_name='Brown',
                date_of_birth=date(1990, 3, 10),
                gender='Male',
                contact_number='555-0103',
                address='789 Pine Rd'
            )
        ]
        db.session.add_all(clients)
        db.session.commit()

        print("Creating enrollments (ClientProgram records)...")
        all_clients = db.session.scalars(select(Client)).all()
        all_programs = db.session.scalars(select(HealthProgram)).all()
        all_users = db.session.scalars(select(User)).all()

        enrollments = [
            ClientProgram(
                client_id=all_clients[0].id,
                program_id=all_programs[0].id,
                status='Active',
                enrollment_date=datetime.now(timezone.utc),
                created_by=all_users[0].id
            ),
            ClientProgram(
                client_id=all_clients[0].id,
                program_id=all_programs[2].id,
                status='Active',
                enrollment_date=datetime.now(timezone.utc),
                created_by=all_users[1].id
            ),
            ClientProgram(
                client_id=all_clients[1].id,
                program_id=all_programs[1].id,
                status='Active',
                enrollment_date=datetime.now(timezone.utc),
                created_by=all_users[2].id
            ),
            ClientProgram(
                client_id=all_clients[2].id,
                program_id=all_programs[3].id,
                status='Pending',
                enrollment_date=datetime.now(timezone.utc),
                created_by=all_users[0].id
            )
        ]
        db.session.add_all(enrollments)
        db.session.commit()

        print("Database seeded successfully!")

if __name__ == '__main__':
    seed_database()