import {create} from "zustand"
import toast from 'react-hot-toast'
import axios from "../lib/axios"

 export const useCartStore = create((set,get) => ({
    cart: [],
    coupon: null,
    total: 0,
    subtotal: 0,
    isCouponApplied: false,
    getMyCoupon: async()=>{
      try {
        const respose = await axios.get("/coupons");
        set({coupon:respose.data});
      } catch (error) {
        console.log("Error in fetching coupons: ",error);
      }  
    },
    applyCoupon: async(code)=>{
        try {
            const response = await axios.post("/coupons/validate",{code:code});
            set({coupon:response.data,isCouponApplied:true});
            get().calculateTotals();
            toast.success("Coupon applied successfully");
        } catch (error) {
            toast.error(error.response.data.message);
        }

    },

    removeCoupon: async()=>{
      set({coupon:null,isCouponApplied:false});
      get().calculateTotals();
      toast.success("Coupon removed successfully");  
    },
    getCartItems: async () => {
        set({ loading: true });
        try {
            const res = await axios.get("/cart");
            set({ cart: res.data });
            get().calculateTotals();
        } catch (err) {
            set({ cart:[] });
            toast.error(err.response.data.message);
        }
    },
    clearCart : async()=>{
        try {
            await axios.delete("/cart");
            set({cart:[],coupon:null ,total:0,subtotal:0});
        } catch (error) {
            console.log(error)
        }
    },
    addToCart : async(product)=>{
        try {
            await axios.post("/cart",{productId:product._id});
            toast.success("Product added to cart")

            set((prevState)=>{
                const existingItem = prevState.cart.find((item)=> item._id === product._id);
                
        
                const newCart = existingItem
                ? prevState.cart.map((item)=>
                    item._id === product._id ? {...item,quantity: item.quantity + 1}: item)
                
                    :[...prevState.cart,{...product,quantity:1}];
                    
                
                    return {cart : newCart};

                });

                console.log(get().cart);
                get().calculateTotals();
            
        } catch (error) {
            toast.error(error.response.data.message)
        }
    },
    removeFromCart: async(productId)=>{
        await axios.delete(`/cart/`,{data:{productId}});
       set((prevState)=>({
           cart: prevState.cart.filter((item)=> item._id !== productId)
           
       }))

       get().calculateTotals();
    },
    updateQuantity : async(productId,quantity)=>{
        try {
            if(quantity === 0){
                get().removeFromCart(productId);
                return;
            }
    
            await axios.put(`/cart/${productId}`,{quantity});
            set((prevState)=>({
                cart: prevState.cart.map((item)=>
                    item._id === productId ? {...item,quantity}: item
                )
            }));
            get().calculateTotals();
            
        } catch (error) {
            toast.error(error.response.data.message)
        }
    },
    calculateTotals: () => {
        try {
            const { cart, coupon } = get();
            
            // Ensure cart is an array
            if (!Array.isArray(cart)) {
                set({ subtotal: 0, total: 0 });
                return;
            }
    
            // Calculate subtotal using optional chaining to handle potential undefined values
            const subtotal = cart.reduce((sum, item) => {
                const price = Number(item?.price) || 0;
                const quantity = Number(item?.quantity) || 0;
                return sum + (price * quantity);
            }, 0);
    
            // Calculate total with discount if coupon exists
            let total = subtotal;
            if (coupon && typeof coupon.discountPercentage === 'number') {
                const discountPercentage = Math.min(Math.max(coupon.discountPercentage, 0), 100);
                const discount = (subtotal * discountPercentage) / 100;
                total = subtotal - discount;
            }
    
            // Round to 2 decimal places to avoid floating-point issues
            set({
                subtotal: Number(subtotal.toFixed(2)),
                total: Number(total.toFixed(2))
            });
        } catch (error) {
            console.error('Error calculating totals:', error);
            // Set safe default values in case of error
            set({ subtotal: 0, total: 0 });
        }
    }
 }))