export default defineNitroPlugin(() => {
  // @ts-expect-error BigInt.prototype.toJSON is not a built-in function
  BigInt.prototype.toJSON = function () {
    return this.toString()
  }
})
