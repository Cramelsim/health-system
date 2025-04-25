from app import app
from models import db, User, HealthProgram, Client, ClientProgram
from datetime import date

def seed_database():
    with app.app_context():
        print("Dropping all tables...")
        db.drop_all()
        print("Creating all tables...")
        db.create_all()

        print("Seeding users...")
        # Create admin user
        admin = User(username='admin', role='admin')
        admin.set_password('admin123')
        db.session.add(admin)

        # Create doctor users
        doctor1 = User(username='dr_smith', role='doctor')
        doctor1.set_password('doctor123')
        doctor2 = User(username='dr_jones', role='doctor')
        doctor2.set_password('doctor123')
        db.session.add_all([doctor1, doctor2])

        print("Seeding health programs...")
        programs = [
            HealthProgram(name='TB', description='Tuberculosis treatment and prevention'),
            HealthProgram(name='Malaria', description='Malaria prevention and treatment'),
            HealthProgram(name='HIV', description='HIV/AIDS management program'),
            HealthProgram(name='Diabetes', description='Diabetes care and education'),
            HealthProgram(name='Hypertension', description='Blood pressure management')
        ]
        db.session.add_all(programs)

        print("Seeding clients...")
        clients = [
            Client(
                first_name='John',
                last_name='Doe',
                date_of_birth=date(1985, 5, 15),
                gender='Male',
                contact_number='555-0101',
                address='123 Main St, Anytown'
            ),
            Client(
                first_name='Jane',
                last_name='Smith',
                date_of_birth=date(1990, 8, 22),
                gender='Female',
                contact_number='555-0102',
                address='456 Oak Ave, Somewhere'
            ),
            Client(
                first_name='Robert',
                last_name='Johnson',
                date_of_birth=date(1978, 3, 10),
                gender='Male',
                contact_number='555-0103',
                address='789 Pine Rd, Nowhere'
            )
        ]
        db.session.add_all(clients)

        db.session.commit()

        print("Creating enrollments...")
        enrollments = [
            ClientProgram(
                client_id=1,
                program_id=1,
                enrollment_date=date(2023, 1, 10),
                status='Active'
            ),
            ClientProgram(
                client_id=1,
                program_id=3,
                enrollment_date=date(2023, 2, 15),
                status='Active'
            ),
            ClientProgram(
                client_id=2,
                program_id=2,
                enrollment_date=date(2023, 3, 20),
                status='Completed'
            ),
            ClientProgram(
                client_id=3,
                program_id=4,
                enrollment_date=date(2023, 4, 5),
                status='Active'
            )
        ]
        db.session.add_all(enrollments)

        db.session.commit()
        print("Database seeded successfully!")

if __name__ == '__main__':
    seed_database()