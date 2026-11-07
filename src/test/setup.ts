/* 测试环境垫片：jsdom 未提供 ImageData，按算法实际使用的字段提供最小实现 */

class ImageDataShim {
  readonly width: number
  readonly height: number
  readonly data: Uint8ClampedArray

  constructor(widthOrData: number | Uint8ClampedArray, heightOrWidth: number, maybeHeight?: number) {
    if (typeof widthOrData === 'number') {
      this.width = widthOrData
      this.height = heightOrWidth
      this.data = new Uint8ClampedArray(this.width * this.height * 4)
    } else {
      this.data = widthOrData
      this.width = heightOrWidth
      this.height = maybeHeight ?? this.data.length / 4 / this.width
    }
  }
}

if (typeof globalThis.ImageData === 'undefined') {
  globalThis.ImageData = ImageDataShim as unknown as typeof ImageData
}
