# 🍎 iOS Setup Guide for TestFlight

## Prerequisites
- Mac computer with Xcode installed
- Apple Developer Account ($99/year)
- iOS device for testing

## Setup Steps

### 1. Transfer Project to Mac
- Copy the entire `LabubuUniverse` folder to your Mac
- Or clone from GitHub: `git clone https://github.com/CryptoBitwise/Labubu-Universe.git`

### 2. Install Dependencies
```bash
cd LabubuUniverse
npm install
cd ios
pod install
```

### 3. Open in Xcode
```bash
open LabubuUniverse.xcworkspace
```
**Important:** Always open `.xcworkspace`, not `.xcodeproj`

### 4. Configure for TestFlight

#### A. Update Bundle Identifier
- In Xcode, select the project
- Go to "Signing & Capabilities"
- Change Bundle Identifier to: `com.yourcompany.labubuuniverse`

#### B. Update Team ID
- Replace `YOUR_TEAM_ID` in `ios/ExportOptions.plist` with your Apple Developer Team ID

#### C. Update App Information
- Display Name: "Labubu Universe"
- Version: "1.0.0"
- Build: "1"

### 5. Build for TestFlight

#### Option A: Using Xcode
1. Select "Any iOS Device (arm64)" as destination
2. Product → Archive
3. Distribute App → App Store Connect
4. Upload to TestFlight

#### Option B: Using Command Line
```bash
cd ios
xcodebuild -workspace LabubuUniverse.xcworkspace \
           -scheme LabubuUniverse \
           -configuration Release \
           -destination generic/platform=iOS \
           -archivePath LabubuUniverse.xcarchive \
           archive

xcodebuild -exportArchive \
           -archivePath LabubuUniverse.xcarchive \
           -exportPath ./build \
           -exportOptionsPlist ExportOptions.plist
```

### 6. Upload to TestFlight
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Create new app with bundle identifier
3. Upload the `.ipa` file
4. Add testers and submit for review

## Features Included in This Build
- ✅ Collection limit feature (15 figures max)
- ✅ Collection counter display
- ✅ Beta limit modal
- ✅ Photo upload functionality
- ✅ Firebase integration
- ✅ Beautiful Labubu-themed UI

## Troubleshooting

### CocoaPods Issues
```bash
sudo gem install cocoapods
cd ios
pod deintegrate
pod install
```

### Xcode Build Issues
- Clean Build Folder: Cmd+Shift+K
- Reset Package Caches: File → Packages → Reset Package Caches
- Update to latest Xcode version

### Signing Issues
- Ensure Apple Developer Account is active
- Check Team ID matches in ExportOptions.plist
- Verify Bundle Identifier is unique

## Next Steps
1. Test on physical iOS device
2. Submit to TestFlight for beta testing
3. Gather feedback from beta testers
4. Prepare for App Store submission

---
**Note:** This guide assumes you have access to a Mac. If not, consider using GitHub Actions or a cloud-based Mac service.
