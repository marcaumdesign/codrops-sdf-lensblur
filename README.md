# Shape Lens Blur Effect with SDFs and WebGL

*An introduction on harnessing the power of Signed Distance Fields (SDFs) to draw shapes with interactive lens blur effect.*

![SDF Lens Blur](docs/demo.gif)

[Article on Codrops](https://tympanus.net/codrops/?p=77970)

[Demo](http://tympanus.net/Tutorials/SDFLensBlur/)

## Installation

- Install with `pnpm install`
- Run demo with `pnpm dev`
- Build with `pnpm build`

## Live Demo

- **Main Demo**: [GitHub Pages](https://marcaumdesign.github.io/codrops-sdf-lensblur/)
- **Iframe Version**: [GitHub Pages](https://marcaumdesign.github.io/codrops-sdf-lensblur/iframe.html)

### Iframe Usage

You can customize the iframe with URL parameters:

- `var`: Shape variation (0-3)
- `color`: Color in HEX format

Examples:
- `iframe.html?var=2&color=FF00FF` - Purple circle with magenta color
- `iframe.html?var=1&color=00FF00` - Green circle
- `iframe.html?var=3&color=D9CBEC` - Triangle with light purple

## Credits
- [Three.js](https://threejs.org/) - WebGL Library
- [Inigo Quilez's Articles](https://iquilezles.org/articles/distfunctions2d/) - 2D distance functions
- [The Book of Shaders](https://thebookofshaders.com/) - Shaders learning resources
- [Lygia](https://lygia.xyz/) - Shader Library

## Misc

Follow *Guillaume Lanier*: [X](https://x.com/guilanier), [GitHub](https://github.com/guilanier) 

Follow Codrops: [X](http://www.X.com/codrops), [Facebook](http://www.facebook.com/codrops), [GitHub](https://github.com/codrops), [Instagram](https://www.instagram.com/codropsss/)

## License
[MIT](LICENSE)

Made with :blue_heart:  by [Codrops](http://www.codrops.com)





