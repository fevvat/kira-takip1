# Açık Kaynak Ön Yüz Referans Notları

KiraTakip yeniden düzenlemesinde [Tabler](https://github.com/tabler/tabler) uygulama kabuğundan bilgi yoğun ama sakin yan menü, veri odaklı sayfa başlığı ve araç çubuğu yapısı; [shadcn-admin](https://github.com/satnaing/shadcn-admin) örneğinden ise erişilebilir ve duyarlı yönetim paneli düzeni ile yeniden kullanılabilir ekran kalıpları alınacaktır.

Uygulama, dekoratif kartların baskın olduğu bir pazarlama yüzeyi gibi değil; iş listeleri, bağlamsal işlem araçları, seçilebilir kayıt satırları, aranabilir/filtrelenebilir tablolar ve net durum etiketleri olan operasyonel bir ürün olarak yeniden düzenlenecektir. Mevcut teknoloji yığını korunacak ve haricî kaynak kodu doğrudan kopyalanmayacaktır.

| Kaynak | İncelenen alan | KiraTakip’e uygulanan ilke |
|---|---|---|
| [Tabler](https://github.com/tabler/tabler) | Uygulama kabuğu ve yoğun dashboard hiyerarşisi | Az yuvarlatılmış beyaz yüzey, dengeli yan menü ve işlem öncelikli sayfa düzeni |
| [shadcn-admin](https://github.com/satnaing/shadcn-admin) | Duyarlı yönetim paneli, erişilebilir etkileşim kalıpları | Gruplu navigasyon, korumalı çalışma alanı ve odak halkası korunumu |
| [finance-dashboard](https://github.com/Thakurkartik30/finance-dashboard) | Gelir-gider özetleri ile işlem listesi/filtreleme modeli | Finans ekranlarında metrik + kayıt listesi birlikteliği ve tablo yoğunluğuna öncelik |
| [mini-pms](https://github.com/vicheanath/mini-pms) | Gayrimenkul yönetiminde mülk kaydı için CRUD akışı | Portföy, kiracı ve sözleşme iş akışlarının ayrı operasyon modülleri olarak korunması |

Bu dört kaynağın ortak sonucu, ürünün ana ekranında süsleme yerine görev hiyerarşisine; liste ekranlarında kart kopyasına değil, tutarlı veri tablosu ve bağlamsal eylem modeline ağırlık verilmesidir.
