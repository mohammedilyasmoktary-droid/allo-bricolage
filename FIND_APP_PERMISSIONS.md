# Finding App Permissions in Postgres.app

## If You Don't See "App Permissions" Tab

The App Permissions might be in a different location depending on your Postgres.app version.

### Option 1: Check for Tabs in Settings
In the Server Settings window you have open:
- Look for **tabs at the top** of the settings window
- It might be called:
  - "App Permissions"
  - "Client Applications" 
  - "Allowed Apps"
  - "Security"

### Option 2: Check the Main Window
1. **Close the Server Settings window** (click outside or press Escape)
2. In the **main Postgres.app window**, look for:
   - A menu bar item: **"Postgres" → "Preferences"** or **"Settings"**
   - Or right-click on "PostgreSQL 18" in the sidebar
   - Look for "App Permissions" or "Client Applications"

### Option 3: Alternative - Edit pg_hba.conf File
If you can't find App Permissions, we can edit the configuration file directly:

1. In the Server Settings window you have open
2. Find **"HBA File:"** (you should see it in the list)
3. Click the **"Show"** button next to it
4. This will open the file in Finder
5. We'll edit it to allow connections

### Option 4: Check Postgres.app Menu
- Click on **"Postgres"** in the macOS menu bar (top of screen)
- Look for **"Preferences"** or **"Settings"**
- Check for App Permissions there

## Quick Alternative Solution

If you can't find App Permissions, we can use a different approach - I'll help you edit the configuration file directly to allow Node.js connections.






