import ContactForm from "../../components/Contact/ContactForm";
import "./ContactPage.css";

const ContactPage: React.FC = () => {
    return (
        <section className="contact-page">
            <div className="container">
                <h1 className="contact-title">تواصل مع شركة <span>صنايعي</span></h1>
                <p className="contact-desc">
                    رضاؤكم يهمنا... لذا نسعى للوصول اليكم في 
                    اي وقت وفي كل مكان.. للاستفسارات والشكاوي تواصل معنا</p>
                <ContactForm />
            </div>
        </section>
    );
};

export default ContactPage;
