import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import './LegalPages.css';

const TermsOfUse: React.FC = () => {
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
                        شروط الاستخدام
                    </motion.h1>
                    <p>القواعد والمسؤوليات التي تنظم استخدامك لمنصة "صنايعي".</p>
                </div>
            </header>

            <main className="lp-container lp-content">
                <section>
                    <h2>١. قبول الشروط</h2>
                    <p>باستخدامك لمنصة "صنايعي"، فإنك توافق على الالتزام بشروط الاستخدام الموضحة هنا.</p>
                </section>

                <section>
                    <h2>٢. مسؤولية المستخدم</h2>
                    <p>يجب على المستخدم تقديم معلومات صحيحة ودقيقة، ويتحمل كامل المسؤولية عن المحتوى الذي ينشره أو يشاركه عبر المنصة.</p>
                </section>

                <section>
                    <h2>٣. قواعد التعامل</h2>
                    <p>يجب الالتزام بالاحترام المتبادل بين العميل والصنايعي، ويمنع استخدام المنصة لأي أغراض غير قانونية أو احتيالية.</p>
                </section>

                <section>
                    <h2>٤. حقوق الملكية</h2>
                    <p>جميع حقوق الملكية الفكرية للمنصة والمحتوى هي ملك لشركة "صنايعي" ولا يجوز نسخها أو استخدامها دون إذن صريح.</p>
                </section>

                <section>
                    <h2>٥. تعديل الشروط</h2>
                    <p>نحتفظ بالحق في تحديث شروط الاستخدام في أي وقت، وسيتم إخطار المستخدمين بأي تغييرات جوهرية.</p>
                </section>

                <div className="lp-last-updated">
                    آخر تحديث: فبراير ٢٠٢٦
                </div>
            </main>
        </div>
    );
};

export default TermsOfUse;
