# App Icon Assets

## Required Files

Place the following icon files in this directory:

### 1. app_icon.png
- **Size**: 1024x1024px
- **Format**: PNG
- **Content**: Complete app icon with background gradient (Teal → Purple)
- **Description**: Main icon showing accounting ledger book with digital elements

### 2. app_icon_foreground.png
- **Size**: 1024x1024px
- **Format**: PNG with transparency
- **Content**: Only the book element (no background)
- **Description**: Foreground layer for Android adaptive icons
- **Important**: Keep the book centered within 432x432px safe zone

## How to Generate These Files

See the detailed instructions in: `../../ICON_SETUP.md`

Or use the AI prompt in: `../icon_prompt.txt`

## Current Status

⚠️ **TODO**: Icon files need to be created and placed here

Once you have the icon files:
1. Copy them to this directory
2. Run: `flutter pub get`
3. Run: `flutter pub run flutter_launcher_icons`
4. Build the app to see the new icon

## Design Specifications

**Selected Design**: Option 8 - Accounting Book + Digital Hybrid

**Color Palette**:
- Background: Teal (#26A69A) → Purple (#7E57C2) gradient
- Book: Deep Indigo (#283593)
- Spine: Gold (#FFA726)
- Glow: Cyan (#00BCD4)

**Style**: Modern, professional, flat design with subtle depth
