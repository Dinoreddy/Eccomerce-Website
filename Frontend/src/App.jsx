import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import Navbar from "./components/Navbar";
import AdminPage from "./pages/AdminPage";
import { Toaster } from "react-hot-toast";
import { useUserStore } from "./stores/useUserStore";
import { useEffect } from "react";
import LoadingSpinner from "./components/LoadingSpinner";
import CategoryPage from "./pages/CategoryPage";
import CartPage from "./pages/CartPage";
import { useCartStore } from "./stores/useCartStore";
import PurchaseSuccessPage from "./pages/PurchaseSuccessPage";
import PurchaseCancelPage from "./pages/PurchaseCanclePage";

function App() {
  console.log("Current mode:", import.meta.env.MODE);

  const { user,checkAuth,checkingAuth } = useUserStore();
  const{getCartItems , total , subtotal} = useCartStore();

  useEffect(() => {
    
     checkAuth();
    
  }, [checkAuth]);


  useEffect(() => {
   if(!user) return;
   getCartItems();
    
  },[getCartItems,user]);

  
  
if(checkingAuth) return <LoadingSpinner/>
  return (
    <>
      <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.3)_0%,rgba(10,80,60,0.2)_45%,rgba(0,0,0,0.1)_100%)]" />
          </div>
        </div>

        <div className="relative z-50 pt-20">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />}></Route>
            <Route path="/login" element={!user?<LoginPage />:<Navigate to="/" />}></Route>
            <Route path="/signup" element={!user?<SignUpPage />:<Navigate to="/" />}></Route>
            <Route path="/admin-dashboard" element={user?.role==="Admin"?<AdminPage />:<Navigate to="/login" />}></Route>
            <Route path="/category/:category" element={<CategoryPage />}></Route>
            <Route path="/cart" element={user? <CartPage />:<Navigate to="/login" />}></Route>
            <Route path="/purchase-success" element={<PurchaseSuccessPage />}></Route>
            <Route path="/purchase-cancel" element={ <PurchaseCancelPage />}></Route>
          </Routes>
        </div>
      </div>
      <Toaster />
    </>
  );
}

export default App;
