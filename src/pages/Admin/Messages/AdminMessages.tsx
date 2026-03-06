/* AdminMessages.tsx — Admin Messaging Center */
import { useState, useEffect, useRef, useCallback } from 'react';
import {
    FaBroadcastTower, FaUser, FaBuilding, FaHardHat,
    FaPaperPlane, FaSearch, FaTimes, FaHistory,
    FaEnvelopeOpenText, FaUsers, FaGlobeAfrica,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { adminMessagesApi, type AdminMessageItem } from '../../../Api/admin/adminMessages.api';
import './AdminMessages.css';

/* ── Types ─────────────────────────────────────────────────────── */
type Tab = 'broadcast' | 'individual';

type AudienceKey = 'all' | 'users' | 'craftsmen' | 'companies';
const AUDIENCE_OPTIONS: { key: AudienceKey; label: string; icon: React.ReactNode }[] = [
    { key: 'all', label: 'الجميع', icon: <FaGlobeAfrica /> },
    { key: 'users', label: 'المستخدمون', icon: <FaUser /> },
    { key: 'craftsmen', label: 'الصنايعية', icon: <FaHardHat /> },
    { key: 'companies', label: 'الشركات', icon: <FaBuilding /> },
];

type RecipientType = 'user' | 'craftsman' | 'company';
const RECIPIENT_TYPES: { key: RecipientType; label: string }[] = [
    { key: 'user', label: 'مستخدم' },
    { key: 'craftsman', label: 'صنايعي' },
    { key: 'company', label: 'شركة' },
];

interface Recipient { id: number; name: string; email: string; }

const TARGET_LABELS: Record<string, string> = {
    all: 'الجميع', users: 'المستخدمون', craftsmen: 'الصنايعية',
    companies: 'الشركات', user: 'مستخدم', craftsman: 'صنايعي', company: 'شركة',
};

/* ── Component ─────────────────────────────────────────────────── */
const AdminMessages = () => {
    const [tab, setTab] = useState<Tab>('broadcast');

    /* ── Broadcast form state ── */
    const [bAudience, setBAudience] = useState<AudienceKey>('all');
    const [bTitle, setBTitle] = useState('');
    const [bBody, setBBody] = useState('');
    const [bSending, setBSending] = useState(false);

    /* ── Individual form state ── */
    const [iType, setIType] = useState<RecipientType>('user');
    const [iTitle, setITitle] = useState('');
    const [iBody, setIBody] = useState('');
    const [iSending, setISending] = useState(false);
    const [searchQ, setSearchQ] = useState('');
    const [searchResults, setSearchResults] = useState<Recipient[]>([]);
    const [recipient, setRecipient] = useState<Recipient | null>(null);
    const [searching, setSearching] = useState(false);
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    /* ── History ── */
    const [history, setHistory] = useState<AdminMessageItem[]>([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [histPage, setHistPage] = useState(1);
    const [histTotal, setHistTotal] = useState(0);

    /* ── Fetch history ── */
    const fetchHistory = useCallback(async (page = 1) => {
        setHistoryLoading(true);
        try {
            const res = await adminMessagesApi.getAll(undefined, page);
            setHistory(res.data.data || []);
            setHistTotal(res.data.total || 0);
            setHistPage(page);
        } catch {
            toast.error('فشل تحميل سجل الرسائل');
        } finally {
            setHistoryLoading(false);
        }
    }, []);

    useEffect(() => { fetchHistory(1); }, [fetchHistory]);

    /* ── Recipient search ── */
    useEffect(() => {
        if (!searchQ || searchQ.length < 2) { setSearchResults([]); return; }
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(async () => {
            setSearching(true);
            try {
                const res = await adminMessagesApi.searchRecipients(iType, searchQ);
                setSearchResults(res.data.data || []);
            } catch { /* ignore */ } finally { setSearching(false); }
        }, 350);
    }, [searchQ, iType]);

    /* reset search when type changes */
    useEffect(() => { setRecipient(null); setSearchQ(''); setSearchResults([]); }, [iType]);

    /* ── Send broadcast ── */
    const handleSendBroadcast = async () => {
        if (!bTitle.trim() || !bBody.trim()) { toast.warning('أدخل العنوان والنص'); return; }
        setBSending(true);
        try {
            await adminMessagesApi.sendBroadcast({ target_type: bAudience, title: bTitle, body: bBody });
            toast.success('تم إرسال الرسالة الجماعية ✅');
            setBTitle(''); setBBody('');
            fetchHistory(1);
        } catch { toast.error('فشل إرسال الرسالة'); } finally { setBSending(false); }
    };

    /* ── Send individual ── */
    const handleSendIndividual = async () => {
        if (!recipient) { toast.warning('اختر المستلم أولاً'); return; }
        if (!iTitle.trim() || !iBody.trim()) { toast.warning('أدخل العنوان والنص'); return; }
        setISending(true);
        try {
            await adminMessagesApi.sendIndividual({ target_type: iType, target_id: recipient.id, title: iTitle, body: iBody });
            toast.success('تم إرسال الرسالة ✅');
            setITitle(''); setIBody(''); setRecipient(null); setSearchQ('');
            fetchHistory(1);
        } catch { toast.error('فشل إرسال الرسالة'); } finally { setISending(false); }
    };

    /* ── Render ── */
    return (
        <div className="admin-msg-page">
            {/* Header */}
            <div className="admin-msg-header">
                <div className="admin-msg-header-icon">
                    <FaEnvelopeOpenText />
                </div>
                <div>
                    <h1>مركز الرسائل</h1>
                    <p>أرسل رسائل جماعية أو فردية لجميع أنواع المستخدمين</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="admin-msg-tabs">
                <button className={`admin-msg-tab ${tab === 'broadcast' ? 'active' : ''}`} onClick={() => setTab('broadcast')}>
                    <FaBroadcastTower /> بث جماعي
                </button>
                <button className={`admin-msg-tab ${tab === 'individual' ? 'active' : ''}`} onClick={() => setTab('individual')}>
                    <FaUser /> رسالة فردية
                </button>
            </div>

            <div className="admin-msg-layout">
                {/* ── Left: Form ── */}
                {tab === 'broadcast' ? (
                    <div className="admin-msg-card">
                        <h2><FaBroadcastTower /> إرسال رسالة جماعية</h2>
                        <div className="admin-msg-form">
                            <div className="form-group">
                                <label>الجمهور المستهدف</label>
                                <div className="audience-chips">
                                    {AUDIENCE_OPTIONS.map(o => (
                                        <button
                                            key={o.key}
                                            className={`audience-chip ${bAudience === o.key ? 'selected' : ''}`}
                                            onClick={() => setBAudience(o.key)}
                                        >
                                            {o.icon} {o.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>عنوان الرسالة</label>
                                <input
                                    value={bTitle}
                                    onChange={e => setBTitle(e.target.value)}
                                    placeholder="مثال: تحديث مهم في السياسة..."
                                    maxLength={255}
                                />
                            </div>

                            <div className="form-group">
                                <label>نص الرسالة</label>
                                <textarea
                                    rows={5}
                                    value={bBody}
                                    onChange={e => setBBody(e.target.value)}
                                    placeholder="اكتب نص الرسالة هنا..."
                                />
                            </div>

                            <button className="admin-msg-send-btn" onClick={handleSendBroadcast} disabled={bSending}>
                                {bSending ? 'جاري الإرسال...' : <><FaPaperPlane /> إرسال للجميع</>}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="admin-msg-card">
                        <h2><FaUser /> إرسال رسالة فردية</h2>
                        <div className="admin-msg-form">
                            <div className="form-group">
                                <label>نوع المستلم</label>
                                <div className="audience-chips">
                                    {RECIPIENT_TYPES.map(t => (
                                        <button
                                            key={t.key}
                                            className={`audience-chip ${iType === t.key ? 'selected' : ''}`}
                                            onClick={() => setIType(t.key)}
                                        >
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>البحث عن المستلم</label>
                                <div className="recipient-search-wrap">
                                    <FaSearch className="recipient-search-icon" />
                                    <input
                                        value={searchQ}
                                        onChange={e => { setSearchQ(e.target.value); setRecipient(null); }}
                                        placeholder="ابحث بالاسم أو البريد..."
                                        disabled={!!recipient}
                                    />
                                    {searchResults.length > 0 && !recipient && (
                                        <div className="recipient-results">
                                            {searching && <div className="recipient-result-item"><span>جاري البحث...</span></div>}
                                            {searchResults.map(r => (
                                                <div
                                                    key={r.id}
                                                    className="recipient-result-item"
                                                    onClick={() => { setRecipient(r); setSearchQ(''); setSearchResults([]); }}
                                                >
                                                    <strong>{r.name}</strong>
                                                    <span>{r.email}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {recipient && (
                                    <div className="recipient-selected">
                                        <span>✅ {recipient.name} — {recipient.email}</span>
                                        <button onClick={() => setRecipient(null)}><FaTimes /></button>
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label>عنوان الرسالة</label>
                                <input
                                    value={iTitle}
                                    onChange={e => setITitle(e.target.value)}
                                    placeholder="مثال: تحذير بخصوص حسابك..."
                                    maxLength={255}
                                />
                            </div>

                            <div className="form-group">
                                <label>نص الرسالة</label>
                                <textarea
                                    rows={5}
                                    value={iBody}
                                    onChange={e => setIBody(e.target.value)}
                                    placeholder="اكتب نص الرسالة هنا..."
                                />
                            </div>

                            <button className="admin-msg-send-btn" onClick={handleSendIndividual} disabled={iSending || !recipient}>
                                {iSending ? 'جاري الإرسال...' : <><FaPaperPlane /> إرسال الرسالة</>}
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Right: History ── */}
                <div className="admin-msg-card">
                    <h2><FaHistory /> سجل الرسائل المرسلة {histTotal > 0 && `(${histTotal})`}</h2>
                    {historyLoading ? (
                        <div className="admin-msg-empty"><p>جاري التحميل...</p></div>
                    ) : history.length === 0 ? (
                        <div className="admin-msg-empty">
                            <FaEnvelopeOpenText />
                            <p>لا توجد رسائل مرسلة بعد</p>
                        </div>
                    ) : (
                        <div className="admin-msg-list">
                            {history.map(msg => (
                                <div key={msg.id} className="admin-msg-list-item">
                                    <div className="admin-msg-list-item-top">
                                        <span className="admin-msg-list-item-title">{msg.title}</span>
                                        <span className={`admin-msg-badge ${msg.type}`}>
                                            {msg.type === 'broadcast' ? '📢 جماعي' : '👤 فردي'}
                                        </span>
                                    </div>
                                    <p className="admin-msg-list-item-body">{msg.body}</p>
                                    <div className="admin-msg-meta">
                                        <span><FaUsers /> {TARGET_LABELS[msg.target_type] ?? msg.target_type}</span>
                                        <span>
                                            {new Date(msg.created_at).toLocaleDateString('ar-EG', {
                                                year: 'numeric', month: 'short', day: 'numeric',
                                                hour: '2-digit', minute: '2-digit',
                                            })}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {histTotal > 20 && (
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem' }}>
                            <button
                                className="audience-chip"
                                disabled={histPage <= 1}
                                onClick={() => fetchHistory(histPage - 1)}
                            >السابق</button>
                            <span style={{ padding: '0.4rem 0.7rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                صفحة {histPage}
                            </span>
                            <button
                                className="audience-chip"
                                disabled={history.length < 20}
                                onClick={() => fetchHistory(histPage + 1)}
                            >التالي</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminMessages;
