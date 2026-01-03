# Role-Based Workflows Documentation

This document describes the complete workflows for each user role in the Easy Car platform.

## Table of Contents
1. [Client Reservation Workflow](#client-reservation-workflow)
2. [Manager Vehicle CRUD Workflow](#manager-vehicle-crud-workflow)
3. [Admin CRUD Workflows](#admin-crud-workflows)
   - [Agencies Management](#agencies-management)
   - [Users Management](#users-management)

---

## Client Reservation Workflow

### Overview
Clients can browse vehicles, view details, check availability, and make reservations.

### Workflow Steps

1. **Browse Agencies**
   - Visit homepage (`/`)
   - View list of available agencies
   - Click on an agency to view their vehicles

2. **Search & Filter Vehicles**
   - Use search bar to find vehicles by make, model, or year
   - Apply filters:
     - Transmission (Automatic/Manual)
     - Fuel Type (Gasoline/Diesel/Electric/Hybrid)
     - Minimum seats
     - Price range
     - Availability dates
   - Sort by price, year, or name

3. **View Vehicle Details**
   - Click on a vehicle card
   - View:
     - Vehicle images
     - Specifications (year, make, model, color, seats, transmission, fuel type)
     - Features list
     - Pricing (daily, weekly, monthly)

4. **Make Reservation**
   - Must be signed in as a client
   - Fill out reservation form:
     - Select start and end dates
     - Enter customer information (name, email, phone)
     - Apply discount code (optional)
   - View calculated pricing:
     - Base price based on rental period
     - Applied discount (if any)
     - Total price
   - Submit reservation

5. **View Reservations**
   - Access client dashboard (`/client/dashboard`)
   - View all reservations with:
     - Vehicle details
     - Pick-up and return dates
     - Status (Pending/Confirmed/Cancelled/Completed)
     - Total price and savings
   - See statistics:
     - Total bookings
     - Confirmed reservations
     - Pending reservations
     - Total spent

### Features
- ✅ Real-time availability checking
- ✅ Dynamic pricing calculation
- ✅ Discount code application
- ✅ Reservation status tracking
- ✅ Statistics dashboard

### Routes
- `/` - Browse agencies
- `/[agency-slug]` - View agency vehicles
- `/[agency-slug]/vehicles/[id]` - Vehicle details & reservation
- `/client/dashboard` - Client dashboard

---

## Manager Vehicle CRUD Workflow

### Overview
Managers can create, read, update, and delete vehicles for their agency.

### Workflow Steps

#### Create Vehicle

1. **Navigate to Dashboard**
   - Sign in as manager
   - Access manager dashboard (`/dashboard`)

2. **Add New Vehicle**
   - Click "Add Vehicle" button
   - Fill out vehicle form:
     - Basic Info: Make, Model, Year, Color, License Plate
     - Specifications: Seats, Transmission, Fuel Type
     - Pricing: Daily, Weekly, Monthly rates
     - Images: Upload via Cloudinary or add URLs
     - Features: Add vehicle features
     - Availability: Toggle available/unavailable
   - Submit form

3. **Vehicle Created**
   - Vehicle appears in vehicles list
   - Automatically associated with manager's agency

#### Read/View Vehicles

1. **View All Vehicles**
   - Dashboard shows grid of all agency vehicles
   - Each card displays:
     - Vehicle image
     - Year, Make, Model
     - License plate
     - Daily rate
     - Availability status

2. **View Vehicle Details**
   - Click "Edit" on any vehicle card
   - View complete vehicle information
   - See all images and features

#### Update Vehicle

1. **Edit Vehicle**
   - Click "Edit" on vehicle card
   - Modify any vehicle information
   - Update images, features, pricing, etc.
   - Save changes

2. **Toggle Availability**
   - Edit vehicle
   - Check/uncheck "Available for rental"
   - Save changes

#### Delete Vehicle

1. **Delete Vehicle**
   - Click "Delete" button on vehicle card
   - Confirm deletion
   - Vehicle removed from system

### Features
- ✅ Full CRUD operations
- ✅ Image upload via Cloudinary
- ✅ Multiple images per vehicle
- ✅ Feature management
- ✅ Availability toggle
- ✅ Pricing configuration

### Routes
- `/dashboard` - Vehicles list
- `/dashboard/vehicles/new` - Create vehicle
- `/dashboard/vehicles/[id]` - Edit vehicle
- `/dashboard/reservations` - Manage reservations
- `/dashboard/pricing` - Manage pricing & discounts

### API Endpoints
- `GET /api/vehicles` - List vehicles (agency-scoped)
- `POST /api/vehicles` - Create vehicle
- `GET /api/vehicles/[id]` - Get vehicle details
- `PUT /api/vehicles/[id]` - Update vehicle
- `DELETE /api/vehicles/[id]` - Delete vehicle

---

## Admin CRUD Workflows

### Overview
Admins have full system access and can manage agencies, users, and view all reservations.

---

### Agencies Management

#### Create Agency

1. **Navigate to Admin Dashboard**
   - Sign in as admin
   - Access admin dashboard (`/admin`)

2. **Create New Agency**
   - Go to "Agencies" tab
   - Click "Create Agency"
   - Fill out form:
     - Agency Name (auto-generates slug)
     - Slug (URL-friendly identifier)
     - Email
     - Phone (optional)
     - Address (optional)
     - Description (optional)
   - Submit form

3. **Agency Created**
   - Agency appears in agencies list
   - Can be assigned to managers

#### View Agencies

1. **View All Agencies**
   - Admin dashboard shows all agencies
   - Each card displays:
     - Agency name and description
     - Contact information
     - Statistics:
       - Number of vehicles
       - Total reservations
       - Pending reservations
   - Quick actions:
     - View public page
     - Manage agency

#### Update Agency

1. **Edit Agency**
   - Click "Manage" on agency card
   - Modify agency information
   - Update name, slug, contact info, etc.
   - Save changes

#### Delete Agency

1. **Delete Agency**
   - Click "Delete Agency" button
   - Confirm deletion
   - Agency removed from system

### Routes
- `/admin/agencies` - List all agencies
- `/admin/agencies/new` - Create agency
- `/admin/agencies/[id]` - Edit/Delete agency

### API Endpoints
- `GET /api/admin/agencies` - List all agencies
- `POST /api/admin/agencies` - Create agency
- `GET /api/admin/agencies/[id]` - Get agency details
- `PUT /api/admin/agencies/[id]` - Update agency
- `DELETE /api/admin/agencies/[id]` - Delete agency

---

### Users Management

#### Create User

1. **Navigate to Users**
   - Go to "Users" tab in admin dashboard
   - Click "Create User"

2. **Fill User Form**
   - Name
   - Email
   - Password (minimum 6 characters)
   - Role (Client/Manager/Admin)
   - Agency (required if role is Manager)
   - Phone (optional)

3. **User Created**
   - User can now sign in
   - Appears in users list

#### View Users

1. **View All Users**
   - Users table shows:
     - Name and email
     - Role badge
     - Associated agency (if manager)
     - Contact information
     - Created date
   - Statistics cards show:
     - Total users
     - Number of managers
     - Number of clients

#### Update User

1. **Edit User**
   - Click "View" on user row
   - Modify user information
   - Change password (optional - leave blank to keep current)
   - Update role and agency assignment
   - Save changes

#### Delete User

1. **Delete User**
   - Click "Delete User" button
   - Confirm deletion
   - Cannot delete your own account
   - User removed from system

### Routes
- `/admin/users` - List all users
- `/admin/users/new` - Create user
- `/admin/users/[id]` - Edit/Delete user

### API Endpoints
- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Create user
- `GET /api/admin/users/[id]` - Get user details
- `PUT /api/admin/users/[id]` - Update user
- `DELETE /api/admin/users/[id]` - Delete user

---

## Additional Admin Features

### System Overview Dashboard
- View system-wide statistics:
  - Total agencies
  - Total users
  - Total vehicles
  - Total reservations
  - Pending reservations
  - Confirmed reservations

### All Reservations View
- View reservations across all agencies
- Filter by status (All/Pending/Confirmed/Completed)
- See agency, vehicle, customer, and booking details

### Routes
- `/admin` - System overview
- `/admin/reservations` - All reservations

---

## Permission Summary

### Client
- ✅ Browse agencies and vehicles
- ✅ Search and filter vehicles
- ✅ Make reservations
- ✅ View own reservations
- ❌ Cannot manage vehicles
- ❌ Cannot manage agencies
- ❌ Cannot manage users

### Manager
- ✅ Manage own agency vehicles (CRUD)
- ✅ Manage own agency reservations
- ✅ Create and manage discounts
- ✅ View own agency statistics
- ❌ Cannot access other agencies
- ❌ Cannot manage users
- ❌ Cannot create agencies

### Admin
- ✅ Full system access
- ✅ Manage all agencies (CRUD)
- ✅ Manage all users (CRUD)
- ✅ View all reservations
- ✅ System-wide statistics
- ✅ Create managers and assign to agencies

---

## Security Features

1. **Role-Based Access Control**
   - Middleware enforces role-based routing
   - API routes verify user roles
   - UI adapts based on user role

2. **Agency Isolation**
   - Managers can only access their own agency data
   - API routes verify agency ownership
   - Clients can only view their own reservations

3. **Admin Protection**
   - Admin routes require admin role
   - Cannot delete own account
   - Full audit trail through timestamps

---

## Testing Credentials

After running `npm run seed`, use these credentials:

**Admin:**
- Email: `admin@easycar.com`
- Password: `password123`

**Manager:**
- Email: `manager@premiumcarrentals.com`
- Password: `password123`

**Client:**
- Email: `client1@example.com`
- Password: `password123`

---

## Next Steps

To extend these workflows, consider:
- Email notifications for reservations
- Calendar view for availability
- Advanced reporting and analytics
- Bulk operations for managers
- Export functionality for admin

