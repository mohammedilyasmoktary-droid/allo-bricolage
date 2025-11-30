# 📸 Profile Pictures Setup Guide

## Issue Fixed
✅ Backend now properly saves and returns profilePictureUrl
✅ Frontend displays profile pictures in all components
✅ Database schema updated with profilePictureUrl field

## To Add the Provided Images:

### Step 1: Save Images
Save the 6 provided technician images to:
```
backend/uploads/profile-pictures/
```

Name them:
- `technician_1.jpg` (Handyman with drill - image 1)
- `technician_2.jpg` (HVAC technician - image 2)  
- `technician_3.jpg` (Electrician - image 3)
- `technician_4.jpg` (General technician - image 4)
- `technician_5.jpg` (Carpenter - image 5)
- `technician_6.jpg` (Plumber - image 6)
- `technician_7.jpg` (General technician - image 7)
- `technician_8.jpg` (General technician - image 8)

### Step 2: Assign to Technicians
Run the script to assign images to all technicians:
```bash
cd backend
npx tsx src/scripts/add-profile-pictures.ts
```

### Step 3: Verify
1. Check images are accessible: http://localhost:5001/uploads/profile-pictures/technician_1.jpg
2. Login as technician and check profile
3. Check admin dashboard - should see profile pictures in table
4. Check search technicians page - should see profile pictures

## Manual Upload (Alternative)
Technicians can also upload their own:
1. Login as technician
2. Go to Profile page
3. Click "Télécharger une photo de profil"
4. Select image
5. Click "Mettre à jour"

## Troubleshooting
- If images don't show: Check browser console for 404 errors
- If upload fails: Check backend/uploads/profile-pictures/ directory exists
- If URL wrong: Check BACKEND_URL in backend/.env matches your port
