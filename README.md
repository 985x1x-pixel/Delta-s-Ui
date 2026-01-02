<div align="center">

# Δ Delta's UI Editor

### Custom UI Layout Editor for Hordes.io

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/985x1x-pixel/Delta-s-Ui/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Hordes.io](https://img.shields.io/badge/game-Hordes.io-orange.svg)](https://hordes.io/play)

[Installation](#installation) • [Features](#features) • [Usage](#usage) • [Screenshots](#screenshots) • [Contributing](#contributing)

![Delta UI Banner](assets/banners/header-banner.png)

</div>

---

## 🎮 About

**Delta's UI Editor** is a powerful userscript that allows you to customize and reposition UI elements in [Hordes.io](https://hordes.io/play). Move, resize, and save your perfect UI layout!

### ✨ Key Features

- 🎯 **Drag & Drop** - Move any UI element anywhere on screen
- 📐 **Resize Elements** - Adjust size of supported elements
- 💾 **Save Profiles** - Create and switch between multiple layouts
- 🔄 **Auto-Restore** - Layouts persist after teleporting or changing worlds
- 📤 **Import/Export** - Share your layouts with others
- ⚡ **Grid Snapping** - Precise element placement

---

## 📦 Installation

### Requirements
- [Tampermonkey](https://www.tampermonkey.net/) (Chrome, Firefox, Edge, Safari)
- OR [Greasemonkey](https://www.greasespot.net/) (Firefox)
- OR [Violentmonkey](https://violentmonkey.github.io/) (Chrome, Firefox, Edge)

### Quick Install

1. Install a userscript manager (Tampermonkey recommended)
2. **[Click here to install Delta's UI Editor](https://raw.githubusercontent.com/985x1x-pixel/Delta-s-Ui/main/src/delta-ui-editor.user.js)**
3. Click "Install" in the popup
4. Go to [hordes.io/play](https://hordes.io/play) and enjoy!

### Manual Install

1. Copy the contents of [`delta-ui-editor.user.js`](src/delta-ui-editor.user.js)
2. Open Tampermonkey → Create new script
3. Paste the code and save

---

## 🎮 Usage

### Opening the Editor

| Method | Action |
|--------|--------|
| **Δ Button** | Click the Delta button in the top-right menu bar |
| **Keyboard** | Press `F6` to toggle edit mode |

### Edit Mode

1. Press `F6` or click **Enter Edit Mode**
2. **Drag** elements to reposition them
3. **Drag corners** to resize (supported elements)
4. Click **Save** to save your layout
5. Press `F6` or `ESC` to exit

### Profiles

- Create multiple profiles for different activities (PvP, Farming, etc.)
- Switch between profiles instantly
- Export/Import to share with friends

---

## 📸 Screenshots

<div align="center">

| Editor Panel | Edit Mode |
|:------------:|:---------:|
| ![Editor](assets/screenshots/editor-panel.png) | ![Edit Mode](assets/screenshots/edit-mode.png) |

</div>

---

## ⌨️ Hotkeys

| Key | Action |
|-----|--------|
| `F6` | Toggle Edit Mode |
| `ESC` | Exit Edit Mode / Close Panel |
| `Drag` | Move elements |
| `Corner Drag` | Resize elements |

---

## 🎯 Moveable Elements

| Element | Resizable | Category |
|---------|:---------:|----------|
| Party Info Bar | ❌ | Upper Left |
| Party Frames | ✅ | Upper Left |
| Chat Window | ✅ | Lower Left |
| Chat Input | ✅ | Lower Left |
| Channel Buttons | ❌ | Lower Left |
| System Buttons | ❌ | Upper Right |
| Minimap | ✅ | Upper Right |
| Stats Bar | ❌ | Upper Right |
| Player Frame | ✅ | Center |
| Skill Bar | ✅ | Center |
| Experience Bar | ✅ | Bottom |

---

## 🛠️ Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/985x1x-pixel/Delta-s-Ui.git

# Navigate to directory
cd Delta-s-Ui

# The main script is ready to use
# Located at: src/delta-ui-editor.user.js
