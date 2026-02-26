import { useState, useEffect } from 'react';
import {
    FaSearch,
    FaEdit,
    FaRegTrashAlt,
    FaPlus,
    FaTimes,
    FaLayerGroup,
    FaSyncAlt
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { adminServicesApi } from '../../../Api/admin/adminServices.api';
import { getFullImageUrl } from '../../../utils/imageUrl';
import '../AdminPremium.css';
import './ServicesPage.css';

interface ServiceData {
    id: string;
    name: string;
    description: string;
    icon: string;
    slug: string;
    price?: number;
    created_at: string;
}

const ServicesPage = () => {
    const [services, setServices] = useState<ServiceData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedService, setSelectedService] = useState<ServiceData | null>(null);
    const [formData, setFormData] = useState<{
        name: string;
        description: string;
        price: number;
        icon: string | File;
    }>({
        name: '',
        description: '',
        price: 0,
        icon: ''
    });
    const [iconPreview, setIconPreview] = useState<string | null>(null);

    const fetchServices = async () => {
        setLoading(true);
        try {
            const response = await adminServicesApi.getAllServices({
                page: currentPage,
                search: searchQuery || undefined
            });

            // Laravel-style pagination response
            const data = response.data.data ? response.data.data : response.data;
            setServices(data || []);
            setTotalPages(response.data.last_page || 1);
        } catch (err: any) {
            toast.error("فشل تحميل قائمة الخدمات");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, [currentPage, searchQuery]);

    const handleOpenModal = (mode: 'create' | 'edit', service: ServiceData | null = null) => {
        setModalMode(mode);
        setSelectedService(service);
        if (mode === 'edit' && service) {
            setFormData({
                name: service.name,
                description: service.description || '',
                price: service.price || 0,
                icon: service.icon || ''
            });
            setIconPreview((service.icon ? getFullImageUrl(service.icon) : null) as string | null);
        } else {
            setFormData({
                name: '',
                description: '',
                price: 0,
                icon: ''
            });
            setIconPreview(null);
        }
        setIsModalOpen(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData({ ...formData, icon: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setIconPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedService(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('price', formData.price.toString());

        // إرفاق الأيقونة فقط إذا تم اختيار ملف جديد أو كان نصاً (في حالة الـ update بدون تغيير الصورة)
        if (formData.icon instanceof File) {
            data.append('icon', formData.icon);
        }

        try {
            if (modalMode === 'create') {
                await adminServicesApi.createService(data);
                toast.success("تم إضافة الخدمة بنجاح ✅");
            } else if (selectedService) {
                await adminServicesApi.updateService(selectedService.id, data);
                toast.success("تم تحديث الخدمة بنجاح ✅");
            }
            handleCloseModal();
            fetchServices();
        } catch (error: any) {
            console.error("Service Save Error:", error);
            const msg = error.response?.data?.message || "حدث خطأ أثناء حفظ البيانات";
            const errs = error.response?.data?.errors;

            if (errs) {
                Object.values(errs).flat().forEach((m: any) => toast.error(m));
            } else {
                toast.error(msg);
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("هل أنت متأكد من رغبتك في حذف هذه الخدمة؟")) return;
        try {
            await adminServicesApi.deleteService(id);
            toast.success("تم حذف الخدمة بنجاح");
            fetchServices();
        } catch (err) {
            toast.error("حدث خطأ أثناء الحذف");
        }
    };

    return (
        <div className="services-container">
            <header className="services-premium-header">
                <div className="header-glass-content">
                    <div className="title-area">
                        <h1>إدارة الخدمات</h1>
                        <p>إضافة وتعديل الخدمات المتوفرة في المنصة</p>
                    </div>
                    <div className="header-actions-top">
                        <button className="add-service-btn" onClick={() => handleOpenModal('create')}>
                            <FaPlus size={20} />
                            <span>إضافة خدمة جديدة</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="services-controls">
                <div className="search-wrapper">
                    <FaSearch className="search-icon" size={20} />
                    <input
                        type="text"
                        placeholder="ابحث عن خدمة..."
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button className="action-btn" onClick={fetchServices} title="تحديث">
                    <FaSyncAlt size={18} />
                </button>
            </div>

            <div className="services-table-wrapper">
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>جاري التحميل...</div>
                ) : (
                    <table className="services-table">
                        <thead>
                            <tr>
                                <th>الأيقونة</th>
                                <th>اسم الخدمة</th>
                                <th>الوصف</th>
                                <th>السعر</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.length > 0 ? services.map(service => (
                                <tr key={service.id}>
                                    <td>
                                        <div className="service-icon-cell">
                                            {service.icon ? (
                                                <img src={getFullImageUrl(service.icon)} alt={service.name} className="service-icon-img" />
                                            ) : (
                                                <FaLayerGroup size={24} />
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="service-name">{service.name}</div>
                                    </td>
                                    <td>
                                        <div className="service-description">{service.description || 'لا يوجد وصف'}</div>
                                    </td>
                                    <td>
                                        <div className="service-price">{service.price ? `${service.price} ج.م` : 'غير محدد'}</div>
                                    </td>
                                    <td className="actions-cell">
                                        <button className="action-btn edit" onClick={() => handleOpenModal('edit', service)}>
                                            <FaEdit size={18} />
                                        </button>
                                        <button className="action-btn delete" onClick={() => handleDelete(service.id)}>
                                            <FaRegTrashAlt size={18} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>لا توجد خدمات حالياً</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}

                {totalPages > 1 && (
                    <div className="pagination-container" style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem', gap: '1rem', alignItems: 'center', borderTop: '1px solid var(--color-border)' }}>
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            className="pg-btn"
                            style={{ padding: '0.5rem 1rem', border: '1px solid var(--color-border)', borderRadius: 6, background: 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
                        >
                            السابق
                        </button>
                        <span className="pg-info" style={{ fontSize: '0.9rem', fontWeight: 600 }}>صفحة {currentPage} من {totalPages}</span>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="pg-btn"
                            style={{ padding: '0.5rem 1rem', border: '1px solid var(--color-border)', borderRadius: 6, background: 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
                        >
                            التالي
                        </button>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <>
                    <div className="modal-overlay" onClick={handleCloseModal}></div>
                    <div className="service-modal">
                        <div className="modal-header">
                            <h3>{modalMode === 'create' ? 'إضافة خدمة جديدة' : 'تعديل الخدمة'}</h3>
                            <button className="close-btn" onClick={handleCloseModal}><FaTimes size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="service-form">
                            <div className="form-group-service2">
                                <label>اسم الخدمة</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="مثال: سباكة، كهرباء..."
                                />
                            </div>
                            <div className="form-group-service2">
                                <label>السعر الأساسي (اختياري)</label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                    placeholder="0"
                                />
                            </div>
                            <div className="form-group-service2 full">
                                <label>الوصف</label>
                                <textarea
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="وصف مختصر للخدمة..."
                                />
                            </div>
                            <div className="form-group-service2 full">
                                <label>أيقونة الخدمة (صورة)</label>
                                <div className="icon-upload-wrapper">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        id="icon-upload"
                                        className="file-input-hidden"
                                    />
                                    <label htmlFor="icon-upload" className="custom-file-btn">
                                        <FaPlus /> اختر صورة
                                    </label>
                                    {iconPreview && (
                                        <div className="icon-preview-container">
                                            <img src={iconPreview} alt="Preview" />
                                            <button type="button" className="remove-preview" onClick={() => {
                                                setIconPreview(null);
                                                setFormData({ ...formData, icon: '' });
                                            }}>
                                                <FaTimes />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </form>
                        <div className="modal-footer">
                            <button type="button" className="cancel-btn" onClick={handleCloseModal}>إلغاء</button>
                            <button type="submit" className="submit-btn" onClick={handleSubmit}>
                                {modalMode === 'create' ? 'إضافة' : 'حفظ التغييرات'}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ServicesPage;