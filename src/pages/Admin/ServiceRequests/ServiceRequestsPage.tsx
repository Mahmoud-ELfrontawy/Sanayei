import { useState, useEffect } from 'react';
import {
    FaSearch,
    FaEdit,
    FaRegTrashAlt,
    FaRegCalendarAlt,
    FaRegClock,
    FaUser,
    FaSyncAlt,
    FaTimes
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { adminServiceRequestsApi } from '../../../Api/admin/adminServiceRequests.api';
import './ServiceRequestsPage.css';

interface ServiceRequestData {
    id: string;
    name: string;
    email: string;
    phone: string;
    province: string;
    address: string;
    date: string;
    time: string;
    status: 'pending' | 'accepted' | 'rejected' | 'completed';
    service?: { id: number; name: string };
    craftsman?: { id: number; name: string };
    user?: { id: number; name: string };
}

const ServiceRequestsPage = () => {
    const [requests, setRequests] = useState<ServiceRequestData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<ServiceRequestData | null>(null);
    const [formData, setFormData] = useState({
        status: 'pending' as any,
        craftsman_id: '' as any,
        date: '',
        time: ''
    });

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const response = await adminServiceRequestsApi.getAllServiceRequests();
            setRequests(response.data);
        } catch (err: any) {
            toast.error("فشل تحميل قائمة الطلبات");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleOpenEdit = (request: ServiceRequestData) => {
        setSelectedRequest(request);
        setFormData({
            status: request.status,
            craftsman_id: request.craftsman?.id || '',
            date: request.date || '',
            time: request.time || ''
        });
        setIsEditModalOpen(true);
    };

    const handleCloseEdit = () => {
        setIsEditModalOpen(false);
        setSelectedRequest(null);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRequest) return;
        try {
            await adminServiceRequestsApi.updateServiceRequest(selectedRequest.id, formData);
            toast.success("تم تحديث الطلب بنجاح");
            handleCloseEdit();
            fetchRequests();
        } catch (err) {
            toast.error("حدث خطأ أثناء تحديث البيانات");
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("هل أنت متأكد من حذف هذا الطلب؟")) return;
        try {
            await adminServiceRequestsApi.deleteServiceRequest(id);
            toast.success("تم حذف الطلب بنجاح");
            fetchRequests();
        } catch (err) {
            toast.error("حدث خطأ أثناء الحذف");
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending': return 'قيد المراجعة';
            case 'accepted': return 'تم القبول';
            case 'rejected': return 'مرفوض';
            case 'completed': return 'مكتمل';
            default: return status;
        }
    };

    const filteredRequests = requests.filter(r =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.service?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="service-requests-container">
            <header className="requests-premium-header">
                <div className="header-glass-content">
                    <div className="title-area">
                        <h1>إدارة طلبات الخدمات</h1>
                        <p>متابعة الطلبات الجارية وتوزيع المهام على الصنايعية</p>
                    </div>
                </div>
            </header>

            <div className="requests-controls">
                <div className="search-wrapper">
                    <FaSearch className="search-icon" size={20} />
                    <input
                        type="text"
                        placeholder="ابحث باسم العميل أو نوع الخدمة..."
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button className="action-btn" onClick={fetchRequests} title="تحديث">
                    <FaSyncAlt size={18} />
                </button>
            </div>

            <div className="requests-table-wrapper">
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>جاري التحميل...</div>
                ) : (
                    <table className="requests-table">
                        <thead>
                            <tr>
                                <th>العميل</th>
                                <th>الخدمة</th>
                                <th>الموقع</th>
                                <th>الموعد</th>
                                <th>الصنايعي</th>
                                <th>الحالة</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRequests.length > 0 ? filteredRequests.map(request => (
                                <tr key={request.id}>
                                    <td>
                                        <div className="customer-info">
                                            <span className="customer-name">{request.name}</span>
                                            <span className="customer-phone">{request.phone}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="service-tag">{request.service?.name || 'غير محدد'}</span>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.85rem' }}>
                                            <div>{request.province}</div>
                                            <div style={{ color: '#64748b' }}>{request.address}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.85rem' }}>
                                            <div><FaRegCalendarAlt size={12} style={{ marginLeft: 4 }} />{request.date}</div>
                                            <div><FaRegClock size={12} style={{ marginLeft: 4 }} />{request.time}</div>
                                        </div>
                                    </td>
                                    <td>
                                        {request.craftsman ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <FaUser size={14} color="#3b82f6" />
                                                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{request.craftsman.name}</span>
                                            </div>
                                        ) : (
                                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>غير محدد</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`request-status-badge ${request.status}`}>
                                            {getStatusText(request.status)}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <button className="action-btn edit" onClick={() => handleOpenEdit(request)}>
                                            <FaEdit size={18} />
                                        </button>
                                        <button className="action-btn delete" onClick={() => handleDelete(request.id)}>
                                            <FaRegTrashAlt size={18} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>لا توجد طلبات حالياً</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && selectedRequest && (
                <>
                    <div className="modal-overlay" onClick={handleCloseEdit}></div>
                    <div className="request-modal">
                        <div className="modal-header">
                            <h3>تحديث حالة الطلب</h3>
                            <button className="close-btn" onClick={handleCloseEdit} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><FaTimes size={24} /></button>
                        </div>
                        <form onSubmit={handleUpdate} className="request-form">
                            <div className="form-group-service">
                                <label>حالة الطلب</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                >
                                    <option value="pending">قيد المراجعة</option>
                                    <option value="accepted">قبول الطلب</option>
                                    <option value="rejected">رفض الطلب</option>
                                    <option value="completed">تم التنفيذ</option>
                                </select>
                            </div>
                            <div className="form-group-service">
                                <label>تغيير الصنايعي (ID)</label>
                                <input
                                    type="text"
                                    value={formData.craftsman_id}
                                    onChange={(e) => setFormData({ ...formData, craftsman_id: e.target.value })}
                                    placeholder="أدخل معرف الصنايعي..."
                                />
                            </div>
                            <div className="form-group-service">
                                <label>التاريخ</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                            <div className="form-group-service">
                                <label>الوقت</label>
                                <input
                                    type="time"
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                />
                            </div>
                        </form>
                        <div className="modal-footer">
                            <button type="button" onClick={handleCloseEdit} style={{ padding: '0.75rem 1.5rem', border: 'none', background: '#f1f5f9', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>إلغاء</button>
                            <button type="submit" onClick={handleUpdate} style={{ padding: '0.75rem 1.5rem', border: 'none', background: '#4f46e5', color: 'white', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>حفظ التعديلات</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ServiceRequestsPage;