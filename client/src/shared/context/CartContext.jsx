import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

const CART_STORAGE_KEY = "shoplocal_cart";

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);

      return storedCart ? JSON.parse(storedCart) : [];
    } catch {
      return [];
    }
  });

  //--->>> SAVE CART

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (error) {
      console.error("Unable to save cart:", error);
    }
  }, [cartItems]);

  //-->>> ADD TO CART

  const addToCart = (product, shop, quantity = 1) => {
    if (!product?.available) return;

    const safeQuantity = Math.max(1, Number(quantity) || 1);

    setCartItems((previous) => {
      const existingItem = previous.find(
        (item) =>
          String(item.productId) === String(product.id) &&
          String(item.shopId) === String(shop.id),
      );

      if (existingItem) {
        return previous.map((item) =>
          String(item.productId) === String(product.id) &&
          String(item.shopId) === String(shop.id)
            ? {
                ...item,
                quantity: item.quantity + safeQuantity,
              }
            : item,
        );
      }

      return [
        ...previous,
        {
          id: `${shop.id}-${product.id}`,

          productId: product.id,

          shopId: shop.id,

          product,

          shop,

          quantity: safeQuantity,
        },
      ];
    });
  };

  //--->>> UPDATE QUANTITY

  const updateQuantity = (itemId, quantity) => {
    const safeQuantity = Number(quantity) || 0;

    if (safeQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCartItems((previous) =>
      previous.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity: safeQuantity,
            }
          : item,
      ),
    );
  };

  //--->>> REMOVE ITEM

  const removeFromCart = (itemId) => {
    setCartItems((previous) => previous.filter((item) => item.id !== itemId));
  };

  //--->>> CLEAR CART

  const clearCart = () => {
    setCartItems([]);
  };

  const subtotal = useMemo(
    () =>
      cartItems.reduce((total, item) => {
        const price = Number(item.product?.price) || 0;

        const quantity = Number(item.quantity) || 0;

        return total + price * quantity;
      }, 0),
    [cartItems],
  );

  //--->>> DISCOUNT

  const discount = useMemo(
    () =>
      cartItems.reduce((total, item) => {
        const price = Number(item.product?.price) || 0;

        const productDiscount = Number(item.product?.discount) || 0;

        const quantity = Number(item.quantity) || 0;

        const discountAmount = (price * productDiscount * quantity) / 100;

        return total + discountAmount;
      }, 0),
    [cartItems],
  );

  //--->>> TOTAL

  const total = useMemo(
    () => Math.round(subtotal - discount),
    [subtotal, discount],
  );

  //-->>> ITEM COUNT

  const itemCount = useMemo(
    () =>
      cartItems.reduce(
        (count, item) => count + (Number(item.quantity) || 0),
        0,
      ),
    [cartItems],
  );

  //--->>> CONTEXT VALUE

  const value = {
    cartItems,

    addToCart,

    updateQuantity,

    removeFromCart,

    clearCart,

    subtotal,

    discount,

    total,

    itemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

//--->>> HOOK

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
