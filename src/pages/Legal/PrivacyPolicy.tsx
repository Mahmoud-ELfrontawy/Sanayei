import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import './LegalPages.css';

const PrivacyPolicy: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="lp-page-wrapper">
            <header className="lp-hero">
                <div className="lp-container">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        سياسة الخصوصية
                    </motion.h1>
                    <p>التزامنا بحماية بياناتك وخصوصيتك في منصة "صنايعي".</p>
                </div>
            </header>

            <main className="lp-container lp-content">
                <section>
                    <h2>١. جمع المعلومات</h2>
                    <p>نقوم بجمع المعلومات التي تقدمها لنا مباشرة عند إنشاء حسابك، مثل الاسم، رقم الهاتف، الموقع الجغرافي، ومعلومات المهارات الحرفية للصنايعية.</p>
                </section>

                <section>
                    <h2>٢. كيف نستخدم معلوماتك</h2>
                    <p>نستخدم البيانات لتحسين تجربة المستخدم، وتسهيل عملية التواصل بين العميل والصنايعي، وتقديم الدعم الفني اللازم.</p>
                </section>

                <section>
                    <h2>٣. حماية البيانات</h2>
                    <p>نحن نتخذ إجراءات أمنية متقدمة لحماية معلوماتك من الوصول غير المصرح به أو التعديل أو الإفصاح عنها.</p>
                </section>

                <section>
                    <h2>٤. مشاركة المعلومات</h2>
                    <p>لا نقوم ببيع معلوماتك الشخصية لأي طرف ثالث. نقوم فقط بمشاركة المعلومات الضرورية لإتمام طلبات الخدمة بين العميل والصنايعي.</p>
                </section>

                <section>
                    <h2>٥. حقوقك</h2>
                    <p>لك الحق في الوصول إلى بياناتك الشخصية وتصحيحها أو حذفها في أي وقت من خلال إعدادات حسابك.</p>
                </section>

                <div className="lp-last-updated">
                    آخر تحديث: فبراير ٢٠٢٦
                </div>
            </main>
        </div>
    );
};

export default PrivacyPolicy;
