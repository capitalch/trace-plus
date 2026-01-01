# App Icon Setup Instructions

## Overview
This guide will help you generate and configure the custom app icon for Trace Mobile Plus using the selected Option 8 design (Accounting Book + Digital Hybrid).

## Step 1: Generate the Icon Image

You have two options to create the icon:

### Option A: Use AI Image Generator (Recommended)
1. Go to an AI image generator like:
   - DALL-E (ChatGPT): https://chat.openai.com/
   - Microsoft Designer: https://designer.microsoft.com/
   - Midjourney: https://www.midjourney.com/

2. Use the prompt from `assets/icon_prompt.txt`:
   ```
   Create a mobile app icon for a financial accounting application. Design a modern,
   minimalist icon featuring a stylized accounting ledger book in a 3/4 view, slightly
   open. The book should be deep indigo blue (#283593) with a gold spine showing 'T+'
   text. Add subtle digital elements like glowing lines or particles around the book
   in cyan color. The background should be a gradient from teal (#26A69A) to purple
   (#7E57C2). Include subtle Dr/Cr accounting columns visible on the open page. Flat
   design style, professional, modern, clean, suitable for mobile app icon, 1024x1024px,
   rounded corners.
   ```

3. Download the generated image as PNG (1024x1024px)

### Option B: Design Manually
1. Use a graphic design tool (Figma, Adobe Illustrator, Canva, etc.)
2. Follow the specifications in `assets/icon_prompt.txt`
3. Export as PNG at 1024x1024px with transparency

## Step 2: Prepare Icon Files

You need TWO image files:

### Main Icon (Required)
- **File name**: `app_icon.png`
- **Size**: 1024x1024px
- **Format**: PNG with or without transparency
- **Content**: The complete icon with background gradient

### Foreground Icon for Adaptive Icon (Required for Android 8.0+)
- **File name**: `app_icon_foreground.png`
- **Size**: 1024x1024px
- **Format**: PNG with transparency
- **Content**: Only the book element (without background gradient)
- **Safe zone**: Keep the book within 432x432px center area

**To create the foreground icon:**
1. Remove the background gradient from the main icon
2. Keep only the book and digital elements
3. Ensure transparency around the book
4. Save as `app_icon_foreground.png`

## Step 3: Place Icon Files

Copy both icon files to:
```
C:\projects\trace-plus\dev\trace_mobile_plus\assets\icons\
```

You should have:
- `assets/icons/app_icon.png` (main icon with background)
- `assets/icons/app_icon_foreground.png` (book only, transparent background)

## Step 4: Generate Platform-Specific Icons

Run the following commands in the terminal:

```bash
# Install dependencies
flutter pub get

# Generate icons for all platforms
flutter pub run flutter_launcher_icons
```

This will automatically create all required icon sizes for Android.

## Step 5: Verify Icon Generation

Check that the icons were generated in:
```
android/app/src/main/res/mipmap-hdpi/ic_launcher.png
android/app/src/main/res/mipmap-mdpi/ic_launcher.png
android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png

android/app/src/main/res/drawable-hdpi/ic_launcher_foreground.png
android/app/src/main/res/drawable-mdpi/ic_launcher_foreground.png
android/app/src/main/res/drawable-xhdpi/ic_launcher_foreground.png
android/app/src/main/res/drawable-xxhdpi/ic_launcher_foreground.png
android/app/src/main/res/drawable-xxxhdpi/ic_launcher_foreground.png

android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml
```

**Note:** The foreground icons are in `drawable-*` directories, while the main launcher icons are in `mipmap-*` directories.

## Step 6: Test the Icon

1. Build and install the app on a device:
   ```bash
   flutter run --release
   ```

2. Check the app icon on your device's home screen and app drawer

3. Verify it looks good at different sizes and backgrounds

## Configuration Details

The icon configuration in `pubspec.yaml`:
```yaml
flutter_launcher_icons:
  android: true                                    # Generate for Android
  ios: false                                       # Skip iOS for now
  image_path: "assets/icons/app_icon.png"         # Main icon file
  adaptive_icon_background: "#26A69A"             # Teal background color
  adaptive_icon_foreground: "assets/icons/app_icon_foreground.png"  # Foreground layer
```

## Design Specifications

Your selected icon design (Option 8):

**Colors:**
- Background gradient: Teal (#26A69A) → Purple (#7E57C2)
- Book cover: Deep Indigo (#283593)
- Book spine: Gold/Amber (#FFA726)
- Digital glow: Cyan (#00BCD4) at 20% opacity
- Text: White (#FFFFFF)

**Style:**
- Flat design with subtle shadows
- Modern, professional, minimalist
- Accounting ledger book at 3/4 view, slightly open
- "T+" text on gold spine
- Subtle Dr/Cr columns visible on pages
- Digital elements (glowing lines/particles) around book

## Troubleshooting

**Issue: Icons not generating**
- Ensure both PNG files exist in `assets/icons/`
- Check file names match exactly (case-sensitive)
- Run `flutter clean` then `flutter pub get` and try again

**Issue: Icon looks blurry**
- Ensure source images are exactly 1024x1024px
- Use PNG format (not JPG)
- Regenerate with higher quality settings

**Issue: Adaptive icon not working**
- Verify foreground image has transparent background
- Check that book is centered and within safe zone
- Test on Android 8.0+ device

## Next Steps After Icon Setup

1. Rebuild the app: `flutter build apk --release`
2. Test on multiple Android devices
3. If needed, adjust colors or design and regenerate
4. For iOS support, set `ios: true` in config and provide iOS-specific requirements

## Notes

- The current configuration is Android-only
- Adaptive icons provide better integration with Android 8.0+ launchers
- Keep the source 1024x1024px files in version control for future updates
- You can regenerate icons anytime by running the flutter_launcher_icons command
