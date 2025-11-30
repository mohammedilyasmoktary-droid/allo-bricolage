# Allo Bricolage - Application Preview Guide

## 🎨 Application Overview

### Color Scheme
- **Primary**: Dark Blue (#032B5A) - Used for headers, buttons, navigation
- **Accent**: Yellow (#F4C542) - Used for highlights, icons, CTAs
- **Background**: White (#FFFFFF) - Clean, professional look

### Key Pages & Features

## 📱 Client Interface

### 1. Home Page (`/`)
- Hero section with "Allo Bricolage" branding
- Feature cards: Qualified Technicians, Various Services, Secure Payment
- Call-to-action buttons for registration/login
- Clean, modern design with Material UI components

### 2. Login/Register Pages
- Clean card-based forms
- Role selection (Client/Technician) on registration
- Material UI text fields and buttons
- Error handling with alerts

### 3. Client Dashboard (`/client/dashboard`)
- Welcome message with user name
- Two main action cards:
  - **Search Technicians** - Navigate to search page
  - **My Bookings** - View booking history
- Quick access to main features

### 4. Search Technicians (`/client/search`)
- Search form with:
  - City input field
  - Category dropdown (Plomberie, Électricité, Menuiserie, etc.)
  - Search button
- Results displayed as cards showing:
  - Technician name and photo
  - Rating (stars) and years of experience
  - Skills (chips)
  - Bio/description
  - Pricing (hourly rate or base price)
  - Online/Offline status badge
  - "Réserver" (Book) button

### 5. Create Booking (`/client/bookings/create`)
- Form with:
  - Selected technician info card
  - Service category dropdown
  - Problem description (textarea)
  - City and address fields
  - Preferred date/time picker
  - Estimated price input
  - Photo upload (up to 5 images)
  - Payment method selection (radio buttons):
    - Cash on delivery
    - Card payment
    - Wafacash
    - Bank transfer
- Payment method info alert for non-cash methods

### 6. My Bookings (`/client/bookings`)
- List of all bookings as cards
- Each card shows:
  - Service category name
  - Status badge (color-coded: Pending=Yellow, Accepted=Blue, Completed=Green, etc.)
  - Technician name
  - Address and scheduled date
  - Price and payment status
  - Description
  - "Rate Technician" button (for completed & paid bookings)
- Rating dialog with:
  - Star rating (1-5)
  - Comment textarea

## 🔧 Technician Interface

### 1. Technician Dashboard (`/technician/dashboard`)
- Header with online/offline toggle switch
- Three stat cards:
  - Pending Requests count
  - Today's Jobs count
  - Verification Status badge
- Quick overview of technician activity

### 2. New Requests (`/technician/requests`)
- List of pending booking requests
- Each request card shows:
  - Service category
  - Client name and contact
  - Address and scheduled date
  - Problem description
  - "Accept" and "Decline" buttons
- Action buttons to respond to requests

### 3. My Jobs (`/technician/jobs`)
- Filter dropdown by status
- List of all assigned jobs
- Each job card shows:
  - Service category and status badge
  - Client information
  - Address and date
  - Description
  - Status update buttons:
    - "En route" (when Accepted)
    - "Arrivé - Commencer" (when On the Way)
    - "Terminer" (when In Progress)
- Status workflow: Accepted → On the Way → In Progress → Completed

### 4. Technician Profile (`/technician/profile`)
- Verification status card with badge
- Profile form:
  - Years of experience
  - Hourly rate (MAD)
  - Base price (MAD)
  - Bio/description
  - Save button
- Pending verification alert if not approved

## 👨‍💼 Admin Interface

### 1. Admin Dashboard (`/admin/dashboard`)
- Statistics cards:
  - Total Users
  - Total Technicians (with pending count)
  - Total Bookings (with completed count)
  - Total Revenue (MAD)

### 2. Manage Technicians (`/admin/technicians`)
- Table view with columns:
  - Name, Email, Phone, City
  - Skills, Experience
  - Verification Status (color-coded badge)
  - Action buttons (Approve/Reject for pending)
- Bulk management of technician verification

### 3. Manage Bookings (`/admin/bookings`)
- Filter dropdowns:
  - By status (All, Pending, Accepted, In Progress, Completed)
  - By payment status (All, Unpaid, Pending, Paid)
- Table showing:
  - Booking ID, Client, Technician
  - Category, Status, Price
  - Payment Status
  - Payment status dropdown to update manually

## 🎯 User Flows

### Client Booking Flow
1. Register/Login as Client
2. Search for technicians by city/category
3. Select a technician
4. Fill booking form (description, photos, address, date)
5. Select payment method
6. Submit booking (status: PENDING)
7. Wait for technician acceptance
8. Track status updates
9. After completion & payment, rate technician

### Technician Work Flow
1. Register as Technician
2. Complete profile (skills, experience, pricing)
3. Upload documents (ID, certificates)
4. Wait for admin verification
5. Toggle online status
6. Receive booking requests
7. Accept/Decline requests
8. Update job status as work progresses
9. Mark job as completed with final price
10. Rate client after completion

### Admin Management Flow
1. Login as Admin
2. View dashboard statistics
3. Review pending technician applications
4. Approve/Reject technicians
5. Monitor all bookings
6. Update payment status manually
7. View system statistics

## 🚀 To See the Preview

Follow the steps in `QUICK_START.md` to:
1. Install dependencies
2. Setup database
3. Configure environment
4. Run migrations and seed
5. Start both servers
6. Open http://localhost:5173 in your browser

## 📸 Visual Elements

- **Cards**: Rounded corners (12px), subtle shadows
- **Buttons**: Rounded (8px), no text transform, primary color
- **Navigation**: Top app bar with logo, menu items, logout
- **Status Badges**: Color-coded chips (Success=Green, Warning=Yellow, Error=Red, Info=Blue)
- **Forms**: Material UI text fields with labels
- **Tables**: Clean, bordered tables for admin views
- **Icons**: Material UI icons throughout

## 🎨 Design Principles

- Clean and professional
- Mobile-responsive
- Consistent color scheme
- Clear navigation
- Intuitive user flows
- Accessible forms
- Visual feedback for actions

