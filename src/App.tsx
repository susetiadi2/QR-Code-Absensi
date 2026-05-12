/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  LogIn, Users, QrCode, FileSpreadsheet, LogOut, Download, Upload, UserPlus, CheckCircle2,
  Home, GraduationCap, Presentation, ClipboardList, CalendarCheck, ScanLine, 
  Menu, Bell, Clock, RefreshCw, Check, BedDouble, Send, X, Zap, BarChart3, FileText, Calendar,
  Plus, Search, Eye, Edit2, Trash2, IdCard, UserCircle2, MapPin, Phone, AlertCircle, Printer, Save
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import QrScanner from './components/QrScanner';
import { User, AbsensiRecord } from './types';
import { QRCodeSVG } from 'qrcode.react';
import Papa from 'papaparse';

// ==========================================
// GOOGLE APPS SCRIPT WEB APP URL
// ==========================================
// Ini adalah link url web app yang telah di-deploy dari Google Apps Script.
export const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwayToxlPftJ6QVGOG97_6n4eDsstfY2nQQ-jEQiYwgDUcqU3UjmsOwWaCcdZ6wYT1NZw/exec";

// ==========================================
// MOCK DATA & STATE (SaaS Simulation)
// ==========================================
// In production, this communicates with the Google Apps Script REST API via fetch/axios.

function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('absensiUser');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('absensiUser', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('absensiUser');
  };

  return { user, login, logout };
}

// ==========================================
// PAGES
// ==========================================

const LoginPage = ({ onLogin }: { onLogin: (u: User) => void }) => {
  const [role, setRole] = useState<'siswa' | 'guru' | 'admin'>('siswa');
  const [nis, setNis] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [schoolId, setSchoolId] = useState('CLI-1001'); // SAAS Client ID
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Simulate/Hit App Script API call
      // Because Google Apps Script requires CORS setup which is complex, we simulate it here or use text/plain
      const response = await fetch(GAS_WEB_APP_URL, {
        method: "POST",
        // Using text/plain to avoid preflight (OPTIONS) request issues with GAS
        headers: {
          "Content-Type": "text/plain",
        },
        body: JSON.stringify({
          action: "LOGIN",
          clientDbId: schoolId,
          username: role === 'siswa' ? nis : username,
          password: password,
          role: role
        }),
      });

      const result = await response.json();
      console.log("Response dari GAS:", result);
      
      let loggedUser: User | null = null;

      if (role === 'siswa' && nis) {
        loggedUser = { id: `s-${nis}`, role: 'siswa', name: 'Siswa Percobaan', nis, sekolah: schoolId };
      } else if ((role === 'guru' || role === 'admin') && username && password) {
        loggedUser = { id: `g-${username}`, role, name: role === 'admin' ? 'Administrator' : 'Bapak/Ibu Guru', username, sekolah: schoolId };
      }

      if (loggedUser) {
        onLogin(loggedUser);
        navigate('/dashboard');
      } else {
        alert("Masukkan kredensial yang valid!");
      }
    } catch (err) {
      console.error("Gagal melakukan login:", err);
      alert("Terjadi kesalahan saat menghubungi server.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-indigo-600 p-6 text-center">
          <QrCode className="w-12 h-12 text-white mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-white">Sistem Absensi SAAS</h1>
          <p className="text-indigo-100 text-sm mt-1">Gunakan kode perusahaan/sekolah Anda</p>
        </div>

        <div className="p-6">
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            {(['siswa', 'guru', 'admin'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 py-2 text-sm font-medium rounded-md capitalize transition-colors ${
                  role === r ? 'bg-white text-indigo-600 shadow' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client ID (Kode Sekolah)</label>
              <input
                type="text"
                value={schoolId}
                onChange={(e) => setSchoolId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                placeholder="Misal: CLI-1001"
                required
              />
            </div>

            {role === 'siswa' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Induk Siswa (NIS)</label>
                <input
                  type="text"
                  value={nis}
                  onChange={(e) => setNis(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  placeholder="Masukkan 10 digit NIS"
                  required
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    placeholder="Masukkan username"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white font-medium py-2.5 rounded-lg hover:bg-indigo-700 transition"
            >
              Masuk
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// --- SISWA DASHBOARD ---
const SiswaDashboard = ({ user }: { user: User }) => {
  const [scannedData, setScannedData] = useState<string | null>(null);

  const handleScan = (data: string) => {
    setScannedData(data);
    // Here we would call the Google Apps Script doPost API to persist attendance
    alert(`Berhasil merekam kehadiran untuk Guru/Sesi: ${data}`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">Halo, {user.name}</h2>
        <p className="text-gray-500 text-sm mt-1">NIS: {user.nis}</p>
        
        <div className="mt-6 flex flex-col items-center">
          <p className="text-sm font-medium text-gray-600 mb-4">Pindai QR Code Guru untuk Absen Kehadiran</p>
          <div className="w-full max-w-sm">
            {scannedData ? (
              <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex items-center flex-col justify-center gap-2">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
                <p className="font-semibold">Absensi Berhasil!</p>
                <p className="text-xs text-green-600 text-center mt-1">Data dikirim ke Google Sheets (Sesi: {scannedData})</p>
                <button onClick={() => setScannedData(null)} className="mt-4 text-sm underline text-green-700 font-medium">Batal / Pindai Lagi</button>
              </div>
            ) : (
              <QrScanner onScanSuccess={handleScan} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- GURU DASHBOARD ---
const GuruDashboard = ({ user }: { user: User }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
            <QrCode className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">QR Code Kelas Hari Ini</h3>
          <p className="text-sm text-gray-500 mt-2 mb-4">Tampilkan QR Code ini menggunakan proyektor atau layar agar dipindai oleh Siswa.</p>
          <div className="p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 w-48 h-48 flex items-center justify-center">
            {/* Simulasi Gambar QR Code */}
            <span className="text-xs text-gray-400">QR_SESI_MATEMATIKA_01</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Riwayat Kehadiran (Live)</h3>
            <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Waktu</th>
                  <th className="px-4 py-3">NIS</th>
                  <th className="px-4 py-3">Nama</th>
                  <th className="px-4 py-3 rounded-tr-lg">Status</th>
                </tr>
              </thead>
              <tbody>
                {/* Mock Data */}
                {[
                  { time: '07:15', nis: '1001', name: 'Andi Saputra', status: 'Hadir' },
                  { time: '07:18', nis: '1002', name: 'Budi Santoso', status: 'Hadir' },
                ].map((row, i) => (
                  <tr key={i} className="border-b last:border-0 border-gray-50">
                    <td className="px-4 py-3">{row.time}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{row.nis}</td>
                    <td className="px-4 py-3">{row.name}</td>
                    <td className="px-4 py-3">
                      <span className="bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full text-xs font-medium">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- ADMIN DASHBOARD ---
const AdminDashboard = ({ user }: { user: User }) => {
  const chartData = [
    { name: '', value: 1.0 },
    { name: '', value: 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard Admin</h2>
          <p className="text-gray-500 text-sm mt-1">Pusat kontrol data absensi sekolah.</p>
        </div>
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          <div className="flex items-center gap-2 bg-white px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 font-medium shadow-sm">
            <Clock className="w-4 h-4 text-gray-500" />
            Senin, 11 Mei 2026
          </div>
          <button className="flex items-center gap-2 bg-[#4f46e5] hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition">
            <RefreshCw className="w-4 h-4" />
            Refresh Data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden flex flex-col">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-50 bg-opacity-50 rounded-full" />
          <div className="flex justify-between items-start mb-4 z-10 w-full">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">TOTAL SISWA</h3>
            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 ml-auto">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-auto z-10">
            <span className="text-3xl font-bold text-gray-800">1</span>
          </div>
        </div>
        {/* Card 2 */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden flex flex-col">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-green-50 bg-opacity-50 rounded-full" />
          <div className="flex justify-between items-start mb-4 z-10 w-full">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">HADIR</h3>
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center text-green-600 ml-auto">
              <Check className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-auto z-10">
            <span className="text-3xl font-bold text-gray-800">0</span>
          </div>
        </div>
        {/* Card 3 */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden flex flex-col">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-yellow-50 bg-opacity-50 rounded-full" />
          <div className="flex justify-between items-start mb-4 z-10 w-full">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">SAKIT</h3>
            <div className="w-8 h-8 bg-yellow-50 rounded-lg flex items-center justify-center text-yellow-600 ml-auto">
              <BedDouble className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-auto z-10">
            <span className="text-3xl font-bold text-gray-800">1</span>
          </div>
        </div>
        {/* Card 4 */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden flex flex-col">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-50 bg-opacity-50 rounded-full" />
          <div className="flex justify-between items-start mb-4 z-10 w-full">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">IZIN</h3>
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500 ml-auto">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-auto z-10">
            <span className="text-3xl font-bold text-gray-800">0</span>
          </div>
        </div>
        {/* Card 5 */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden flex flex-col">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-red-50 bg-opacity-50 rounded-full" />
          <div className="flex justify-between items-start mb-4 z-10 w-full">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">ALPA</h3>
            <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center text-red-500 ml-auto">
              <X className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-auto z-10">
            <span className="text-3xl font-bold text-gray-800">0</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-[#4f46e5]" />
            <h3 className="text-[15px] font-bold text-gray-800">Grafik Statistik Kehadiran</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} ticks={[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]} tick={{fontSize: 12, fill: '#888'}} domain={[0, 1.0]} />
                <Bar dataKey="value" fill="#eab308" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h3 className="text-[15px] font-bold text-gray-800">Akses Cepat</h3>
          </div>
          
          <div className="space-y-3">
            {[
              { icon: <ScanLine className="w-5 h-5 text-[#4f46e5]" />, title: 'Scan Absensi', desc: 'Mode scanner kamera', bg: 'bg-indigo-50' },
              { icon: <GraduationCap className="w-5 h-5 text-blue-600" />, title: 'Data Siswa', desc: 'Kelola database siswa', bg: 'bg-blue-50' },
              { icon: <FileText className="w-5 h-5 text-green-600" />, title: 'Laporan', desc: 'Export & rekap data', bg: 'bg-green-50' },
              { icon: <Calendar className="w-5 h-5 text-pink-600" />, title: 'Hari Libur', desc: 'Setting tanggal merah', bg: 'bg-pink-50' }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition cursor-pointer group">
                <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-gray-800 mb-0.5">{item.title}</h4>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


// ==========================================
// MAIN LAYOUT & ROUTER
// ==========================================

const DummyView = ({ title }: { title: string }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center min-h-[400px]">
    <h2 className="text-2xl font-bold text-gray-400">{title} (Segera Hadir)</h2>
  </div>
);

const AdminDataSiswa = () => {
  const [activeModal, setActiveModal] = useState<'view' | 'edit' | 'delete' | 'qr' | null>(null);

  const closeModal = () => setActiveModal(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:space-y-0">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden print:hidden">
        {/* Header Section */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-[15px] font-bold text-gray-800">Direktori Siswa</h3>
          <div className="flex gap-2">
            <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button className="bg-[#4f46e5] hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Tambah
            </button>
          </div>
        </div>

        {/* Filter Section */}
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 font-medium tracking-wide">Show</span>
              <select className="border border-gray-200 outline-none focus:border-indigo-500 rounded-lg px-3 py-2 text-sm text-gray-700 w-20 appearance-none bg-white font-medium">
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
            </div>
            <select className="border border-gray-200 outline-none focus:border-indigo-500 rounded-lg px-4 py-2 text-sm text-gray-700 appearance-none bg-white font-medium w-40">
              <option>Semua Kelas</option>
              <option>Kelas VI B</option>
            </select>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Cari Nama / NISN..." 
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-full sm:w-64 outline-none focus:border-indigo-500 font-medium placeholder-gray-400 text-gray-700"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400 w-16">No</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">Nama</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">NISN</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">Kelas</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400 w-48 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                <td className="px-6 py-4 text-sm text-gray-500">1</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold shrink-0">
                      A
                    </div>
                    <span className="font-bold text-gray-800 text-[13px]">Ahmad Rizki</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-[13px] text-gray-500 font-medium">1234567890</td>
                <td className="px-6 py-4">
                  <span className="bg-blue-50 text-blue-600 text-[11px] font-bold px-2.5 py-1 rounded-md tracking-wide">
                    Kelas VI B
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => setActiveModal('view')} className="w-8 h-8 rounded bg-teal-50 text-teal-500 flex items-center justify-center hover:bg-teal-100 transition">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => setActiveModal('edit')} className="w-8 h-8 rounded bg-orange-50 text-orange-500 flex items-center justify-center hover:bg-orange-100 transition">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setActiveModal('delete')} className="w-8 h-8 rounded bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setActiveModal('qr')} className="w-8 h-8 rounded bg-indigo-50 text-indigo-500 flex items-center justify-center hover:bg-indigo-100 transition">
                      <QrCode className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer/Pagination */}
        <div className="p-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 font-medium">Menampilkan 1 - 1 dari 1 data</p>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-400 font-medium cursor-not-allowed">Prev</button>
            <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-400 font-medium cursor-not-allowed">Next</button>
          </div>
        </div>

      </div>

      {/* Detail Modal */}
      {activeModal === 'view' && (
        <div className="fixed inset-0 bg-gray-900/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-xl animate-in fade-in zoom-in duration-200">
            <div className="bg-[#0f9d58] p-6 relative">
              <button onClick={closeModal} className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center text-white transition">
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full border-2 border-white/30 flex items-center justify-center text-white text-2xl font-bold bg-white/10 shrink-0">
                  A
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white leading-tight">Ahmad Rizki</h2>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex items-center gap-1.5 text-white/90 text-sm font-medium">
                      <IdCard className="w-4 h-4 opacity-80" />
                      1234567890
                    </div>
                    <span className="bg-white/20 text-white text-[11px] font-bold px-2 py-0.5 rounded backdrop-blur-sm">Kelas VI B</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-6 h-[400px] overflow-y-auto">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <UserCircle2 className="w-5 h-5 text-[#0f9d58]" />
                  <h3 className="font-bold text-[#0f9d58]">Data Pribadi</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-1.5 mb-1 opacity-60">
                      <Users className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold tracking-wider">JENIS KELAMIN</span>
                    </div>
                    <p className="font-bold text-gray-800 text-[15px]">Laki-laki</p>
                  </div>
                  <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-1.5 mb-1 opacity-60">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold tracking-wider">TANGGAL LAHIR</span>
                    </div>
                    <p className="font-bold text-gray-800 text-[15px]">2008-05-15</p>
                  </div>
                  <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-1.5 mb-1 opacity-60">
                      <UserPlus className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold tracking-wider">AGAMA</span>
                    </div>
                    <p className="font-bold text-gray-800 text-[15px]">Islam</p>
                  </div>
                  <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-1.5 mb-1 opacity-60">
                      <Phone className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold tracking-wider">NO. HANDPHONE</span>
                    </div>
                    <p className="font-bold text-gray-800 text-[15px]">81234567890</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-[#0f9d58]" />
                  <h3 className="font-bold text-[#0f9d58]">Data Orang Tua</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-1.5 mb-1 opacity-60">
                      <UserCircle2 className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold tracking-wider">NAMA AYAH</span>
                    </div>
                    <p className="font-bold text-gray-800 text-[15px]">Budi Santoso</p>
                  </div>
                  <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-1.5 mb-1 opacity-60">
                      <UserCircle2 className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold tracking-wider">NAMA IBU</span>
                    </div>
                    <p className="font-bold text-gray-800 text-[15px]">Siti Aminah</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-5 h-5 text-[#0f9d58]" />
                  <h3 className="font-bold text-[#0f9d58]">Alamat Lengkap</h3>
                </div>
                <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-100 flex items-center gap-3">
                  <Home className="w-5 h-5 text-gray-400 shrink-0" />
                  <p className="font-medium text-gray-700 text-sm">Jl. Merdeka No. 10, Bengkulu</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#fef3c7] text-[#92400e] font-bold text-sm tracking-wide hover:bg-[#fde68a] transition">
                <Edit2 className="w-4 h-4" />
                Edit Data
              </button>
              <button onClick={closeModal} className="px-5 py-2 rounded-lg bg-gray-200 text-gray-800 font-bold text-sm tracking-wide hover:bg-gray-300 transition">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {activeModal === 'edit' && (
        <div className="fixed inset-0 bg-gray-900/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
              <h2 className="text-xl font-bold text-gray-800">Edit Data Siswa</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4 bg-white flex-1">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 tracking-wider mb-1.5 uppercase">Nama Lengkap</label>
                <input type="text" defaultValue="Ahmad Rizki" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-indigo-500 font-medium text-gray-800" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 tracking-wider mb-1.5 uppercase">NISN</label>
                  <input type="text" defaultValue="1234567890" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-indigo-500 font-medium text-gray-800" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 tracking-wider mb-1.5 uppercase">Kelas</label>
                  <input type="text" defaultValue="Kelas VI B" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-indigo-500 font-medium text-gray-800" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 tracking-wider mb-1.5 uppercase">Jenis Kelamin</label>
                  <select className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-indigo-500 font-medium text-gray-800 appearance-none bg-white">
                    <option>Laki-laki</option>
                    <option>Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 tracking-wider mb-1.5 uppercase">Tanggal Lahir</label>
                  <input type="date" defaultValue="2008-05-15" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-indigo-500 font-medium text-gray-800" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 tracking-wider mb-1.5 uppercase">Agama</label>
                  <select className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-indigo-500 font-medium text-gray-800 appearance-none bg-white">
                    <option>Islam</option>
                    <option>Kristen</option>
                    <option>Katolik</option>
                    <option>Hindu</option>
                    <option>Buddha</option>
                    <option>Konghucu</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 tracking-wider mb-1.5 uppercase">Nama Ayah</label>
                  <input type="text" defaultValue="Budi Santoso" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-indigo-500 font-medium text-gray-800 bg-white" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 tracking-wider mb-1.5 uppercase">Nama Ibu</label>
                  <input type="text" defaultValue="Siti Aminah" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-indigo-500 font-medium text-gray-800 bg-white" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 tracking-wider mb-1.5 uppercase">No. Handphone</label>
                  <input type="text" defaultValue="81234567890" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-indigo-500 font-medium text-gray-800 bg-white" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 tracking-wider mb-1.5 uppercase">Alamat Lengkap</label>
                <textarea rows={3} defaultValue="Jl. Merdeka No. 10, Bengkulu" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-indigo-500 font-medium text-gray-800 resize-none"></textarea>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-white flex justify-end gap-3 shrink-0">
              <button onClick={closeModal} className="px-5 py-2.5 text-gray-500 font-bold text-sm hover:text-gray-700 transition">
                Batal
              </button>
              <button className="px-6 py-2.5 rounded-lg bg-[#4f46e5] text-white font-bold text-sm tracking-wide hover:bg-indigo-700 transition shadow-sm shadow-indigo-500/30">
                Simpan Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {activeModal === 'delete' && (
        <div className="fixed inset-0 bg-gray-900/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-in fade-in zoom-in duration-200 p-6 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full border-4 border-orange-200 flex items-center justify-center mb-5">
              <span className="text-4xl font-black text-orange-300">!</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Apakah Anda yakin?</h2>
            <p className="text-gray-500 text-[15px] leading-relaxed mb-6">
              Data siswa "Ahmad Rizki" akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan!
            </p>
            <div className="flex items-center justify-center gap-3 w-full">
              <button onClick={closeModal} className="w-full py-2.5 rounded border border-gray-300 bg-gray-500 text-white font-bold hover:bg-gray-600 transition">
                Batal
              </button>
              <button className="w-full py-2.5 rounded bg-red-500 text-white font-bold hover:bg-red-600 transition">
                Ya, Hapus!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code / Kartu Pelajar Modal */}
      {activeModal === 'qr' && (
        <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4 print:absolute print:inset-0 print:bg-white print:items-start print:justify-center print:pt-16 print:p-0">
          <div className="bg-[#f8f9fa] rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in duration-200 print:shadow-none print:border print:border-gray-200 print:m-0">
            <div id="kartu-pelajar" className="bg-[#f8f9fa] print:bg-white">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 flex flex-col items-center text-center">
                <h2 className="text-2xl font-black text-white tracking-widest mb-1 shadow-sm">KARTU PELAJAR</h2>
                <p className="text-[9px] text-white/90 font-bold tracking-[0.2em] uppercase">Sekolah Negeri Bengkulu</p>
              </div>
              
              <div className="p-8 flex flex-col items-center">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 w-48 h-48 flex flex-col items-center justify-center text-center">
                   {/* Real QR Code */}
                   <QRCodeSVG value="1234567890" size={168} level={"H"} includeMargin={false} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-1">Ahmad Rizki</h3>
                <p className="text-indigo-600 font-bold mb-4 tracking-wider text-[15px]">1234567890</p>
                <div className="bg-gray-200/60 px-4 py-1.5 rounded-full">
                  <span className="text-sm font-bold text-gray-700">Kelas VI B</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border-t border-gray-100 flex gap-3 print:hidden">
              <button 
                onClick={handlePrint} 
                className="flex-1 rounded-xl bg-[#1a1b2e] text-white font-bold py-3 text-sm flex items-center justify-center gap-2 hover:bg-gray-900 transition"
              >
                <Printer className="w-4 h-4" />
                Cetak
              </button>
              <button onClick={closeModal} className="flex-1 rounded-xl border border-gray-200 bg-white text-gray-700 font-bold py-3 text-sm hover:bg-gray-50 transition">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminDataGuru = () => {
  const [activeModal, setActiveModal] = useState<'add' | 'edit' | 'delete' | 'view' | null>(null);

  const closeModal = () => setActiveModal(null);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header Section */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-[15px] font-bold text-gray-800">Manajemen Guru</h3>
          <div className="flex gap-2">
            <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setActiveModal('add')}
              className="bg-[#a855f7] hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Tambah
            </button>
          </div>
        </div>

        {/* Filter Section */}
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 font-medium tracking-wide">Show</span>
              <select className="border border-gray-200 outline-none focus:border-purple-500 rounded-lg px-3 py-2 text-sm text-gray-700 w-20 appearance-none bg-white font-medium">
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
            </div>
            <select className="border border-gray-200 outline-none focus:border-purple-500 rounded-lg px-4 py-2 text-sm text-gray-700 appearance-none bg-white font-medium w-40">
              <option>Semua Kelas</option>
              <option>Kelas VI B</option>
            </select>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Cari Username..." 
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-full sm:w-64 outline-none focus:border-purple-500 font-medium placeholder-gray-400 text-gray-700"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400 w-16">No</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">Username</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">Wali Kelas</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">Password</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400 w-36 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                <td className="px-6 py-4 text-sm text-gray-500">1</td>
                <td className="px-6 py-4">
                  <span className="font-bold text-gray-800 text-[14px]">guru1</span>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-purple-50 text-purple-600 text-[11px] font-bold px-3 py-1.5 rounded-md tracking-wide">
                    Kelas VI B
                  </span>
                </td>
                 <td className="px-6 py-4 text-[15px] text-gray-400 font-black tracking-widest">
                  ••••••••
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => setActiveModal('view')} className="w-8 h-8 rounded bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-100 transition">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => setActiveModal('edit')} className="w-8 h-8 rounded bg-yellow-50 text-yellow-500 flex items-center justify-center hover:bg-yellow-100 transition">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setActiveModal('delete')} className="w-8 h-8 rounded bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer/Pagination */}
        <div className="p-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 font-medium">Menampilkan 1 - 1 dari 1 data</p>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-400 font-medium cursor-not-allowed">Prev</button>
            <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-400 font-medium cursor-not-allowed">Next</button>
          </div>
        </div>

      </div>

      {/* Edit/Add Modal */}
      {(activeModal === 'edit' || activeModal === 'add') && (
        <div className="fixed inset-0 bg-gray-900/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
              <h2 className="text-lg font-bold text-gray-800">{activeModal === 'edit' ? 'Edit Data Guru' : 'Tambah Guru'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4 bg-white flex-1">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 tracking-wider mb-1.5 uppercase">Username</label>
                <input type="text" defaultValue={activeModal === 'edit' ? "guru1" : ""} placeholder="Masukkan Username..." className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-purple-500 font-medium text-gray-800" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 tracking-wider mb-1.5 uppercase">Wali Kelas</label>
                  <select className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-purple-500 font-medium text-gray-800 appearance-none bg-white">
                    <option disabled={activeModal === 'add' ? true : false} selected={activeModal === 'add'}>- Pilih -</option>
                    <option selected={activeModal === 'edit'}>Kelas VI B</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 tracking-wider mb-1.5 uppercase">Password</label>
                  <input type="password" defaultValue={activeModal === 'edit' ? "12345678" : ""} placeholder="Masukkan Password..." className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-purple-500 font-medium text-gray-800" />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-white flex justify-end gap-3 shrink-0">
              <button onClick={closeModal} className="px-5 py-2.5 text-gray-500 font-bold text-sm hover:text-gray-700 transition">
                Batal
              </button>
              <button className="px-6 py-2.5 rounded-lg bg-[#a855f7] text-white font-bold text-sm tracking-wide hover:bg-purple-600 transition shadow-sm shadow-purple-500/30">
                Simpan Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {activeModal === 'delete' && (
        <div className="fixed inset-0 bg-gray-900/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-in fade-in zoom-in duration-200 p-6 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full border-4 border-orange-200 flex items-center justify-center mb-5">
              <span className="text-4xl font-black text-orange-300">!</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Apakah Anda yakin?</h2>
            <p className="text-gray-500 text-[15px] leading-relaxed mb-6">
              Data guru "guru1" akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan!
            </p>
            <div className="flex items-center justify-center gap-3 w-full">
              <button onClick={closeModal} className="w-full py-2.5 rounded border border-gray-300 bg-gray-500 text-white font-bold hover:bg-gray-600 transition">
                Batal
              </button>
              <button className="w-full py-2.5 rounded bg-red-500 text-white font-bold hover:bg-red-600 transition">
                Ya, Hapus!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {activeModal === 'view' && (
        <div className="fixed inset-0 bg-gray-900/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-blue-50 shrink-0">
              <h2 className="text-lg font-bold text-blue-800 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Detail Guru
              </h2>
              <button onClick={closeModal} className="text-blue-400 hover:text-blue-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 bg-white flex-1">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 tracking-wider mb-1 uppercase">Username</label>
                <div className="font-bold text-gray-800 text-[15px]">guru1</div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 tracking-wider mb-1 uppercase">Wali Kelas</label>
                <div className="font-medium text-gray-700">Kelas VI B</div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 tracking-wider mb-1 uppercase">Password</label>
                <div className="font-mono bg-gray-50 px-3 py-2 rounded-lg text-gray-700 tracking-wider border border-gray-100">password123</div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-white flex justify-end shrink-0">
              <button onClick={closeModal} className="px-6 py-2.5 rounded-lg bg-blue-500 text-white font-bold text-sm tracking-wide hover:bg-blue-600 transition shadow-sm">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminLaporan = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [kelas, setKelas] = useState('Semua Kelas');
  const [isSearched, setIsSearched] = useState(false);

  const handleSearch = () => {
    if (startDate && endDate) {
      setIsSearched(true);
    }
  };

  const handleExport = () => {
    if (!isSearched) return;
    
    const dataToExport = [
      { Tanggal: '11 Mei 2026', NIS: '1001', Nama: 'Ahmad Rizki', Kelas: 'Kelas VI B', Status: 'Hadir' },
      { Tanggal: '11 Mei 2026', NIS: '1002', Nama: 'Budi Santoso', Kelas: 'Kelas VI B', Status: 'Sakit' },
    ];
    
    import('xlsx').then(XLSX => {
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Kehadiran");
      XLSX.writeFile(wb, "Laporan_Kehadiran.xlsx");
    });
  };

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col flex-1 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex-shrink-0">
          <h3 className="text-[17px] font-bold text-gray-800 mb-1">Laporan Kehadiran</h3>
          <p className="text-gray-500 text-[13px] font-medium">Rekap data absensi siswa berdasarkan periode.</p>
        </div>

        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row items-end gap-6 flex-shrink-0">
          <div className="flex-1 w-full">
            <label className="block text-[11px] font-bold text-gray-500 tracking-wider mb-2 uppercase">Dari Tanggal</label>
            <div className="relative">
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#4f46e5] font-medium text-gray-700 bg-white"
              />
            </div>
          </div>
          <div className="flex-1 w-full">
            <label className="block text-[11px] font-bold text-gray-500 tracking-wider mb-2 uppercase">Sampai Tanggal</label>
            <div className="relative">
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#4f46e5] font-medium text-gray-700 bg-white"
              />
            </div>
          </div>
          <div className="flex-1 w-full">
            <label className="block text-[11px] font-bold text-gray-500 tracking-wider mb-2 uppercase">Filter Kelas</label>
            <select 
              value={kelas}
              onChange={(e) => setKelas(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#4f46e5] font-medium text-gray-700 bg-white appearance-none"
            >
              <option>Semua Kelas</option>
              <option>Kelas VI A</option>
              <option>Kelas VI B</option>
            </select>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
            <button 
              onClick={handleSearch}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#4f46e5] hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-sm transition"
            >
              <Search className="w-4 h-4" />
              Cari Data
            </button>
            <button 
              onClick={handleExport}
              disabled={!isSearched}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold shadow-sm transition ${isSearched ? 'bg-[#0f9d58] hover:bg-green-700 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              Export Excel
            </button>
          </div>
        </div>

        <div className="p-8 flex-1 flex flex-col overflow-auto items-center justify-center bg-gray-50/30">
          {!isSearched ? (
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-5">
                <Calendar className="w-10 h-10" />
              </div>
              <h4 className="text-[17px] font-bold text-gray-800 mb-2">Menunggu Filter</h4>
              <p className="text-gray-500 text-center text-[13px] font-medium leading-relaxed max-w-[300px]">
                Silakan pilih rentang tanggal mulai dan akhir,<br />lalu klik tombol <span className="font-bold text-gray-700">Cari Data</span>.
              </p>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col">
               <div className="w-full border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm">
                 <div className="overflow-x-auto">
                   <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50">
                          <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Tanggal</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">NIS</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nama</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kelas</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                          <td className="px-6 py-4 text-[13px] text-gray-600 font-medium whitespace-nowrap">11 Mei 2026</td>
                          <td className="px-6 py-4 text-[13px] font-bold text-gray-900">1001</td>
                          <td className="px-6 py-4 text-[14px] text-gray-800 font-bold w-full md:w-auto">Ahmad Rizki</td>
                          <td className="px-6 py-4 text-[13px] text-gray-600 font-medium whitespace-nowrap">Kelas VI B</td>
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            <span className="bg-green-50 text-green-600 text-[11px] font-bold px-2.5 py-1 rounded-md tracking-wide">Hadir</span>
                          </td>
                        </tr>
                        <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                          <td className="px-6 py-4 text-[13px] text-gray-600 font-medium whitespace-nowrap">11 Mei 2026</td>
                          <td className="px-6 py-4 text-[13px] font-bold text-gray-900">1002</td>
                          <td className="px-6 py-4 text-[14px] text-gray-800 font-bold">Budi Santoso</td>
                          <td className="px-6 py-4 text-[13px] text-gray-600 font-medium whitespace-nowrap">Kelas VI B</td>
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            <span className="bg-yellow-50 text-yellow-600 text-[11px] font-bold px-2.5 py-1 rounded-md tracking-wide">Sakit</span>
                          </td>
                        </tr>
                      </tbody>
                   </table>
                 </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AdminKelolaAbsen = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Pengaturan Waktu */}
      <div className="lg:col-span-1 border border-gray-100 rounded-2xl bg-white shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-5 h-5 text-indigo-600" />
            <h3 className="text-[17px] font-bold text-gray-800">Pengaturan Waktu</h3>
          </div>
          <p className="text-gray-500 text-[13px] font-medium">Konfigurasi jam operasional absensi.</p>
        </div>
        <div className="p-6 space-y-6">
          <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Absen Datang</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-bold text-gray-700 mb-1.5">Mulai Buka</label>
                <div className="relative">
                  <input type="time" defaultValue="06:00" className="w-full pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-500 font-medium text-gray-800 bg-white" />
                  <Clock className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-bold text-gray-700 mb-1.5">Batas Terlambat</label>
                <div className="relative">
                  <input type="time" defaultValue="07:15" className="w-full pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-500 font-medium text-gray-800 bg-white" />
                  <Clock className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-start gap-1.5">
              <div className="w-4 h-4 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] font-black italic">i</span>
              </div>
              <p className="text-[11px] font-medium text-orange-600">Lewat batas ini status: <span className="font-bold">Terlambat</span></p>
            </div>
          </div>

          <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Absen Pulang</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-bold text-gray-700 mb-1.5">Mulai Buka</label>
                <div className="relative">
                  <input type="time" defaultValue="15:00" className="w-full pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-500 font-medium text-gray-800 bg-white" />
                  <Clock className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-bold text-gray-700 mb-1.5">Tutup Absen</label>
                <div className="relative">
                  <input type="time" defaultValue="17:00" className="w-full pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-500 font-medium text-gray-800 bg-white" />
                  <Clock className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-start gap-1.5">
              <div className="w-4 h-4 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] font-black italic">i</span>
              </div>
              <p className="text-[11px] font-medium text-orange-600">Pulang sebelum dibuka: <span className="font-bold">Pulang Cepat</span></p>
            </div>
          </div>
          
          <button className="w-full bg-[#4f46e5] hover:bg-indigo-700 text-white py-3 rounded-xl text-sm font-bold shadow-sm transition flex items-center justify-center gap-2">
            <Save className="w-4 h-4" />
            Simpan Pengaturan
          </button>
        </div>
      </div>

      {/* Daftar Hari Libur */}
      <div className="lg:col-span-2 border border-gray-100 rounded-2xl bg-white shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-[17px] font-bold text-gray-800 mb-1">Daftar Hari Libur</h3>
          <p className="text-gray-500 text-[13px] font-medium">Siswa tidak bisa absen pada tanggal ini.</p>
        </div>
        
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row items-end gap-4 min-w-0 flex-wrap lg:flex-nowrap">
            <div className="flex-1 w-full min-w-0">
              <label className="block text-[10px] font-bold text-gray-500 tracking-wider mb-2 uppercase">Tanggal</label>
              <input type="date" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-500 font-medium text-gray-700 bg-white" placeholder="dd/mm/yyyy" />
            </div>
            <div className="flex-[2] w-full min-w-0">
              <label className="block text-[10px] font-bold text-gray-500 tracking-wider mb-2 uppercase">Keterangan</label>
              <input type="text" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-500 font-medium text-gray-700 bg-white placeholder-gray-400 truncate" placeholder="Contoh: Maulid Nabi / Cuti Bersama" />
            </div>
            <button className="w-full sm:w-auto bg-[#0f9d58] hover:bg-green-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-sm transition flex items-center justify-center gap-2 shrink-0">
              <Plus className="w-4 h-4" />
              Tambah
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-[300px]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-16">No</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-40">Tanggal</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Keterangan</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right w-24">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {/* Empty State */}
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <p className="text-gray-400 text-[15px] font-medium italic">Tidak ada jadwal libur.</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex items-center justify-between mt-auto">
          <p className="text-[13px] text-gray-400 font-medium">Tidak ada data ditemukan.</p>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-400 font-medium cursor-not-allowed">Prev</button>
            <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-400 font-medium cursor-not-allowed">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminScanAbsensi = () => {
  const [scanResult, setScanResult] = useState<any>(null);

  const handleScan = (decodedText: string) => {
    if (scanResult) return;
    
    let studentName = 'Siswa Tidak Dikenal';
    let studentClass = '-';
    let isSuccess = false;

    if (decodedText === '1234567890') {
      studentName = 'Ahmad Rizki';
      studentClass = 'Kelas VI B';
      isSuccess = true;
    } else {
      studentName = 'QR Tidak Valid (' + decodedText + ')';
      studentClass = '-';
      isSuccess = false;
    }

    setScanResult({
      nis: decodedText,
      nama: studentName,
      kelas: studentClass,
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      status: isSuccess ? 'Hadir' : 'Gagal'
    });
    
    // Kembali ke mode scan setelah 3.5 detik
    setTimeout(() => {
      setScanResult(null);
    }, 3500);
  };

  return (
    <div className="flex flex-col items-center justify-start py-8 px-4 min-h-[calc(100vh-8rem)]">
      {scanResult ? (
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center justify-center animate-in zoom-in duration-300 w-full max-w-sm text-center">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-inner ${scanResult.status === 'Hadir' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
            {scanResult.status === 'Hadir' ? <CheckCircle2 className="w-12 h-12" /> : <X className="w-12 h-12" />}
          </div>
          <h3 className="text-2xl font-black text-gray-800 mb-2">{scanResult.nama}</h3>
          <p className="text-gray-500 font-medium mb-8 text-sm">{scanResult.nis} • {scanResult.kelas}</p>
          
          <div className={`w-full rounded-2xl p-5 flex flex-col items-center border ${scanResult.status === 'Hadir' ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100'}`}>
            <span className={`text-xs font-bold mb-2 uppercase tracking-widest ${scanResult.status === 'Hadir' ? 'text-green-600' : 'text-red-600'}`}>Waktu Scan</span>
            <span className={`text-4xl font-black mb-3 tracking-tight ${scanResult.status === 'Hadir' ? 'text-green-700' : 'text-red-700'}`}>{scanResult.waktu}</span>
            <span className={`text-[#f8f9fa] text-[11px] font-black px-4 py-1.5 rounded-full tracking-widest uppercase shadow-sm ${scanResult.status === 'Hadir' ? 'bg-green-500' : 'bg-red-500'}`}>
              {scanResult.status === 'Hadir' ? 'BERHASIL ABSEN' : 'GAGAL ABSEN'}
            </span>
          </div>
          <p className="mt-6 text-xs font-bold text-gray-400">Menutup otomatis...</p>
        </div>
      ) : (
        <div className="w-full max-w-sm space-y-4">
          <div className="flex flex-col items-center text-center space-y-2 mb-6">
            <div className="w-16 h-16 bg-indigo-50 text-[#4f46e5] rounded-2xl flex items-center justify-center mb-2 shadow-sm rotate-3">
              <ScanLine className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Scan QR Code</h2>
            <p className="text-gray-500 text-sm font-medium">Arahkan kamera ke QR Code Kartu Pelajar siswa untuk memproses absensi.</p>
          </div>

          <QrScanner onScanSuccess={handleScan} />
          
          <div className="pt-4 w-full flex flex-col gap-3">
            <button 
              onClick={() => handleScan('1234567890')}
              className="w-full py-4 border-2 border-dashed border-[#4f46e5]/30 text-[#4f46e5] hover:bg-indigo-50/50 font-bold rounded-xl transition flex flex-col items-center justify-center gap-2 group"
            >
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Simulasi Scan QR Ahmad Rizki</span>
              </div>
              <span className="text-[11px] font-normal text-indigo-400">Klik ini jika Anda tidak memiliki kamera untuk mencoba</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminLayout = ({ user, onLogout, children }: { user: User, onLogout: () => void, children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = () => {
    if (location.pathname.includes('/data-siswa')) return 'Direktori Siswa';
    if (location.pathname.includes('/data-guru')) return 'Manajemen Guru';
    if (location.pathname.includes('/laporan')) return 'Laporan Kehadiran';
    if (location.pathname.includes('/kelola-absen')) return 'Kelola Hari Libur';
    if (location.pathname.includes('/scan-absensi')) return 'Scan Absensi';
    return 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#191543] text-white flex flex-col h-screen transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 shrink-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} print:hidden`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-indigo-900/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <LayoutDashboardIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-wide leading-tight">E-ABSENSI</h1>
              <p className="text-[10px] text-indigo-300 tracking-wider">SCHOOL SYSTEM</p>
            </div>
          </div>
          <button 
            className="lg:hidden text-gray-400 hover:text-white"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 shrink-0">
          <div className="bg-[#1e1b4b] rounded-xl p-4 flex items-center gap-3 border border-indigo-900/40">
            <div className="w-10 h-10 bg-[#06b6d4] rounded-lg flex items-center justify-center font-bold text-lg text-white">
              A
            </div>
            <div>
              <p className="text-sm font-bold text-gray-100">{user.username || 'admin'}</p>
              <div className="bg-[#4f46e5] text-white text-[9px] px-2 py-0.5 rounded inline-block mt-0.5 tracking-widest font-semibold">ADMIN</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-2 overflow-y-auto">
          <Link to="/dashboard" onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${location.pathname === '/dashboard' || location.pathname === '/dashboard/' ? 'bg-[#4f46e5] text-white shadow-lg shadow-indigo-500/20' : 'text-[#94a3b8] hover:text-indigo-300 hover:bg-white/5'}`}>
            <Home className="w-5 h-5" />
            Dashboard
          </Link>
          <Link to="/dashboard/data-siswa" onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${location.pathname.includes('/data-siswa') ? 'bg-[#4f46e5] text-white shadow-lg shadow-indigo-500/20' : 'text-[#94a3b8] hover:text-indigo-300 hover:bg-white/5'}`}>
            <GraduationCap className="w-5 h-5" />
            Data Siswa
          </Link>
          <Link to="/dashboard/data-guru" onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${location.pathname.includes('/data-guru') ? 'bg-[#4f46e5] text-white shadow-lg shadow-indigo-500/20' : 'text-[#94a3b8] hover:text-indigo-300 hover:bg-white/5'}`}>
            <Presentation className="w-5 h-5" />
            Data Guru
          </Link>
          <Link to="/dashboard/laporan" onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${location.pathname.includes('/laporan') ? 'bg-[#4f46e5] text-white shadow-lg shadow-indigo-500/20' : 'text-[#94a3b8] hover:text-indigo-300 hover:bg-white/5'}`}>
            <ClipboardList className="w-5 h-5" />
            Laporan
          </Link>
          <Link to="/dashboard/kelola-absen" onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${location.pathname.includes('/kelola-absen') ? 'bg-[#4f46e5] text-white shadow-lg shadow-indigo-500/20' : 'text-[#94a3b8] hover:text-indigo-300 hover:bg-white/5'}`}>
            <CalendarCheck className="w-5 h-5" />
            Kelola Absen
          </Link>
          <Link to="/dashboard/scan-absensi" onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${location.pathname.includes('/scan-absensi') ? 'bg-[#4f46e5] text-white shadow-lg shadow-indigo-500/20' : 'text-[#94a3b8] hover:text-indigo-300 hover:bg-white/5'}`}>
            <ScanLine className="w-5 h-5" />
            Scan Absensi
          </Link>
        </nav>

        <div className="p-4 border-t border-indigo-900/30 shrink-0">
          <button onClick={onLogout} className="flex items-center gap-3 w-full px-4 py-3 text-red-300/80 hover:text-red-300 hover:bg-red-500/10 rounded-xl font-medium text-sm transition">
            <LogOut className="w-5 h-5" />
            Keluar Aplikasi
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden print:overflow-visible">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 lg:px-8 shrink-0 shadow-sm shadow-gray-100/50 relative z-10 w-full print:hidden">
          <div className="flex items-center gap-4">
            <Menu className="w-5 h-5 text-gray-800 lg:hidden cursor-pointer" onClick={() => setIsSidebarOpen(true)} />
            <div className="hidden lg:flex items-center gap-3">
              <Menu className="w-5 h-5 text-gray-800 cursor-pointer" />
              <h2 className="text-[17px] font-bold text-gray-900">{getPageTitle()}</h2>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block pt-1">
              <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-0.5">HARI INI</p>
              <p className="text-[13px] font-bold text-gray-900">Senin, 11 Mei 2026</p>
            </div>
            <div className="relative">
              <div className="w-10 h-10 border border-gray-200/80 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-50 transition">
                <Bell className="w-[18px] h-[18px] text-gray-600" />
                <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6 lg:p-8 flex-1 overflow-auto bg-[#f8f9fa] print:p-0 print:overflow-visible">
          {children}
        </main>
      </div>
    </div>
  );
};

const LayoutDashboardIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="7" height="9" x="3" y="3" rx="1" />
    <rect width="7" height="5" x="14" y="3" rx="1" />
    <rect width="7" height="9" x="14" y="12" rx="1" />
    <rect width="7" height="5" x="3" y="16" rx="1" />
  </svg>
);

const MainLayout = ({ user, onLogout, children }: { user: User, onLogout: () => void, children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 w-full">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-6 h-6 text-indigo-600" />
            <h1 className="font-bold text-gray-900 text-lg">AbsensiQR SAAS</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900 leading-tight">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize leading-tight">{user.role} • {user.sekolah}</p>
            </div>
            <button 
              onClick={onLogout}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default function App() {
  const { user, login, logout } = useAuth();

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={!user ? <LoginPage onLogin={login} /> : <Navigate to="/dashboard" replace />} 
        />
        <Route 
          path="/dashboard/*" 
          element={
            user ? (
              user.role === 'admin' ? (
                <Routes>
                  <Route path="/" element={<AdminLayout user={user} onLogout={logout}><AdminDashboard user={user} /></AdminLayout>} />
                  <Route path="/data-siswa" element={<AdminLayout user={user} onLogout={logout}><AdminDataSiswa /></AdminLayout>} />
                  <Route path="/data-guru" element={<AdminLayout user={user} onLogout={logout}><AdminDataGuru /></AdminLayout>} />
                  <Route path="/laporan" element={<AdminLayout user={user} onLogout={logout}><AdminLaporan /></AdminLayout>} />
                  <Route path="/kelola-absen" element={<AdminLayout user={user} onLogout={logout}><AdminKelolaAbsen /></AdminLayout>} />
                  <Route path="/scan-absensi" element={<AdminLayout user={user} onLogout={logout}><AdminScanAbsensi /></AdminLayout>} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              ) : (
                <MainLayout user={user} onLogout={logout}>
                  {user.role === 'siswa' && <SiswaDashboard user={user} />}
                  {user.role === 'guru' && <GuruDashboard user={user} />}
                </MainLayout>
              )
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}

