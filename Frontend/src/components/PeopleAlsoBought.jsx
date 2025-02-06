import React from 'react'
import ProductCard from './ProductCard'
import { useState } from 'react'
import { useEffect } from 'react'
import axios from '../lib/axios'
import LoadingSpinner from './LoadingSpinner'

const PeopleAlsoBought = () => {
    const [recommended,setRecommended] = useState([])
    const[loading,setLoading] = useState(true);

    useEffect(()=>{
        const fetchRecommendations = async()=>{
            try {
            const res = await axios.get("/products/recommended");
            setRecommended(res.data);
            console.log(res.data);
            } catch (error) {
                toast.error(error.response.data.message);
            }finally{
                setLoading(false);
            }
        }
        fetchRecommendations();
    },[])
    if(loading){
        return <LoadingSpinner/>
    }
  return (
    <div className='mt-8'>
        <h3 className='text-2xl font-semibold text-emerald-400'>
            People Also Bought
        </h3>
        <div className='mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {recommended.map((product)=>(
            <ProductCard key={product.id} product={product} />
        ))}
        </div>
    </div>
  )
}

export default PeopleAlsoBought