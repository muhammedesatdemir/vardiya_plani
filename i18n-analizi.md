# Vardiya Planı — Çoklu Dil (i18n) Hazırlık Analizi

> **Analiz Raporu — Kod Değiştirilmedi**
> Tarih: 2026-09-02 · Kapsam: `app/` + `src/` (34 dosya) + native config
> i18n kütüphanesi: **Kurulu değil** · Mevcut dil: **yalnızca Türkçe**

Expo / React Native vardiya planlama uygulamasının (proje adı: Vardiya Planı, marka: Demrivo) mevcut Türkçe-tek-dil kod tabanında, kullanıcıya görünen tüm ifadelerin, takvim/vardiya sisteminin ve locale bağımlılıklarının tam envanteri.

---

## İçindekiler

1. [Genel Özet](#1-genel-özet)
2. [Eksiksiz Çeviri Envanteri](#2-eksiksiz-çeviri-envanteri)
3. [Takvim ve Tarih Envanteri](#3-takvim-ve-tarih-envanteri)
4. [Vardiya Envanteri](#4-vardiya-envanteri)
5. [Dinamik Metinler](#5-dinamik-metinler)
6. [Hard-coded Türkçe Stringler](#6-hard-coded-türkçe-stringler)
7. [Locale / Internationalization Riskleri](#7-locale--internationalization-riskleri)
8. [Çeviri Key Önerileri](#8-çeviri-key-önerileri)
9. [Çeviri Dosyası İçin Hazır Envanter](#9-çeviri-dosyası-için-hazır-envanter)
10. [Analiz Tamamlama Kontrolü](#10-analiz-tamamlama-kontrolü)
11. [i18n'ye Geçiş İçin Toplam Değişiklik Envanteri](#i18nye-geçiş-için-toplam-değişiklik-envanteri)
12. [Kapsam Dışı / Teknik (Çeviri Gerektirmez)](#kapsam-dışı--teknik-çeviri-gerektirmez)

---

## Genel İstatistikler

| Metrik | Değer |
|---|---|
| Kullanıcıya görünen benzersiz ifade | ~340 |
| Çeviri gerektiren ifade | ~300 |
| Takvim / tarih-saat alanı | 18 |
| Dinamik (template) metin | ~35 |
| Vardiya ile ilgili alan | 17 |
| Hard-coded Türkçe string | ~300 |
| i18n sistemine bağlı alan | 0 |
| i18n'e taşınması gereken alan | ~300 |

---

## 1. Genel Özet

Uygulama şu anda **hiçbir i18n kütüphanesi kullanmıyor** (i18next / react-i18next / react-native-localize yok). Tek altyapı izi `expo-localization` paketinin `package.json`'da bağımlılık olarak durması, ama kod içinde aktif kullanılmıyor. Tüm kullanıcıya görünen metinler component ve constants dosyalarına doğrudan Türkçe olarak gömülü.

Tarih/saat için `date-fns` + `date-fns/locale/tr` kullanılıyor (`src/utils/date.ts`), ancak buna **paralel olarak** `src/utils/turkish.ts` içinde elle yazılmış `TURKISH_MONTHS` / `TURKISH_WEEKDAYS` dizileri ve `src/components/home/MonthPicker.tsx` içinde üçüncü bir `MONTH_NAMES_TR` dizisi daha var. Üç ayrı ay-adı kaynağı, i18n geçişinde tekilleştirilmesi gereken en somut teknik borç.

Vardiya sistemi (`src/constants/shifts.ts`) üç ana vardiya tipi + off varyantları içeriyor: **Sabah (S)**, **Öğle (Ö)**, **Gece (G)**, **Off**. Kritik bulgu: takvim hücresi renk paleti (`DayCell.tsx`) bu kısaltmaları (`S`/`Ö`/`G`/`Off`) **doğrudan anahtar** olarak kullanıyor — çeviri sırasında kısaltmalar değişirse (örn. İngilizce "Morning"→"M") renk eşleştirme mantığı kırılır (bkz. Bölüm 4 ve 7).

`src/constants/holidays.ts`, Türkiye'ye özgü resmi/dini tatilleri (Ramazan Bayramı, Kurban Bayramı, Cumhuriyet Bayramı vb.) sabit tarihlerle tutuyor — bu basit bir string çevirisi değil, çok-bölgeli bir uygulamada ayrı bir ülke/takvim veri kaynağı gerektiren yapısal bir konu.

---

## 2. Eksiksiz Çeviri Envanteri

Ekranlara ve component'lere göre tespit edilen her benzersiz kullanıcıya görünen ifade. Dinamik olanlar `dinamik` etiketiyle işaretlenmiştir.

### Navigasyon & Route Başlıkları

| Dosya | Satır | Mevcut Türkçe | Ekran | Tür | Öncelik |
|---|---|---|---|---|---|
| app/_layout.tsx | 87 | Gün Düzenle | day/[date] başlık | Screen Title | High |
| app/_layout.tsx | 94 | Ay Oluştur | generate başlık | Screen Title | High |
| app/_layout.tsx | 101 | Revize Et | revise başlık | Screen Title | High |
| app/_layout.tsx | 108 | Şablonlar | templates/index başlık | Screen Title | High |
| app/_layout.tsx | 114 | Şablon Düzenle | templates/[id] başlık | Screen Title | High |
| app/_layout.tsx | 120 | Vardiya Saatleri | shift-times başlık | Screen Title | High |
| app/(tabs)/_layout.tsx | 52 | Ana Sayfa | Tab bar | Screen Title | High |
| app/(tabs)/_layout.tsx | 56 | Vardiya Planı | Home header (brand) | Label | Medium |
| app/(tabs)/_layout.tsx | 57 | Demrivo | Home header (ürün adı) | Label | Low — marka adı |
| app/(tabs)/_layout.tsx | 66 | Takvim | Tab bar | Screen Title | High |
| app/(tabs)/_layout.tsx | 75 | Ayarlar | Tab bar | Screen Title | High |

### Ana Sayfa — app/(tabs)/index.tsx

| Dosya | Satır | Mevcut Türkçe / Template | Tür | Dinamik | Öncelik |
|---|---|---|---|---|---|
| index.tsx | 83 | Yarın | Label | — | High |
| index.tsx | 161–166 | "Hadi başlayalım, tempo bizde." / "Aynı ciddiyetle devam." / "Yarıyı gördük, bozmadan ilerle." / "Biraz daha sabır, iş rayında." / "Az kaldı, bugün de bitsin." / "Son gün, tatil kokusu geldi." (6 motivasyon mesajı) | Dynamic Text | Gün indeksine göre seçilir | Medium |
| index.tsx | 177 | İyi gidiyorsun, ritmi koru. | Dynamic Text | Fallback | Medium |
| index.tsx | 183 | `${consecutiveWork} gün üst üste çalışıyorsun` | Dynamic Text | count | **Critical — plural** |
| index.tsx | 188 | `${nextOffDays} gün sonra` | Dynamic Text | count | **Critical — plural** |
| index.tsx | 190 | `Sonraki izin: ${label}` | Dynamic Text | label | High |
| index.tsx | 196 | `Sonraki mesai: ${nextWorkingShift.dayLabel}` | Dynamic Text | dayLabel | High |
| index.tsx | 210 | Takvim | Button | — | High |
| index.tsx | 211 | Aylık görünüm | Label | — | Medium |
| index.tsx | 217 | Plan Oluştur | Button | — | High |
| index.tsx | 218 | Yeni ay ekle | Label | — | Medium |

### Ayarlar — app/(tabs)/settings.tsx

| Dosya | Satır | Mevcut Türkçe | Tür | Öncelik |
|---|---|---|---|---|
| settings.tsx | 174 | GÖRÜNÜM (bölüm başlığı) | Setting | High |
| settings.tsx | 185 | Tema | Setting | High |
| settings.tsx | 208 | Açık | Button | High |
| settings.tsx | 231 | Koyu | Button | High |
| settings.tsx | 242 | PROGRAM (bölüm başlığı) | Setting | High |
| settings.tsx | 261 | Aktif Şablon | Setting | High |
| settings.tsx | 263 | Seçilmedi (fallback) | Empty State | Medium |
| settings.tsx | 290 | Vardiya Saatleri | Setting | High |
| settings.tsx | 292 | Sabah, öğle ve gece saatlerini özelleştir | Setting | High |
| settings.tsx | 306 | VERİ (bölüm başlığı) | Setting | High |
| settings.tsx | 325 | Hazırlanıyor... / Verileri Dışa Aktar | Button | High |
| settings.tsx | 349 | Tüm Verileri Sil | Button | High |
| settings.tsx | 358 | HAKKINDA (bölüm başlığı) | Setting | High |
| settings.tsx | 363 | Vardiya Planı (uygulama adı) | Label | Low |
| settings.tsx | 366 | Sürüm 1.2.4 | Label | Low — çeviri gerekmez |
| settings.tsx | 370 | Demrivo tarafından geliştirildi | Label | Medium |
| settings.tsx | 378 | Vardiyalı çalışanlar için pratik planlama | Label | Medium |
| settings.tsx | 399 | Dışa Aktarma Hazır (modal başlığı) | Dialog | High |
| settings.tsx | 402 | Vardiya planınız Excel uyumlu dosya olarak hazırlandı. Dosyayı paylaşabilir veya cihazınıza kaydedebilirsiniz. | Dialog | High |
| settings.tsx | 416 | Kapat | Button | High |
| settings.tsx | 427 | Paylaş | Button | High |
| settings.tsx | 451 | Tüm veriler silinsin mi? (modal başlığı) | Dialog | **Critical** |
| settings.tsx | 454 | Bu işlem geri alınamaz. Tüm vardiya planlarınız, notlarınız ve ayarlarınız kalıcı olarak silinecektir. | Dialog | **Critical** |
| settings.tsx | 468 | Vazgeç | Button | **Critical** |
| settings.tsx | 479 | Sil | Button | **Critical** |
| settings.tsx | 56 | Tarih,Gün,Vardiya,Saat Başlangıç,Saat Bitiş,Not,Korumalı (CSV başlık satırı) | Other | Medium |
| settings.tsx | 62 | Pazar,Pazartesi,Salı,Çarşamba,Perşembe,Cuma,Cumartesi (CSV export gün adları) | Calendar | High |
| settings.tsx | 81 | Evet / Hayır (CSV kilit durumu) | Other | Medium |
| settings.tsx | 110 | Hata / Dosya oluşturulurken bir hata oluştu. | Error | High |
| settings.tsx | 124 | Vardiya Planını Paylaş (share dialog başlığı) | Dialog | Medium |
| settings.tsx | 128 | Hata / Paylaşım bu cihazda desteklenmiyor. | Error | High |

### Gün Düzenle — app/day/[date].tsx

| Dosya | Satır | Mevcut Türkçe | Tür | Öncelik |
|---|---|---|---|---|
| day/[date].tsx | 96 | Geçersiz tarih | Error | High |
| day/[date].tsx | 106 | Geri | Button | High |
| day/[date].tsx | 218 | `🇹🇷 Resmi Tatil — ${holidayName}` | Calendar | **Critical — bayrak emoji kültüre özgü** |
| day/[date].tsx | 234 | Vardiya Seçin | Shift | High |
| day/[date].tsx | 258 | İzin günü | Shift | High |
| day/[date].tsx | 276 | Bu Güne Özel Saat | Label | High |
| day/[date].tsx | 279 | Sadece bu gün için geçerli | Label | Medium |
| day/[date].tsx | 285 | Başlangıç | Label | High |
| day/[date].tsx | 302 | Bitiş | Label | High |
| day/[date].tsx | 328 | Varsayılana döndür | Button | High |
| day/[date].tsx | 339 | Fazla Mesai | Label | High |
| day/[date].tsx | 349 | Eksik Saat | Label | High |
| day/[date].tsx | 370 | Bu Günü Koru | Label | High |
| day/[date].tsx | 374 | Plan oluştururken bu gün otomatik değişmesin | Label | Medium |
| day/[date].tsx | 385 | 📝 Not | Label | High |
| day/[date].tsx | 394 | Bugüne özel not ekle... (placeholder) | Placeholder | High |
| day/[date].tsx | 408 | Örn: İzin değişti, nöbet kaydırıldı... (hint) | Placeholder | Medium |
| day/[date].tsx | 423 | İptal | Button | **Critical — sık tekrar** |
| day/[date].tsx | 433 | Kaydet | Button | **Critical — sık tekrar** |
| day/[date].tsx | 446 | Günü Temizle | Button | High |
| day/[date].tsx | 512 | Saat | Label | High |
| day/[date].tsx | 537 | Dakika | Label | High |
| day/[date].tsx | 569 | Sıfırla | Button | High |

### Ay Oluştur — app/generate.tsx

| Dosya | Satır | Mevcut Türkçe / Template | Tür | Öncelik |
|---|---|---|---|---|
| generate.tsx | 55 | İzin (getShiftName fallback) | Shift | **Critical — duplike mantık** |
| generate.tsx | 60–63 | Sabah / Öğle / Akşam / Gece (getShiftName eşlemesi) | Shift | **Critical — "Akşam" tutarsızlığı** |
| generate.tsx | 89–90 | `${g.count} ${g.name.toLowerCase()}` → join(' → ') | Dynamic Text | **Critical — plural + word order** |
| generate.tsx | 97 | `Standart ${cycleLength} Gün Döngü` | Dynamic Text | High |
| generate.tsx | 99 | 'Özel Düzen' / `${trimmed} (Özel Düzen)` | Dynamic Text | High |
| generate.tsx | 104 | `${cycleLength} günlük döngü • ${workDays} iş, ${offDays} izin` | Dynamic Text | **Critical — plural** |
| generate.tsx | 144 | Plan Hazır (başarı modalı başlığı) | Dialog | High |
| generate.tsx | 154 | gün oluşturuldu | Dynamic Text | **Critical — plural** |
| generate.tsx | 164 | gün korundu | Dynamic Text | **Critical — plural** |
| generate.tsx | 177 | Tamam | Button | **Critical — sık tekrar** |
| generate.tsx | 435–438 | Bu Ay / 3 Ay / 6 Ay / Yıl Sonu (dönem preset'leri) | Filter | High |
| generate.tsx | 446–451 | Ay Başından / Önceki aydan devam eder / Bugünden / Bugünden itibaren doldurur | Filter | High |
| generate.tsx | 470 | Vardiya Şablonu (bölüm başlığı) | Label | High |
| generate.tsx | 552 | Kendi Düzenini Oluştur | Button | High |
| generate.tsx | 558 | Özel vardiya döngüsü tasarla | Label | Medium |
| generate.tsx | 574 | Dönem (bölüm başlığı) | Label | High |
| generate.tsx | 636 | Dönem seçilmedi | Empty State | Medium |
| generate.tsx | 638 | `${getMonthNameTR(first.month)} ${first.year}` | Date | High |
| generate.tsx | 640 | `${getMonthNameTR(first.month)} → ${getMonthNameTR(last.month)} ${last.year}` | Date | High |
| generate.tsx | 644 | `${selectedMonths.length} ay` | Dynamic Text | **Critical — plural** |
| generate.tsx | 652 | Başlangıç Noktası (bölüm başlığı) | Label | High |
| generate.tsx | 717 | Koruma Seçenekleri (bölüm başlığı) | Label | High |
| generate.tsx | 730 | Özel ayarladığım günleri koru | Label | High |
| generate.tsx | 733 | Elle değiştirdiğiniz veya sabitlediğiniz günler korunur | Label | Medium |
| generate.tsx | 753 | Yeni plan, mevcut planların üzerine yazılır. (uyarı) | Other | High |
| generate.tsx | 766 | İptal | Button | **Critical — sık tekrar** |
| generate.tsx | 782 | `${selectedMonths.length===1 ? '1 Ay' : selectedMonths.length + ' Ay'} Oluştur` | Button | **Critical — plural** |

### Revize Et — app/revise.tsx

| Dosya | Satır | Mevcut Türkçe / Template | Tür | Öncelik |
|---|---|---|---|---|
| revise.tsx | 75 | Off (getShiftPatternDisplay) | Shift | Medium |
| revise.tsx | 136 | Hata / Lütfen bir tarih aralığı seçin. | Error | High |
| revise.tsx | 141 | Hata / Lütfen bir vardiya seçin. | Error | High |
| revise.tsx | 146 | Hata / Lütfen bir şablon seçin. | Error | High |
| revise.tsx | 161–164 | `${result.revised} gün güncellendi${skipped>0 ? `, ${skipped} gün atlandı` : ''}.` | Dialog | **Critical — çift plural + koşullu cümle** |
| revise.tsx | 164 | Tamam (Alert butonu) | Button | **Critical — sık tekrar** |
| revise.tsx | 169 | Tarih seçin | Placeholder | High |
| revise.tsx | 197 | Tarih Aralığı | Label | High |
| revise.tsx | 210 | `${getMonthNameTR(viewMonth)} ${viewYear}` | Date | High |
| revise.tsx | 222 | Pt,Sa,Ça,Pe,Cu,Ct,Pz (gün başlıkları — takvim grid) | Calendar | **Critical — farklı kısaltma seti** |
| revise.tsx | 268 | Değişiklik Türü | Label | High |
| revise.tsx | 278 | Tek vardiya ata | Label | High |
| revise.tsx | 289 | Şablondan oluştur | Label | High |
| revise.tsx | 297 | Vardiya (bölüm başlığı) | Label | High |
| revise.tsx | 336 | Şablon (bölüm başlığı) | Label | High |
| revise.tsx | 354 | `${template.cycleLength} günlük döngü` | Dynamic Text | High |
| revise.tsx | 371 | + Yeni Şablon Oluştur | Button | High |
| revise.tsx | 378 | Seçenekler (bölüm başlığı) | Label | High |
| revise.tsx | 385 | Kilitli günlerin üzerine yaz | Label | High |
| revise.tsx | 397 | Manuel günlerin üzerine yaz | Label | High |
| revise.tsx | 411–413 | `Seçili aralıktaki mevcut planlar ${overrideLocked?'':'(kilitli olanlar hariç) '}üzerine yazılacaktır` | Other | High |
| revise.tsx | 424 | İptal | Button | **Critical — sık tekrar** |
| revise.tsx | 435 | Uygula | Button | High |

### Vardiya Saatleri — app/shift-times.tsx

| Dosya | Satır | Mevcut Türkçe / Template | Tür | Öncelik |
|---|---|---|---|---|
| shift-times.tsx | 68 | Vardiya Saatleri (hero başlık) | Label | High |
| shift-times.tsx | 71–72 | Sabah, öğle ve gece vardiyalarının saatlerini kendine göre düzenle. Bu saatler tüm planlarda otomatik kullanılır. | Label | Medium |
| shift-times.tsx | 100–101 | Bir güne özel saat girilmişse, o gün için özel saat öncelikli kullanılır. | Label | Medium |
| shift-times.tsx | 167 | Gece geçer (overnight chip) | Shift | High |
| shift-times.tsx | 184 | `${shift.name} vardiyası için varsayılan saat aralığı` | Dynamic Text | High |
| shift-times.tsx | 316 | Saatleri 00–23, dakikaları 00–59 aralığında girin. | Error | High |
| shift-times.tsx | 320 | Başlangıç ve bitiş aynı olamaz. | Error | High |
| shift-times.tsx | 422 | Başlangıç ve bitiş saatini düzenle | Label | Medium |
| shift-times.tsx | 430 | Başlangıç | Label | High |
| shift-times.tsx | 456 | Bitiş | Label | High |
| shift-times.tsx | 497 | ↺ Varsayılana dön | Button | High |
| shift-times.tsx | 521 | İptal | Button | **Critical — sık tekrar** |
| shift-times.tsx | 534 | Kaydet | Button | **Critical — sık tekrar** |
| shift-times.tsx | 576–577 | SS / DD (saat/dakika hint) | Placeholder | Medium — kısaltma evrensel değil |

### Şablonlar — app/templates/index.tsx & [id].tsx

| Dosya | Satır | Mevcut Türkçe / Template | Tür | Öncelik |
|---|---|---|---|---|
| templates/index.tsx | 28 | İzin (getShiftName fallback) | Shift | **Critical — generate.tsx ile duplike** |
| templates/index.tsx | 32–35 | Sabah / Öğle / Akşam / Gece | Shift | **Critical — duplike + "Akşam" tutarsız** |
| templates/index.tsx | 66 | `Standart ${cycleLength} Gün Döngü` | Dynamic Text | High |
| templates/index.tsx | 75 | `${cycleLength} günlük döngü • ${workDays} iş, ${offDays} izin` | Dynamic Text | **Critical — plural** |
| templates/index.tsx | 111 | Aktif Şablon (intro başlık) | Label | High |
| templates/index.tsx | 114–115 | Kullandığınız vardiya düzenini seçin. Bu seçim plan oluşturma ve varsayılan akışta kullanılır. | Label | Medium |
| templates/index.tsx | 213 | Sistem şablonu / Özel şablon | Label | High |
| templates/index.tsx | 231 | Görüntüle / Düzenle | Button | High |
| templates/index.tsx | 259 | + Yeni Şablon | Button | High |
| templates/[id].tsx | 283 | Hata / Şablon bulunamadı. | Error | High |
| templates/[id].tsx | 304,319 | Uyarı / Döngü en az 2 gün olmalıdır. | Error | High |
| templates/[id].tsx | 314 | Eksik Bilgi / Lütfen şablon için bir isim girin. | Error | High |
| templates/[id].tsx | 350 | Uyarı / Sistem şablonları silinemez. | Error | High |
| templates/[id].tsx | 355–356 | Şablonu Sil / `"${name}" şablonunu silmek istediğinize emin misiniz?` | Dialog | **Critical — silme onayı** |
| templates/[id].tsx | 358,360 | Vazgeç / Sil | Button | **Critical** |
| templates/[id].tsx | 393 | Şablon İsmi | Label | High |
| templates/[id].tsx | 406 | Örn: Sabah-Öğle Döngüsü (placeholder) | Placeholder | Medium |
| templates/[id].tsx | 418 | `Vardiya Döngüsü (${steps.length} gün)` | Dynamic Text | **Critical — plural** |
| templates/[id].tsx | 472 | Gün Ekle | Button | High |
| templates/[id].tsx | 479 | Değiştirmek için dokun, silmek için uzun bas | Label | Medium |
| templates/[id].tsx | 489 | `${selectedStepIndex+1}. Gün İçin Vardiya Seç` | Dynamic Text | **Critical — sıra sayısı eki** |
| templates/[id].tsx | 517 | Döngü Önizleme | Label | High |
| templates/[id].tsx | 535 | Bu döngü sürekli tekrar eder | Label | Medium |
| templates/[id].tsx | 549,577,586 | Şablonu Sil / İptal / Oluştur / Kaydet | Button | High |

### Ana Sayfa Component'leri (src/components/home/*)

| Dosya | Satır | Mevcut Türkçe / Template | Tür | Öncelik |
|---|---|---|---|---|
| HomeBottomActions.tsx | 41 | Mesai Özeti | Button | High |
| HomeBottomActions.tsx | 43–44 | Fazla / eksik saat | Label | High |
| HomeBottomActions.tsx | 59 | Aylık Notlar | Button | High |
| HomeBottomActions.tsx | 61–62 | Bu ayın notları | Label | Medium |
| NotesSheet.tsx | 111 | `${monthLabel} Notları\n\n${body}` (paylaşım metni) | Dynamic Text | High |
| NotesSheet.tsx | 144–145 | `${monthLabel} Notları` (başlık) | Dynamic Text | High |
| NotesSheet.tsx | 181–183 | Bu ay için kayıtlı not bulunmuyor. | Empty State | High |
| NotesSheet.tsx | 197–199 | Kapat | Button | **Critical — sık tekrar** |
| NotesSheet.tsx | 213–215 | 📤 Paylaş | Button | **Critical — sık tekrar** |
| QuickActions.tsx | 30 | Hızlı İşlemler | Label | High |
| SummarySheet.tsx | 82–84 | `${monthLabel} Mesai Özeti:\nToplam fazla mesai: ...\nToplam eksik saat: ...` (paylaşım) | Dynamic Text | High |
| SummarySheet.tsx | 122 | Mesai Özeti (başlık) | Label | High |
| SummarySheet.tsx | 135–136 | Toplam Fazla Mesai | Label | High |
| SummarySheet.tsx | 151–152 | Toplam Eksik Saat | Label | High |
| SummarySheet.tsx | 172–173,182–184 | Kapat / 📤 Paylaş | Button | **Critical** |
| TodayShiftCard.tsx | 72 | BUGÜN (badge) | Label | High |
| TodayShiftCard.tsx | 96 | özel (customBadge) | Label | Medium |
| TodayShiftCard.tsx | 99 | (ertesi gün) (overnight hint) | Label | High |
| TodayShiftCard.tsx | 103 | Bugün izinlisiniz | Label | High |
| TodayShiftCard.tsx | 110–111 | `Sonraki: ${dayLabel} ${shiftName}${time?' '+time:''}` | Dynamic Text | High |
| TodayShiftCard.tsx | 129–130 | Plan Yok / Henüz plan oluşturulmamış | Empty State | High |
| TodayShiftCard.tsx | 139 | Plan Oluştur | Button | High |
| UpcomingDays.tsx | 36 | Önümüzdeki 7 Gün | Label | **Critical — sayı+kelime, plural** |
| UpcomingDays.tsx | 73 | Bugün / Yarın | Label | **Critical — sık tekrar** |
| CalendarActions.tsx | 43 | Ay Oluştur | Button | High |

> **Not:** `src/components/calendar/DayCell.tsx` ve `CalendarHeader.tsx` doğrudan serbest metin literal'i içermiyor — `shortName` (S/Ö/G/Off) ve `getMonthNameTR()` çıktısını render ediyorlar; asıl metin kaynağı Bölüm 4'te.

---

## 3. Takvim ve Tarih Envanteri

**Kritik bulgu:** ay ve gün isimleri için proje içinde **üç farklı, birbirinden bağımsız kaynak** var. Bu, i18n geçişinde ilk tekilleştirilmesi gereken konu.

| # | Mevcut Değer | Tür | Kaynak | Türkçe Gösterim | Locale Değişince Ne Olmalı? | Not |
|---|---|---|---|---|---|---|
| 1 | Ocak…Aralık | Date | src/utils/turkish.ts (TURKISH_MONTHS) | Ocak, Şubat, Mart, Nisan, Mayıs, Haziran, Temmuz, Ağustos, Eylül, Ekim, Kasım, Aralık | Dile göre tam çevrilmeli | **Kaynak #1/3 — duplike** |
| 2 | Ocak…Aralık | Date | src/components/home/MonthPicker.tsx (MONTH_NAMES_TR) | Ocak…Aralık (aynı liste, ayrı tanım) | Dile göre tam çevrilmeli | **Kaynak #2/3 — duplike** |
| 3 | MMMM formatı | Date | src/utils/date.ts (date-fns + locale/tr) | date-fns tr locale üzerinden üretilir | locale parametresi diline göre değişmeli (en-US, de, vb.) | **Kaynak #3/3 — en sürdürülebilir olan bu** |
| 4 | Pazar…Cumartesi | Date | src/utils/turkish.ts (TURKISH_WEEKDAYS) | Pazar başlangıçlı tam gün adları | Dile göre tam çevrilmeli | Hafta başlangıcı Pazar (ABD tarzı) |
| 5 | Pazartesi…Pazar | Date | src/utils/turkish.ts (TURKISH_WEEKDAYS_MONDAY_START) | Pazartesi başlangıçlı tam gün adları | Dile göre tam çevrilmeli; hangi dilde hafta başlangıcının Pazartesi/Pazar olduğu ayrıca ayarlanmalı | ISO 8601 (Pazartesi) vs ABD (Pazar) farkı — High |
| 6 | Pzt, Sal, Çar, Per, Cum, Cmt, Paz | Date | src/components/calendar/CalendarGrid.tsx (WEEKDAYS) | 3 harfli kısaltmalar, Pazartesi başlangıçlı | Çevrilmeli; İngilizce 3 harfli kısaltmalar (Mon/Tue/Wed) farklı karakter genişliğinde olabilir | High — Calendar ekranı |
| 7 | Pt, Sa, Ça, Pe, Cu, Ct, Pz | Date | app/revise.tsx (satır 222) | 2 harfli kısaltmalar, CalendarGrid'den **farklı** kısaltma seti | Çevrilmeli — ayrıca CalendarGrid ile tutarlı hale getirilmeli | **Critical — aynı uygulamada 2 farklı gün kısaltma standardı** |
| 8 | Pazar, Pazartesi, Salı, Çarşamba, Perşembe, Cuma, Cumartesi | Date | app/(tabs)/settings.tsx (satır 62, CSV export) | Tam gün adları, Pazar başlangıçlı | CSV dışa aktarımı diline göre değişmeli | High — dışa aktarılan dosya kullanıcıya gidiyor |
| 9 | Intl.DateTimeFormat('tr-TR', {weekday:'short'}) | Date | app/(tabs)/index.tsx (satır 57) | Tarayıcı/JS motoru üzerinden üretilen kısa gün adı | 'tr-TR' sabit — dinamik locale koduna çevrilmeli | **Critical — hardcoded locale kodu** |
| 10 | Intl.DateTimeFormat('tr-TR', {weekday:'long'}) | Date | app/(tabs)/index.tsx (84), app/day/[date].tsx (85) | Tam gün adı | 'tr-TR' sabit — dinamik locale koduna çevrilmeli | **Critical — hardcoded locale kodu, 2 dosyada** |
| 11 | 'd MMMM yyyy, EEEE' | Date | src/utils/date.ts (formatDateTR, satır 75) | "22 Mart 2026, Pazar" | Format sırası dile göre değişebilir (örn. EN: "Sunday, March 22, 2026") | High — fonksiyon adı da "TR" sonekli |
| 12 | 'd MMMM' | Date | src/utils/date.ts (formatDateShortTR, satır 82) | "22 Mart" | EN'de "March 22" — gün/ay sırası tersine döner | High |
| 13 | 'MMMM yyyy' | Date | src/utils/date.ts (formatMonthYearTR, satır 89) | "Mart 2026" | Çoğu dilde sıra aynı kalır ama locale parametresi dinamikleşmeli | Medium |
| 14 | 'EEEE' | Date | src/utils/date.ts (formatWeekdayTR, satır 96) | "Pazar" | locale parametresi dinamikleşmeli | Medium |
| 15 | 'yyyy-MM-dd' | Date | src/utils/date.ts (ISO_DATE_FORMAT) | Depolama/internal format | **Değişmemeli** — kullanıcıya gösterilmiyor | Low — çeviri gerekmez |
| 16 | "Yarın" / "Bugün" (relative date) | Date | app/(tabs)/index.tsx, TodayShiftCard.tsx, UpcomingDays.tsx | Bugün/Yarın etiketleri | Doğrudan çevrilebilir, dilbilgisel risk düşük | Medium |
| 17 | Saat formatı (HH:MM, 24 saat) | Time | src/constants/shifts.ts, shift-times.tsx | 07:00, 15:00, 23:00 (24 saat formatı) | İngilizce (ABD) kullanıcılar 12 saat + AM/PM bekleyebilir — şu an tercih/ayar yok | High — 12/24 saat tercihi eksik |
| 18 | Hafta başlangıcı: Pazartesi (varsayılan görünüm) | Date | CalendarGrid.tsx, revise.tsx takvim grid | Pazartesi ilk sütun | ABD/bazı ülkelerde Pazar ilk gün — ayarlanabilir olmalı | Medium |

> **🇹🇷 Bayrak emojisi ile resmi tatil gösterimi:** `app/day/[date].tsx:218` içinde `` `🇹🇷 Resmi Tatil — ${holidayName}` `` kalıbı kullanılıyor. Bayrak emojisi ülkeye özgü sabit kodlanmış; çok ülkeli desteğe geçilirse ya kaldırılmalı ya da kullanıcının/cihazın ülkesine göre dinamikleştirilmeli.

---

## 4. Vardiya Envanteri

Tüm vardiya tipleri `src/constants/shifts.ts → DEFAULT_SHIFT_TYPES` içinde tanımlı. Her tip bir `code` (internal, saat bazlı), bir `name` (tam ad) ve bir `shortName` (takvim hücresinde gösterilen kısaltma) taşıyor.

| # | Shift Key / Kod | Mevcut Gösterim | Anlamı | Kullanıldığı Yer | Çevrilmeli mi? | İngilizce İçin Öneri | Not |
|---|---|---|---|---|---|---|---|
| 1 | 0715 | name: "Sabah", shortName: "S" | 07:00–15:00 vardiyası | DayCell, TodayShiftCard, generate/revise/templates ekranları | Evet (name+shortName) | Morning / M | **Critical — shortName renk paleti anahtarı** |
| 2 | 1523 | name: "Öğle", shortName: "Ö" | 15:00–23:00 vardiyası | Aynı | Evet | Afternoon / A | **Critical — "Ö" Türkçe'ye özgü karakter** |
| 3 | 2307 | name: "Gece", shortName: "G" | 23:00–07:00 (gece yarısını geçer, isOvernight:true) | Aynı | Evet | Night / N | **Critical — "G" harfi çeviri sonrası çakışma riski** |
| 4 | OFF | name: "Off", shortName: "Off" | İzin/tatil günü | Tüm ekranlar | Kısmen — zaten İngilizce bırakılmış | Off (değişmeyebilir) veya "Day Off" | Medium — Tutarsızlık: diğerleri Türkçe, bu İngilizce kalmış |
| 5 | OFF1 / OFF2 | name: "Off" (iç varyant) | Off kodunun döngü-farklılaştırma varyantları | Şablon step referansları | Hayır — internal, UI'da "Off" ile birleşiyor | — | Low — isOffCode() ile tekilleştiriliyor |
| 6 | getShiftName() fallback ("İzin") | İzin | generate.tsx / templates/index.tsx içinde ayrı, duplike bir eşleme fonksiyonu | Plan özeti metinleri (örn. "3 izin") | Evet | Off / Leave | **Critical — shifts.ts'teki "Off" ile aynı anlam, farklı kelime** |
| 7 | getShiftName() eşlemesi ("Akşam") | Akşam | generate.tsx/templates/index.tsx yerel fonksiyonunda "Öğle" vardiyasının karşılığı olarak "Akşam" kullanılmış | Plan özeti, döngü açıklaması | Evet | Evening (ama shifts.ts'te bu vardiyanın adı "Öğle"/Afternoon) | **Critical — kod tutarsızlığı, i18n'den önce düzeltilmeli** |
| 8 | isOvernight (2307/Gece) | "Gece geçer" chip'i, "(ertesi gün)" hint'i | Gece yarısını geçen vardiya göstergesi | shift-times.tsx, TodayShiftCard.tsx | Evet | "Crosses midnight" / "(next day)" | High — dilbilgisel yapı değişir |
| 9 | formatOvernightShiftDisplay() | `${shiftName} (${endTime}'e kadar)` | Örn: "Gece (07:00'ye kadar)" | schedulingEngine.ts | Evet | "Night (until 07:00)" | **Critical — Türkçe'ye özgü ek template'e hardcoded gömülü** |
| 10 | DEFAULT_TEMPLATES isimleri (BYG-A1, BYG-B1, BYG-C1, BYG-D1) | BYG-A1 vb. | Vardiya döngü şablonu adları | Şablon seçim ekranları | Hayır — özel/kurumsal kısaltma | Değişmez | Low — marka/departman kodu, çeviri dışı |
| 11 | theme: 'light'/'dark' → UI metni | Açık / Koyu | Tema seçimi (internal kod Türkçe değil ama UI'da Türkçe metne çevriliyor) | settings.tsx | Evet | Light / Dark | High — internal kod korunur, sadece UI etiketi değişir |
| 12 | 'Sistem şablonu' / 'Özel şablon' | Sistem şablonu / Özel şablon | Şablonun kaynağı (varsayılan mı kullanıcı tanımlı mı) | templates/index.tsx | Evet | System template / Custom template | High |
| 13 | DurationCard etiketleri | Fazla Mesai / Eksik Saat / Saat / Dakika | Gün bazlı süre girişi | day/[date].tsx | Evet | Overtime / Shortfall / Hours / Minutes | High |
| 14 | formatDurationTR() | "X saat Y dakika" / "X dakika" / "X saat" / "0 dakika" | Süre metni oluşturma | duration.ts, SummarySheet, HomeBottomActions | Evet | "X hours Y minutes" (çoğul: "1 hour" vs "2 hours") | **Critical — İngilizce'de saat/dakika çoğul eki gerekir, Türkçe'de gerekmez** |
| 15 | SHIFT_BG_COLORS_LIGHT/DARK (DayCell.tsx) | Anahtarlar: S, Ö, G, Off | Takvim hücresi arkaplan rengi seçimi | DayCell.tsx satır 34–54 | Hayır (bu bir kod anahtarı) — ama shortName değişirse kırılır | Anahtarları shortName yerine code'a bağlamak gerekir | **Critical — mimari risk, bkz. Bölüm 7** |
| 16 | Vardiya Seçin / İzin günü | Vardiya Seçin, İzin günü | Gün düzenleme ekranındaki seçim etiketleri | day/[date].tsx | Evet | Select Shift / Day off | High |
| 17 | Vardiya Şablonu / Kendi Düzenini Oluştur | Vardiya Şablonu, Kendi Düzenini Oluştur, Özel vardiya döngüsü tasarla | Plan oluşturma akışındaki şablon seçim bölümü | generate.tsx | Evet | Shift Template / Build Your Own Pattern | High |

### Kısaltma ↔ renk paleti bağımlılığı (en kritik mimari bulgu)

`DayCell.tsx`'taki `SHIFT_BG_COLORS_LIGHT`/`_DARK` sözlükleri, vardiyanın `shortName` değerini (`S`/`Ö`/`G`/`Off`) doğrudan anahtar olarak kullanıyor. Çeviri sırasında bu kısaltmalar değişirse (örn. "Morning"→"M") renk eşleşmesi bulunamaz ve kod otomatik olarak `shiftType.color` alanına düşer (fallback zaten var), ancak bu iki kaynağın senkronize tutulması gerekir.

**Öneri:** renk paleti anahtarını `shortName` yerine değişmeyen `code` alanına (0715/1523/2307/OFF) bağlamak — bu, kod değişikliği gerektirir ama i18n'den bağımsız bir ön-hazırlık adımı olarak ayrıca değerlendirilebilir.

### Kısaltma ve vardiya adı tutarsızlıkları

Aynı "Öğle" vardiyası, `shifts.ts`'te "Öğle" olarak tanımlıyken `generate.tsx` ve `templates/index.tsx`'teki yerel `getShiftName()` fonksiyonunda "Akşam" olarak etiketleniyor. Ayrıca gün kısaltmaları da iki farklı standartta: `CalendarGrid.tsx` 3 harfli (Pzt/Sal/Çar...) kullanırken `revise.tsx` 2 harfli (Pt/Sa/Ça...) kullanıyor. Bu tutarsızlıklar i18n'den **önce** düzeltilmezse, çeviri anahtarları da aynı tutarsızlığı iki dile taşır.

---

## 5. Dinamik Metinler

Değişken içeren template literal'ler. Türkçe'de çoğul eki genelde gerekmez ("3 gün", "1 gün" — aynı), ama İngilizce'de sayıya göre değişir ("1 day" / "3 days") — bu, basit string-replace çevirisiyle çözülemez, **ICU MessageFormat** tarzı plural kuralları gerektirir.

| # | Mevcut String / Template | Değişkenler | Kullanım | Çoğul Problemi | Locale Problemi | Önerilen i18n Yapısı |
|---|---|---|---|---|---|---|
| 1 | `${consecutiveWork} gün üst üste çalışıyorsun` | consecutiveWork: number | SmartInsight (Home) | **Evet** | Kelime sırası TR'de sabit; EN'de "You've worked N days in a row" farklı sıra | `t('insight.consecutiveWork', {count})` + ICU plural |
| 2 | `${nextOffDays} gün sonra` | nextOffDays: number | SmartInsight | **Evet** | EN: "in N days" — edat + sayı sırası tersine döner | `t('insight.daysUntil', {count})` |
| 3 | `${result.revised} gün güncellendi, ${result.skipped} gün atlandı.` | revised, skipped: number | Revize sonucu (Alert) | **Evet — çift sayaç** | Koşullu ikinci cümle (skipped>0 ise) — ICU'da nested select+plural gerekir | `t('revise.result', {revised, skipped})` + koşullu alt-mesaj |
| 4 | "gün oluşturuldu" / "gün korundu" | count (dışarıdan gelen sayı) | generate.tsx başarı modalı | **Evet** | — | `t('generate.daysCreated', {count})` |
| 5 | `${selectedMonths.length} ay` / "1 Ay" özel durumu | count: number | generate.tsx dönem özeti ve buton metni | **Evet — kod içinde zaten manuel tekil/çoğul ayrımı var** | Bu manuel ayrım i18n kütüphanesine taşınmalı | `t('generate.monthsCount', {count})` |
| 6 | `${cycleLength} günlük döngü • ${workDays} iş, ${offDays} izin` | cycleLength, workDays, offDays | generate.tsx, templates/index.tsx (duplike) | **Evet — üç sayaç birden** | "iş"/"izin" kelimeleri de ayrı çeviri anahtarı ister | `t('template.cycleSummary', {cycleLength, workDays, offDays})` |
| 7 | `${g.count} ${g.name.toLowerCase()}` → join(' → ') | count, name (vardiya adı) | generate.tsx döngü açıklaması | **Evet — her segment ayrı plural** | "toLowerCase()" Türkçe'ye özgü ı/İ sorunu yaratabilir | Segment bazlı array + join, her segment kendi plural key'i |
| 8 | `${selectedStepIndex + 1}. Gün İçin Vardiya Seç` | index+1: number (sıra sayısı) | templates/[id].tsx | Sıra sayısı eki Türkçe'ye özgü | EN'de "Select Shift for Day 1" — sayı sonda değil başta, ek yok | `t('template.selectShiftForDay', {day})` |
| 9 | `Vardiya Döngüsü (${steps.length} gün)` | steps.length | templates/[id].tsx başlık | **Evet** | — | `t('template.cycleTitle', {count})` |
| 10 | `Sonraki mesai: ${nextWorkingShift.dayLabel}` | dayLabel: string (gün adı) | SmartInsight | Hayır (isim, sayı değil) | Kelime sırası korunabilir | `t('insight.nextShift', {day})` |
| 11 | `Sonraki: ${dayLabel} ${shiftName}${time?' '+time:''}` | dayLabel, shiftName, time (opsiyonel) | TodayShiftCard | Hayır | Koşullu segment — interpolasyon sırası dile göre değişebilir | `t('home.nextShift', {day, shift, time})` |
| 12 | `${shift.name} vardiyası için varsayılan saat aralığı` | shift.name: string | shift-times.tsx | Hayır | "X vardiyası için" — EN: "Default hours for X shift" tamamen farklı kelime sırası | `t('shiftTimes.defaultRangeFor', {shift})` |
| 13 | `${shiftName} (${endTime}'e kadar)` | shiftName, endTime | schedulingEngine.ts (formatOvernightShiftDisplay) | Hayır | "'e kadar" Türkçe ek; EN: "(until X)" önek | `t('shift.untilTime', {shift, time})` |
| 14 | "X saat Y dakika" / "X saat" / "X dakika" / "0 dakika" | h, m: number | duration.ts (formatDurationTR) | **Evet — EN'de "1 hour" vs "2 hours" ayrımı gerekir** | Birim sırası dile göre aynı kalabilir ama plural ayrı sorun | ICU: `{hours, plural, one{#hour} other{#hours}}` + benzer dakika için |
| 15 | `${getMonthNameTR(month)} ${year}` (çeşitli yerlerde) | month, year | generate.tsx, revise.tsx, MonthPicker.tsx | Hayır | Ay-yıl sırası çoğu dilde aynı, ama fonksiyon adı "TR" sonekiyle dil-spesifik | date-fns `format(date, 'MMMM yyyy', {locale})` dinamik locale ile |
| 16 | `Seçili aralıktaki mevcut planlar ${overrideLocked?'':'(kilitli olanlar hariç) '}üzerine yazılacaktır` | overrideLocked: boolean | revise.tsx | Hayır | Koşullu ara-cümle segmenti — cümle ortasına eklenen ifade | İki ayrı tam cümle olarak i18n key'lenmeli (koşullu parça değil) |
| 17 | `🇹🇷 Resmi Tatil — ${holidayName}` | holidayName: string | day/[date].tsx | Hayır | Bayrak emoji ülkeye özgü; tatil isminin kendisi de kültüre özgü | `t('calendar.officialHoliday', {name})`, emoji ayrı ele alınmalı |

> **Genel gözlem:** Kod tabanında zaten manuel plural farkındalığı olan yerler var (örn. generate.tsx satır 782'deki `selectedMonths.length===1 ? '1 Ay' : ...`). Bu, geliştiricinin çoğul sorununun farkında olduğunu gösteriyor — i18n kütüphanesi (i18next + ICU) bu manuel if/else'leri standart bir plural API'sine dönüştürecek.

---

## 6. Hard-coded Türkçe Stringler

Grep taramasında Türkçe özel karakter (`çığöşüÇĞİÖŞÜ`) içeren toplam **201 satır (app/, 10 dosya)** ve **253 satır (src/, 24 dosya)** tespit edildi.

| # | Dosya | Eşleşme Sayısı | Kullanıcıya Görünüyor mu | i18n'e Taşınmalı mı |
|---|---|---|---|---|
| 1 | app/generate.tsx | 50 | Evet | **Evet** |
| 2 | app/(tabs)/settings.tsx | 29 | Evet | **Evet** |
| 3 | src/constants/holidays.ts | 29 | Evet | **Evet (veri yapısı değişikliği gerektirir)** |
| 4 | src/components/home/NotesSheet.tsx | 26 (çoğu yorum) | Kısmen | High — sadece UI string'leri |
| 5 | app/templates/[id].tsx | 25 | Evet | **Evet** |
| 6 | app/day/[date].tsx | 24 | Evet | **Evet** |
| 7 | src/components/home/SummarySheet.tsx | 23 (çoğu yorum) | Kısmen | High — sadece UI string'leri |
| 8 | app/(tabs)/index.tsx | 22 | Evet | **Evet** |
| 9 | app/revise.tsx | 20 | Evet | **Evet** |
| 10 | src/utils/turkish.ts | 17 | Evet (ay/gün adları) | High — locale mantığı kalır, veri listeleri taşınır |
| 11 | app/shift-times.tsx | 14 | Evet | **Evet** |
| 12 | app/templates/index.tsx | 12 | Evet | **Evet** |
| 13 | src/components/home/HomeBottomActions.tsx | 9 | Evet | High |
| 14 | src/components/home/MonthPicker.tsx | 8 | Evet | **Evet — duplike kaynak** |
| 15 | src/stores/scheduleStore.ts | 8 (tümü yorum) | Hayır | Hayır |
| 16 | src/components/home/TodayShiftCard.tsx | 6 | Evet | High |
| 17 | src/types/index.ts | 6 (JSDoc örnekleri) | Hayır | Hayır — ama dokümantasyon güncellenmeli |
| 18 | app/_layout.tsx | 4 | Evet | High |
| 19 | src/repositories/fileRepository.ts | 4 (yorum) | Hayır | Hayır |
| 20 | src/services/schedulingEngine.ts | 4 (1 UI string + yorumlar) | Kısmen | **Evet — kritik format fonksiyonu** |
| 21 | src/components/home/UpcomingDays.tsx | 3 | Evet | High |
| 22 | src/components/home/SmartInsight.tsx | 3 | Hayır (prop olarak alıyor) | Kaynak başka dosyada |
| 23 | src/components/calendar/DayCell.tsx | 5 (yorum/anahtar) | Hayır | Hayır |
| 24 | src/components/home/QuickActions.tsx | 1 | Evet | High |
| 25 | src/components/calendar/CalendarActions.tsx | 1 | Evet | High |
| 26 | src/components/calendar/CalendarGrid.tsx | 1 (dizi, 7 değer) | Evet | **Evet — duplike kaynak** |
| 27 | src/constants/shifts.ts | 2 (+diğer name/shortName alanları) | Evet | **Evet — en kritik veri kaynağı** |
| 28 | Test dosyaları (turkish.test.ts, duration.test.ts, fileRepository.test.ts, schedulingEngine.test.ts) | 84 toplam | Hayır | Hayır — test verisi |

---

## 7. Locale / Internationalization Riskleri

| Risk | Açıklama | Seviye |
|---|---|---|
| shortName ↔ renk paleti bağımlılığı | DayCell.tsx'teki renk sözlükleri S/Ö/G/Off harflerine sabitlenmiş; çeviri bu kısaltmaları değiştirirse görsel tutarlılık bozulur | **Critical** |
| Üç ayrı ay/gün ismi kaynağı | turkish.ts, MonthPicker.tsx ve date.ts (date-fns/tr) aynı bilgiyi üç farklı yerde tutuyor | **Critical** |
| İki farklı gün kısaltması standardı | CalendarGrid.tsx (Pzt/Sal/Çar — 3 harf) ile revise.tsx (Pt/Sa/Ça — 2 harf) aynı bilgiyi farklı formatta veriyor | **Critical** |
| Hardcoded 'tr-TR' locale kodu | app/(tabs)/index.tsx ve app/day/[date].tsx içinde Intl.DateTimeFormat çağrılarında locale sabit yazılmış | **Critical** |
| Pluralization (çoğul) eksikliği | "gün", "ay", "vardiya" gibi sayaçlı ifadelerde Türkçe'de ek değişmiyor ama İngilizce'de "day/days" ayrımı gerekiyor | **Critical** |
| Kod içi anlam tutarsızlığı (Öğle/Akşam) | generate.tsx ve templates/index.tsx'teki yerel getShiftName() fonksiyonu "Öğle" vardiyasını "Akşam" olarak etiketliyor | High |
| Fonksiyon adlarında dil sonekleri | formatDateTR, formatDurationTR, getMonthNameTR gibi isimler dil-spesifik | Medium |
| Türkçe karakter varsayımı (toLowerCase/toUpperCase) | turkish.ts'nin var olma nedeni: native JS toUpperCase/toLowerCase Türkçe ı/İ karakterini yanlış işliyor | High |
| 12/24 saat formatı tercihi yok | Tüm saatler 24 saat formatında sabit; İngilizce/ABD kullanıcılar için 12 saat + AM/PM tercihi bulunmuyor | High |
| Hafta başlangıcı sabit (Pazartesi) | Takvim ve revize ekranı hep Pazartesi'yi ilk gün varsayıyor; ABD gibi ülkelerde Pazar ilk gündür | Medium |
| Kültüre özgü resmi tatiller | holidays.ts, Türkiye'ye özgü dini/resmi bayramları sabit tarihlerle tutuyor — ayrı bölge/takvim veri kaynağı gerektirir | **Critical** |
| Bayrak emojisiyle ülke göstergesi | "🇹🇷 Resmi Tatil" kalıbı ülkeye özgü sabit | Medium |
| Metin taşması / sabit genişlik riski | Buton ve chip'ler dilden dile uzunluk değiştirebilir; esnek genişlik kullanımı doğrulanmadı | Medium |
| Takvim hücresi genişliği ve kısaltma uzunluğu | Tek harfli Türkçe kısaltmalar yerine çok dilli kısaltmalar 3+ karaktere çıkarsa DayCell'in sabit boyutlu tasarımı taşabilir | High |
| Alfabetik sıralama (locale-aware sorting) | turkish.ts içindeki compareTR() Türkçe'ye özgü localeCompare kullanıyor | Medium |
| RTL dil desteği | Şu an planlanan diller LTR; layout'larda RTL varsayımı kontrol edilmedi | Low — şimdilik plan dışı |
| Font desteği | Türkçe özel karakterler standart sistem fontlarında sorunsuz görünüyor | Low |
| Accessibility/screen-reader metinleri yok | Projede accessibilityLabel/accessibilityHint hiç kullanılmıyor | Medium |
| Dil karışıklığı örneği | schedulingEngine.ts:124'teki 'Unknown error' İngilizce, uygulamanın geneli Türkçe | High |
| "Off" kodunun dil tutarsızlığı | Diğer vardiya adları Türkçe (Sabah/Öğle/Gece) iken "Off" İngilizce bırakılmış | Medium |

---

## 8. Çeviri Key Önerileri

Mevcut ekran/özellik gruplarına uygun, ölçeklenebilir bir `namespace.section.key` yapısı öneriliyor:

**Genel:**
`common.cancel` · `common.save` · `common.confirm` · `common.close` · `common.share` · `common.delete` · `common.ok` · `common.error` · `common.warning`

**Takvim:**
`calendar.weekdays.mon_short` · `calendar.weekdays.monday` · `calendar.months.january` · `calendar.today` · `calendar.tomorrow` · `calendar.holiday.official`

**Vardiya:**
`shift.morning` · `shift.afternoon` · `shift.night` · `shift.off` · `shift.morning_short` · `shift.crossesMidnight` · `shift.untilTime`

**Ana sayfa:**
`home.nextShift` · `home.consecutiveWorkDays` · `home.daysUntilOff` · `home.upcomingDays` · `home.noPlanYet`

**Plan oluşturma:**
`generate.title` · `generate.cycleSummary` · `generate.periodRange` · `generate.monthsCount` · `generate.planReady` · `generate.daysCreated`

**Revize:**
`revise.title` · `revise.dateRange` · `revise.changeType` · `revise.resultSummary` · `revise.errors.selectDateRange`

**Şablonlar:**
`templates.title` · `templates.systemTemplate` · `templates.customTemplate` · `templates.deleteConfirm` · `templates.cycleTitle`

**Ayarlar:**
`settings.appearance` · `settings.theme.light` · `settings.theme.dark` · `settings.data.exportAll` · `settings.data.deleteAllConfirm` · `settings.about.version`

**Gün düzenleme:**
`dayEdit.selectShift` · `dayEdit.overtime` · `dayEdit.shortfall` · `dayEdit.notePlaceholder` · `dayEdit.lockDay`

**Vardiya saatleri:**
`shiftTimes.title` · `shiftTimes.defaultRangeFor` · `shiftTimes.errors.invalidTime` · `shiftTimes.resetToDefault`

**Süre:**
`duration.hoursMinutes` · `duration.hoursOnly` · `duration.minutesOnly`

> **Öneri:** "gün", "ay" gibi sayaçlı metinler için düz key yerine **ICU plural bloğu** kullanılmalı (i18next'te `{count}` + `_one`/`_other` suffix desteği hazır). Örnek: `generate.daysCreated_one` / `generate.daysCreated_other`.

---

## 9. Çeviri Dosyası İçin Hazır Envanter

Geliştiricinin doğrudan `tr.json` / `en.json` dosyalarına aktarabileceği örnek satırlar (temsili bir alt küme — tam liste Bölüm 2, 4 ve 5'teki tüm satırları kapsar).

| Key | Türkçe (TR) | İngilizce (EN) | Açıklama |
|---|---|---|---|
| common.cancel | İptal | Cancel | Genel iptal butonu, 5+ ekranda tekrar ediyor |
| common.save | Kaydet | Save | Genel kaydet butonu |
| common.ok | Tamam | OK | Alert onay butonu |
| common.close | Kapat | Close | Modal kapatma |
| common.share | Paylaş | Share | 📤 emoji ayrı tutulmalı, metin kısmı çevrilir |
| common.delete | Sil | Delete | — |
| common.giveUp | Vazgeç | Cancel | [CONTEXT NEEDED] "İptal"/"Vazgeç" iki farklı Türkçe kelimenin İngilizce'de aynı kelimeye düşüp düşmemesi tasarım kararı |
| shift.morning | Sabah | Morning | 0715 kodu |
| shift.afternoon | Öğle | Afternoon | 1523 kodu — bkz. Bölüm 7, "Akşam" tutarsızlığı önce düzeltilmeli |
| shift.night | Gece | Night | 2307 kodu, isOvernight:true |
| shift.off | Off | Off | [CONTEXT NEEDED] "Off" mu "Day Off" mu kalacak — ürün kararı |
| shift.morning_short | S | [CONTEXT NEEDED] | Tek harf kısaltma; mimari karar (bkz. Bölüm 7 renk paleti riski) |
| shift.afternoon_short | Ö | [CONTEXT NEEDED] | "Ö" Türkçe'ye özgü karakter, doğrudan çevrilemez |
| shift.night_short | G | [CONTEXT NEEDED] | Aynı mimari karara bağlı |
| calendar.weekdays.mon | Pzt / Pt (iki farklı kaynakta iki farklı kısaltma) | Mon | Önce kaynak dilde tekilleştirilmeli |
| calendar.months.january | Ocak | January | 3 ayrı kaynaktan biri — bkz. Bölüm 3 |
| calendar.today | Bugün | Today | — |
| calendar.tomorrow | Yarın | Tomorrow | — |
| calendar.holidayOfficial | 🇹🇷 Resmi Tatil — {name} | Official Holiday — {name} | Bayrak emojisi çok-ülkeli senaryoda kaldırılmalı |
| home.consecutiveWorkDays | {count} gün üst üste çalışıyorsun | You've worked {count} days in a row | Plural + kelime sırası farkı |
| home.upcomingDays | Önümüzdeki 7 Gün | [CONTEXT NEEDED] | "7" sabit mi yapılandırılabilir mi belirsiz |
| home.noPlanYet | Henüz plan oluşturulmamış | No plan created yet | Empty state |
| generate.planReady | Plan Hazır | Plan Ready | Başarı modalı başlığı |
| generate.daysCreated | {count} gün oluşturuldu | {count} days created | ICU plural: day/days |
| generate.monthsCount | {count} ay | {count} months | ICU plural: month/months |
| generate.overwriteWarning | Yeni plan, mevcut planların üzerine yazılır. | The new plan will overwrite existing plans. | — |
| settings.appearance | GÖRÜNÜM | APPEARANCE | Bölüm başlığı, büyük harf stili korunmalı |
| settings.theme.light | Açık | Light | — |
| settings.theme.dark | Koyu | Dark | — |
| settings.deleteAllConfirmTitle | Tüm veriler silinsin mi? | Delete all data? | Kritik onay diyaloğu |
| settings.deleteAllConfirmBody | Bu işlem geri alınamaz. Tüm vardiya planlarınız, notlarınız ve ayarlarınız kalıcı olarak silinecektir. | This action cannot be undone. All your shift plans, notes, and settings will be permanently deleted. | — |
| settings.about.tagline | Vardiyalı çalışanlar için pratik planlama | Practical planning for shift workers | [CONTEXT NEEDED] marka sesi onayı önerilir |
| duration.hoursMinutes | {h} saat {m} dakika | {h} hr {m} min (veya "{h} hour(s) {m} minute(s)") | [CONTEXT NEEDED] kısa mı uzun mu format tercih edilecek |
| shiftTimes.crossesMidnight | Gece geçer | Crosses midnight | — |
| shiftTimes.untilTime | {shift} ({time}'e kadar) | {shift} (until {time}) | Türkçe ek → İngilizce önek dönüşümü |
| app.name | Vardiya Planı | [CONTEXT NEEDED] | Uygulama adı — store/marka kararı, teknik çeviri değil (app.json + strings.xml + Info.plist üçünde senkron güncellenmeli) |

---

## 10. Analiz Tamamlama Kontrolü

- [x] Tüm ekranlar tarandı (11 route dosyası)
- [x] Tüm navigation/tab alanları tarandı
- [x] Tüm butonlar tarandı
- [x] Tüm dialoglar tarandı (Alert.alert + özel modal/showAlert)
- [x] Tüm snackbar/toast mesajları tarandı (proje toast kullanmıyor, sadece Alert)
- [x] Tüm hata mesajları tarandı
- [x] Tüm bildirimler tarandı (push notification implementasyonu yok — expo-notifications kurulu değil)
- [x] Tüm ayarlar tarandı
- [x] Tüm takvim ifadeleri tarandı
- [x] Tüm gün isimleri tarandı (3 ayrı kaynak tespit edildi)
- [x] Tüm ay isimleri tarandı (3 ayrı kaynak tespit edildi)
- [x] Tüm gün kısaltmaları tarandı (2 farklı standart tespit edildi)
- [x] Tüm vardiya kodları tarandı
- [x] Tüm vardiya açıklamaları tarandı
- [x] Tüm filtreler tarandı (dönem preset'leri, başlangıç noktası seçenekleri)
- [x] Tüm istatistik ekranları tarandı (SummarySheet, HomeBottomActions)
- [x] Tüm dinamik stringler tarandı
- [x] Tüm hard-coded Türkçe stringler tarandı (grep ile doğrulandı)
- [x] Tarih formatları kontrol edildi
- [x] Saat formatları kontrol edildi (24 saat sabit, 12/24 tercihi eksik olarak işaretlendi)
- [x] Pluralization problemleri kontrol edildi
- [x] Accessibility metinleri kontrol edildi (proje genelinde hiç kullanılmadığı tespit edildi)
- [x] Kullanıcıya görünmeyen teknik stringler ayrıştırıldı
- [x] Locale kaynaklı teknik riskler tespit edildi

---

## i18n'ye Geçiş İçin Toplam Değişiklik Envanteri

Yukarıdaki tüm bölümlerin özetlendiği, hiçbir öğenin kaybolmadığı nihai master liste. Geliştirici bu listeyi i18n implementasyonu için bir iş kırılım yapısı (WBS) olarak kullanabilir.

### A. Altyapı Kurulumu

| Adım | Açıklama | Öncelik |
|---|---|---|
| A1 | i18n kütüphanesi kurulumu (i18next + react-i18next önerilir; expo-localization zaten mevcut) | **Critical** |
| A2 | tr.json / en.json çeviri dosyası yapısı oluşturma (Bölüm 8 key önerileri temel alınarak) | **Critical** |
| A3 | date-fns locale importunu dinamik hale getirme (şu an sabit `tr` import ediliyor) | **Critical** |
| A4 | Intl.DateTimeFormat çağrılarındaki hardcoded 'tr-TR' locale kodunu dinamikleştirme (2 dosya) | **Critical** |
| A5 | ICU plural desteği kurulumu (day/days, hour/hours, month/months için) | **Critical** |

### B. Kaynak Dilde Önce Düzeltilmesi Gereken Tutarsızlıklar (i18n'den bağımsız, ön koşul)

| Adım | Açıklama | Öncelik |
|---|---|---|
| B1 | Üç ayrı ay-adı kaynağını (turkish.ts, MonthPicker.tsx, date.ts) tek kaynağa indirgeme | **Critical** |
| B2 | İki farklı gün-kısaltması standardını (CalendarGrid 3 harf, revise.tsx 2 harf) tekilleştirme | **Critical** |
| B3 | generate.tsx/templates/index.tsx'teki duplike `getShiftName()` fonksiyonunu tek yerden çözümlenen ortak fonksiyona taşıma; "Öğle"/"Akşam" tutarsızlığını düzeltme | **Critical** |
| B4 | DayCell.tsx renk paleti anahtarını `shortName` yerine değişmeyen `code` alanına bağlama (i18n güvenliği için) | **Critical** |
| B5 | schedulingEngine.ts:124'teki İngilizce "Unknown error" mesajını Türkçe'ye çevirip i18n key'ine bağlama | High |

### C. Çevrilecek İçerik Grupları (Bölüm 2, 4, 5'in özeti)

| Grup | Kapsam | Yaklaşık Adet |
|---|---|---|
| Route/Tab başlıkları | app/_layout.tsx, app/(tabs)/_layout.tsx | 11 |
| Ana sayfa metinleri | index.tsx + Home component'leri | ~45 |
| Ayarlar ekranı | settings.tsx | ~29 |
| Gün düzenleme ekranı | day/[date].tsx | ~24 |
| Plan oluşturma ekranı | generate.tsx | ~50 |
| Revize ekranı | revise.tsx | ~22 |
| Vardiya saatleri ekranı | shift-times.tsx | ~14 |
| Şablonlar ekranı | templates/index.tsx + [id].tsx | ~35 |
| Vardiya veri kaynağı | shifts.ts (name, shortName × 4 vardiya tipi + varyantlar) | 8 |
| Resmi tatiller | holidays.ts (ayrı bölge veri kaynağı gerektirir) | 29 |
| Takvim/tarih sabitleri | turkish.ts, MonthPicker.tsx, date.ts, CalendarGrid.tsx, revise.tsx, settings.tsx (CSV) | ~18 alan |
| Dinamik/template metinler | Plural + interpolasyon gerektiren tüm ifadeler | ~35 |
| Native/config metinleri | app.json (expo.name), android/.../strings.xml (app_name) | 2 (aynı değer, 2 dosya) |

### D. Kapsam Dışı / Karar Bekleyen

| Konu | Neden Karar Gerekiyor |
|---|---|
| Uygulama adı "Vardiya Planı" / marka adı "Demrivo" | Store görünürlüğü ve marka kimliği kararı — teknik çeviri değil, [CONTEXT NEEDED] |
| Vardiya kısaltmaları (S/Ö/G) | Çevrilecekse renk paleti mimarisi de değişmeli; çevrilmeyecekse İngilizce kullanıcıya Türkçe harf gösterilecek |
| Resmi tatiller listesi | Çok ülkeli desteğe geçilirse basit çeviri yetmez, ülke/bölge bazlı ayrı veri kaynağı gerekir |
| 12/24 saat formatı tercihi | Şu an ayarlarda böyle bir seçenek yok; eklenip eklenmeyeceği ürün kararı |
| "İptal" / "Vazgeç" ayrımı | Türkçe'de iki farklı kelime, İngilizce'de muhtemelen tek kelimeye ("Cancel") düşecek |

---

## Kapsam Dışı / Teknik (Çeviri Gerektirmez)

Aşağıdakiler kullanıcıya görünmediği için ana envanterin dışında tutulmuştur:

- Shift `code` değerleri: 0715, 1523, 2307, OFF, OFF1, OFF2
- Renk hex kodları (#16A34A, #F97316, #3B82F6 vb.)
- Route/path string'leri (/calendar, /generate, /templates/[id])
- ISO_DATE_FORMAT ('yyyy-MM-dd') — depolama formatı
- theme: 'light'/'dark' internal enum değeri
- PlannedDaySource, revizyon mode union type değerleri
- STORAGE_FILE, GLOBAL_KEY gibi dosya/anahtar isimleri
- 'tr-TR' locale sabiti (turkish.ts, kod içi kullanım)
- Dev-only console.log mesajları ('[Persist] Load failed...')
- template.steps code referans dizileri
- TypeScript interface/type alan adları
- Test dosyalarındaki Türkçe assertion verileri (84 satır, 4 dosya)
- BYG-A1/B1/C1/D1 gibi kurumsal şablon kodları (özel isim, çevrilmez)
- throw new Error() içindeki İngilizce dev mesajları (date.ts, turkish.ts)

> **Dikkat — çift kullanım:** `theme` alanı hem internal kod hem de settings.tsx'te "Açık"/"Koyu" olarak UI'a yansıyor; internal kod değişmemeli, yalnızca UI etiketi çevrilmeli. Aynı durum vardiya `shortName` alanı için de geçerli — bkz. Bölüm 7 kritik risk.

---

*Analiz kapsamı: app/ (11 dosya) + src/ (23 dosya) + native config (app.json, eas.json, AndroidManifest.xml, strings.xml). Kod hiçbir şekilde değiştirilmedi — bu rapor yalnızca okuma ve analiz sonucudur.*
