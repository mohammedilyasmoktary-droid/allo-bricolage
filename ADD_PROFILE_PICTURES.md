# 📸 How to Add Profile Pictures to Technicians

## Step 1: Save the Images

Save the provided technician images to:
```
backend/uploads/profile-pictures/
```

Name them:
- `technician_1.jpg` (Handyman with drill)
- `technician_2.jpg` (HVAC technician)
- `technician_3.jpg` (Electrician)
- `technician_4.jpg` (General technician)
- `technician_5.jpg` (Carpenter)
- `technician_6.jpg` (Plumber)
- `technician_7.jpg` (General technician)
- `technician_8.jpg` (General technician)

## Step 2: Run the Script

```bash
cd backend
npx tsx src/scripts/add-profile-pictures.ts
```

This will assign profile pictures to all existing technicians.

## Step 3: Verify

1. Check that images are accessible at: `http://localhost:5001/uploads/profile-pictures/technician_X.jpg`
2. Login as a technician and check their profile
3. Check the admin dashboard to see profile pictures in the table

## Alternative: Manual Upload

Technicians can also upload their own profile pictures:
1. Login as technician
2. Go to Profile page
3. Click "Télécharger une photo de profil"
4. Select image and save





