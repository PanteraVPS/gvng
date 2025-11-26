import { useState } from 'react'
import { Product } from '../types'

export const useCart = () => {
  const [cart, setCart] = useState<any[]>(() => {
    const savedCart = localStorage.getItem('cart')
    return savedCart ? JSON.parse(savedCart) : []
  })

  const addToCart = (product: Product, quantity: number, size: string, color: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(
        item => item.product._id === product._id && item.size === size && item.color === color
      )

      let newCart
      if (existingItem) {
        newCart = prevCart.map(item =>
          item.product._id === product._id && item.size === size && item.color === color
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        newCart = [...prevCart, { product, quantity, size, color }]
      }

      localStorage.setItem('cart', JSON.stringify(newCart))
      return newCart
    })
  }

  const removeFromCart = (productId: string, size: string, color: string) => {
    setCart(prevCart => {
      const newCart = prevCart.filter(
        item => !(item.product._id === productId && item.size === size && item.color === color)
      )
      localStorage.setItem('cart', JSON.stringify(newCart))
      return newCart
    })
  }

  const updateQuantity = (productId: string, size: string, color: string, quantity: number) => {
    setCart(prevCart => {
      const newCart = prevCart.map(item =>
        item.product._id === productId && item.size === size && item.color === color
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
      localStorage.setItem('cart', JSON.stringify(newCart))
      return newCart
    })
  }

  const clearCart = () => {
    setCart([])
    localStorage.removeItem('cart')
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0)
  }

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice
  }
}
