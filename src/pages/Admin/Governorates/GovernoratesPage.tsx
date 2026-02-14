import { useState, useEffect } from 'react';
import {
    Search,
    Edit,
    Trash2,
    Plus,
    X,
    RefreshCcw,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import { adminGovernoratesApi } from '../../../Api/admin/adminGovernorates.api';
import './GovernoratesPage.css';

interface GovernorateData {
    id: string;
    name: string;
    slug: string;
    is_active: boolean;
    created_at: string;
}

const GovernoratesPage = () => {
    const [governorates, setGovernorates] = useState<GovernorateData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedGov, setSelectedGov] = useState<GovernorateData | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        is_active: true
    });

    const fetchGovernorates = async () => {
        setLoading(true);
        try {
            const response = await adminGovernoratesApi.getAllGovernorates();
            setGovernorates(response.data);
        } catch (err: any) {
            toast.error("فشل تحميل قائمة المحافظات");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGovernorates();
    }, []);

    const handleOpenModal = (mode: 'create' | 'edit', gov: GovernorateData | null = null) => {
        setModalMode(mode);
        setSelectedGov(gov);
        if (mode === 'edit' && gov) {
            setFormData({
                name: gov.name,
                is_active: gov.is_active
            });
        } else {
            setFormData({
                name: '',
                is_active: true
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedGov(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (modalMode === 'create') {
                await adminGovernoratesApi.createGovernorate(formData);
                toast.success("تم إضافة المحافظة بنجاح");
            } else if (selectedGov) {
                await adminGovernoratesApi.updateGovernorate(selectedGov.id, formData);
                toast.success("تم تحديث المحافظة بنجاح");
            }
            handleCloseModal();
            fetchGovernorates();
        } catch (err) {
            toast.error("حدث خطأ أثناء حفظ البيانات");
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("هل أنت متأكد من رغبتك في حذف هذه المحافظة؟")) return;
        try {
            await adminGovernoratesApi.deleteGovernorate(id);
            toast.success("تم حذف المحافظة بنجاح");
            fetchGovernorates();
        } catch (err) {
            toast.error("حدث خطأ أثناء الحذف");
        }
    };

    const filteredGovernorates = governorates.filter(g =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="governorates-container">
            <header className="governorates-premium-header">
                <div className="header-glass-content">
                    <div className="title-area">
                        <h1>إدارة المحافظات</h1>
                        <p>تفعيل أو تعطيل التواجد في مختلف محافظات الجمهورية</p>
                    </div>
                    <div className="header-actions-top">
                        <button className="add-gov-btn" onClick={() => handleOpenModal('create')}>
                            <Plus size={20} />
                            <span>إضافة محافظة جديدة</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="governorates-controls">
                <div className="search-wrapper">
                    <Search className="search-icon" size={20} />
                    <input
                        type="text"
                        placeholder="ابحث عن محافظة..."
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button className="action-btn" onClick={fetchGovernorates} title="تحديث">
                    <RefreshCcw size={18} />
                </button>
            </div>

            <div className="governorates-table-wrapper">
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>جاري التحميل...</div>
                ) : (
                    <table className="governorates-table">
                        <thead>
                            <tr>
                                <th>اسم المحافظة</th>
                                <th>الحالة</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredGovernorates.length > 0 ? filteredGovernorates.map(gov => (
                                <tr key={gov.id}>
                                    <td>
                                        <div className="gov-name">{gov.name}</div>
                                    </td>
                                    <td>
                                        <span className={`gov-status-badge ${gov.is_active ? 'active' : 'inactive'}`}>
                                            {gov.is_active ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                            {gov.is_active ? 'نشطة' : 'معطلة'}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <button className="action-btn edit" onClick={() => handleOpenModal('edit', gov)}>
                                            <Edit size={18} />
                                        </button>
                                        <button className="action-btn delete" onClick={() => handleDelete(gov.id)}>
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={3} style={{ textAlign: 'center', padding: '2rem' }}>لا توجد محافظات حالياً</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <>
                    <div className="modal-overlay" onClick={handleCloseModal}></div>
                    <div className="gov-modal">
                        <div className="modal-header">
                            <h3>{modalMode === 'create' ? 'إضافة محافظة جديدة' : 'تعديل المحافظة'}</h3>
                            <button className="close-btn" onClick={handleCloseModal}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="gov-form">
                            <div className="form-group-governate">
                                <label>اسم المحافظة</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="مثال: القاهرة، الجيزة..."
                                />
                            </div>
                            <label className="form-check-group">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                />
                                <span>تفعيل المحافظة حالياً</span>
                            </label>
                        </form>
                        <div className="modal-footer">
                            <button type="button" className="cancel-btn" onClick={handleCloseModal}>إلغاء</button>
                            <button type="submit" className="submit-btn success" onClick={handleSubmit}>
                                {modalMode === 'create' ? 'إضافة' : 'حفظ التغييرات'}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default GovernoratesPage;
