import userImg from "../../assets/images/Rectangle 35.png";
import artisanImg from "../../assets/images/Rectangle 33.png";
import companyImg from "../../assets/images/Rectangle 31.png";

export const JOIN_CARDS = [
  {
    title: "المستخدم",
    text: "نقدم لك مختلف الخدمات من الصنايعية المحترفين في جميع المجالات مع تجربة استخدام سهلة وخدمة موثوقة.",
    image: userImg,
    button: "سجل الآن حسابك",
    link: "/register",
  },
  {
    title: "الصنايعي",
    text: "انضم إلينا الآن واعرض خدماتك، وساعد عملاءك في الوصول إليك بسهولة وزيادة دخلك.",
    image: artisanImg,
    button: "سجل الآن حساب صنايعي",
    link: "/register-worker",
  },
  {
    title: "الشركات",
    text: "استفد من خدماتنا في توسيع شبكة عملائك وتوفير أفضل الصنايعية المعتمدين لدينا لشركتك.",
    image: companyImg,
    button: "سجل الآن حساب شركتك",
    link: "/register-company",
  },
];
