# Vynora 🎶

![Vynora Icon](Vynora.png)

Vynora é um player de música premium construído com Electron, inspirado na estética clássica do iTunes CoverFlow, mas com um toque moderno de animações fluidas e design em vidro (glassmorphism).

## 🚀 Funcionalidades

- **Visualizador de Mercúrio**: Animações de volume dinâmicas com efeito de mercúrio líquido.
- **Integração iTunes API**: Busca automática de capas de alta qualidade para suas músicas.
- **Cache Inteligente**: Capas são extraídas dos metadados locais ou salvas em disco para carregamento instantâneo.
- **Multiplataforma**: Suporte nativo para Linux (AppImage, deb, pacman), Windows e macOS.
- **Design Premium**: Interface responsiva, modo escuro e micro-interações suaves com Framer Motion.

## 📸 Screenshots

<p align="center">
  <img src="Prints/1.png" width="30%" />
  <img src="Prints/2.png" width="30%" />
  <img src="Prints/3.png" width="30%" />
</p>

## 🛠️ Como Instalar (Arch Linux)

Se você estiver no Arch Linux, pode buildar e instalar diretamente usando o nosso PKGBUILD:

```bash
makepkg -si
```

Para outras plataformas, verifique a pasta `dist-electron` após rodar o build.

## 📦 Desenvolvimento

```bash
# Instalar dependências
npm install

# Rodar em modo de desenvolvimento
npm run electron:dev

# Gerar pacotes para todas as plataformas
./build.sh all
```

---

## 💡 Sobre o Projeto

Este projeto começou como um experimento baseado em um design do Figma e evoluiu para um player funcional e altamente otimizado. Criado apenas por diversão e para explorar animações complexas no Electron.

[English Version (English README)](README%20(EN).md)
