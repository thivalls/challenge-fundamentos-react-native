import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';
import { createPrinter } from 'typescript';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const loadproducts = await AsyncStorage.getItem('@GOMARKETPLACE');
      if (loadproducts) {
        setProducts(JSON.parse(loadproducts));
        // AsyncStorage.removeItem('@GOMARKETPLACE');
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const checkItem = products.find(item => {
        return item.id === product.id;
      });
      if (!checkItem) {
        setProducts([...products, { ...product, quantity: 1 }]);
      } else {
        setProducts(
          products.map(item => {
            if (item.id === product.id) {
              return {
                ...item,
                quantity: item.quantity + 1,
              };
            }
            return item;
          }),
        );
      }
      await AsyncStorage.setItem('@GOMARKETPLACE', JSON.stringify(products));
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      setProducts(
        products.map(product => {
          if (product.id === id) {
            return {
              ...product,
              quantity: product.quantity + 1,
            };
          }
          return product;
        }),
      );
      await AsyncStorage.setItem('@GOMARKETPLACE', JSON.stringify(products));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const checkLastItem = products.find(product => {
        return product.id === id;
      });

      if (checkLastItem && checkLastItem.quantity === 1) {
        setProducts(
          products.filter(product => {
            return product.id !== id;
          }),
        );
      } else {
        setProducts(
          products.map(product => {
            if (product.id === id) {
              return {
                ...product,
                quantity: product.quantity - 1,
              };
            }
            return product;
          }),
        );
      }
      await AsyncStorage.setItem('@GOMARKETPLACE', JSON.stringify(products));
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
