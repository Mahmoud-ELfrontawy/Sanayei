// src/mock/craftsmanData.ts

// 1. تعريف الأنواع (Types)
export interface Review {
  id: number;
  clientName: string;
  rating: number;
  comment: string;
  clientImage?: string;
  date?: string;
}

export interface PortfolioItem {
  id: number;
  title: string;
  imageUrl: string;
}

export interface CraftsmanProfileData {
  id: number;
  name: string;
  jobTitle: string;
  avatarUrl: string;
  coverUrl: string;
  rating: number;
  experienceYears: number;
  address: string;
  about: string;
  specialization: string[];
  paymentMethods: string[];
  services: string[];
  reviews: Review[];
  portfolio: PortfolioItem[];
}

// 2. البيانات الثابتة (Mock Data)
export const mockCraftsmanData: CraftsmanProfileData = {
  id: 1,
  name: "سامي حسين",
  jobTitle: "فني كهرباء ومنازل ذكية",
  avatarUrl:
    "https://img.freepik.com/free-photo/portrait-smiling-worker-hard-hat-sanding-wood_23-2149366479.jpg", // صورة وهمية
  coverUrl:
    "https://img.freepik.com/free-photo/electrician-working-switchboard_1098-18544.jpg",
  rating: 4,
  experienceYears: 8,
  address: "الجيزة - فيصل - شارع العشرين",
  about:
    "صنايعي معتمد بخبرة طويلة في الكهرباء والسباكة. هدفي دايماً إنك تكون مطمن بعد الشغل. بقدم شغل نظيف، متقن، وفي الميعاد المتفق عليه. مش بس بصلّح، أنا بحل المشكلة من جذورها وبقدم نصائح تحافظ على بيتك.",
  specialization: [
    "خبير في تنفيذ أعمال الصيانة والتركيبات الداخلية",
    "خبرة عملية تتجاوز 8 سنوات في السوق المصري",
    "تأسيس شبكات المنازل الذكية (Smart Home)",
  ],
  paymentMethods: ["الدفع النقدي (كاش)", "فودافون كاش", "InstaPay"],
  services: [
    "تمديدات كهربائية داخلية وخارجية",
    "تركيب مفاتيح وإنارة ذكية",
    "إصلاح وصيانة لوحات الكهرباء",
    "تركيب النجف والمراوح",
    "تأسيس كهرباء الشقق بالكامل",
  ],
  reviews: [
    {
      id: 1,
      clientName: "أحمد محمد",
      rating: 5,
      comment: "شغل ممتاز جداً وسريع، أنصح بالتعامل معه.",
      date: "2024-01-10",
    },
    {
      id: 2,
      clientName: "خالد علي",
      rating: 4,
      comment: "محترم وملتزم بالمواعيد، والأسعار مناسبة.",
      date: "2024-01-12",
    },
    {
      id: 3,
      clientName: "سارة يوسف",
      rating: 5,
      comment: "حل المشكلة من جذورها، شكراً جزيلاً.",
      date: "2024-01-15",
    },
    {
      id: 4,
      clientName: "ماجد سامي",
      rating: 5,
      comment: "احترافية عالية في التعامل.",
      date: "2024-01-20",
    },
    {
      id: 5,
      clientName: "عمر كمال",
      rating: 3,
      comment: "تجربة جيدة ولكن تأخر قليلاً عن الموعد.",
      date: "2024-01-22",
    },
    {
      id: 6,
      clientName: "منى زكي",
      rating: 5,
      comment: "شغل نظيف جداً.",
      date: "2024-01-25",
    },
    {
      id: 7,
      clientName: "هيثم نبيل",
      rating: 4,
      comment: "الكهرباء رجعت تشتغل تمام، تسلم ايدك.",
      date: "2024-01-28",
    },
    {
      id: 8,
      clientName: "ياسمين صبري",
      rating: 5,
      comment: "ممتاز.",
      date: "2024-02-01",
    },
    {
      id: 9,
      clientName: "كريم محمود",
      rating: 5,
      comment: "خدمة رائعة جداً.",
      date: "2024-02-05",
    },
    {
      id: 10,
      clientName: "نادية حسن",
      rating: 4,
      comment: "شكراً على الأمانة والدقة.",
      date: "2024-02-07",
    },
  ],
  portfolio: [
    {
      id: 1,
      title: "تشطيب شقة سكنية",
      imageUrl:
        "https://img.freepik.com/free-photo/modern-living-room-interior-design_23-2150794692.jpg",
    },
    {
      id: 2,
      title: "تأسيس كهرباء فيلا",
      imageUrl:
        "https://img.freepik.com/free-photo/electrician-working-new-home_169016-3652.jpg",
    },
    {
      id: 3,
      title: "تركيب نجف مودرن",
      imageUrl:
        "https://img.freepik.com/free-photo/luxury-crystal-chandelier_1339-4050.jpg",
    },
    {
      id: 4,
      title: "صيانة لوحة تحكم",
      imageUrl:
        "https://img.freepik.com/free-photo/male-electrician-works-switchboard-with-electrical-connecting-cable_169016-16039.jpg",
    },
    {
      id: 5,
      title: "تركيب إضاءة مخفية",
      imageUrl:
        "https://img.freepik.com/free-photo/ceiling-lamp-decoration-interior-room_74190-2775.jpg",
    },
    {
      id: 6,
      title: "تأسيس سباكة حمام",
      imageUrl:
        "https://img.freepik.com/free-photo/plumber-installing-sink-bathroom_169016-3645.jpg",
    },
    {
      id: 7,
      title: "عمل ديكورات جبس",
      imageUrl:
        "https://img.freepik.com/free-photo/empty-living-room-with-blue-sofa-plants-table-empty-white-wall-background-3d-rendering_41470-1778.jpg",
    },
    {
      id: 8,
      title: "مشروع شركة",
      imageUrl:
        "https://img.freepik.com/free-photo/office-skyscrapers-business-district_107420-95729.jpg",
    },
    {
      id: 9,
      title: "صيانة خارجية",
      imageUrl:
        "https://img.freepik.com/free-photo/worker-installing-solar-panels_23-2149352195.jpg",
    },
    {
      id: 10,
      title: "تجديد مطبخ كامل",
      imageUrl:
        "https://img.freepik.com/free-photo/modern-kitchen-interior-design_23-2150794689.jpg",
    },
    {
      id: 11,
      title: "تركيب سخانات شمسية",
      imageUrl:
        "https://img.freepik.com/free-photo/technician-installing-solar-panels-roof_23-2149352210.jpg",
    },
    {
      id: 12,
      title: "إضاءة لاند سكيب",
      imageUrl:
        "https://img.freepik.com/free-photo/illuminated-garden-path-night_1268-14578.jpg",
    },
  ],
};
