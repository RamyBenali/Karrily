import { Navigation } from "../components/layout/navigation";
import { motion } from "motion/react";
import { Plus, Package, Calendar, TrendingUp, DollarSign, Edit2, Trash2, Eye, BarChart3 } from "lucide-react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const earningsData = [
  { month: "Jan", earnings: 1200 },
  { month: "Feb", earnings: 1800 },
  { month: "Mar", earnings: 2400 },
  { month: "Apr", earnings: 2100 },
  { month: "May", earnings: 2800 },
  { month: "Jun", earnings: 3200 },
];

const myListings = [
  {
    id: 1,
    title: "Modern Downtown Loft",
    image: "https://images.unsplash.com/photo-1638454668466-e8dbd5462f20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBtb2Rlcm4lMjBhcGFydG1lbnQlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NzE0MzkzODh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Real Estate",
    price: 450,
    period: "night",
    status: "Active",
    views: 1243,
    bookings: 12,
    rating: 4.9
  },
  {
    id: 3,
    title: "Professional Camera Kit",
    image: "https://images.unsplash.com/photo-1769699167687-540cce99f744?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBjYW1lcmElMjBlcXVpcG1lbnR8ZW58MXx8fHwxNzcxNDg2NjExfDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Electronics",
    price: 85,
    period: "day",
    status: "Active",
    views: 867,
    bookings: 24,
    rating: 4.8
  },
  {
    id: 4,
    title: "Designer Furniture Set",
    image: "https://images.unsplash.com/photo-1760716478137-d861d5b354e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ25lciUyMGZ1cm5pdHVyZSUyMGNoYWlyJTIwbW9kZXJufGVufDF8fHx8MTc3MTUwNTIyN3ww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "Furniture",
    price: 120,
    period: "week",
    status: "Active",
    views: 542,
    bookings: 8,
    rating: 4.7
  }
];

const upcomingBookings = [
  {
    id: 1,
    renterName: "Alice Johnson",
    item: "Modern Downtown Loft",
    startDate: "Feb 25, 2026",
    endDate: "Feb 28, 2026",
    earnings: 1350
  },
  {
    id: 2,
    renterName: "Bob Smith",
    item: "Professional Camera Kit",
    startDate: "Feb 27, 2026",
    endDate: "Mar 1, 2026",
    earnings: 255
  }
];

export function LenderDashboard() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<"overview" | "listings" | "bookings" | "earnings">("overview");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <div className="pt-24 pb-16">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4"
          >
            <div>
              <h1 className="text-5xl font-bold text-[#0F2A2E] mb-3">Lender Dashboard</h1>
              <p className="text-xl text-gray-600">Manage your listings and track your earnings</p>
            </div>
            <Button className="bg-[#FF4F5A] hover:bg-[#FF4F5A]/90 text-white px-6 h-12 rounded-full shadow-xl shadow-[#FF4F5A]/30 group">
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
              Add New Listing
            </Button>
          </motion.div>

          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-2 shadow-lg border border-gray-100 mb-8 inline-flex gap-2"
          >
            {[
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "listings", label: "My Listings", icon: Package },
              { id: "bookings", label: "Bookings", icon: Calendar },
              { id: "earnings", label: "Earnings", icon: DollarSign }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-medium transition-all ${
                  activeView === tab.id
                    ? "bg-[#0F2A2E] text-white shadow-lg"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </motion.div>

          {/* Overview */}
          {activeView === "overview" && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { 
                    label: "Total Earnings", 
                    value: "$12,450", 
                    change: "+18%", 
                    icon: DollarSign, 
                    color: "#FF4F5A",
                    bgGradient: "from-[#FF4F5A] to-[#FF6B74]"
                  },
                  { 
                    label: "Active Listings", 
                    value: "3", 
                    change: "+1", 
                    icon: Package, 
                    color: "#0F2A2E",
                    bgGradient: "from-[#0F2A2E] to-[#1A4851]"
                  },
                  { 
                    label: "Total Bookings", 
                    value: "44", 
                    change: "+12%", 
                    icon: Calendar, 
                    color: "#0F2A2E",
                    bgGradient: "from-[#0F2A2E] to-[#1A4851]"
                  },
                  { 
                    label: "Avg Rating", 
                    value: "4.8★", 
                    change: "+0.2", 
                    icon: TrendingUp, 
                    color: "#FF4F5A",
                    bgGradient: "from-[#FF4F5A] to-[#FF6B74]"
                  }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className={`bg-gradient-to-br ${stat.bgGradient} rounded-3xl p-6 text-white shadow-xl`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                        <stat.icon className="w-6 h-6" />
                      </div>
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-sm font-medium">
                        {stat.change}
                      </span>
                    </div>
                    <div className="text-4xl font-bold mb-1">{stat.value}</div>
                    <div className="text-white/80">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Earnings Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-[#0F2A2E] mb-1">Earnings Overview</h2>
                    <p className="text-gray-600">Your monthly earnings trend</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-[#0F2A2E] text-white rounded-full text-sm font-medium">
                      6 Months
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200">
                      1 Year
                    </button>
                  </div>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={earningsData}>
                      <defs>
                        <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF4F5A" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#FF4F5A" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="earnings" 
                        stroke="#FF4F5A" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorEarnings)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid md:grid-cols-2 gap-6"
              >
                <div className="bg-gradient-to-br from-[#0F2A2E] to-[#1A4851] rounded-3xl p-8 text-white">
                  <h3 className="text-2xl font-bold mb-3">Upcoming Bookings</h3>
                  <p className="text-white/80 mb-4">You have 2 bookings in the next week</p>
                  <Button
                    onClick={() => setActiveView("bookings")}
                    className="bg-white/20 hover:bg-white/30 text-white rounded-full backdrop-blur-md border border-white/30"
                  >
                    View All Bookings
                  </Button>
                </div>
                <div className="bg-gradient-to-br from-[#FF4F5A] to-[#FF6B74] rounded-3xl p-8 text-white">
                  <h3 className="text-2xl font-bold mb-3">Performance Tips</h3>
                  <p className="text-white/80 mb-4">Boost your visibility with better photos</p>
                  <Button className="bg-white/20 hover:bg-white/30 text-white rounded-full backdrop-blur-md border border-white/30">
                    Learn More
                  </Button>
                </div>
              </motion.div>
            </div>
          )}

          {/* My Listings */}
          {activeView === "listings" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100"
            >
              <h2 className="text-2xl font-bold text-[#0F2A2E] mb-6">My Listings</h2>
              <div className="space-y-4">
                {myListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="flex flex-col md:flex-row gap-6 p-6 bg-gray-50 rounded-3xl hover:shadow-lg transition-all group"
                  >
                    <div className="w-full md:w-56 h-40 rounded-2xl overflow-hidden flex-shrink-0">
                      <ImageWithFallback
                        src={listing.image}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <span className="inline-block px-3 py-1 bg-white text-gray-700 text-xs font-medium rounded-full mb-2">
                            {listing.category}
                          </span>
                          <h3 className="text-xl font-bold text-[#0F2A2E]">{listing.title}</h3>
                          <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-2xl font-bold text-[#0F2A2E]">${listing.price}</span>
                            <span className="text-gray-500">/ {listing.period}</span>
                          </div>
                        </div>
                        <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          {listing.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-gray-500">Views</div>
                          <div className="text-lg font-bold text-gray-900">{listing.views}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Bookings</div>
                          <div className="text-lg font-bold text-gray-900">{listing.bookings}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Rating</div>
                          <div className="text-lg font-bold text-gray-900">{listing.rating}★</div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button 
                          size="sm" 
                          onClick={() => navigate(`/item/${listing.id}`)}
                          className="bg-[#0F2A2E] hover:bg-[#1A4851] text-white rounded-full"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button size="sm" variant="outline" className="rounded-full">
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" className="rounded-full text-red-600 border-red-200 hover:bg-red-50">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Bookings */}
          {activeView === "bookings" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100"
            >
              <h2 className="text-2xl font-bold text-[#0F2A2E] mb-6">Upcoming Bookings</h2>
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 bg-gray-50 rounded-3xl"
                  >
                    <div className="flex-1 mb-4 md:mb-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-[#0F2A2E] rounded-full flex items-center justify-center text-white font-bold">
                          {booking.renterName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{booking.renterName}</h4>
                          <p className="text-sm text-gray-500">{booking.item}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 ml-15">
                        <Calendar className="w-4 h-4" />
                        <span>{booking.startDate} - {booking.endDate}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Earnings</div>
                        <div className="text-2xl font-bold text-[#0F2A2E]">${booking.earnings}</div>
                      </div>
                      <Button size="sm" className="bg-[#0F2A2E] hover:bg-[#1A4851] text-white rounded-full">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Earnings */}
          {activeView === "earnings" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                <h2 className="text-2xl font-bold text-[#0F2A2E] mb-6">Earnings Breakdown</h2>
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  {[
                    { label: "This Month", value: "$3,200", change: "+24%" },
                    { label: "Last Month", value: "$2,800", change: "+18%" },
                    { label: "All Time", value: "$12,450", change: "" }
                  ].map((stat) => (
                    <div key={stat.label} className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
                      <div className="text-sm text-gray-500 mb-1">{stat.label}</div>
                      <div className="flex items-baseline gap-2">
                        <div className="text-3xl font-bold text-[#0F2A2E]">{stat.value}</div>
                        {stat.change && (
                          <span className="text-sm font-medium text-green-600">{stat.change}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <h3 className="text-xl font-bold text-[#0F2A2E] mb-4">Recent Transactions</h3>
                <div className="space-y-3">
                  {[
                    { date: "Feb 19, 2026", item: "Modern Downtown Loft", amount: 450, status: "Completed" },
                    { date: "Feb 18, 2026", item: "Professional Camera Kit", amount: 85, status: "Completed" },
                    { date: "Feb 15, 2026", item: "Designer Furniture Set", amount: 120, status: "Completed" }
                  ].map((transaction, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                      <div>
                        <div className="font-semibold text-gray-900">{transaction.item}</div>
                        <div className="text-sm text-gray-500">{transaction.date}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          {transaction.status}
                        </span>
                        <div className="text-xl font-bold text-[#0F2A2E]">+${transaction.amount}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
