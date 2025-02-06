import { create } from "zustand"
import toast from 'react-hot-toast'
import axios from "../lib/axios"


const useProducStore = create((set)=>({
    products:[],
    loading : false,

    setProducts:(products)=>{set({products})},

    createProduct: async (productData)=>{
        set({loading:true});
        try {
            const res = await axios.post("/products",productData);
            set((prevState)=>({
                products:[...prevState.products,res.data],
                loading:false
            }))
            toast.success(res.data.message);
            console.log(res.data);

        } catch (error) {
            toast.error(error.response.data.message);
            set({loading:false});
        }
    },
    fetchAllProducts:async ()=>{
        set({loading:true});
        try {
            const res = await axios.get("/products");
            set({products:res.data,loading:false})
            
            console.log(res.data);

        } catch (error) {
           set({error:"Failed to fetch all products",loading:false})
            toast.error(error.response.data.message);
        }
    },
    toggleFeaturedProduct: async(productId)=>{
        set({loading:true});
        try {
            const response = await axios.patch(`/products/${productId}`);

            set((prevState)=>({
                products:prevState.products.map((product)=>
                    product._id === productId ?{...product,isFeatured:response.data.isFeatured}:product
            ),
        loading:false,
            }))
        } catch (error) {
            set({loading:false});
            toast.error(error.response.data.message);
        }
    },
    deleteProduct: async(productId)=>{
        set({loading:true});
        try {
            const response = await axios.delete(`/products/${productId}`);
            set((prevState)=>({
                products:prevState.products.filter((product)=>
                    product._id !== productId
            ),
        loading:false,
       
            }))
            toast.success(response.data.message);
        } catch (error) {
            set({loading:false});
            toast.error(error.response.data.message);
        }
    },
    fetchProductsByCategory: async(category)=>{
        set({loading:true})
        try {
            const response = await axios.get(`/products/category/${category}`);
            set({products : response.data.products,loading:false});
            console.log(response.data);
            
        } catch (error) {
            set({error:"Failed to fetch products by category",loading:false});
            toast.error(error.response.data.message);
        }
    },
    fetchFeaturedProducts: async()=>{
        try {
            set({loading:true});
            const response = await axios.get("/products/featured");
            set({products:response.data,loading:false});
        
        } catch (error) {
            set({error:"Failed to fetch featured products",loading:false});
        }
    }
       
    

})) 
 


export default useProducStore