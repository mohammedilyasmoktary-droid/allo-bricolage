# Image Loading Troubleshooting

## If images don't show:

1. **Check file names**: Must be exactly:
   - technician_1.jpg (or .png, .webp)
   - technician_2.jpg
   - ... through technician_8.jpg

2. **Check file location**: 
   - Files must be in: `frontend/public/images/technicians/`
   - NOT in `frontend/src/` or anywhere else

3. **Check file format**: 
   - Supported: .jpg, .jpeg, .png, .webp
   - Case sensitive on some systems

4. **Restart dev server**:
   ```bash
   # Stop server (Ctrl+C)
   cd frontend
   npm run dev
   ```

5. **Clear browser cache**:
   - Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
   - Or clear browser cache

6. **Check browser console**:
   - Open DevTools (F12)
   - Look for 404 errors on image paths
   - Should see: GET /images/technicians/technician_X.jpg 404

7. **Verify path in browser**:
   - Try: http://localhost:5173/images/technicians/technician_1.jpg
   - Should show the image directly

## Current Status:
Run: `ls -la frontend/public/images/technicians/`
You should see 8 image files listed.
