# Hustlaa - Artisan Platform

A fullstack web application connecting skilled artisans with customers across all Nigerian states, built using Uber's business model.

## Features

### For Customers
- Search and discover verified artisans by location, skill, and rating
- View detailed artisan profiles with reviews and ratings
- Book services with preferred artisans
- Track booking status in real-time
- Leave reviews and ratings after service completion
- Secure payment processing

### For Artisans
- Create and manage professional profile
- List services with pricing and duration
- Receive and manage booking requests
- Update availability status
- Build reputation through customer reviews
- Track earnings and completed jobs

### Platform Features
- Nationwide coverage across all 36 Nigerian states and FCT
- Location-based artisan search with proximity filtering
- Real-time booking management
- Secure authentication and authorization
- Responsive design for mobile and desktop
- Payment integration ready (Paystack/Flutterwave)

## Tech Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database
- **JWT** authentication
- **bcryptjs** for password hashing
- RESTful API architecture

### Frontend
- **React 18** with Hooks
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Axios** for API calls
- **React Hot Toast** for notifications
- **Vite** for fast development

## Project Structure

```
hustlaa/
├── backend/
│   ├── db/
│   │   └── schema.sql          # Database schema
│   ├── middleware/
│   │   └── auth.js             # Authentication middleware
│   ├── routes/
│   │   ├── auth.js             # Authentication routes
│   │   ├── artisans.js         # Artisan management routes
│   │   ├── bookings.js         # Booking management routes
│   │   ├── payments.js         # Payment processing routes
│   │   └── users.js            # User management routes
│   ├── server.js               # Express server setup
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── Navbar.jsx      # Navigation component
    │   ├── context/
    │   │   └── AuthContext.jsx # Authentication context
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── ArtisanSearch.jsx
    │   │   ├── ArtisanProfile.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Bookings.jsx
    │   │   ├── BookingDetails.jsx
    │   │   └── Profile.jsx
    │   ├── services/
    │   │   └── api.js          # API service layer
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your database credentials and JWT secret:
```
DATABASE_URL=postgresql://user:password@localhost:5432/hustlaa
JWT_SECRET=your_secure_jwt_secret_key
PORT=5000
NODE_ENV=development
```

5. Create the database and run the schema:
```bash
# Create database
createdb hustlaa

# Run schema
psql -d hustlaa -f db/schema.sql
```

6. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Artisans
- `GET /api/artisans` - Get all artisans (with filters)
- `GET /api/artisans/:id` - Get artisan by ID
- `PUT /api/artisans/profile` - Update artisan profile
- `POST /api/artisans/location` - Set artisan location
- `POST /api/artisans/services` - Add service
- `GET /api/artisans/search/nearby` - Search nearby artisans
- `GET /api/artisans/meta/states` - Get Nigerian states

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/customer` - Get customer bookings
- `GET /api/bookings/artisan` - Get artisan bookings
- `GET /api/bookings/:id` - Get booking details
- `PATCH /api/bookings/:id/status` - Update booking status
- `PATCH /api/bookings/:id/cancel` - Cancel booking
- `POST /api/bookings/:id/review` - Add review

### Payments
- `POST /api/payments/initialize` - Initialize payment
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/history` - Get payment history
- `GET /api/payments/:id` - Get payment details

### Users
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/password` - Change password
- `GET /api/users/dashboard` - Get dashboard stats

## Database Schema

The application uses PostgreSQL with the following main tables:
- `users` - User accounts (customers and artisans)
- `artisan_profiles` - Extended profile for artisans
- `artisan_locations` - Location data for artisans
- `services` - Services offered by artisans
- `bookings` - Service bookings
- `payments` - Payment records
- `reviews` - Customer reviews

## Features to Implement

- [ ] Payment gateway integration (Paystack/Flutterwave)
- [ ] Real-time notifications
- [ ] Image upload for profiles and services
- [ ] Advanced search filters
- [ ] Chat system between customers and artisans
- [ ] Admin dashboard for platform management
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Analytics and reporting

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Contact

For questions or support, please contact the development team.
