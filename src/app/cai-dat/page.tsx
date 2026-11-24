
'use client';

import { useEffect, useState } from 'react';
import {
  Building2,
  UserRound,
  LockKeyhole,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Flame,
  Info,
} from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';

type TabType = 'club' | 'profile' | 'password';

interface ClubInfo {
  tenCLB: string;
  donViTrucThuoc: string;
  email: string;
  soDienThoai: string;
  diaChi: string;
}

interface ProfileInfo {
  hoTen: string;
  email: string;
  soDienThoai: string;
  diaChi: string;
  ngaySinh: string;
  gioiTinh: string;
}

const initialClubInfo: ClubInfo = {
  tenCLB: 'Karate-HaUI',
  donViTrucThuoc: 'Đại học Công Nghiệp Hà Nội',
  email: 'admin.karate@haui.edu.vn',
  soDienThoai: '0988888888',
  diaChi: 'Chùa Tu Hoàng, cách Đại Học Công Nghiệp 900m',
};

const initialProfileInfo: ProfileInfo = {
  hoTen: '',
  email: '',
  soDienThoai: '',
  diaChi: '',
  ngaySinh: '',
  gioiTinh: '',
};

const settingMenus = [
  {
    id: 'club' as TabType,
    title: 'Thông tin câu lạc bộ',
    description: 'Thông tin chung và liên hệ',
    icon: Building2,
  },
  {
    id: 'profile' as TabType,
    title: 'Thông tin cá nhân',
    description: 'Cập nhật hồ sơ quản trị viên',
    icon: UserRound,
  },
  {
    id: 'password' as TabType,
    title: 'Đổi mật khẩu',
    description: 'Thay đổi mật khẩu đăng nhập',
    icon: LockKeyhole,
  },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('club');

  const [clubInfo, setClubInfo] =
    useState<ClubInfo>(initialClubInfo);

  const [profileInfo, setProfileInfo] =
    useState<ProfileInfo>(initialProfileInfo);

  const [passwordInfo, setPasswordInfo] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [loadingClub, setLoadingClub] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] =
    useState<'success' | 'error' | ''>('');

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const activeMenu = settingMenus.find(
    (item) => item.id === activeTab
  );

  const inputClass =
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 shadow-sm';

  function showMessage(
    text: string,
    type: 'success' | 'error'
  ) {
    setMessage(text);
    setMessageType(type);
  }

  function handleTabChange(tab: TabType) {
    setActiveTab(tab);
    setMessage('');
    setMessageType('');
  }

  // Lấy thông tin câu lạc bộ
  useEffect(() => {
    if (activeTab !== 'club') return;

    let cancelled = false;

    async function fetchClubInfo() {
      try {
        setLoadingClub(true);

        const response = await fetch('/api/settings/club');
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || 'Không thể tải thông tin câu lạc bộ.'
          );
        }

        if (!cancelled) {
          setClubInfo({
            tenCLB: result.data.tenCLB || 'Karate-HaUI',
            donViTrucThuoc: result.data.donViTrucThuoc || 'Đại học Công Nghiệp Hà Nội',
            email: result.data.email || 'admin.karate@haui.edu.vn',
            soDienThoai: result.data.soDienThoai || '0988888888',
            diaChi: result.data.diaChi || 'Chùa Tu Hoàng, cách Đại Học Công Nghiệp 900m',
          });
        }
      } catch (error) {
        if (!cancelled) {
          showMessage(
            error instanceof Error
              ? error.message
              : 'Đã xảy ra lỗi khi tải dữ liệu.',
            'error'
          );
        }
      } finally {
        if (!cancelled) setLoadingClub(false);
      }
    }

    fetchClubInfo();

    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  // Lấy thông tin cá nhân quản trị viên
  useEffect(() => {
    if (activeTab !== 'profile') return;

    let cancelled = false;

    async function fetchProfile() {
      try {
        setLoadingProfile(true);

        const response = await fetch('/api/auth/profile');
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || 'Không thể tải thông tin cá nhân.'
          );
        }

        if (!cancelled) {
          const user = result.user;

          setProfileInfo({
            hoTen: user.hoTen ?? '',
            email: user.email ?? '',
            soDienThoai: user.soDienThoai ?? '',
            diaChi: user.diaChi ?? '',
            ngaySinh: user.ngaySinh
              ? String(user.ngaySinh).slice(0, 10)
              : '',
            gioiTinh: user.gioiTinh ?? '',
          });
        }
      } catch (error) {
        if (!cancelled) {
          showMessage(
            error instanceof Error
              ? error.message
              : 'Đã xảy ra lỗi khi tải dữ liệu.',
            'error'
          );
        }
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    }

    fetchProfile();

    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  // Cập nhật thông tin câu lạc bộ
  async function handleSaveClub() {
    if (!clubInfo.tenCLB.trim()) {
      showMessage('Tên câu lạc bộ không được để trống.', 'error');
      return;
    }

    try {
      setSaving(true);
      setMessage('');

      const response = await fetch('/api/settings/club', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clubInfo),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || 'Không thể cập nhật thông tin câu lạc bộ.'
        );
      }

      showMessage(
        result.message || 'Cập nhật thông tin câu lạc bộ thành công.',
        'success'
      );
    } catch (error) {
      showMessage(
        error instanceof Error
          ? error.message
          : 'Đã xảy ra lỗi khi lưu dữ liệu.',
        'error'
      );
    } finally {
      setSaving(false);
    }
  }

  // Cập nhật hồ sơ cá nhân
  async function handleSaveProfile() {
    if (!profileInfo.hoTen.trim() || !profileInfo.email.trim()) {
      showMessage('Họ tên và email không được để trống.', 'error');
      return;
    }

    try {
      setSaving(true);
      setMessage('');

      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileInfo),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || 'Không thể cập nhật thông tin cá nhân.'
        );
      }

      showMessage(
        result.message || 'Cập nhật thông tin cá nhân thành công.',
        'success'
      );
    } catch (error) {
      showMessage(
        error instanceof Error
          ? error.message
          : 'Đã xảy ra lỗi khi cập nhật hồ sơ.',
        'error'
      );
    } finally {
      setSaving(false);
    }
  }

  // Đổi mật khẩu
  async function handleChangePassword() {
    if (
      !passwordInfo.currentPassword ||
      !passwordInfo.newPassword ||
      !passwordInfo.confirmPassword
    ) {
      showMessage('Vui lòng nhập đầy đủ thông tin mật khẩu.', 'error');
      return;
    }

    if (passwordInfo.newPassword.length < 8) {
      showMessage('Mật khẩu mới phải có ít nhất 8 ký tự.', 'error');
      return;
    }

    if (passwordInfo.newPassword !== passwordInfo.confirmPassword) {
      showMessage('Mật khẩu xác nhận không trùng khớp.', 'error');
      return;
    }

    if (
      passwordInfo.currentPassword === passwordInfo.newPassword
    ) {
      showMessage(
        'Mật khẩu mới phải khác mật khẩu hiện tại.',
        'error'
      );
      return;
    }

    try {
      setSaving(true);
      setMessage('');

      const response = await fetch('/api/auth/change-password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordInfo),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || 'Không thể đổi mật khẩu.'
        );
      }

      setPasswordInfo({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      showMessage(
        result.message || 'Đổi mật khẩu thành công.',
        'success'
      );
    } catch (error) {
      showMessage(
        error instanceof Error
          ? error.message
          : 'Đã xảy ra lỗi khi đổi mật khẩu.',
        'error'
      );
    } finally {
      setSaving(false);
    }
  }

  function renderMessage() {
    if (!message) return null;

    return (
      <div
        className={`flex items-start gap-2 rounded-xl border p-3 text-sm ${messageType === 'success'
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-gray-200 bg-gray-50 text-gray-900'
          }`}
      >
        {messageType === 'success' ? (
          <CheckCircle2 size={18} className="shrink-0" />
        ) : (
          <AlertCircle size={18} className="shrink-0" />
        )}
        <span>{message}</span>
      </div>
    );
  }

  function renderPasswordInput(
    label: string,
    value: string,
    field: 'currentPassword' | 'newPassword' | 'confirmPassword',
    visible: boolean,
    toggle: () => void
  ) {
    return (
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          {label}
        </label>

        <div className="relative">
          <input
            type={visible ? 'text' : 'password'}
            value={value}
            onChange={(e) => {
              setPasswordInfo((prev) => ({
                ...prev,
                [field]: e.target.value,
              }));
              setMessage('');
              setMessageType('');
            }}
            className={`${inputClass} pr-11`}
            placeholder={`Nhập ${label.toLowerCase()}`}
            autoComplete="new-password"
          />

          <button
            type="button"
            onClick={toggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:bg-gray-50 hover:text-blue-600"
            aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout pageTitle="Cài đặt hệ thống">
      <div className="space-y-6 text-slate-800">
        <section className="relative overflow-hidden rounded-[28px] border border-white/80 bg-white    p-6 shadow-[0_12px_40px_rgba(219,39,119,0.08)] sm:p-8">
          <div className="pointer-events-none absolute -bottom-16 -right-8 select-none text-[180px] font-black leading-none text-white/40">
            空手
          </div>
          <div className="relative z-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wide text-white shadow-sm">
                  <Flame size={13} />
                  Karate-HaUI
                </span>
                <span className="rounded-full bg-sky-500 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm">
                  Đại học Công Nghiệp Hà Nội
                </span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                Cài đặt{' '}
                <span className="bg-white   bg-clip-text text-transparent">
                  hệ thống
                </span>
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
                Quản lý thông tin câu lạc bộ, hồ sơ quản trị viên và bảo mật tài khoản.
              </p>
            </div>
            <div className="relative inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/75 px-3.5 py-2 text-xs font-medium text-slate-600 shadow-sm">
              <MapPin size={14} className="text-blue-600" />
              Khu vực quản trị viên
            </div>
          </div>
        </section>

        <div className="flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50/70 px-4 py-3.5">
          <Info className="mt-0.5 shrink-0 text-sky-600" size={18} />
          <p className="text-sm leading-6 text-sky-800">
            Cập nhật thông tin câu lạc bộ, hồ sơ cá nhân và mật khẩu đăng nhập tại đây.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="h-fit rounded-[24px] border border-gray-200 bg-white p-3 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
            <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              Danh mục cài đặt
            </p>

            <div className="mt-2 space-y-1.5">
              {settingMenus.map((menu) => {
                const Icon = menu.icon;
                const isActive = activeTab === menu.id;

                return (
                  <button
                    key={menu.id}
                    type="button"
                    onClick={() => handleTabChange(menu.id)}
                    className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${isActive
                      ? 'bg-white   text-gray-900 font-bold ring-1 ring-gray-200'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'
                      }`}
                  >
                    <div
                      className={`rounded-xl p-2 ${isActive
                        ? 'bg-gray-100 text-blue-600'
                        : 'bg-slate-100 text-slate-500'
                        }`}
                    >
                      <Icon size={19} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">
                        {menu.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {menu.description}
                      </p>
                    </div>

                    {isActive && (
                      <ChevronRight size={17} className="shrink-0 text-blue-600" />
                    )}
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="min-w-0 overflow-hidden rounded-[26px] border border-gray-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
            <div className="border-b border-gray-200 bg-white    px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-gray-100 p-3 text-blue-600">
                  {activeMenu && <activeMenu.icon size={22} />}
                </div>

                <div>
                  <h2 className="font-bold text-slate-800">
                    {activeMenu?.title}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {activeMenu?.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6 p-5 sm:p-6">
              {/* THÔNG TIN CÂU LẠC BỘ */}
              {activeTab === 'club' && (
                <>
                  <div>
                    <h3 className="font-bold text-slate-800">
                      Thông tin chung
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Thông tin nhận diện và liên hệ của câu lạc bộ.
                    </p>
                  </div>

                  {loadingClub ? (
                    <div className="flex min-h-64 flex-col items-center justify-center gap-3">
                      <Loader2 className="animate-spin text-blue-600" size={30} />
                      <p className="text-sm text-slate-500">
                        Đang tải thông tin câu lạc bộ...
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Tên câu lạc bộ
                          </label>
                          <div className="relative">
                            <Building2
                              size={17}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                              value={clubInfo.tenCLB}
                              onChange={(e) =>
                                setClubInfo({
                                  ...clubInfo,
                                  tenCLB: e.target.value,
                                })
                              }
                              className={`${inputClass} pl-10`}
                              placeholder="Nhập tên câu lạc bộ"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Đơn vị trực thuộc
                          </label>
                          <input
                            value={clubInfo.donViTrucThuoc}
                            onChange={(e) =>
                              setClubInfo({
                                ...clubInfo,
                                donViTrucThuoc: e.target.value,
                              })
                            }
                            className={inputClass}
                            placeholder="Nhập đơn vị trực thuộc"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Email liên hệ
                          </label>
                          <div className="relative">
                            <Mail
                              size={17}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                              type="email"
                              value={clubInfo.email}
                              onChange={(e) =>
                                setClubInfo({
                                  ...clubInfo,
                                  email: e.target.value,
                                })
                              }
                              className={`${inputClass} pl-10`}
                              placeholder="Nhập email liên hệ"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Số điện thoại
                          </label>
                          <div className="relative">
                            <Phone
                              size={17}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                              value={clubInfo.soDienThoai}
                              onChange={(e) =>
                                setClubInfo({
                                  ...clubInfo,
                                  soDienThoai: e.target.value,
                                })
                              }
                              className={`${inputClass} pl-10`}
                              placeholder="Nhập số điện thoại"
                            />
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Địa chỉ
                          </label>
                          <div className="relative">
                            <MapPin
                              size={17}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                              value={clubInfo.diaChi}
                              onChange={(e) =>
                                setClubInfo({
                                  ...clubInfo,
                                  diaChi: e.target.value,
                                })
                              }
                              className={`${inputClass} pl-10`}
                              placeholder="Nhập địa chỉ câu lạc bộ"
                            />
                          </div>
                        </div>
                      </div>

                      {renderMessage()}

                      <div className="flex justify-end border-t border-slate-100 pt-5">
                        <button
                          type="button"
                          onClick={handleSaveClub}
                          disabled={saving}
                          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {saving ? (
                            <Loader2 size={17} className="animate-spin" />
                          ) : (
                            <Save size={17} />
                          )}
                          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* THÔNG TIN CÁ NHÂN */}
              {activeTab === 'profile' && (
                <>
                  <div>
                    <h3 className="font-bold text-slate-800">
                      Hồ sơ quản trị viên
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Cập nhật thông tin của tài khoản đang đăng nhập.
                    </p>
                  </div>

                  {loadingProfile ? (
                    <div className="flex min-h-64 flex-col items-center justify-center gap-3">
                      <Loader2 className="animate-spin text-blue-600" size={30} />
                      <p className="text-sm text-slate-500">
                        Đang tải thông tin cá nhân...
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Họ và tên
                          </label>
                          <input
                            value={profileInfo.hoTen}
                            onChange={(e) =>
                              setProfileInfo({
                                ...profileInfo,
                                hoTen: e.target.value,
                              })
                            }
                            className={inputClass}
                            placeholder="Nhập họ và tên"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Email
                          </label>
                          <div className="relative">
                            <Mail
                              size={17}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                              type="email"
                              value={profileInfo.email}
                              onChange={(e) =>
                                setProfileInfo({
                                  ...profileInfo,
                                  email: e.target.value,
                                })
                              }
                              className={`${inputClass} pl-10`}
                              placeholder="Nhập email"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Số điện thoại
                          </label>
                          <div className="relative">
                            <Phone
                              size={17}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                              value={profileInfo.soDienThoai}
                              onChange={(e) =>
                                setProfileInfo({
                                  ...profileInfo,
                                  soDienThoai: e.target.value,
                                })
                              }
                              className={`${inputClass} pl-10`}
                              placeholder="Nhập số điện thoại"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Ngày sinh
                          </label>
                          <div className="relative">
                            <CalendarDays
                              size={17}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                              type="date"
                              value={profileInfo.ngaySinh}
                              onChange={(e) =>
                                setProfileInfo({
                                  ...profileInfo,
                                  ngaySinh: e.target.value,
                                })
                              }
                              className={`${inputClass} pl-10`}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Giới tính
                          </label>
                          <select
                            value={profileInfo.gioiTinh}
                            onChange={(e) =>
                              setProfileInfo({
                                ...profileInfo,
                                gioiTinh: e.target.value,
                              })
                            }
                            className={inputClass}
                          >
                            <option value="">Chưa chọn</option>
                            <option value="Nam">Nam</option>
                            <option value="Nữ">Nữ</option>
                            <option value="Khác">Khác</option>
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Địa chỉ
                          </label>
                          <div className="relative">
                            <MapPin
                              size={17}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                              value={profileInfo.diaChi}
                              onChange={(e) =>
                                setProfileInfo({
                                  ...profileInfo,
                                  diaChi: e.target.value,
                                })
                              }
                              className={`${inputClass} pl-10`}
                              placeholder="Nhập địa chỉ"
                            />
                          </div>
                        </div>
                      </div>

                      {renderMessage()}

                      <div className="flex justify-end border-t border-slate-100 pt-5">
                        <button
                          type="button"
                          onClick={handleSaveProfile}
                          disabled={saving}
                          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {saving ? (
                            <Loader2 size={17} className="animate-spin" />
                          ) : (
                            <Save size={17} />
                          )}
                          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* ĐỔI MẬT KHẨU */}
              {activeTab === 'password' && (
                <>
                  <div>
                    <h3 className="font-bold text-slate-800">
                      Thay đổi mật khẩu
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Nhập mật khẩu hiện tại để xác nhận trước khi đổi.
                    </p>
                  </div>

                  <div className="max-w-xl space-y-5 rounded-2xl border border-gray-200 bg-white    p-5">
                    {renderPasswordInput(
                      'Mật khẩu hiện tại',
                      passwordInfo.currentPassword,
                      'currentPassword',
                      showPasswords.current,
                      () =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          current: !prev.current,
                        }))
                    )}

                    {renderPasswordInput(
                      'Mật khẩu mới',
                      passwordInfo.newPassword,
                      'newPassword',
                      showPasswords.new,
                      () =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          new: !prev.new,
                        }))
                    )}

                    {renderPasswordInput(
                      'Xác nhận mật khẩu mới',
                      passwordInfo.confirmPassword,
                      'confirmPassword',
                      showPasswords.confirm,
                      () =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          confirm: !prev.confirm,
                        }))
                    )}

                    <p className="text-xs text-slate-500">
                      Mật khẩu mới phải có ít nhất 8 ký tự.
                    </p>
                  </div>

                  {renderMessage()}

                  <div className="flex justify-end border-t border-slate-100 pt-5">
                    <button
                      type="button"
                      onClick={handleChangePassword}
                      disabled={saving}
                      className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving ? (
                        <Loader2 size={17} className="animate-spin" />
                      ) : (
                        <LockKeyhole size={17} />
                      )}
                      {saving ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}
