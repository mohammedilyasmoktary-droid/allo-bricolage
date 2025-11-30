# 📸 Guide: Adding Technician Profile Pictures

## ✅ Step 1: Ratings Fixed!

Sample reviews have been added to all technicians. Ratings should now display correctly (4.0 - 4.7 stars).

---

## 🖼️ Step 2: Add Your Technician Images

### Where to Save Images:

Save your 6 technician images to this folder:
```
backend/uploads/profile-pictures/
```

### Required File Names:

Name your images **exactly** as follows:
1. `technician_1.jpg`
2. `technician_2.jpg`
3. `technician_3.jpg`
4. `technician_4.jpg`
5. `technician_5.jpg`
6. `technician_6.jpg`

### Supported Formats:
- `.jpg` or `.jpeg` (recommended)
- `.png`

### Quick Steps:

1. **Copy your 6 images** to: `backend/uploads/profile-pictures/`
2. **Rename them** to: `technician_1.jpg`, `technician_2.jpg`, etc.
3. **Run this command:**
   ```bash
   cd backend
   npm run add-technician-images
   ```
4. **Restart your backend server** (if running)

---

## 🎯 What Happens:

- The script will automatically assign images to all 20 technicians
- Images will cycle through (technician_1 → technician_2 → ... → technician_6 → technician_1)
- Images will be accessible at: `http://localhost:5001/uploads/profile-pictures/technician_X.jpg`

---

## ✅ Verification:

After adding images, you can verify they're working by:

1. **Check the URL directly:**
   - Open: `http://localhost:5001/uploads/profile-pictures/technician_1.jpg`
   - Should see your image

2. **Check the homepage:**
   - Visit: `http://localhost:5173`
   - Technician cards should show profile pictures

3. **Check technician profiles:**
   - Click on any technician card
   - Profile page should display the image

---

## 🐛 Troubleshooting:

**Images don't show?**
- Make sure files are named exactly: `technician_1.jpg` (not `technician_1.JPG` or `Technician_1.jpg`)
- Check file permissions
- Restart backend server
- Clear browser cache

**Script says "No images found"?**
- Verify images are in: `backend/uploads/profile-pictures/`
- Check file names match exactly (case-sensitive)
- Make sure files have `.jpg` or `.jpeg` extension

---

## 📝 Notes:

- You can add more images later (technician_7.jpg, technician_8.jpg, etc.)
- Images will be automatically distributed to technicians
- If you update an image, just replace the file and restart the backend





