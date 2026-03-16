# Vynora 🎶

![Vynora Icon](Vynora.png)

Vynora is a music player built with Electron, inspired by iTunes CoverFlow.

## 🚀 Features

- **Mercury Visualizer**: Dynamic volume animations with a liquid mercury effect.

- **API Integration**: Automatic cover art search for your songs.

- **Cache**: Cover art is extracted from local metadata or saved to disk for loading.

- **Cross-platform**: Supports Linux (AppImage, deb, pacman), Windows, and macOS.

- **Design**: Dark mode and smooth micro-interactions with Framer Motion.

## 📸 Screenshots

<p align="center">

<img src="Prints/1.png" width="30%" />

<img src="Prints/2.png" width="30%" />
<img src="Prints/3.png" width="30%" />
</p>

## 🛠️ How to Install (Arch Linux)

If you are on Arch Linux, you can build and install directly using PKGBUILD:

```bash
makepkg -si

```

For other platforms, check the `dist-electron` folder after running the build.

## 📦 Development

```bash

# Install dependencies
npm install

# Run in development mode
npm run electron:dev
```

---

## 💡 About the Project

I saw this on Figma from a guy who created it with AI, so I downloaded his project and started building it and playing around with the app. I'm just saving it on GitHub in case I want to work on it again someday. If anyone wants to test it, just download the app.

## Credits

https://github.com/frontendfocus-764
I used many of the animations he made in the app's code.

https://github.com/frontendfocus-764/frontendfocus-shared
link in case anyone wants to see this guy's work, he's AWESOME!!

Original Project
https://www.figma.com/community/file/1545557016596999853/vynora
