# 📦 Packing List Management System

A full-stack web application for managing packing lists with automated price validation and admin review workflows.

## 🏗️ Architecture

### Backend (Flask)
- **Framework**: Flask with SQLAlchemy ORM
- **Database**: SQLite (configurable to PostgreSQL/MySQL)
- **Authentication**: JWT tokens
- **File Processing**: Pandas + openpyxl for Excel parsing
- **API**: RESTful endpoints with role-based access control

### Frontend (React + Vite)
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios with interceptors
- **Build Tool**: Vite for fast development

## 🚀 Features

### For Users
- **Account Management**: Register and login
- **File Upload**: Drag-and-drop Excel packing list upload
- **Validation**: Automatic price matching against price list
- **History**: View upload history with status tracking
- **Real-time Feedback**: Progress indicators and validation results

### For Admins
- **Dashboard**: Overview statistics and metrics
- **Price Management**: Upload and update price lists
- **Duty Management**: Upload and update duty rate tables
- **Review System**: Approve/reject pending uploads with comments
- **User Oversight**: View all user uploads and activities

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Backend API | Flask, SQLAlchemy, PyJWT |
| Frontend | React, TypeScript, Tailwind CSS |
| Database | SQLite (dev), PostgreSQL (prod) |
| File Processing | Pandas, openpyxl |
| Authentication | JWT tokens |
| HTTP Client | Axios |
| Build Tools | Vite, ESLint |

## 📋 Prerequisites

- **Python 3.8+**
- **Node.js 16+**
- **npm or yarn**

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd packing-list-system
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the Flask application
python app.py
```

The backend will start at `http://localhost:5000`

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start at `http://localhost:3000`

## 🗄️ Database Schema

### Users
- `id`: Primary key
- `username`: Unique username
- `password_hash`: Hashed password
- `is_admin`: Admin flag
- `created_at`: Registration timestamp

### Upload Records
- `id`: Primary key
- `user_id`: Foreign key to Users
- `filename`: Original filename
- `upload_time`: Upload timestamp
- `status`: success/pending/approved/rejected
- `items`: JSON data of parsed items
- `review_comment`: Admin review comment

### Price List
- `item_code`: Primary key (product code)
- `unit_price`: Product price
- `updated_at`: Last update timestamp

### Duty Rates
- `item_code`: Primary key (product code)
- `rate`: Tax rate percentage
- `updated_at`: Last update timestamp

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### User Operations
- `POST /api/user/upload/packing-list` - Upload packing list
- `GET /api/user/uploads` - Get user upload history
- `GET /api/user/upload/{id}` - Get upload details

### Admin Operations
- `POST /api/admin/upload/price-list` - Upload price list
- `POST /api/admin/upload/duty-rate` - Upload duty rates
- `GET /api/admin/uploads` - Get all uploads
- `POST /api/admin/review/{id}` - Review upload
- `GET /api/admin/stats` - Get dashboard statistics

## 📊 File Formats

### Packing List Excel Format
Required columns (case-insensitive):
- `Item Code` / `Item_Code` / `Code`
- `Quantity` / `Qty`
- `Price` / `Unit Price` / `Unit_Price`

### Price List Excel Format
Required columns:
- `Item Code` / `Item_Code` / `Code`
- `Price` / `Unit Price` / `Unit_Price`

### Duty Rate Excel Format
Required columns:
- `Item Code` / `Item_Code` / `Code`
- `Rate` / `Duty Rate` / `Tax Rate`

## ⚡ Validation Logic

1. **File Parsing**: Extract item codes, quantities, and prices
2. **Price Matching**: Compare against stored price list
3. **Status Assignment**:
   - ✅ **Success**: All items match with correct prices
   - ⚠️ **Pending**: Validation errors require admin review
   - ✅ **Approved**: Admin approved pending items
   - ❌ **Rejected**: Admin rejected with comments

## 🎨 UI Components

### Reusable Components
- `AuthForm`: Login/registration form
- `FileUploader`: Drag-and-drop file upload with progress
- `RecordTable`: Data table with pagination and actions
- `Pagination`: Page navigation component

### Pages
- `LoginPage`: User authentication
- `RegisterPage`: New user registration
- `DashboardPage`: User file upload and history
- `AdminPage`: Admin management interface

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Role-based Access**: User/Admin permission levels
- **File Validation**: Type and size restrictions
- **SQL Injection Protection**: SQLAlchemy ORM
- **CORS Configuration**: Cross-origin request handling

## 🚀 Deployment

### Backend Deployment
1. Configure production database (PostgreSQL recommended)
2. Set environment variables:
   ```bash
   export SECRET_KEY="your-secret-key"
   export DATABASE_URL="postgresql://user:pass@host:port/db"
   export JWT_SECRET_KEY="your-jwt-secret"
   ```
3. Deploy to cloud platform (Heroku, AWS, etc.)

### Frontend Deployment
1. Build for production:
   ```bash
   npm run build
   ```
2. Deploy `dist/` folder to static hosting (Netlify, Vercel, etc.)
3. Configure API base URL for production

## 🧪 Development

### Backend Development
```bash
cd backend
python app.py  # Runs with auto-reload in debug mode
```

### Frontend Development
```bash
cd frontend
npm run dev    # Hot reload development server
npm run build  # Production build
npm run lint   # Code linting
```

## 📝 Sample Data

To test the system:

1. **Create admin user**: Register a user and manually set `is_admin=True` in database
2. **Upload price list**: Use admin panel to upload price reference data
3. **Upload packing list**: Use user dashboard to test validation workflow

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the [Issues](../../issues) page
- Review the documentation above
- Contact the development team

---

**Built with ❤️ using Flask + React** 