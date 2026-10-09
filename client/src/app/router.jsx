import { BrowserRouter, Route, Routes } from "react-router-dom";

import PublicLayout from "../shared/layouts/PublicLayout";
import MetaWrapper from "../shared/meta/MetaWrapper";
import { PAGE_TITLES } from "../shared/meta/pageTitles";

import HomePage from "../modules/home/pages/HomePage";
import ShopsPage from "../modules/shops/pages/ShopsPage";
import ShopDetailsPage from "../modules/shops/pages/ShopDetailsPage";
import AboutPage from "../modules/about/pages/AboutPage";
import ProductDetailsPage from "../modules/shops/pages/ProductDetailsPage";
import PublicProductsPage from "../modules/shops/pages/PublicProductsPage";

import ProtectedRoute from "../shared/components/ProtectedRoute";
import CartPage from "../modules/cart/pages/CartPage";
import CheckoutPage from "../modules/cart/pages/CheckoutPage";
import OrderSuccessPage from "../modules/cart/pages/OrderSuccessPage";
import ProfilePage from "../modules/user/MyProfile";
import Orders from "../modules/user/Orders";

import LoginPage from "../modules/auth/pages/LoginPage";
import SignupPage from "../modules/auth/pages/SignupPage";
import SellerLoginPage from "../modules/auth/pages/SellerLoginPage";
import SellerRegisterPage from "../modules/auth/pages/SellerRegisterPage";

import ContributionPage from "../shared/components/ContributionPage";
import PageNotFoundPage from "../shared/components/PageNotFoundPage";

import ProtectedAdminRoute from "../shared/components/ProtectedAdminRoute";
import AdminLoginPage from "../modules/admin/pages/AdminLoginPage";
import AdminDashboardPage from "../modules/admin/pages/AdminDashboardPage";

import ProtectedSellerRoute from "../shared/components/ProtectedSellerRoute";
import DashboardLayout from "../shared/layouts/DashboardLayout";
import DashboardHome from "../modules/dashboard/pages/dashboardhome/DashboardHome";
import ShopInfoPage from "../modules/dashboard/pages/ShopInfo/ShopInfoPage";
import ProductsPage from "../modules/dashboard/pages/products/ProductsPage";
import BulkProductUploadPage from "../modules/dashboard/pages/products/BulkProductUploadPage";
import OrdersPage from "../modules/dashboard/pages/orders/OrdersPage";
import CustomersPage from "../modules/dashboard/pages/customers/CustomersPage";
import ReviewsPage from "../modules/dashboard/pages/reviews/ReviewsPage";
import AnalyticsPage from "../modules/dashboard/pages/analytics/AnalyticsPage";
import SettingsPage from "../modules/dashboard/pages/settings/SettingsPage";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          {/* Home */}
          <Route
            path="/"
            element={
              <MetaWrapper title={PAGE_TITLES.HOME} element={<HomePage />} />
            }
          />

          {/* Shops */}
          <Route
            path="/shops"
            element={
              <MetaWrapper title={PAGE_TITLES.SHOPS} element={<ShopsPage />} />
            }
          />

          {/* Shop Details */}
          <Route
            path="/shops/:id"
            element={
              <MetaWrapper
                title={PAGE_TITLES.SHOP_DETAILS}
                element={<ShopDetailsPage />}
              />
            }
          />
          <Route
            path="/shops/:shopId/products/:productId"
            element={
              <MetaWrapper
                title={PAGE_TITLES.PRODUCT_DETAILS}
                element={<ProductDetailsPage />}
              />
            }
          />



          {/* Products */}
          <Route
            path="/products"
            element={
              <MetaWrapper
                title={PAGE_TITLES.PRODUCTS_PAGE}
                element={<PublicProductsPage />}
              />
            }
          />

          <Route
            path="/about"
            element={
              <MetaWrapper title={PAGE_TITLES.ABOUT} element={<AboutPage />} />
            }
          />
        </Route>

        {/* Proceted pages */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/cart"
            element={
              <MetaWrapper title={PAGE_TITLES.CART} element={<CartPage />} />
            }
          />
          <Route
            path="/checkout"
            element={
              <MetaWrapper
                title={PAGE_TITLES.CHECKOUT}
                element={<CheckoutPage />}
              />
            }
          />
          <Route
            path="/order-success"
            element={
              <MetaWrapper
                title={PAGE_TITLES.ORDER_SUCCESS}
                element={<OrderSuccessPage />}
              />
            }
          />
          <Route
            path="/profile"
            element={
              <MetaWrapper
                title={PAGE_TITLES.PROFILE}
                element={<ProfilePage />}
              />
            }
          />
          <Route
            path="/orders"
            element={
              <MetaWrapper title={PAGE_TITLES.ORDERS} element={<Orders />} />
            }
          />

          <Route
            path="/contribute"
            element={
              <MetaWrapper
                title={PAGE_TITLES.CONTRIBUTE}
                element={<ContributionPage />}
              />
            }
          />
        </Route>

        {/* Authentication */}
        <Route
          path="/login"
          element={
            <MetaWrapper title={PAGE_TITLES.LOGIN} element={<LoginPage />} />
          }
        />
        <Route
          path="/signup"
          element={
            <MetaWrapper title={PAGE_TITLES.SIGNUP} element={<SignupPage />} />
          }
        />
        <Route
          path="/seller/login"
          element={
            <MetaWrapper
              title={PAGE_TITLES.SELLER_LOGIN}
              element={<SellerLoginPage />}
            />
          }
        />
        <Route
          path="/seller/register"
          element={
            <MetaWrapper
              title={PAGE_TITLES.SELLER_REGISTER}
              element={<SellerRegisterPage />}
            />
          }
        />

        {/* Super Admin Authentication */}
        <Route
          path="/admin/login"
          element={
            <MetaWrapper
              title={PAGE_TITLES.ADMIN_LOGIN}
              element={<AdminLoginPage />}
            />
          }
        />

        {/* Super Admin Protected Dashboard */}
        <Route element={<ProtectedAdminRoute />}>
          <Route
            path="/admin"
            element={
              <MetaWrapper
                title={PAGE_TITLES.ADMIN_DASHBOARD}
                element={<AdminDashboardPage />}
              />
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <MetaWrapper
                title={PAGE_TITLES.ADMIN_DASHBOARD}
                element={<AdminDashboardPage />}
              />
            }
          />
        </Route>

        {/* Seller Dashboard */}
        <Route element={<ProtectedSellerRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route
              index
              element={
                <MetaWrapper
                  title={PAGE_TITLES.DASHBOARD}
                  element={<DashboardHome />}
                />
              }
            />
            <Route
              path="shop"
              element={
                <MetaWrapper
                  title={PAGE_TITLES.SHOP_INFO}
                  element={<ShopInfoPage />}
                />
              }
            />
            <Route
              path="products"
              element={
                <MetaWrapper
                  title={PAGE_TITLES.PRODUCTS}
                  element={<ProductsPage />}
                />
              }
            />
            <Route
              path="products/upload"
              element={
                <MetaWrapper
                  title={PAGE_TITLES.BULK_UPLOAD}
                  element={<BulkProductUploadPage />}
                />
              }
            />
            <Route
              path="orders"
              element={
                <MetaWrapper
                  title={PAGE_TITLES.ORDERS}
                  element={<OrdersPage />}
                />
              }
            />
            <Route
              path="customers"
              element={
                <MetaWrapper
                  title={PAGE_TITLES.CUSTOMERS}
                  element={<CustomersPage />}
                />
              }
            />
            <Route
              path="reviews"
              element={
                <MetaWrapper
                  title={PAGE_TITLES.REVIEWS}
                  element={<ReviewsPage />}
                />
              }
            />
            <Route
              path="analytics"
              element={
                <MetaWrapper
                  title={PAGE_TITLES.ANALYTICS}
                  element={<AnalyticsPage />}
                />
              }
            />
            <Route
              path="settings"
              element={
                <MetaWrapper
                  title={PAGE_TITLES.SETTINGS}
                  element={<SettingsPage />}
                />
              }
            />
          </Route>
        </Route>

        {/* 404 Not Found Page */}
        <Route
          path="*"
          element={
            <MetaWrapper
              title={PAGE_TITLES.NOT_FOUND}
              element={<PageNotFoundPage />}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
