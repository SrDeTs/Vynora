# Maintainer: Michael <michael@example.com>
pkgname=vynora
pkgver=1.0.0
pkgrel=1
pkgdesc="Premium iPod CoverFlow clone with iTunes API integration"
arch=('x64')
url="https://github.com/vynora/app"
license=('MIT')
depends=('electron')
makedepends=('npm' 'nodejs' 'git')
source=("vynora::git+https://github.com/vynora/app.git") # Substitua pela URL real se disponível
sha256sums=('SKIP')

build() {
  cd "$srcdir/$pkgname"
  npm install
  npm run build
}

package() {
  cd "$srcdir/$pkgname"
  
  # Instala os arquivos compilados (Vite build)
  install -dm755 "$pkgdir/usr/lib/$pkgname"
  cp -r dist/* "$pkgdir/usr/lib/$pkgname/"
  cp electron-main.js "$pkgdir/usr/lib/$pkgname/"
  cp package.json "$pkgdir/usr/lib/$pkgname/"
  
  # Instala as dependências de runtime (music-metadata)
  cp -r node_modules "$pkgdir/usr/lib/$pkgname/"

  # Cria o script de inicialização usando o Electron do sistema
  install -dm755 "$pkgdir/usr/bin"
  echo "#!/bin/sh
exec electron /usr/lib/$pkgname/electron-main.js \"\$@\"" > "$pkgdir/usr/bin/$pkgname"
  chmod +x "$pkgdir/usr/bin/$pkgname"

  # Instala o ícone do sistema
  install -dm755 "$pkgdir/usr/share/icons/hicolor/512x512/apps"
  cp Vynora.png "$pkgdir/usr/share/icons/hicolor/512x512/apps/vynora.png"

  # Desktop Entry (Opcional, mas recomendado)
  install -dm755 "$pkgdir/usr/share/applications"
  echo "[Desktop Entry]
Name=Vynora
Comment=$pkgdesc
Exec=$pkgname
Icon=vynora
Type=Application
Categories=AudioVideo;Player;
" > "$pkgdir/usr/share/applications/$pkgname.desktop"
}
