import React from 'react';
import { Language } from '../utils/translations';
import { CLINIC_INFO } from '../data/initialData';
import { Presentation, MapPin } from 'lucide-react';

interface NavbarProps {
  currentTab: 'dashboard' | 'patients' | 'appointments' | 'finance' | 'protocols' | 'pitch';
  onSelectTab: (tab: 'dashboard' | 'patients' | 'appointments' | 'finance' | 'protocols' | 'pitch') => void;
  onOpenQuickSession?: () => void;
  onOpenClinicAbout: () => void;
  currentLanguage: Language;
  onChangeLanguage: (lang: Language) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenQuickSession,
  onOpenClinicAbout,
  currentLanguage,
  onChangeLanguage,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-18 sm:h-20">
          {/* Zone 1: Prominent Clinic Logo without Doctor Photo */}
          <div className="flex items-center gap-4 shrink-0 py-2">
            <button 
              onClick={() => onSelectTab('dashboard')}
              className="flex items-center gap-3.5 group cursor-pointer text-left"
            >
              <img
                src={CLINIC_INFO.logoUrl}
                alt={CLINIC_INFO.name}
                className="h-12 sm:h-14 w-auto object-contain shrink-0 group-hover:scale-102 transition-transform drop-shadow-2xs"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="hidden sm:block border-l border-slate-200 pl-3.5">
                <div className="text-sm font-bold text-slate-800 tracking-tight leading-tight group-hover:text-[#6f906e] transition-colors whitespace-nowrap">
                  Fzt. Hamit Gümüş
                </div>
                <div className="text-[11px] font-medium text-slate-500 whitespace-nowrap mt-0.5">
                  Mersin Fizik Tedavi & Manuel Terapi
                </div>
              </div>
            </button>
          </div>

          {/* Zone 2: Clean single-line text navigation links with soft #82A381 accents */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`hover:text-[#587457] transition-colors whitespace-nowrap shrink-0 py-1.5 ${
                currentTab === 'dashboard' ? 'text-[#445B43] font-semibold border-b-2 border-[#82A381]' : ''
              }`}
            >
              {currentLanguage === 'ar' ? 'لوحة التحكم' : currentLanguage === 'en' ? 'Dashboard' : 'Genel Bakış'}
            </button>
            <button
              onClick={() => onSelectTab('patients')}
              className={`hover:text-[#587457] transition-colors whitespace-nowrap shrink-0 py-1.5 ${
                currentTab === 'patients' ? 'text-[#445B43] font-semibold border-b-2 border-[#82A381]' : ''
              }`}
            >
              {currentLanguage === 'ar' ? 'ملفات المرضى' : currentLanguage === 'en' ? 'Patients' : 'Hasta Dosyaları'}
            </button>
            <button
              onClick={() => onSelectTab('appointments')}
              className={`hover:text-[#587457] transition-colors whitespace-nowrap shrink-0 py-1.5 ${
                currentTab === 'appointments' ? 'text-[#445B43] font-semibold border-b-2 border-[#82A381]' : ''
              }`}
            >
              {currentLanguage === 'ar' ? 'الجدول والمواعيد' : currentLanguage === 'en' ? 'Appointments' : 'Randevu Takvimi'}
            </button>
            <button
              onClick={() => onSelectTab('finance')}
              className={`hover:text-[#587457] transition-colors whitespace-nowrap shrink-0 py-1.5 ${
                currentTab === 'finance' ? 'text-[#445B43] font-semibold border-b-2 border-[#82A381]' : ''
              }`}
            >
              {currentLanguage === 'ar' ? 'المالية والمصروفات' : currentLanguage === 'en' ? 'Finances' : 'Finans & Kasa'}
            </button>
            <button
              onClick={() => onSelectTab('protocols')}
              className={`hover:text-[#587457] transition-colors whitespace-nowrap shrink-0 py-1.5 ${
                currentTab === 'protocols' ? 'text-[#445B43] font-semibold border-b-2 border-[#82A381]' : ''
              }`}
            >
              {currentLanguage === 'ar' ? 'بروتوكولات العلاج' : currentLanguage === 'en' ? 'Protocols' : 'Tedavi Protokolleri'}
            </button>
            <button
              onClick={() => onSelectTab('pitch')}
              className={`hover:text-[#587457] transition-colors whitespace-nowrap shrink-0 py-1.5 flex items-center gap-1.5 ${
                currentTab === 'pitch' ? 'text-[#445B43] font-semibold border-b-2 border-[#82A381]' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Presentation className="w-4 h-4 text-[#82A381]" />
              <span>{currentLanguage === 'en' ? 'Project Concept' : 'Proje Fikri'}</span>
            </button>
            <button
              onClick={onOpenClinicAbout}
              className="hover:text-[#587457] transition-colors whitespace-nowrap shrink-0 py-1.5 flex items-center gap-1.5 text-slate-600 hover:text-slate-900"
            >
              <MapPin className="w-4 h-4 text-[#82A381]" />
              <span>{currentLanguage === 'en' ? 'Clinic & Location' : 'Klinik & Konum'}</span>
            </button>
          </nav>

          {/* Zone 3: Language Selector (TR & EN only) */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200/80 text-xs font-semibold">
              <button
                type="button"
                onClick={() => onChangeLanguage('tr')}
                className={`px-2.5 py-1 rounded transition-colors ${currentLanguage === 'tr' ? 'bg-white text-[#314230] shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                TR
              </button>
              <button
                type="button"
                onClick={() => onChangeLanguage('en')}
                className={`px-2.5 py-1 rounded transition-colors ${currentLanguage === 'en' ? 'bg-white text-[#314230] shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                EN
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar for smaller viewports */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-3 border-t border-slate-100 text-xs scrollbar-none">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`whitespace-nowrap px-2.5 py-1 rounded-md ${currentTab === 'dashboard' ? 'bg-teal-50 text-teal-800 font-semibold' : 'text-slate-600'}`}
          >
            Genel Bakış
          </button>
          <button
            onClick={() => onSelectTab('patients')}
            className={`whitespace-nowrap px-2.5 py-1 rounded-md ${currentTab === 'patients' ? 'bg-teal-50 text-teal-800 font-semibold' : 'text-slate-600'}`}
          >
            Hasta Dosyaları
          </button>
          <button
            onClick={() => onSelectTab('appointments')}
            className={`whitespace-nowrap px-2.5 py-1 rounded-md ${currentTab === 'appointments' ? 'bg-teal-50 text-teal-800 font-semibold' : 'text-slate-600'}`}
          >
            Randevular
          </button>
          <button
            onClick={() => onSelectTab('finance')}
            className={`whitespace-nowrap px-2.5 py-1 rounded-md ${currentTab === 'finance' ? 'bg-teal-50 text-teal-800 font-semibold' : 'text-slate-600'}`}
          >
            Finans & Kasa
          </button>
          <button
            onClick={() => onSelectTab('protocols')}
            className={`whitespace-nowrap px-2.5 py-1 rounded-md ${currentTab === 'protocols' ? 'bg-teal-50 text-teal-800 font-semibold' : 'text-slate-600'}`}
          >
            Protokoller
          </button>
          <button
            onClick={() => onSelectTab('pitch')}
            className={`whitespace-nowrap px-2.5 py-1 rounded-md flex items-center gap-1 ${currentTab === 'pitch' ? 'bg-[#E6EFE6] text-[#314230] font-semibold' : 'text-slate-600'}`}
          >
            <Presentation className="w-3.5 h-3.5" />
            <span>Proje Fikri</span>
          </button>
          <button
            onClick={onOpenClinicAbout}
            className="whitespace-nowrap px-2.5 py-1 rounded-md flex items-center gap-1 text-slate-700 hover:bg-slate-100"
          >
            <MapPin className="w-3.5 h-3.5 text-rose-600" />
            <span>Klinik & Konum</span>
          </button>
        </div>
      </div>
    </header>
  );
};
