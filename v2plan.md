# Vardiya Planı — v2 Localization Dönüşüm Planı

> **Belge türü:** Localization / Internationalization Refactoring Planı
> **Referans:** `i18n-analizi.md` (2026-09-02 tarihli tam envanter)
> **Kapsam:** Yalnızca UI, metin, tarih/saat gösterimi, dil altyapısı
> **Kapsam Dışı:** İş mantığı, algoritmalar, state management, backend, repository/service katmanları, veri modelleri, navigation mantığı — bkz. son bölüm

---

## Kritik Kısıt Beyanı

Bu belgedeki **hiçbir madde** aşağıdakileri değiştirmeyi önermez: shift oluşturma/hesaplama algoritmaları (`schedulingEngine.ts`), state management (`scheduleStore.ts`, Zustand), repository/persistence katmanı (`fileRepository.ts`, `memoryRepository.ts`), domain modelleri (`types/index.ts`'teki veri şekilleri), navigation akışı (`expo-router` route yapısı), veya uygulamanın fonksiyonel davranışı. Her öneri, aşağıdaki 5 soru filtresinden geçirilmiştir:

1. Kullanıcıya görünen UI ile mi ilgili? → Hayırsa elenir.
2. Localization için gerçekten gerekli mi? → Hayırsa elenir.
3. İş mantığını etkiliyor mu? → Evetse elenir.
4. Algoritmayı etkiliyor mu? → Evetse elenir.
5. Backend/persistence davranışını etkiliyor mu? → Evetse elenir.

Bu filtreden geçemeyen hiçbir madde bu planda yer almaz (örn. i18n-analizi.md'nin B4 maddesi — DayCell.tsx'teki renk paleti anahtarını değiştirme — kod incelemesiyle doğrulandı: `getShiftColors()` zaten `shiftType.color`'a düşen bir fallback zincirine sahip, dolayısıyla bu saf bir görsel-anahtarlama refactor'üdür, hesaplama/algoritma değişikliği değildir; bu yüzden plana dahil edilmiştir — bkz. Bölüm 8).

---

## Yönetici Özeti

Vardiya Planı uygulaması şu anda tamamen Türkçe hardcode edilmiş, i18n altyapısı olmayan bir React Native / Expo uygulamasıdır. `i18n-analizi.md` raporunda tespit edilen **~340 benzersiz kullanıcı metni**, **18 takvim/tarih alanı**, **17 vardiya alanı** ve **~35 dinamik/plural metin**, uzun vadede 15+ dili destekleyecek bir mimariye taşınmalıdır.

Bu plan şunu önerir:

- **Kütüphane:** `i18next` + `react-i18next` (+ `expo-localization` cihaz dili tespiti için, zaten kurulu).
- **Yaklaşım:** Kademeli, ekran ekran string migration; iş mantığına dokunulmadan sadece render katmanında `t()` çağrılarına geçiş.
- **Ölçek:** Faz 1'de TR+EN, ama key yapısı ve dosya mimarisi ilk günden 15+ dili düşünerek kurulur (düz JSON, ICU plural, namespace ayrımı, RTL-hazır layout kuralları).
- **Süre:** 5 faz, tahmini toplam efor **13–18 iş günü** (tek geliştirici, tam zamanlı eşdeğeri — bkz. Bölüm 10).
- **En kritik ön koşul:** i18n-analizi.md'de tespit edilen 4 kaynak-dilde-mevcut tutarsızlık (üç ayrı ay-adı listesi, iki farklı gün-kısaltma standardı, "Öğle/Akşam" isim çakışması, hardcoded `'tr-TR'` locale kodu) migration'dan **önce** çözülmelidir — aksi halde çeviri anahtarları bu tutarsızlıkları tüm dillere taşır.

---

## 1. Mevcut Durum Değerlendirmesi

`i18n-analizi.md`'den doğrulanmış özet:

| Metrik | Değer | Kaynak |
|---|---|---|
| Toplam kullanıcıya görünen benzersiz ifade | ~340 | Bölüm 2 |
| Hardcoded Türkçe string (grep doğrulamalı) | ~300 satır (app/ 201 + src/ 253, test dosyaları hariç) | Bölüm 6 |
| Dinamik (plural/interpolasyon gerektiren) string | ~35 | Bölüm 5 |
| Shift kodları | 6 tip: `0715` (Sabah/S), `1523` (Öğle/Ö), `2307` (Gece/G), `OFF`, `OFF1`, `OFF2` | Bölüm 4 |
| Takvim bileşenleri | `CalendarGrid.tsx`, `DayCell.tsx`, `CalendarHeader.tsx`, `MonthPicker.tsx`, `revise.tsx` içi takvim grid | Bölüm 3 |
| Tarih format kaynakları | 3 ayrı kaynak (turkish.ts, MonthPicker.tsx, date.ts+date-fns) | Bölüm 3 |
| Riskli alanlar | Renk paleti↔kısaltma bağımlılığı, hardcoded `'tr-TR'`, plural eksikliği, Öğle/Akşam tutarsızlığı | Bölüm 7 |
| Çevrilecek ekranlar | 11 route: Home, Calendar, Settings, Day Edit, Generate, Revise, Shift Times, Templates (index+detail), root layout, tab layout | Bölüm 2 |
| i18n sistemine bağlı alan | 0 | Bölüm 1 |

### i18n-analizi.md'de Eksik Kalan / Bu Planda Tamamlanan Noktalar

Kaynak analiz çok kapsamlı olmakla birlikte, bir **geçiş planı** için gereken şu boyutları içermiyordu — bu belge onları ekliyor:

- Hangi i18n kütüphanesinin seçileceği ve gerekçesi (analiz sadece "i18next önerilir" diyordu, alternatif değerlendirmesi yoktu).
- Dosya/namespace mimarisi (tek `tr.json`/`en.json` mi, ekran bazlı namespace mi).
- RTL hazırlığı için somut ekran/component listesi (analiz RTL'i "Low, plan dışı" olarak işaretlemişti, ama Faz 2'de Arapça geldiğinde hazırlıksız yakalanmamak için şimdiden bir envanter gerekiyor).
- Dil seçimi ekranının UI gereksinimleri (analiz kapsamında yoktu — hiçbir dil seçici ekran/ayar bulunamadı).
- Cihaz dilinin ilk açılışta nasıl algılanacağı ve kullanıcı override'ının nasıl saklanacağı (persistence *mekanizması* değil, hangi ayarın tutulacağı — bu satır i18n-analizi.md'de yoktu).
- Test/QA stratejisi (pseudo-localization, uzun metin testi, ekran bazlı görsel regresyon).
- Faz bazlı, bağımlılık sıralı görev listesi (analiz sadece A/B/C/D gruplarını listeliyordu, sıralama ve bağımlılık ilişkisi yoktu).

---

## 2. En Uygun i18n Mimarisi

### Mevcut Teknoloji Yığını

`package.json` doğrulaması: **Expo (~54) + React Native (0.81) + expo-router (~6) + TypeScript + Zustand**. Tarih için `date-fns` (^4.1.0) zaten kurulu. `expo-localization` (~17.0.8) bağımlılığı mevcut ama kullanılmıyor.

### Alternatif Değerlendirmesi

| Seçenek | Uygunluk | Değerlendirme |
|---|---|---|
| **i18next + react-i18next** | ✅ Seçildi | React Native/Expo ekosisteminde de-facto standart; ICU plural desteği olgun (`i18next-icu` veya yerleşik `_one`/`_other` suffix); namespace desteği var (ekran bazlı dosya bölme); `expo-localization` ile cihaz dili tespiti birebir entegre olur; 15+ dil / RTL deneyimi kanıtlanmış (çok sayıda büyük RN uygulaması kullanıyor); topluluk ve dokümantasyon geniş. |
| react-intl (FormatJS) | ⚠️ Uygun ama gereksiz ağır | Güçlü ICU desteği var ama React Native'de kurulum daha karmaşık (Intl polyfill gereksinimleri, Hermes'te ek yapılandırma); bu proje ölçeğinde i18next'in sunduğundan fazlasını getirmiyor. |
| lingui | ⚠️ Değerlendirildi, elendi | Derleme-zamanı extraction (macro tabanlı) güçlü bir DX sunuyor ama Expo + Babel yapılandırmasına ek plugin gerektiriyor; ekip zaten i18next'e daha yakın bir zihniyetle (JSON key-value) çalışıyor, geçiş eğrisi daha düşük olan i18next tercih edildi. |
| easy-localization | ❌ Uygun değil | Flutter'a özgü bir paket, React Native projesinde kullanılamaz. |
| flutter_localizations / intl (Dart) | ❌ Uygun değil | Proje Flutter değil; bu seçenekler stack uyumsuzluğu nedeniyle değerlendirme dışı. |
| Native Android/iOS strings (ARB/.strings) | ❌ Uygun değil | Proje tek bir RN/JS kod tabanından iki platforma da derleniyor; native string dosyaları yalnızca `app.json`/`AndroidManifest.xml`/`Info.plist` gibi platform meta verileri için kapsamda (bkz. Bölüm 9 Faz 4), uygulama içi UI metinleri için değil. |

### Seçim: i18next + react-i18next + expo-localization

**Gerekçe:**

1. `expo-localization` zaten `package.json`'da mevcut — cihazın sistem dilini (`getLocales()`) okumak için ek bağımlılık gerekmiyor, sadece i18next'in `LanguageDetector` mekanizmasına bağlanacak.
2. i18next'in yerleşik plural sistemi (`key_one` / `key_other` suffix'leri, CLDR plural kategorilerini destekler) i18n-analizi.md Bölüm 5'te tespit edilen ~35 dinamik metnin çoğunu ek kütüphane olmadan çözer. Faz 3'te Arapça gibi 6 plural formuna sahip diller eklendiğinde (`zero/one/two/few/many/other`) aynı mekanizma sorunsuz genişler.
3. Namespace desteği, i18n-analizi.md'nin önerdiği `screen.section.key` hiyerarşisini doğrudan dosya bazında ayırmaya izin verir (bkz. Bölüm 3) — 15+ dilde tek dev bir JSON yerine ekran başına küçük dosyalar, çeviri ekibiyle çalışmayı kolaylaştırır.
4. React Native'de `Intl` API desteği (Hermes motoru üzerinden) kısmi olduğundan, i18next'in kendi interpolasyon/plural motoru native `Intl.PluralRules` polyfill sorunlarına daha az bağımlıdır.
5. Mevcut `date-fns` kullanımıyla çakışmaz — tarih formatlama `date-fns`'de kalmaya devam eder (bkz. Bölüm 5), i18next yalnızca statik/dinamik metin çevirisini üstlenir. İki kütüphane farklı sorumluluklarda çalışır, birbirini ikame etmez.

---

## 3. Translation Key Stratejisi

### Naming Convention

```
<namespace>.<bölüm?>.<key>[_short|_one|_other]
```

- **namespace** = ekran veya paylaşılan alan adı (`common`, `calendar`, `shift`, `home`, `generate`, `revise`, `templates`, `settings`, `dayEdit`, `shiftTimes`, `duration`, `errors`).
- Alt bölüm gerektiğinde (örn. takvimde günler ve aylar ayrı gruplanmalı) ikinci seviye eklenir: `calendar.weekdays.*`, `calendar.months.*`.
- Kısaltma varyantları `_short` son ekiyle: `calendar.weekdays.monday` / `calendar.weekdays.monday_short`.
- Plural varyantları i18next standardı `_one` / `_other` (gerekirse Arapça için `_zero`/`_two`/`_few`/`_many` de otomatik desteklenir): `generate.daysCreated_one`, `generate.daysCreated_other`.

### Dosya Mimarisi (Namespace = Dosya)

```
src/i18n/
  index.ts                    # i18next init, expo-localization bağlama
  locales/
    tr/
      common.json
      calendar.json
      shift.json
      home.json
      generate.json
      revise.json
      templates.json
      settings.json
      dayEdit.json
      shiftTimes.json
      duration.json
      errors.json
    en/
      (aynı dosya seti)
```

**Neden ekran-bazlı ayrım, tek dev JSON değil:** 15+ dil hedeflendiğinde tek dosya (`tr.json` / `en.json`) hem çeviri ekibi için (hangi ekranın çevrildiğini takip etmek zorlaşır) hem de bundle-splitting için (React Native'de lazy-load faydası sınırlı olsa da, dosya boyutu okunabilirliği etkiler) sürdürülemez hale gelir. Namespace bazlı yapı, i18next'in `ns` parametresiyle native olarak desteklenir, ek bir soyutlama gerektirmez.

### Örnek Hiyerarşi (i18n-analizi.md Bölüm 8'in genişletilmiş hali)

```jsonc
// common.json
{
  "save": "Kaydet",
  "cancel": "İptal",
  "confirm": "Onayla",
  "close": "Kapat",
  "share": "Paylaş",
  "delete": "Sil",
  "ok": "Tamam",
  "error": "Hata",
  "warning": "Uyarı"
}

// calendar.json
{
  "today": "Bugün",
  "tomorrow": "Yarın",
  "weekdays": {
    "monday": "Pazartesi",
    "monday_short": "Pzt",
    "tuesday": "Salı",
    "tuesday_short": "Sal"
    // ...
  },
  "months": {
    "january": "Ocak",
    "february": "Şubat"
    // ...
  },
  "holidayOfficial": "Resmi Tatil — {{name}}"
}

// shift.json
{
  "morning": "Sabah",
  "afternoon": "Öğle",
  "night": "Gece",
  "off": "Off",
  "crossesMidnight": "Gece geçer",
  "untilTime": "{{shift}} ({{time}}'e kadar)"
}

// generate.json
{
  "daysCreated_one": "{{count}} gün oluşturuldu",
  "daysCreated_other": "{{count}} gün oluşturuldu",
  "monthsCount_one": "{{count}} ay",
  "monthsCount_other": "{{count}} ay"
}
```

> Not: Türkçe kaynak dilde `_one`/`_other` metinleri genelde aynıdır (Türkçe'de sayısal ek değişmez) — bu **kasıtlıdır**, ileride İngilizce ve diğer dillerde bu iki varyant farklılaşacaktır (`"{{count}} day created"` / `"{{count}} days created"`).

### Ay/Gün İsimleri İçin Özel Not

`calendar.months.*` ve `calendar.weekdays.*` key'leri **yalnızca elle çeviri gerektiren diller için fallback** olarak tutulur. Asıl kaynak `date-fns`'in kendi locale paketleri olmalıdır (bkz. Bölüm 5) — bu key'ler CSV export gibi `date-fns` format string'inin kullanılamadığı özel durumlar için saklanır (örn. `settings.tsx`'teki CSV başlık satırı, mevcut kodda zaten elle üretilen bir dizi).

---

## 4. Shift Sistemi İçin Özel Değerlendirme

### Mevcut Durum (kod doğrulamalı)

`src/constants/shifts.ts` içindeki `DEFAULT_SHIFT_TYPES`, her vardiya için üç alan taşır:

| Alan | Örnek | Rolü |
|---|---|---|
| `code` | `"0715"`, `"OFF"` | **Internal, değişmez kimlik.** Şablon `steps` dizilerinde, `isOffCode()` kontrolünde, veri modelinde referans olarak kullanılıyor. |
| `name` | `"Sabah"`, `"Öğle"`, `"Gece"`, `"Off"` | **Kullanıcıya görünen tam ad.** Vardiya seçim ekranlarında, özet metinlerinde gösteriliyor. |
| `shortName` | `"S"`, `"Ö"`, `"G"`, `"Off"` | **Kullanıcıya görünen kısaltma.** Takvim hücresinde (`DayCell.tsx`) render ediliyor; aynı zamanda `DayCell.tsx`'teki renk paleti sözlüğünün (`SHIFT_BG_COLORS_LIGHT/DARK`) anahtarı olarak kullanılıyor. |

`DayCell.tsx` kod incelemesiyle doğrulandı (`getShiftColors()` fonksiyonu): `shortName`, renk paletinde bulunamazsa fonksiyon otomatik olarak `shiftType.color` alanına (her shift tipinin kendi hex rengi) düşüyor. **Bu, kritik bir bulgu: sistem zaten bir fallback'e sahip, `shortName` çevrildiğinde uygulama kırılmaz — sadece palet ile fallback rengi arasında görsel bir tutarsızlık oluşabilir** (palet elle seçilmiş "saturated" tonlar, fallback `shiftType.color` alanındaki ham renk).

### Sorulara Yanıtlar

**Kod (`code`) sabit mi kalmalı?**
Evet, kesinlikle. `code` alanı (`0715`, `1523`, `2307`, `OFF`, `OFF1`, `OFF2`) veri modelinin bir parçası, şablon referanslarında ve `isOffCode()` mantığında kullanılıyor. Bu değer **iş mantığına ait**, localization kapsamı dışındadır ve değiştirilmeyecektir.

**Gösterim (`name`, `shortName`) değişmeli mi?**
Evet. `name` ve `shortName` saf UI metnidir, `t()` çağrılarına taşınmalıdır. `name` için çeviri kolaydır (`shift.morning` = "Morning"). `shortName` için ise bir **ürün kararı** gerekir (aşağıya bakınız).

**Çeviri nasıl yapılmalı?**
`ShiftType` veri modelindeki `name` ve `shortName` alanları **değişmez** kalır (bunlar hâlâ `code`'a bağlı sabit varsayılan veridir — DEFAULT_SHIFT_TYPES). Render katmanında, bu alanları doğrudan ekrana basmak yerine `code`'dan bir çeviri anahtarına eşleyen ince bir yardımcı (`getShiftDisplayName(code, t)`, `getShiftShortLabel(code, t)`) kullanılmalı. Bu yardımcı, mevcut `name`/`shortName` alanlarının **yerini almaz**, render sırasında `t()` çıktısını tercih eden bir katman ekler; kullanıcı özel şablon adı girdiyse (örn. şablon `name` alanı gibi kullanıcı verisi) o zaten `t()` kapsamı dışında olduğundan değişmeden kalır.

**İngilizce karşılıkları ne olmalı?**

| code | TR name | EN name (öneri) | TR shortName | EN shortName (öneri) |
|---|---|---|---|---|
| `0715` | Sabah | Morning | S | **[ÜRÜN KARARI GEREKİR]** — M |
| `1523` | Öğle | Afternoon | Ö | **[ÜRÜN KARARI GEREKİR]** — A |
| `2307` | Gece | Night | G | **[ÜRÜN KARARI GEREKİR]** — N |
| `OFF` | Off | Off (değişmeyebilir) | Off | Off |

**Kısaltma (`shortName`) kararı neden ayrı işaretlendi:** `Ö` harfi Türkçe'ye özgüdür ve İngilizce klavye/fontta doğal karşılığı yoktur — bu yüzden basit bir çeviri değil, bir **tasarım kararı** gerektirir. Üç seçenek var:

1. **Kısaltmayı da çevir** (S→M, Ö→A, G→N): Her dilde farklı harf seti gerekir, 15+ dilde bu harflerin çakışmaması (örn. iki farklı vardiyanın aynı baş harfle başlaması) her dil için ayrıca kontrol edilmeli.
2. **Kısaltmayı sabit tut, sadece tam adı çevir**: Takvim hücresinde her zaman `S`/`Ö`/`G`/`Off` görünür, tam ad (tooltip/detay ekranında) dile göre değişir. Daha az çeviri riski, ama kullanıcı deneyiminde kısaltmanın anlamı dilden bağımsız kalır.
3. **Kısaltma yerine ikon/renk kullan**: Localization riskini tamamen ortadan kaldırır ama bu bir **görsel tasarım değişikliği** olur, mevcut plan kapsamının (metin çevirisi) ötesine geçer — bu belge bunu önermez, sadece seçenek olarak not eder.

Bu plan, **seçenek 2'yi** (kısaltmayı sabit tutmak) düşük riskli varsayılan olarak önerir çünkü DayCell.tsx'in mevcut sabit-genişlikli tasarımını bozmaz ve palet↔kısaltma bağımlılığını (Bölüm 7, i18n-analizi.md) sıfıra indirir. Nihai karar üründe verilmelidir; bu plan sadece teknik implikasyonu belirtir.

**Gelecekteki diller için nasıl modellenmeli?**
`code` → çeviri anahtarı eşlemesi (`shift.morning`, `shift.afternoon`, `shift.night`, `shift.off`) dilden bağımsız sabit bir sözlüktür; her yeni dil sadece bu 4 key'in çevirisini `shift.json`'a ekler, kod tarafında hiçbir değişiklik gerekmez. Kısaltma için seçenek 2 benimsenirse, yeni dillerde de ek işlem gerekmez (kısaltma zaten sabit).

### Şablon Adları (`getShiftName()` Tutarsızlığı)

`generate.tsx` ve `templates/index.tsx` içindeki yerel `getShiftName()` fonksiyonu, "Öğle" vardiyasını "Akşam" olarak etiketliyor — bu, `shifts.ts`'teki gerçek `name` alanıyla çelişen, **kaynak Türkçe metinde zaten var olan bir tutarsızlık**. Bu, i18n key'leri oluşturulmadan önce düzeltilmelidir (Bölüm 9, Faz 0), çünkü:
- Bu bir **metin düzeltmesi**dir (yanlış Türkçe kelimeyi doğrusuyla değiştirmek), iş mantığına dokunmaz — plan kapsamında.
- İki dosyadaki duplike `getShiftName()` fonksiyonunun tek bir yardımcıya (`src/utils/shiftDisplay.ts` gibi, sadece görüntüleme amaçlı, hesaplama içermeyen) birleştirilmesi de saf bir render-katmanı refactor'üdür.

---

## 5. Takvim Sistemi İçin Özel Değerlendirme

### Locale'den Otomatik Alınabilecekler

`date-fns`'in `format()` fonksiyonu, `locale` parametresi dinamik hale getirildiğinde aşağıdakileri **kod değişikliği olmadan** otomatik üretir (her dil için `date-fns/locale/<kod>` paketi mevcutsa):

- Ay isimleri (tam ve kısa: `MMMM`, `MMM`)
- Gün isimleri (tam ve kısa: `EEEE`, `EEE`)
- Tarih parçalarının sıralanışı (dil-spesifik format string'i kullanıldığında)

`date-fns`, TR, EN dahil Faz 1 ve Faz 2'deki dillerin (Portekizce, İspanyolca, Arapça, Hintçe için `hi`, Endonezce için `id`) tamamı için resmi locale paketi sağlıyor. Faz 3 dilleri (Urduca `ur`, Bengalce `bn`, Rusça `ru`, Vietnamca `vi`, Filipince — `date-fns`'te doğrudan karşılığı yok, en yakın "fil" locale paketi topluluk tarafından sağlanıyor, doğrulama gerekir) için kütüphane desteği ayrıca kontrol edilmeli.

### Manuel Çevrilmesi Gerekenler

| Alan | Neden Manuel |
|---|---|
| `calendar.today` / `calendar.tomorrow` (Bugün/Yarın) | `date-fns`'in relative-date çıktısı ("today"/"tomorrow") ürünün ses tonuna uymayabilir; UI metni olarak `t()` ile yönetilmesi öneriliyor. |
| CSV export gün adları (`settings.tsx` satır 62) | `date-fns` format string'i CSV üretiminde kullanılmıyor, elle dizi var — bu dizi ya `date-fns`'e taşınmalı ya da `calendar.weekdays.*` key'lerinden okunmalı. |
| Resmi tatil isimleri (`holidays.ts`) | Kültüre özgü veri, `date-fns` kapsamı dışında — bkz. aşağıdaki özel not. |
| "'e kadar" gibi dilbilgisel ekler (`untilTime`) | `date-fns`'in kapsamı dışında, tamamen UI metni — `t()` ile interpolasyon. |

### Refactor Gerektirenler (Sadece Localization Kapsamında)

| # | Sorun | Refactor (localization kapsamında) |
|---|---|---|
| 1 | `date.ts`'te `date-fns/locale/tr` sabit import edilmiş | Locale'i aktif dile göre dinamik seçen bir harita (`{ tr, en, ... }`) ile değiştirme — **saf konfigürasyon değişikliği**, format mantığına dokunmuyor |
| 2 | `Intl.DateTimeFormat('tr-TR', ...)` iki dosyada hardcoded (`index.tsx`, `day/[date].tsx`) | Locale kodunu i18next'in aktif dilinden okuyacak şekilde parametrikleştirme |
| 3 | Üç ayrı ay-adı kaynağı (`turkish.ts`, `MonthPicker.tsx`, `date.ts`) | `MonthPicker.tsx`'teki `MONTH_NAMES_TR` dizisini kaldırıp `date-fns` çıktısını veya `calendar.months.*` çevirisini kullanacak şekilde değiştirme — **render katmanı değişikliği**, MonthPicker'ın seçim mantığı (hangi ay seçili, callback) aynı kalır |
| 4 | İki farklı gün-kısaltması standardı (`CalendarGrid.tsx` 3 harf, `revise.tsx` 2 harf) | Tek bir kaynağa (`calendar.weekdays.*_short` veya `date-fns` `EEEEEE`/`EEE` formatı) indirgeme — **görsel tutarlılık düzeltmesi**, takvim grid'inin gün hesaplama mantığı değişmiyor |
| 5 | `formatDateTR`, `formatDurationTR`, `getMonthNameTR` gibi dil-spesifik fonksiyon adları | İsimlendirme güncellemesi (`formatDate`, `formatDuration`, `getMonthName` — locale parametresi alacak şekilde) — **yalnızca isimlendirme + parametrik hale getirme**, fonksiyonların döndürdüğü değerin hesaplanma şekli (hangi tarih, hangi gün) değişmiyor |
| 6 | Hafta başlangıcı sabit Pazartesi | `weekStartsOn` değerini locale'e göre okuma (`date-fns`'in `Locale.options.weekStartsOn` alanı) — **sadece takvim grid'inin ilk sütununun hangi gün olduğunu belirleyen render parametresi**, gün/tarih hesaplama algoritmasına dokunmuyor |

> **Önemli sınır çizgisi:** Yukarıdaki 6. madde ("hafta başlangıcı") **yalnızca takvimin görsel ilk sütununu** ifade eder — `schedulingEngine.ts`'teki vardiya döngüsü hesaplaması, döngü başlangıç günü, veya herhangi bir plan oluşturma mantığı bu değişiklikten etkilenmez ve bu plan bu tür bir değişiklik önermez.

### Resmi Tatiller (`holidays.ts`) — Özel Değerlendirme

`holidays.ts` Türkiye'ye özgü dini/resmi bayramları (Ramazan Bayramı, Kurban Bayramı gibi hicri takvime bağlı olanlar dahil) içeriyor. Bu veri kümesi:

- **Faz 1 (TR+EN) için:** Basit çeviri yeterli — tatil isimleri `calendar.holidays.*` altında çevrilir, tarihler (Türkiye'ye özgü) değişmez, İngilizce kullanıcı Türkiye tatillerini İngilizce isimle görür.
- **Faz 2+ (çok ülkeli genişleme) için:** Bu belgenin kapsamı dışında bir **ürün kararı** gerektirir — her ülkenin kendi resmi tatil takvimini mi göstereceği, yoksa uygulamanın tek-ülke (Türkiye) odaklı mı kalacağı netleşmeden, `holidays.ts`'in veri yapısını değiştirmek (örn. ülke bazlı ayrı dosyalara bölmek) bu planın önerisi değildir; bu, localization'ın ötesinde bir veri kaynağı/ürün kapsamı genişletme kararıdır. **Bu plan yalnızca Türkiye tatil isimlerinin çevirisini önerir, ülke bazlı tatil sistemi tasarlamaz.**

---

## 6. RTL Hazırlığı (Yalnızca Envanter — İmplementasyon Yok)

Faz 2'de Arapça, olası gelecek dillerde Farsça eklenmesi planlandığından, RTL implementasyonu yapılmadan önce hangi ekran/component'lerin risk taşıdığının **şimdiden** çıkarılması isteniyor. Aşağıdaki liste yalnızca bir hazırlık/farkındalık envanteridir — bu fazda hiçbir RTL kodu yazılmayacaktır.

### Etkilenecek Ekranlar

| Ekran | Risk Noktası |
|---|---|
| `app/(tabs)/calendar.tsx` + `CalendarGrid.tsx` | Takvim grid'i soldan sağa 7 sütun; RTL'de sütun sırası ve gün akış yönü tersine dönmeli |
| `app/(tabs)/index.tsx` (Home) | `UpcomingDays` yatay kaydırmalı liste — RTL'de kaydırma yönü ve ok ikonları ters çevrilmeli |
| `app/day/[date].tsx` | Sol-sağ hizalanmış form alanları (Başlangıç/Bitiş saat girişleri yan yana) |
| `app/generate.tsx`, `app/revise.tsx` | Çok adımlı sihirbaz akışı; "İleri/Geri" gibi yönlü butonlar ve ok ikonları |
| `app/templates/[id].tsx` | Döngü önizleme şeridi (yatay adım listesi) — RTL'de akış yönü değişmeli |
| Tüm ekranlardaki `Geri` butonu ve header'daki geri oku (`app/day/[date].tsx:106`) | Native geri oku RTL'de otomatik döner (React Navigation), ama **özel çizilen** ok ikonları (`↺`, `→`, `›`, `‹` gibi metin karakterleri — bkz. `shift-times.tsx:497`, `templates/index.tsx` "Görüntüle ›") manuel kontrol gerektirir |

### Riskli Widget/Component Türleri

- **Yatay `FlatList`/`ScrollView`** kullanan her yer (UpcomingDays, döngü önizleme şeritleri) — RTL'de `flexDirection` ve scroll yönü.
- **Metin içine gömülü yön belirten karakterler** (`→`, `‹`, `›`, `↺`) — bunlar Unicode olarak RTL'de otomatik ayna görüntüsü almaz, elle `I18nManager.isRTL` kontrolü gerekecek (implementasyon Faz 2'nin kapsamı, bu fazda değil).
- **Takvim hücresi içi ikon/badge konumlandırması** (`DayCell.tsx` — not göstergesi sol-üst, kilit göstergesi sağ-üst olarak sabit konumlandırılmış, kod yorumunda da belirtilmiş) — RTL'de bu köşe konumları yer değiştirmeli.
- **Sabit `marginLeft`/`marginRight`, `paddingLeft`/`paddingRight` kullanan stiller** (React Native'in `marginStart`/`marginEnd` mantıksal eşdeğerleri yerine) — kod tabanında yaygınlığı bu aşamada ayrı bir tarama gerektirir (bu plan kapsamında sayılmadı, Faz 5 QA sürecinde ayrıca taranmalı).

### Kontrol Edilmesi Gereken Layout Kalıpları

- İki elemanın yatay hizalandığı her `flexDirection: 'row'` bloğu (form etiketleri + değerler, buton grupları).
- Sabit yönlü padding/margin kullanan `StyleSheet` tanımları.
- Metin hizalaması için `textAlign: 'left'`/`'right'` sabit kullanılan yerler (`'auto'` veya mantıksal eşdeğerlerle değiştirilmesi gerekecek).

> Bu bölüm yalnızca **envanter ve farkındalık** amaçlıdır. RTL implementasyonu (`I18nManager.forceRTL()`, mantıksal stil özelliklerine geçiş, ikon aynalama) bu planın kapsamı dışındadır ve ayrı bir gelecek faz olarak ele alınmalıdır.

---

## 7. UI Risk Analizi (Metin Uzunluğu Kaynaklı)

Dil değişince metin uzunluğu farklılaşacağından oluşabilecek görsel riskler:

| Risk | Etkilenen Alan | Seviye | Not |
|---|---|---|---|
| Takvim hücresi kısaltma taşması | `DayCell.tsx` — sabit `cellSize` içinde `shortName` render ediliyor | **High** | Kısaltmanın sabit tutulması (Bölüm 4, seçenek 2) bu riski sıfırlar; çevrilirse (`Morning`→`M` gibi tek harfe indirilmezse) hücre taşabilir |
| Buton metni taşması | `common.cancel`/`common.save` gibi kısa TR kelimeler bazı dillerde uzayabilir (örn. Almanca, Rusça birleşik/uzun kelimeler) | **Medium** | Buton genişliklerinin `minWidth` yerine içerik-esnek (`flexShrink`, `numberOfLines` + `adjustsFontSizeToFit` benzeri RN çözümleri) olup olmadığı doğrulanmalı |
| Header/başlık taşması | `app/_layout.tsx`'teki route başlıkları ("Şablon Düzenle" gibi) | **Medium** | React Navigation header'ları genelde `numberOfLines={1}` + ellipsis ile güvenli, ama özel header component'i varsa kontrol edilmeli |
| Tab bar etiket taşması | `app/(tabs)/_layout.tsx` — "Ana Sayfa", "Takvim", "Ayarlar" | **High** | 4-5 tab'lık dar alanlarda uzun dil çevirileri (örn. Almanca "Einstellungen" = Ayarlar) kesilebilir; tab bar font boyutu küçültme veya ikon-öncelikli tasarım değerlendirilmeli |
| Gün kısaltması genişlik farkı | `CalendarGrid.tsx`/`revise.tsx` gün başlıkları | **High** | Türkçe 2-3 harf (Pzt) vs İngilizce 3 harf (Mon) vs bazı dillerde tek karakter (CJK dilleri gelecekte eklenirse) — grid sütun genişliği sabit değil, içerik bazlı olmalı |
| Şablon adı / açıklama metni taşması | `generate.tsx`, `templates/index.tsx` döngü açıklaması (`"{cycleLength} günlük döngü • {workDays} iş, {offDays} izin"`) | **Medium** | Uzun İngilizce/Almanca çeviri satırı sarabilir; `flexWrap` ve satır sayısı sınırının olup olmadığı kontrol edilmeli |
| Shift badge (durum rozetleri) taşması | `TodayShiftCard.tsx` "özel" (customBadge), "BUGÜN" badge'i | **Medium** | Küçük sabit-boyutlu badge'lerde uzun çeviri kesilebilir |
| Modal/Dialog buton grubu taşması | `settings.tsx` silme onayı ("Vazgeç"/"Sil"), `templates/[id].tsx` silme onayı | **Low** | Genelde modallar tam genişlik kullanır, taşma riski düşük ama iki buton yan yana ise kontrol edilmeli |
| CSV export sütun başlığı okunabilirliği | `settings.tsx` CSV header satırı | **Low** | Kullanıcı dosyayı harici uygulamada (Excel vb.) açıyor, uygulama içi UI riski yok, sadece çeviri doğruluğu önemli |

**Önerilen genel önlem (localization kapsamında):** Buton ve badge component'lerinde sabit `width` yerine `minWidth` + iç boşluk (`paddingHorizontal`) kullanımı, metin bileşenlerinde `numberOfLines` ve `ellipsizeMode` tanımlı olması — bunlar mevcut component'lerin **görsel stil ayarlarıdır**, iş mantığı veya veri akışı değildir.

---

## 8. Teknik Borç ve Refactor İhtiyacı (Yalnızca Localization Kapsamında)

| # | Refactor | Risk | Etki | Efor |
|---|---|---|---|---|
| 1 | Üç ayrı ay-adı kaynağının (`turkish.ts`, `MonthPicker.tsx`, `date.ts`) tekilleştirilmesi | Düşük — sadece görüntüleme kaynağı değişiyor, ay hesaplama mantığı (`month` number'ı) aynı kalıyor | Yüksek — 3 dosya yerine 1 kaynaktan besleniyor olması gelecekteki her yeni dil eklemesini basitleştirir | 0.5 gün |
| 2 | İki farklı gün-kısaltması standardının (`CalendarGrid.tsx` 3 harf, `revise.tsx` 2 harf) tekilleştirilmesi | Düşük — sadece render edilen string değişiyor, gün indeksleme mantığı aynı | Orta — görsel tutarlılık + çeviri anahtarı sayısını yarıya indirir | 0.5 gün |
| 3 | `getShiftName()` fonksiyonunun (generate.tsx + templates/index.tsx duplike) ortak bir görüntüleme yardımcısına taşınması, "Öğle/Akşam" tutarsızlığının düzeltilmesi | Düşük — bu fonksiyon yalnızca `code`'dan görüntüleme metnine eşleme yapıyor, plan oluşturma algoritmasına dahil değil (kod incelemesiyle sınırı doğrulanmalı, ama analiz raporunda "plan özeti metni" olarak işaretlenmiş) | Yüksek — kaynak dildeki mevcut bir hata düzeltiliyor, iki yerine tek çeviri anahtarı seti | 0.5 gün |
| 4 | `DayCell.tsx` renk paleti anahtarının `shortName` yerine değişmez `code`'a bağlanması | Düşük — kod incelemesiyle doğrulandı, mevcut fallback zinciri zaten var, bu sadece birincil anahtarı daha sağlam bir alana taşımak | Yüksek — `shortName` hangi dile çevrilirse çevrilsin renk ataması etkilenmez, ileride Bölüm 4/seçenek 1 (kısaltmayı çevirme) tercih edilirse bile güvenli kalır | 0.5 gün |
| 5 | `formatDateTR`, `formatDurationTR`, `getMonthNameTR` gibi fonksiyonların locale-parametreli hale getirilip yeniden adlandırılması | Düşük — imza değişikliği (yeni parametre eklenmesi), dönüş değeri hesaplama mantığı aynı | Yüksek — tüm tarih/süre gösterimlerinin dil değişimine tepki vermesi için önkoşul | 1 gün |
| 6 | `Intl.DateTimeFormat('tr-TR', ...)` çağrılarının (2 dosya) dinamik locale koduna geçirilmesi | Düşük — sadece parametre kaynağı değişiyor | Yüksek — hardcoded olduğu sürece dil değiştirilse bile gün adları hep Türkçe kalır (kritik bug'a yol açar) | 0.5 gün |
| 7 | `duration.ts`'teki `formatDurationTR`'nin ICU plural yapısına taşınması | Düşük — mevcut saat/dakika hesaplama aynı kalır, sadece çıktı string'i `t()` üzerinden üretilir | Orta — İngilizce "1 hour" / "2 hours" ayrımı olmadan çeviri yanlış görünür | 0.5 gün |
| 8 | Buton/badge component'lerinde sabit genişlik yerine esnek genişlik + `numberOfLines` standardizasyonu | Düşük — yalnızca stil özellikleri, layout mantığı (hangi buton nerede) değişmiyor | Orta — Bölüm 7'deki taşma risklerinin çoğunu azaltır | 1–1.5 gün (component bazında dağınık) |

**Toplam teknik borç eforu: ~5–5.5 gün** (Faz 0 ve Faz 1 arasına dağıtılacak, bkz. Bölüm 9).

---

## 9. Uygulama Planı

### Faz 0 — Hazırlık (Ön Koşullar, i18n Kurulumundan Önce)

- [ ] `turkish.ts`, `MonthPicker.tsx`, `date.ts` içindeki üç ayrı ay-adı kaynağını tek bir kaynağa indirgeme (öneri: `date-fns` + dinamik locale, `MonthPicker.tsx`'teki `MONTH_NAMES_TR` dizisini kaldırma).
- [ ] `CalendarGrid.tsx` (3 harf) ve `revise.tsx` (2 harf) gün kısaltmalarını tek standarda getirme.
- [ ] `generate.tsx` ve `templates/index.tsx`'teki duplike `getShiftName()` fonksiyonlarını `src/utils/shiftDisplay.ts` gibi ortak bir görüntüleme yardımcısında birleştirme; "Öğle" vardiyasının yanlışlıkla "Akşam" gösterildiği hatayı düzeltme.
- [ ] `schedulingEngine.ts:124`'teki İngilizce `'Unknown error'` mesajını Türkçe'ye çevirme (dil karışıklığını önlemek için, çeviri sistemine bağlanmadan önce kaynak dilde tutarlılık sağlanmalı).
- [ ] `DayCell.tsx` renk paleti anahtarını `shortName` yerine `code`'a bağlama (fallback davranışı korunarak).
- [ ] Bu 5 maddenin QA doğrulaması: uygulamanın mevcut Türkçe davranışının hiçbir şekilde değişmediğini (aynı renkler, aynı isimler, aynı hesaplamalar) manuel test ile teyit etme.

### Faz 1 — Localization Altyapısı

- [ ] `i18next`, `react-i18next` paketlerini kurma.
- [ ] `expo-localization` üzerinden cihaz dilini okuyan bir `LanguageDetector` yazma (i18next'e bağlama).
- [ ] `src/i18n/index.ts` dosyasında i18next init yapılandırması (namespace listesi, fallback dil = TR, ICU plural ayarları).
- [ ] Namespace bazlı boş JSON dosya iskeletini oluşturma (`src/i18n/locales/tr/*.json`, `src/i18n/locales/en/*.json` — Bölüm 3'teki 12 namespace).
- [ ] `date-fns` locale importunu dinamik hale getirme (aktif dile göre `tr`/`enUS` seçimi).
- [ ] `Intl.DateTimeFormat('tr-TR', ...)` çağrılarını (2 dosya) dinamik locale koduna geçirme.
- [ ] `formatDateTR`, `formatDurationTR`, `getMonthNameTR` fonksiyonlarını locale-parametreli hale getirip yeniden adlandırma.
- [ ] Kullanıcının seçtiği dilin nerede saklanacağına karar verme (mevcut `DEFAULT_SETTINGS`/tema ayarının saklandığı persistence mekanizmasıyla **aynı yöntemi** kullanma — yeni bir storage mekanizması icat edilmiyor, sadece `language` alanı ayarlar veri şekline ekleniyor).

### Faz 2 — String Migration (Ekran Ekran, Riskten Düşüğe Doğru)

- [ ] `common.json` namespace'ini oluşturma ve tüm ekranlarda tekrar eden genel butonları (`İptal`, `Kaydet`, `Tamam`, `Kapat`, `Paylaş`, `Sil`) `t()` çağrısına taşıma.
- [ ] Route/Tab başlıkları (`app/_layout.tsx`, `app/(tabs)/_layout.tsx`) — 11 string.
- [ ] Ayarlar ekranı (`settings.tsx`) — ~29 string (bölüm başlıkları, tema etiketleri, veri yönetimi, hakkında).
- [ ] Ana sayfa ve component'leri (`index.tsx` + `src/components/home/*`) — ~45 string, plural gerektiren dinamik metinler dahil.
- [ ] Gün düzenleme ekranı (`day/[date].tsx`) — ~24 string.
- [ ] Vardiya saatleri ekranı (`shift-times.tsx`) — ~14 string.
- [ ] Şablonlar ekranı (`templates/index.tsx` + `[id].tsx`) — ~35 string.
- [ ] Plan oluşturma ekranı (`generate.tsx`) — ~50 string, en yoğun plural/dinamik metin içeren ekran.
- [ ] Revize ekranı (`revise.tsx`) — ~22 string.
- [ ] Her ekran migration'ından sonra: TR dilinde görsel regresyon kontrolü (metin aynı görünmeli, sadece kaynağı `t()` üzerinden geliyor olmalı).

### Faz 3 — Takvim ve Vardiya Localization

- [ ] `shift.json` namespace'i: `code` → çeviri anahtarı eşlemesini içeren `getShiftDisplayName(code, t)` yardımcısını yazma ve `DEFAULT_SHIFT_TYPES` render edilen her yerde bu yardımcıyı kullanacak şekilde güncelleme.
- [ ] Shift kısaltma (`shortName`) stratejisi için ürün kararını uygulama (Bölüm 4'teki 3 seçenekten biri seçildikten sonra).
- [ ] `calendar.json` namespace'i: gün/ay isimlerini `date-fns` dinamik locale çıktısına veya fallback çeviri key'lerine bağlama.
- [ ] `holidays.ts`'teki resmi tatil isimlerini `calendar.holidays.*` çeviri anahtarlarına taşıma (tarihler değişmez, yalnızca isim metni çevrilir).
- [ ] `settings.tsx` CSV export'undaki gün adı dizisini `calendar.weekdays.*` key'lerinden okuyacak şekilde güncelleme.
- [ ] `duration.ts`'teki `formatDurationTR`'yi ICU plural yapısına taşıma (`duration.hoursMinutes` vb.).
- [ ] `day/[date].tsx:218`'deki `🇹🇷 Resmi Tatil` kalıbındaki bayrak emojisini kaldırma veya sabit/nötr bir gösterime çevirme (ürün kararına bağlı, bu plan kaldırılmasını önerir çünkü ülkeye özgü sabit kodlama gelecekteki çok-dilli kullanıcılar için yanıltıcı olur).

### Faz 4 — Dil Seçimi

- [ ] Ayarlar ekranına yeni bir "Dil / Language" bölümü ekleme (mevcut GÖRÜNÜM/PROGRAM/VERİ/HAKKINDA bölüm yapısına uygun beşinci bir bölüm olarak, mevcut UI kalıpları korunarak).
- [ ] Dil seçim listesi/modalı (Faz 1'de TR/EN, mimari Faz 2/3 dillerini otomatik listeleyecek şekilde veri-güdümlü olmalı — yeni bir dil eklendiğinde sadece namespace JSON'ları ve seçim listesine bir satır eklenmesi yeterli olmalı, kod değişikliği gerekmemeli).
- [ ] İlk açılışta cihaz dilinin `expo-localization` ile tespit edilip, desteklenen diller listesinde varsa otomatik seçilmesi; desteklenmiyorsa TR'ye (mevcut varsayılan) düşmesi.
- [ ] Kullanıcının manuel dil seçiminin, mevcut ayarlar persistence mekanizmasına (Faz 1'de karar verilen yöntem) kaydedilmesi.
- [ ] `app.json` / Android `strings.xml` / iOS `Info.plist`'teki uygulama adı ve mağaza-görünür metinlerin senkron güncellenmesi (bu native config dosyaları localization kapsamında ama **derleme/dağıtım süreci** ayrı ele alınmalı — bkz. Bölüm 11 karar bekleyenler).

### Faz 5 — QA ve Test

- [ ] **Pseudo-localization testi:** Tüm `t()` anahtarlarının gerçekten çağrıldığını doğrulamak için geçici bir "hayali dil" (örn. her karakteri aksanlı harfe çeviren) ile tüm ekranları gezme — hiçbir yerde ham Türkçe metin kalmadığını doğrulama.
- [ ] **Uzun metin testi:** En uzun muhtemel çeviriyi (örn. Almanca veya Rusça referans metinler, henüz çevrilmemiş olsa bile placeholder olarak) TR/EN dışı bir üçüncü "test dili" olarak yükleyip Bölüm 7'deki taşma risklerini ekran ekran doğrulama.
- [ ] **Plural doğrulaması:** 0, 1, 2, 5, 11, 21 gibi farklı sayı değerleriyle tüm `_one`/`_other` metinlerini (gün, ay, saat, dakika sayaçları) test etme.
- [ ] **Tarih/saat format doğrulaması:** Her desteklenen dilde takvim görünümü, gün detay ekranı ve CSV export çıktısının doğru locale ile üretildiğini doğrulama.
- [ ] **Dil değiştirme akışı testi:** Ayarlardan dil değiştirildiğinde uygulamanın yeniden başlatma gerektirmeden (veya gerektiriyorsa net bir bilgilendirmeyle) tüm ekranlarda tutarlı şekilde güncellendiğini doğrulama.
- [ ] **Fonksiyonel regresyon testi:** Tüm bu değişikliklerden sonra plan oluşturma, revize etme, şablon yönetimi gibi **iş mantığı akışlarının** Türkçe'de öncekiyle birebir aynı sonucu ürettiğini doğrulama (localization çalışmasının hiçbir hesaplamayı etkilemediğinin kanıtı).
- [ ] Accessibility etiketlerinin (mevcut analizde hiç kullanılmadığı tespit edilmişti) yeni eklenen dil desteğiyle birlikte en azından kritik butonlarda (Kaydet, Sil, İptal) çok-dilli olarak eklenmesi değerlendirilmeli (opsiyonel, kapsam genişletme kararı gerektirir).

---

## 10. Tahmini İş Yükü ve Önceliklendirme

| Faz | Efor (iş günü) | Öncelik | Bağımlılık |
|---|---|---|---|
| Faz 0 — Hazırlık | 2–2.5 | **Kritik — engelleyici** | Yok, ilk başlamalı |
| Faz 1 — Altyapı | 2–3 | **Kritik — engelleyici** | Faz 0 tamamlanmalı |
| Faz 2 — String Migration | 4–5 | Yüksek | Faz 1 tamamlanmalı |
| Faz 3 — Takvim/Vardiya | 2–3 | Yüksek | Faz 1 tamamlanmalı, Faz 2 ile paralel yürütülebilir |
| Faz 4 — Dil Seçimi | 1.5–2 | Orta | Faz 1 tamamlanmalı, Faz 2/3 ile paralel yürütülebilir |
| Faz 5 — QA/Test | 1.5–2 | Yüksek | Tüm fazlar tamamlanmalı |
| **Toplam** | **13–18 gün** | | |

**Önceliklendirme mantığı:** Faz 0 ve Faz 1, tüm sonraki işin üzerine kurulduğu temel oldukları için engelleyici (blocking) kabul edilmiştir — bu iki faz atlanır veya eksik yapılırsa (örn. üç ay-adı kaynağı tekilleştirilmeden çeviri eklenirse) sonraki tüm fazlarda tekrar iş çıkar. Faz 3 ve Faz 4, Faz 2 ile büyük ölçüde bağımsız oldukları için paralel yürütülebilir ve toplam takvimi kısaltabilir (örneğin 2 geliştirici ile ~10–12 güne indirilebilir).

---

## Localization Kapsamı Dışında Bilinçli Olarak Dokunulmayacak Alanlar

Bu çalışma kapsamında **hiçbir koşulda değiştirilmeyecek, önerilmeyecek veya etkilenmeyecek** alanlar:

- **Business logic** — vardiya atama kuralları, döngü hesaplama mantığı, izin/mesai hesaplamaları.
- **Shift oluşturma algoritmaları** — `src/services/schedulingEngine.ts` içindeki plan üretme, döngü uygulama, gün doldurma mantığı (yalnızca içindeki 1 kullanıcıya-dönük İngilizce hata mesajının dile çevrilmesi hariç — bu bir string düzeltmesi, algoritma değişikliği değil).
- **Takvim hesaplama mantığı** — hangi günün hangi vardiyayı alacağını belirleyen kurallar, tarih aritmetiği (yalnızca *görüntüleme* formatı, *hesaplama* değil).
- **State management mimarisi** — `src/stores/scheduleStore.ts` (Zustand store yapısı, state alanları, action'lar) — yalnızca dil tercihinin ayarlar state'ine bir alan olarak eklenmesi hariç, mevcut mimariye yeni bir kalıp veya kütüphane getirilmez.
- **Backend entegrasyonları / API çağrıları** — proje şu an backend'siz (yerel dosya tabanlı); bu plan hiçbir backend/API değişikliği önermez.
- **Repository katmanı** — `src/repositories/fileRepository.ts`, `memoryRepository.ts` — veri okuma/yazma mekanizması, dosya formatı, migration mantığı değişmez.
- **Service katmanı** — `schedulingEngine.ts` dışında servis mantığı bulunmuyor; var olan mantığa dokunulmaz.
- **Database yapısı** — proje veritabanı kullanmıyor (dosya tabanlı JSON depolama); bu yapı değişmez.
- **Local storage yapısı** — `STORAGE_FILE`, `GLOBAL_KEY` gibi depolama anahtarları ve dosya formatı değişmez; yalnızca depolanan ayarlar objesine bir `language` alanı eklenmesi (Faz 1) mevcut yapıya uyumlu, ek bir alan olarak yapılır.
- **Sync mekanizmaları** — proje şu an cihazlar arası senkronizasyon içermiyor; bu plan böyle bir mekanizma önermez.
- **Authentication / Authorization** — proje kimlik doğrulama içermiyor; kapsam dışı.
- **Domain modelleri** — `src/types/index.ts` içindeki `ShiftType`, `ProgramTemplate`, `PlannedDay` gibi veri şekilleri değişmez (yalnızca ayarlar tipine `language: string` gibi bir alan eklenmesi, bu bir domain model değişikliği değil, bir kullanıcı tercihi eklenmesidir).
- **Veri akışı** — component'ler arası prop akışı, store-to-component bağlanma şekli değişmez.
- **Navigation mantığı** — `expo-router` route yapısı, ekranlar arası geçiş mantığı, route parametreleri değişmez; yalnızca route başlıklarının (`Stack.Screen options.title`) metni `t()` üzerinden gelir.
- **Uygulamanın mevcut fonksiyonel davranışı** — kullanıcı hangi işlemi yaparsa yapsın (plan oluşturma, revize etme, şablon düzenleme, veri dışa aktarma), bu çalışma sonrasında **birebir aynı sonucu** üretmelidir; tek fark, ekranda görünen metnin dile göre değişmesidir.

**Bu listenin amacı:** Proje paydaşlarının, bu çalışmanın bir "yeniden yazım" veya "mimari değişiklik" olmadığını, sadece kullanıcıya görünen katmanda bir dil soyutlaması eklediğini net şekilde görebilmesidir.
