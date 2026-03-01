import { useState, useEffect } from 'react';
import {
    FaEnvelopeOpen,
    FaEnvelope,
    FaTrash,
    FaSyncAlt,
    FaPhone,
    FaCalendarAlt,
    FaUser,
    FaFilter,
    FaEye
} from 'react-icons/fa';
import { adminContactApi } from '../../../Api/admin/adminContact.api';
import type { ContactMessage } from '../../../Api/admin/adminContact.api';
import { toast } from 'react-toastify';
import './ContactMessages.css';

const ContactMessages = () => {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
    const [selectedMsg, setSelectedMsg] = useState<ContactMessage | null>(null);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const isReadParam = filter === 'all' ? undefined : (filter === 'unread' ? 0 : 1);
            const response = await adminContactApi.getAllMessages({
                page,
                is_read: isReadParam as any
            });
            const result = response.data;
            if (result.status) {
                setMessages(result.data.data);
                setLastPage(result.data.last_page);
            }
        } catch (err) {
            toast.error('فشل تحميل الرسائل');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return;
        try {
            const response = await adminContactApi.deleteMessage(id);
            if (response.data.status) {
                toast.success('تم حذف الرسالة بنجاح');
                setMessages(prev => prev.filter(m => m.id !== id));
            }
        } catch (err) {
            toast.error('فشل الحذف');
        }
    };

    const handleMarkAsRead = async (msg: ContactMessage) => {
        if (msg.is_read) return;
        try {
            const response = await adminContactApi.markAsRead(msg.id);
            if (response.data.status) {
                setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: true } : m));
            }
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    };

    const openModal = async (msg: ContactMessage) => {
        setSelectedMsg(msg);
        handleMarkAsRead(msg);
    };

    useEffect(() => {
        fetchMessages();
    }, [page, filter]);

    return (
        <div className="admin-contact-container">
            <header className="page-header-premium">
                <div className="header-content">
                    <h1>الشكاوي والاقتراحات</h1>
                    <p>إدارة رسائل التواصل الواردة من المستخدمين والزوار</p>
                </div>
                <button className="action-btn-refresh" onClick={fetchMessages}>
                    <FaSyncAlt /> تحديث
                </button>
            </header>

            <div className="filter-bar-card">
                <div className="filter-group">
                    <FaFilter />
                    <select value={filter} onChange={(e) => { setFilter(e.target.value as any); setPage(1); }}>
                        <option value="all">الكل</option>
                        <option value="unread">غير مقروء</option>
                        <option value="read">مقروء</option>
                    </select>
                </div>
            </div>

            <div className="messages-grid">
                {loading ? (
                    <div className="loading-state">جاري التحميل...</div>
                ) : messages.length === 0 ? (
                    <div className="empty-state">لا يوجد رسائل حالياً</div>
                ) : (
                    messages.map(msg => (
                        <div key={msg.id} className={`message-card ${!msg.is_read ? 'unread' : ''}`}>
                            <div className="msg-status-icon">
                                {msg.is_read ? <FaEnvelopeOpen className="read-icon" /> : <FaEnvelope className="unread-icon" />}
                            </div>
                            <div className="msg-body">
                                <div className="msg-top">
                                    <span className="msg-user"><FaUser /> {msg.name}</span>
                                    <span className="msg-date"><FaCalendarAlt /> {new Date(msg.created_at).toLocaleDateString('ar-EG')}</span>
                                </div>
                                <h3 className="msg-subject">{msg.subject || 'بدون موضوع'}</h3>
                                <p className="msg-preview">{msg.message.length > 120 ? msg.message.substring(0, 120) + '...' : msg.message}</p>
                                <div className="msg-footer">
                                    <span className="msg-phone"><FaPhone /> {msg.phone || 'غير مدرج'}</span>
                                    <div className="msg-actions">
                                        <button className="btn-view" onClick={() => openModal(msg)}><FaEye /> عرض</button>
                                        <button className="btn-delete" onClick={() => handleDelete(msg.id)}><FaTrash /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {lastPage > 1 && (
                <div className="pagination">
                    <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>السابق</button>
                    <span>صفحة {page} من {lastPage}</span>
                    <button disabled={page === lastPage} onClick={() => setPage(p => p + 1)}>التالي</button>
                </div>
            )}

            {/* Modal for viewing message content */}
            {selectedMsg && (
                <div className="msg-modal-overlay" onClick={() => setSelectedMsg(null)}>
                    <div className="msg-modal-card" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{selectedMsg.subject || 'تفاصيل الرسالة'}</h2>
                            <button className="close-btn" onClick={() => setSelectedMsg(null)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="meta-info">
                                <span><strong>المرسل:</strong> {selectedMsg.name}</span>
                                <span><strong>رقم الهاتف:</strong> {selectedMsg.phone || 'غير مدرج'}</span>
                                <span><strong>التاريخ:</strong> {new Date(selectedMsg.created_at).toLocaleString('ar-EG')}</span>
                            </div>
                            <div className="msg-content-full">
                                {selectedMsg.message}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-close-modal" onClick={() => setSelectedMsg(null)}>إغلاق</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContactMessages;
