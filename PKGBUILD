# Maintainer: Michael <michael@example.com>
pkgname=vynora
pkgver=1.0.0
pkgrel=1
pkgdesc="Premium iPod CoverFlow clone with iTunes API integration"
arch=('x86_64')
url="https://github.com/vynora/app"
license=('MIT')
depends=('electron')
makedepends=('npm' 'nodejs')
source=() # Build local, fontes já estão na pasta

build() {
  # O makepkg é executado na pasta que contém o PKGBUILD ($startdir)
  cd "$startdir"
  npm install
  npm run build
}

package() {
  cd "$startdir"
  
  # Instala os arquivos compilados (Vite build)
  install -dm755 "$pkgdir/usr/lib/$pkgname"
  cp -r dist/* "$pkgdir/usr/lib/$pkgname/"
  cp electron-main.js "$pkgdir/usr/lib/$pkgname/"
  cp package.json "$pkgdir/usr/lib/$pkgname/"
  
  # Instala as dependências de runtime (music-metadata)
  # Nota: Em pacotes oficiais o ideal é instalar as dependências via pacman,
  # mas para build local rápido, mantemos o node_modules.
  cp -r node_modules "$pkgdir/usr/lib/$pkgname/"

  # Cria o script de inicialização usando o Electron do sistema
  install -dm755 "$pkgdir/usr/bin"
  echo "#!/bin/sh
exec electron /usr/lib/$pkgname/electron-main.js \"\$@\"" > "$pkgdir/usr/bin/$pkgname"
  chmod +x "$pkgdir/usr/bin/$pkgname"

  # Instala os ícones do sistema em múltiplas resoluções
  for size in 16 32 48 64 128 256 512; do
    install -dm755 "$pkgdir/usr/share/icons/hicolor/${size}x${size}/apps"
    cp build/icons/${size}.png "$pkgdir/usr/share/icons/hicolor/${size}x${size}/apps/vynora.png"
  done
  
  # Pixmap de fallback
  install -dm755 "$pkgdir/usr/share/pixmaps"
  cp Vynora.png "$pkgdir/usr/share/pixmaps/vynora.png"

  # Desktop Entry
  install -dm755 "$pkgdir/usr/share/applications"
  echo "[Desktop Entry]
Name=Vynora
Comment=$pkgdesc
Exec=$pkgname
Icon=vynora
Type=Application
Categories=AudioVideo;Player;
StartupWMClass=vynora
Terminal=false
" > "$pkgdir/usr/share/applications/$pkgname.desktop"
}
