import { createContext, useContext, ReactNode, useState } from "react";
import { ShoppingCart } from "../components/ShoppingCart";
import { useLocalStorage } from "../hooks/useLocalStorage";

type ShoppingCartProviderProps = {
  children: ReactNode; // React children은 ReactNode
};

type CartItem = {
  // CartItem 타입 지정
  id: number;
  quantity: number;
};

type ShoppingCartContext = {
  // useContext를 통해서 사용할 함수 정의
  openCart: () => void;
  closeCart: () => void;
  getItemQuantity: (id: number) => number; // 숫자 반환
  increaseCartQuantity: (id: number) => void; // 아무거나 반환
  decreaseCartQuantity: (id: number) => void;
  removeFromCart: (id: number) => void;
  cartQuantity: number;
  cartItems: CartItem[];
};

const ShoppingCartContext = createContext({} as ShoppingCartContext);
// useContext사용을 위한 Context 생성
// Context의 value의 타입 지정 => as ShoppingCartContext

export function useShoppingCart() {
  return useContext(ShoppingCartContext);
}

export function ShoppingCartProvider({ children }: ShoppingCartProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [cartItems, setCartItems] = useLocalStorage<CartItem[]>(
    "shopping-cart",
    []
  ); // useState의 cartItems의 cartItem의 타입 지정
  const cartQuantity = cartItems.reduce(
    (quantity, item) => item.quantity + quantity,
    0
  ); // 기존 장바구니에 담기 아이템 갯수에다가 새로 추가한 아이템 갯수를 가산

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  function getItemQuantity(id: number) {
    return cartItems.find((item) => item.id === id)?.quantity || 0;
    // 장바구니에 item의 id와 주어진 id가 같을 경우 quantity나 0을 리턴
  }

  function increaseCartQuantity(id: number) {
    setCartItems((currItems) => {
      // 만약에 Cart에 현재 item이 없다면 하나 추가
      if (currItems.find((item) => item.id === id) == null) {
        return [...currItems, { id, quantity: 1 }];
        // 만약에 이미 item이 있으면 1증가
      } else {
        return currItems.map((item) => {
          if (item.id === id) {
            return { ...item, quantity: item.quantity + 1 };
          } else {
            return item;
          }
        });
      }
    });
  }

  function decreaseCartQuantity(id: number) {
    setCartItems((currItems) => {
      // 만약에 Cart에 현재 item의 quantity가 1개라면 item제거
      if (currItems.find((item) => item.id === id)?.quantity === 1) {
        return currItems.filter((item) => item.id !== id);
        // 만약에 이미 item이 있으면 1증가
      } else {
        return currItems.map((item) => {
          if (item.id === id) {
            return { ...item, quantity: item.quantity - 1 };
          } else {
            return item;
          }
        });
      }
    });
  }

  function removeFromCart(id: number) {
    setCartItems((currItems) => {
      return currItems.filter((item) => item.id !== id);
    });
  }

  return (
    <ShoppingCartContext.Provider
      value={{
        getItemQuantity,
        increaseCartQuantity,
        decreaseCartQuantity,
        removeFromCart,
        cartItems,
        cartQuantity,
        openCart,
        closeCart,
      }}
    >
      {children}
      <ShoppingCart isOpen={isOpen} />
    </ShoppingCartContext.Provider>
  );
}
