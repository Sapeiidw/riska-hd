"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo, LogoIcon } from "@/components/Logo";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Activity,
  Calendar,
  ClipboardList,
  FileText,
  GraduationCap,
  Lock,
  Shield,
  Stethoscope,
  User,
  UserCog,
  Users,
  Video,
  BarChart3,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Check,
  Clock,
  Layers,
  TrendingUp,
  BookOpen,
  Menu,
  X,
  HelpCircle,
  Plus,
  Minus,
  Heart,
  HeartPulse,
  Star,
  Quote,
  Phone,
  Mail,
  MapPin,
  Award,
} from "lucide-react";

// Section Header Component
function SectionHeader({
  badge,
  badgeIcon: BadgeIcon,
  badgeColor,
  title,
  subtitle,
}: {
  badge: string;
  badgeIcon: React.ElementType;
  badgeColor: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <motion.div
      className="text-center mb-12"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
    >
      <Badge className={`${badgeColor} border-0 px-4 py-1.5 mb-4 rounded-full text-xs font-medium`}>
        <BadgeIcon className="size-3.5 mr-1.5" />
        {badge}
      </Badge>
      <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-3">{title}</h2>
      {subtitle && <p className="text-gray-500 max-w-2xl mx-auto">{subtitle}</p>}
    </motion.div>
  );
}

// Uniform Card Component
function FeatureCard({
  icon: Icon,
  title,
  description,
  bgColor,
  index,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  bgColor: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="group"
    >
      <div className="bg-white rounded-3xl p-6 h-full shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100">
        <div
          className={`size-14 rounded-2xl ${bgColor} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className="size-7 text-white" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

// Team Card Component (for Doctors/Nurses)
function TeamCard({
  name,
  role,
  specialization,
  index,
  color,
}: {
  name: string;
  role: string;
  specialization: string;
  index: number;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="group"
    >
      <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100">
        {/* Image placeholder with gradient */}
        <div className={`h-48 bg-gradient-to-br ${color} relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/5" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent" />
          {/* Avatar circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="size-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30">
              <User className="size-12 text-white/80" />
            </div>
          </div>
          {/* Status badge */}
          <div className="absolute top-4 right-4">
            <div className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 flex items-center gap-1">
              <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              Aktif
            </div>
          </div>
        </div>
        {/* Content */}
        <div className="p-5">
          <h3 className="text-lg font-bold text-gray-800 mb-1">{name}</h3>
          <p className="text-sm text-sky-500 font-medium mb-2">{role}</p>
          <p className="text-xs text-gray-400 flex items-center gap-1.5">
            <Award className="size-3.5" />
            {specialization}
          </p>
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="size-3.5 text-amber-400 fill-amber-400" />
              ))}
            </div>
            <Button variant="ghost" size="sm" className="text-sky-500 hover:text-sky-600 hover:bg-sky-50 rounded-xl text-xs h-8 px-3">
              Lihat Profil
              <ArrowRight className="size-3 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Testimonial Card Component
function TestimonialCard({
  name,
  role,
  content,
  rating,
  index,
}: {
  name: string;
  role: string;
  content: string;
  rating: number;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="group"
    >
      <div className="bg-white rounded-3xl p-6 h-full shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 relative">
        {/* Quote icon */}
        <div className="absolute -top-4 -left-2">
          <div className="size-10 rounded-2xl bg-sky-500 flex items-center justify-center shadow-lg">
            <Quote className="size-5 text-white" />
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-4 pt-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`size-4 ${i < rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}`}
            />
          ))}
        </div>

        {/* Content */}
        <p className="text-gray-600 text-sm leading-relaxed mb-6 italic">&ldquo;{content}&rdquo;</p>

        {/* Author */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
          <div className="size-12 rounded-xl bg-gradient-to-br from-sky-400 to-cyan-400 flex items-center justify-center">
            <User className="size-6 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 text-sm">{name}</h4>
            <p className="text-xs text-gray-400">{role}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Stats Card
function StatCard({
  value,
  label,
  icon: Icon,
  color,
  index,
}: {
  value: string;
  label: string;
  icon: React.ElementType;
  color: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="text-center"
    >
      <div className={`size-16 rounded-2xl ${color} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
        <Icon className="size-8 text-white" />
      </div>
      <div className="text-3xl md:text-4xl font-bold text-gray-800 mb-1">{value}</div>
      <p className="text-gray-500 text-sm">{label}</p>
    </motion.div>
  );
}

// FAQ Item
function FAQItem({
  question,
  answer,
  isOpen,
  onClick,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div className="border-b border-gray-100 last:border-0" initial={false}>
      <button
        className="w-full py-5 flex items-center justify-between text-left group"
        onClick={onClick}
      >
        <span className="font-medium text-gray-700 group-hover:text-sky-500 transition-colors pr-4">
          {question}
        </span>
        <div
          className={`size-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
            isOpen
              ? "bg-sky-500 text-white shadow-lg"
              : "bg-gray-100 text-gray-400 group-hover:bg-sky-50"
          }`}
        >
          {isOpen ? <Minus className="size-4" /> : <Plus className="size-4" />}
        </div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        className="overflow-hidden"
      >
        <p className="pb-5 text-gray-500 leading-relaxed">{answer}</p>
      </motion.div>
    </motion.div>
  );
}

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  // Parallax for big typography
  const { scrollY } = useScroll();
  const bigTextY = useTransform(scrollY, [0, 500], [0, 150]);
  const bigTextOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#fitur", label: "Fitur" },
    { href: "#tim", label: "Tim Medis" },
    { href: "/informasi", label: "Artikel" },
    { href: "#faq", label: "FAQ" },
  ];

  const faqs = [
    {
      question: "Apa itu RISKA HD?",
      answer:
        "RISKA HD adalah singkatan dari Ruang Informasi & Sistem Kelola Aktivitas Hemodialisa. Platform digital terintegrasi untuk manajemen layanan hemodialisa di fasilitas kesehatan, mencakup pengelolaan pasien, penjadwalan, dokumentasi, dan edukasi.",
    },
    {
      question: "Siapa saja yang dapat menggunakan sistem ini?",
      answer:
        "Admin, Dokter, Perawat, dan Pasien. Setiap peran memiliki akses yang sesuai dengan kebutuhannya.",
    },
    {
      question: "Apakah data pasien aman di RISKA HD?",
      answer:
        "Ya, kami menggunakan enkripsi data, kontrol akses berbasis peran (RBAC), audit log, dan session management dengan auto-timeout.",
    },
    {
      question: "Bagaimana cara memulai menggunakan RISKA HD?",
      answer:
        "Hubungi tim kami untuk demo dan konsultasi. Kami akan membantu setup, migrasi data, dan pelatihan pengguna.",
    },
  ];

  const doctors = [
    { name: "dr. Ahmad Faisal, Sp.PD-KGH", role: "Dokter Spesialis Ginjal", specialization: "Konsultan Ginjal Hipertensi", color: "from-sky-400 to-cyan-500" },
    { name: "dr. Siti Rahma, Sp.PD", role: "Dokter Penyakit Dalam", specialization: "Nefrologi & Dialisis", color: "from-violet-400 to-purple-500" },
    { name: "dr. Budi Santoso, Sp.PD-KGH", role: "Dokter Spesialis Ginjal", specialization: "Hemodialisis Akut", color: "from-rose-400 to-pink-500" },
    { name: "dr. Dewi Kartika, Sp.PD", role: "Dokter Penyakit Dalam", specialization: "Transplantasi Ginjal", color: "from-emerald-400 to-teal-500" },
  ];

  const nurses = [
    { name: "Ns. Ratna Sari, S.Kep", role: "Kepala Perawat HD", specialization: "Certified Dialysis Nurse", color: "from-cyan-400 to-sky-500" },
    { name: "Ns. Yusuf Rahman, S.Kep", role: "Perawat Senior HD", specialization: "Vascular Access Care", color: "from-teal-400 to-emerald-500" },
    { name: "Ns. Linda Permata, S.Kep", role: "Perawat HD", specialization: "Patient Education", color: "from-amber-400 to-orange-500" },
    { name: "Ns. Andi Wijaya, S.Kep", role: "Perawat HD", specialization: "Emergency Care", color: "from-indigo-400 to-violet-500" },
  ];

  const testimonials = [
    {
      name: "Ibu Siti Aminah",
      role: "Pasien Hemodialisa",
      content: "Dengan RISKA HD, saya bisa memantau jadwal cuci darah dengan mudah. Perawat dan dokter sangat responsif melalui sistem ini.",
      rating: 5,
    },
    {
      name: "dr. Hendra Pratama",
      role: "Dokter Nefrologi",
      content: "Platform yang sangat membantu dalam mengelola pasien hemodialisa. Order dan monitoring jadi lebih efisien.",
      rating: 5,
    },
    {
      name: "Ns. Maya Kusuma",
      role: "Perawat Hemodialisa",
      content: "Dokumentasi dan eksekusi order dokter jadi lebih terstruktur. Sangat meningkatkan kualitas pelayanan kami.",
      rating: 5,
    },
    {
      name: "Bapak Agus Wijaya",
      role: "Pasien Hemodialisa",
      content: "Edukasi yang disediakan sangat informatif. Saya jadi lebih paham tentang kondisi kesehatan saya.",
      rating: 5,
    },
    {
      name: "Admin RS Sehat",
      role: "Administrator Sistem",
      content: "Laporan otomatis dan audit log memudahkan kami dalam monitoring dan evaluasi layanan hemodialisa.",
      rating: 5,
    },
    {
      name: "Ibu Kartini",
      role: "Keluarga Pasien",
      content: "Sebagai keluarga, saya bisa ikut memantau perkembangan kesehatan ibu saya. Sangat membantu!",
      rating: 5,
    },
  ];

  const features = [
    { icon: Users, title: "Manajemen Pasien", description: "Kelola data lengkap pasien, riwayat kesehatan, dan rekam medis dalam satu sistem terintegrasi.", bgColor: "bg-sky-500" },
    { icon: Calendar, title: "Penjadwalan Cerdas", description: "Atur jadwal hemodialisa otomatis dengan notifikasi pengingat untuk pasien dan tim medis.", bgColor: "bg-violet-500" },
    { icon: Stethoscope, title: "Order Dokter", description: "Instruksi dan order dokter langsung tersampaikan ke perawat dengan sistem tracking real-time.", bgColor: "bg-rose-400" },
    { icon: BarChart3, title: "Monitoring Real-time", description: "Pantau vital sign dan kondisi pasien secara real-time selama proses hemodialisa.", bgColor: "bg-emerald-500" },
    { icon: Video, title: "Edukasi Pasien", description: "Materi edukasi berupa video, PDF, dan quiz untuk meningkatkan pemahaman pasien.", bgColor: "bg-amber-500" },
    { icon: FileText, title: "Laporan Otomatis", description: "Generate laporan lengkap secara otomatis untuk evaluasi dan dokumentasi medis.", bgColor: "bg-cyan-500" },
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-gray-50">
      {/* Hero Section with Big Typography */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Sky Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-400 via-sky-500 to-cyan-500" />

        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 size-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-20 right-10 size-96 rounded-full bg-white blur-3xl" />
        </div>

        {/* Clouds */}
        <motion.div
          className="absolute top-20 right-[10%] w-48 h-20 bg-white/30 rounded-full blur-2xl"
          animate={{ x: [0, 20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-40 right-[30%] w-32 h-14 bg-white/20 rounded-full blur-xl"
          animate={{ x: [0, -15, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/3 left-[5%] w-40 h-16 bg-white/20 rounded-full blur-2xl"
          animate={{ x: [0, 10, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Hero Content - Left Right Layout */}
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left - Text Content */}
              <motion.div
                className="space-y-8 z-10"
                style={{ y: bigTextY, opacity: bigTextOpacity }}
              >
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-5 py-2 text-sm mb-4 rounded-full">
                    <Sparkles className="size-4 mr-2" />
                    Sistem Manajemen Hemodialisa #1
                  </Badge>
                </motion.div>

                <motion.h1
                  className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  Kelola Layanan
                  <br />
                  <span className="text-white/90">Hemodialisa</span>
                  <br />
                  <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text">Lebih Mudah</span>
                </motion.h1>

                <motion.div
                  className="text-white/70 text-sm max-w-lg"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.35 }}
                >
                  <span className="font-bold text-white">R</span>uang{" "}
                  <span className="font-bold text-white">I</span>nformasi &{" "}
                  <span className="font-bold text-white">S</span>istem{" "}
                  <span className="font-bold text-white">K</span>elola{" "}
                  <span className="font-bold text-white">A</span>ktivitas{" "}
                  <span className="font-bold text-white">H</span>emo
                  <span className="font-bold text-white">d</span>ialisa
                </motion.div>

                <motion.p
                  className="text-white/80 text-lg max-w-lg leading-relaxed"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  Platform digital terintegrasi untuk dokter, perawat, dan pasien.
                  Terstruktur, aman, dan mudah digunakan.
                </motion.p>

                <motion.div
                  className="flex flex-wrap gap-4 pt-4"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <Link href="/sign-in">
                    <Button className="bg-white text-sky-600 hover:bg-white/90 rounded-full px-8 py-6 text-base shadow-2xl shadow-sky-900/20 group font-semibold">
                      Mulai Sekarang
                      <ArrowUpRight className="ml-2 size-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Button>
                  </Link>
                  <a href="#fitur">
                    <Button variant="outline" className="border-2 border-white/50 text-white hover:bg-white/20 rounded-full px-8 py-6 text-base bg-transparent">
                      Pelajari Lebih Lanjut
                    </Button>
                  </a>
                </motion.div>

                {/* Quick Stats */}
                <motion.div
                  className="flex gap-8 pt-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  {[
                    { value: "500+", label: "Pasien Terkelola" },
                    { value: "50+", label: "Tim Medis" },
                    { value: "99%", label: "Kepuasan" },
                  ].map((stat, i) => (
                    <div key={i} className="text-center">
                      <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                      <div className="text-xs text-white/60">{stat.label}</div>
                    </div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Right - Big Typography & Illustration */}
              <motion.div
                className="hidden lg:flex items-end justify-center relative h-[calc(100vh-80px)]"
                style={{ opacity: bigTextOpacity }}
              >
                {/* Big HD Text */}
                <motion.span
                  className="text-[18vw] font-black text-white/15 tracking-tighter select-none leading-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  style={{ y: bigTextY }}
                >
                  HD
                </motion.span>

                {/* Doctor Image - positioned at bottom, behind curve */}
                <motion.div
                  className="relative z-[1] flex items-end mb-[100px]"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  <Image
                    src="/dokter.webp"
                    alt="Dokter Hemodialisa"
                    width={600}
                    height={750}
                    className="object-contain drop-shadow-2xl"
                    style={{ maxHeight: "95vh" }}
                    priority
                  />
                </motion.div>

                {/* Feature Cards - 4 cards positioned around doctor */}
                {/* Top Left */}
                <motion.div
                  className="absolute top-28 -left-8 bg-white rounded-2xl p-4 shadow-2xl z-20"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                      <Check className="size-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">Data Terintegrasi</p>
                      <p className="text-xs text-gray-400">Semua dalam satu sistem</p>
                    </div>
                  </div>
                </motion.div>

                {/* Top Right */}
                <motion.div
                  className="absolute top-28 -right-8 bg-white rounded-2xl p-4 shadow-2xl z-20"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-violet-500 flex items-center justify-center">
                      <Shield className="size-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">Keamanan Terjamin</p>
                      <p className="text-xs text-gray-400">Enkripsi data pasien</p>
                    </div>
                  </div>
                </motion.div>

                {/* Bottom Left */}
                <motion.div
                  className="absolute bottom-36 -left-8 bg-white rounded-2xl p-4 shadow-2xl z-20"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-sky-500 flex items-center justify-center">
                      <Calendar className="size-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">Jadwal Otomatis</p>
                      <p className="text-xs text-gray-400">Penjadwalan cerdas</p>
                    </div>
                  </div>
                </motion.div>

                {/* Bottom Right */}
                <motion.div
                  className="absolute bottom-36 -right-8 bg-white rounded-2xl p-4 shadow-2xl z-20"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 1.1 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-rose-400 flex items-center justify-center">
                      <HeartPulse className="size-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">Monitoring Real-time</p>
                      <p className="text-xs text-gray-400">Pantau kondisi pasien</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Navbar */}
        <motion.nav
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            scrolled ? "bg-white/95 backdrop-blur-md shadow-xl" : "bg-transparent"
          }`}
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between h-20">
              <Link href="/">
                <Logo variant={scrolled ? "default" : "light"} size="md" />
              </Link>

              {/* Desktop Menu */}
              <div className="hidden md:flex items-center gap-2">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className={`px-5 py-2.5 text-sm font-medium rounded-full transition-all ${
                      scrolled
                        ? "text-gray-600 hover:text-sky-500 hover:bg-sky-50"
                        : "text-white/90 hover:text-white hover:bg-white/20"
                    }`}
                  >
                    {link.label}
                  </a>
                ))}
              </div>

              <Link href="/sign-in" className="hidden md:block">
                <Button
                  className={`rounded-full px-6 py-5 transition-all ${
                    scrolled
                      ? "bg-sky-500 text-white hover:bg-sky-600 shadow-lg shadow-sky-500/30"
                      : "bg-white text-sky-600 hover:bg-white/90"
                  }`}
                >
                  Masuk
                  <ArrowUpRight className="ml-2 size-4" />
                </Button>
              </Link>

              {/* Mobile Menu Button */}
              <button
                className={`md:hidden p-2.5 rounded-xl ${scrolled ? "hover:bg-gray-100" : "hover:bg-white/20"}`}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <X className={`size-6 ${scrolled ? "text-gray-700" : "text-white"}`} />
                ) : (
                  <Menu className={`size-6 ${scrolled ? "text-gray-700" : "text-white"}`} />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <motion.div
            initial={false}
            animate={{ height: isMenuOpen ? "auto" : 0, opacity: isMenuOpen ? 1 : 0 }}
            className="md:hidden overflow-hidden bg-white shadow-xl"
          >
            <div className="container mx-auto px-6 py-4 space-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block py-3 px-4 text-gray-600 hover:text-sky-500 hover:bg-sky-50 rounded-xl font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <Link href="/sign-in" className="block pt-2">
                <Button className="w-full bg-sky-500 hover:bg-sky-600 text-white rounded-xl shadow-xl py-5">
                  Masuk
                </Button>
              </Link>
            </div>
          </motion.div>
        </motion.nav>

        {/* Bottom Curve - z-10 to be in front of doctor image */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
          >
            <path
              d="M0 120L1440 120L1440 60C1440 60 1320 0 720 0C120 0 0 60 0 60L0 120Z"
              fill="#f9fafb"
            />
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            <StatCard value="10+" label="Tahun Pengalaman" icon={Award} color="bg-sky-500" index={0} />
            <StatCard value="500+" label="Pasien Aktif" icon={Users} color="bg-rose-400" index={1} />
            <StatCard value="50+" label="Tim Medis" icon={Stethoscope} color="bg-emerald-500" index={2} />
            <StatCard value="99%" label="Tingkat Kepuasan" icon={Heart} color="bg-violet-500" index={3} />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="fitur" className="py-20 bg-white relative">
        {/* Top divider */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        <div className="container mx-auto px-6">
          <SectionHeader
            badge="Fitur Unggulan"
            badgeIcon={Sparkles}
            badgeColor="bg-violet-100 text-violet-600"
            title="Semua yang Anda Butuhkan"
            subtitle="Fitur lengkap untuk mengelola layanan hemodialisa dengan efisien dan terstruktur."
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gradient-to-b from-sky-50 to-white relative">
        <div className="container mx-auto px-6">
          <SectionHeader
            badge="Kenapa RISKA HD?"
            badgeIcon={Layers}
            badgeColor="bg-sky-100 text-sky-600"
            title="Solusi Terpercaya untuk Hemodialisa"
            subtitle="Dipercaya oleh ratusan fasilitas kesehatan di Indonesia."
          />

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: ClipboardList,
                title: "Terstruktur",
                description: "Data pasien dan rekam medis tersimpan rapi dalam satu sistem yang mudah diakses kapan saja.",
                bgColor: "bg-sky-500",
              },
              {
                icon: Activity,
                title: "Terintegrasi",
                description: "Dokter, perawat, dan pasien terhubung dalam satu ekosistem digital yang seamless.",
                bgColor: "bg-rose-400",
              },
              {
                icon: Shield,
                title: "Aman & Terjamin",
                description: "Enkripsi data berlapis, kontrol akses berbasis peran, dan audit log lengkap.",
                bgColor: "bg-emerald-500",
              },
            ].map((item, index) => (
              <FeatureCard key={index} {...item} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Our Doctors Section */}
      <section id="tim" className="py-20 bg-gradient-to-b from-white to-sky-50/50 relative">
        {/* Top divider */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-200 to-transparent" />
        <div className="container mx-auto px-6">
          <SectionHeader
            badge="Tim Dokter"
            badgeIcon={Stethoscope}
            badgeColor="bg-sky-100 text-sky-600"
            title="Dokter Spesialis Kami"
            subtitle="Tim dokter berpengalaman dan tersertifikasi dalam penanganan hemodialisa."
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {doctors.map((doctor, index) => (
              <TeamCard key={index} {...doctor} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Our Nurses Section */}
      <section className="py-20 bg-gradient-to-b from-rose-50/50 to-white relative">
        <div className="container mx-auto px-6">
          <SectionHeader
            badge="Tim Perawat"
            badgeIcon={Activity}
            badgeColor="bg-rose-100 text-rose-600"
            title="Perawat Profesional Kami"
            subtitle="Perawat tersertifikasi dengan pengalaman dalam perawatan hemodialisa."
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {nurses.map((nurse, index) => (
              <TeamCard key={index} {...nurse} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimoni" className="py-20 bg-gradient-to-b from-amber-50/30 to-white relative">
        {/* Top divider */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent" />
        <div className="container mx-auto px-6">
          <SectionHeader
            badge="Testimoni"
            badgeIcon={Quote}
            badgeColor="bg-amber-100 text-amber-600"
            title="Apa Kata Mereka"
            subtitle="Dengarkan pengalaman dari pasien, dokter, dan perawat yang menggunakan RISKA HD."
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Role-Based Access */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <SectionHeader
            badge="Multi-Role Access"
            badgeIcon={Users}
            badgeColor="bg-cyan-100 text-cyan-600"
            title="Akses Sesuai Peran"
            subtitle="Setiap pengguna mendapat akses fitur sesuai dengan peran dan tanggung jawabnya."
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: UserCog,
                title: "Admin",
                bgColor: "bg-rose-400",
                features: ["Kelola seluruh pengguna", "Konfigurasi sistem", "Audit log & laporan"],
              },
              {
                icon: Stethoscope,
                title: "Dokter",
                bgColor: "bg-sky-500",
                features: ["Order & instruksi", "Evaluasi pasien", "Monitoring kondisi"],
              },
              {
                icon: Activity,
                title: "Perawat",
                bgColor: "bg-cyan-500",
                features: ["Eksekusi order", "Catat vital sign", "Dokumentasi"],
              },
              {
                icon: User,
                title: "Pasien",
                bgColor: "bg-emerald-500",
                features: ["Lihat jadwal", "Akses edukasi", "Riwayat kesehatan"],
              },
            ].map((role, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="group"
              >
                <div className="bg-white rounded-3xl p-6 h-full shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100">
                  <div
                    className={`size-14 rounded-2xl ${role.bgColor} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <role.icon className="size-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">{role.title}</h3>
                  <ul className="space-y-3">
                    {role.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-gray-500">
                        <div className="size-5 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                          <Check className="size-3 text-emerald-500" />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Education Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="bg-purple-100 text-purple-600 border-0 px-4 py-1.5 rounded-full text-xs font-medium">
                <BookOpen className="size-3.5 mr-1.5" />
                Edukasi Pasien
              </Badge>
              <h2 className="text-2xl md:text-4xl font-bold text-gray-800">
                Materi Edukasi Berkualitas
              </h2>
              <p className="text-gray-500 leading-relaxed">
                Konten edukasi yang dikurasi oleh tim medis profesional untuk membantu pasien
                memahami proses hemodialisa dan menjaga kesehatan mereka.
              </p>

              <div className="space-y-4 pt-4">
                {[
                  { icon: Video, title: "Video Tutorial", desc: "Penjelasan visual yang mudah dipahami", bg: "bg-violet-500", href: "/informasi?category=video" },
                  { icon: FileText, title: "Dokumen PDF", desc: "Materi lengkap untuk dibaca offline", bg: "bg-pink-400", href: "/informasi?category=panduan" },
                  { icon: GraduationCap, title: "Quiz Interaktif", desc: "Uji pemahaman dengan cara menyenangkan", bg: "bg-purple-500", href: "/informasi" },
                ].map((item, index) => (
                  <Link key={index} href={item.href}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ x: 8 }}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer group"
                    >
                      <div
                        className={`size-12 rounded-xl ${item.bg} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                      >
                        <item.icon className="size-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{item.title}</h4>
                        <p className="text-sm text-gray-400">{item.desc}</p>
                      </div>
                      <ArrowRight className="size-5 text-gray-300 ml-auto group-hover:text-sky-500 transition-colors" />
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
            >
              <Link href="/informasi">
                <motion.div
                  className="rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 p-8 shadow-2xl cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="aspect-video rounded-2xl bg-white/10 flex items-center justify-center mb-6 group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                    <motion.div
                      className="size-20 rounded-3xl bg-white shadow-2xl flex items-center justify-center group-hover:scale-110 transition-transform z-10"
                      whileTap={{ scale: 0.95 }}
                    >
                      <TrendingUp className="size-10 text-violet-500" />
                    </motion.div>
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">Panduan Lengkap Hemodialisa</h4>
                  <p className="text-white/70 mb-4">Edukasi komprehensif untuk pasien baru dan keluarga</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-white/20 text-white border-0 rounded-full px-3 py-1">
                      12 Video
                    </Badge>
                    <Badge className="bg-white/20 text-white border-0 rounded-full px-3 py-1">
                      8 PDF
                    </Badge>
                    <Badge className="bg-white/20 text-white border-0 rounded-full px-3 py-1">
                      5 Quiz
                    </Badge>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <SectionHeader
            badge="FAQ"
            badgeIcon={HelpCircle}
            badgeColor="bg-amber-100 text-amber-600"
            title="Pertanyaan Umum"
            subtitle="Temukan jawaban untuk pertanyaan yang sering diajukan tentang RISKA HD."
          />

          <motion.div
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-3xl shadow-xl p-8">
              {faqs.map((faq, index) => (
                <FAQItem
                  key={index}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openFAQ === index}
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <SectionHeader
            badge="Keamanan"
            badgeIcon={Lock}
            badgeColor="bg-emerald-100 text-emerald-600"
            title="Data Anda Terlindungi"
            subtitle="Keamanan data pasien adalah prioritas utama kami."
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Shield, label: "Role-Based Access Control", desc: "Akses terkontrol", bg: "bg-emerald-500" },
              { icon: FileText, label: "Audit Log Lengkap", desc: "Tracking aktivitas", bg: "bg-teal-500" },
              { icon: Lock, label: "Enkripsi Data", desc: "Data terenkripsi", bg: "bg-cyan-500" },
              { icon: Clock, label: "Auto Session Timeout", desc: "Logout otomatis", bg: "bg-sky-500" },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="p-6 rounded-3xl bg-gray-50 hover:bg-gray-100 text-center transition-all cursor-pointer group"
              >
                <div
                  className={`size-14 rounded-2xl ${item.bg} flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform`}
                >
                  <item.icon className="size-7 text-white" />
                </div>
                <p className="font-semibold text-gray-800 mb-1">{item.label}</p>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-sky-500 via-sky-600 to-cyan-600 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 size-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-10 right-10 size-96 rounded-full bg-white/10 blur-3xl" />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[25vw] font-black text-white/5 tracking-tighter select-none">
            HD
          </span>
        </div>

        <div className="relative z-10 container mx-auto px-6">
          <motion.div
            className="text-center max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="mb-8"
            >
              <LogoIcon variant="light" size="xl" className="mx-auto" />
            </motion.div>

            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Siap Kelola Hemodialisa
              <br />
              Lebih Baik?
            </h2>

            <p className="text-white/60 text-sm mb-4">
              <span className="font-bold text-white">R</span>uang{" "}
              <span className="font-bold text-white">I</span>nformasi &{" "}
              <span className="font-bold text-white">S</span>istem{" "}
              <span className="font-bold text-white">K</span>elola{" "}
              <span className="font-bold text-white">A</span>ktivitas{" "}
              <span className="font-bold text-white">H</span>emo
              <span className="font-bold text-white">d</span>ialisa
            </p>

            <p className="text-white/80 mb-10 text-lg">
              Mulai gunakan RISKA HD sekarang dan rasakan kemudahan dalam
              mengelola layanan hemodialisa di fasilitas kesehatan Anda.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/sign-in">
                <Button className="bg-white text-sky-600 hover:bg-white/90 h-12 px-6 rounded-full shadow-xl group font-medium">
                  Mulai Sekarang
                  <ArrowUpRight className="ml-2 size-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Button>
              </Link>
              <Button
                variant="outline"
                className="border border-white/30 text-white hover:bg-white/10 h-12 px-6 rounded-full bg-transparent font-medium"
              >
                Hubungi Kami
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-slate-900">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <Logo variant="light" size="md" className="mb-2" />
              <p className="text-gray-500 text-xs mb-3">
                <span className="font-semibold text-gray-300">R</span>uang{" "}
                <span className="font-semibold text-gray-300">I</span>nformasi &{" "}
                <span className="font-semibold text-gray-300">S</span>istem{" "}
                <span className="font-semibold text-gray-300">K</span>elola{" "}
                <span className="font-semibold text-gray-300">A</span>ktivitas{" "}
                <span className="font-semibold text-gray-300">H</span>emo
                <span className="font-semibold text-gray-300">d</span>ialisa
              </p>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Platform manajemen hemodialisa terintegrasi untuk fasilitas kesehatan di Indonesia.
              </p>
              <div className="flex items-center gap-3">
                <a href="#" className="size-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <Mail className="size-5 text-white" />
                </a>
                <a href="#" className="size-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <Phone className="size-5 text-white" />
                </a>
                <a href="#" className="size-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <MapPin className="size-5 text-white" />
                </a>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold text-white mb-4">Produk</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#fitur" className="text-gray-400 hover:text-white text-sm transition-colors">
                    Fitur
                  </a>
                </li>
                <li>
                  <a href="#tim" className="text-gray-400 hover:text-white text-sm transition-colors">
                    Tim Medis
                  </a>
                </li>
                <li>
                  <Link href="/informasi" className="text-gray-400 hover:text-white text-sm transition-colors">
                    Ruang Informasi
                  </Link>
                </li>
                <li>
                  <a href="#faq" className="text-gray-400 hover:text-white text-sm transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Perusahaan</h4>
              <ul className="space-y-3">
                {["Tentang Kami", "Karir", "Blog", "Kontak"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/privasi" className="text-gray-400 hover:text-white text-sm transition-colors">
                    Kebijakan Privasi
                  </Link>
                </li>
                <li>
                  <Link href="/bantuan" className="text-gray-400 hover:text-white text-sm transition-colors">
                    Pusat Bantuan
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                    Syarat & Ketentuan
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} RISKA HD. All rights reserved.
            </p>
            <p className="text-sm text-gray-500">
              Made with <Heart className="size-4 inline text-rose-400 fill-rose-400" /> in Indonesia
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
