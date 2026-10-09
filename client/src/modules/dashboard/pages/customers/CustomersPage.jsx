import { useEffect, useMemo, useState } from "react";

import CustomerFilters from "./components/CustomerFilters";
import CustomerTable from "./components/CustomerTable";
import CustomerDetailsModal from "./components/CustomerDetailsModal";

import { customerAPI } from "../../../../services/api";

function CustomersPage() {
  const [customers, setCustomers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await customerAPI.list();

      const data = response.data?.customers || [];

      setCustomers(
        data.map((customer) => ({
          ...customer,

          id: customer.id || customer._id,

          name: customer.name || "",
          email: customer.email || "",
          phone: customer.phone || "",

          totalOrders: Number(customer.totalOrders || 0),
          completedOrders: Number(customer.completedOrders || 0),
          cancelledOrders: Number(customer.cancelledOrders || 0),
          totalSpent: Number(customer.totalSpent || 0),

          lastOrderDate: customer.lastOrder || null,
          lastOrder: customer.lastOrder || null,

          status: customer.status || "Inactive",
        })),
      );
    } catch (err) {
      console.error("Customers load error:", err);

      setError(err.response?.data?.message || "Unable to load customers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const customersWithStatus = useMemo(() => {
    return customers.map((customer) => {
      if (!customer.lastOrderDate) {
        return {
          ...customer,
          status: "Inactive",
        };
      }

      const orderDate = new Date(customer.lastOrderDate);

      if (Number.isNaN(orderDate.getTime())) {
        return {
          ...customer,
          status: "Inactive",
        };
      }

      const days = (Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24);

      return {
        ...customer,
        status: days <= 30 ? "Active" : "Inactive",
      };
    });
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return customersWithStatus.filter((customer) => {
      const matchesSearch =
        !query ||
        customer.name?.toLowerCase().includes(query) ||
        customer.email?.toLowerCase().includes(query) ||
        customer.phone?.toLowerCase().includes(query) ||
        String(customer.id || "")
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "All" || customer.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [customersWithStatus, searchQuery, statusFilter]);

  const stats = {
    totalCustomers: customersWithStatus.length,

    activeCustomers: customersWithStatus.filter(
      (customer) => customer.status === "Active",
    ).length,

    inactiveCustomers: customersWithStatus.filter(
      (customer) => customer.status === "Inactive",
    ).length,

    newCustomers: customersWithStatus.filter(
      (customer) => customer.totalOrders === 1,
    ).length,
  };

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}

      <div>
        <h1 className="text-2xl font-bold text-[#022B3A]">Customers</h1>

        <p className="mt-1 text-sm text-[#64748B]">
          Manage and view customers who have placed orders with you.
        </p>
      </div>

      {/* ERROR */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {/* STATS */}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#DDE4E2] bg-white p-5">
          <p className="text-sm text-[#64748B]">Total Customers</p>

          <p className="mt-2 text-2xl font-bold text-[#022B3A]">
            {stats.totalCustomers}
          </p>
        </div>

        <div className="rounded-2xl border border-[#DDE4E2] bg-white p-5">
          <p className="text-sm text-[#64748B]">Active Customers</p>

          <p className="mt-2 text-2xl font-bold text-green-600">
            {stats.activeCustomers}
          </p>
        </div>

        <div className="rounded-2xl border border-[#DDE4E2] bg-white p-5">
          <p className="text-sm text-[#64748B]">Inactive Customers</p>

          <p className="mt-2 text-2xl font-bold text-gray-600">
            {stats.inactiveCustomers}
          </p>
        </div>

        <div className="rounded-2xl border border-[#DDE4E2] bg-white p-5">
          <p className="text-sm text-[#64748B]">New Customers</p>

          <p className="mt-2 text-2xl font-bold text-[#FF8C00]">
            {stats.newCustomers}
          </p>
        </div>
      </div>

      {/* FILTERS */}

      <CustomerFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {/* LOADING */}

      {loading ? (
        <div className="rounded-2xl border border-[#DDE4E2] bg-white p-10 text-center">
          <p className="text-sm font-medium text-[#64748B]">
            Loading customers...
          </p>
        </div>
      ) : (
        <CustomerTable
          customers={filteredCustomers}
          onViewCustomer={setSelectedCustomer}
        />
      )}

      {/* CUSTOMER DETAILS MODAL */}

      <CustomerDetailsModal
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />
    </div>
  );
}

export default CustomersPage;
