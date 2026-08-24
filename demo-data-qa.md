# Statik Örnek Veri Kalite Kontrolü

Örnek portföy, “Güneşli Yaşam Sitesi” altında iki blok ve altı bağımsız bölüm olarak görünmektedir. Dört dolu ve iki boş daire; dört kiracı, dört sözleşme ve iki geciken tahakkukla tutarlı biçimde ilişkilendirilmiştir.

Finans ekranında toplam gelir **₺64.500**, toplam gider **₺14.950** ve net bakiye **₺49.550** ile gösterilmektedir. Yaklaşan sözleşmeler, geciken tahsilatlar, demirbaşlar ve belge arşivi de aynı senaryo bağlamında dolu görünmektedir. Mobil görünümde modüller tek sütuna geçmekte; geniş tablolar yatay kaydırmalı kapsayıcı içinde kalmaktadır.

Örnek kayıtlar veritabanına eklenmemiştir. Kullanıcı çalışma alanında gerçek bir kayıt oluştuğunda arayüz gerçek kayıtları öncelemektedir.

Örnek veri modunda her satırdaki düzenle/sil denetimleri yerine “Örnek kayıt” ibaresi gösterilmektedir. Böylece statik veriler için backend mutasyonu tetiklenmez; üstteki yeni kayıt eylemleri ise kullanıcının ilk gerçek kaydını oluşturabilmesi için kullanılabilir kalır.

Örnek veri karar mantığı ve satır mutasyon izni Vitest ile doğrulanmıştır. Test kümesi; örnek modda mutasyon izninin kapalı olduğunu, salt okunur gerçek kayıtta da aksiyonların engellendiğini ve yalnızca gerçek/salt okunur olmayan kayıtlarda işlemlerin etkin olduğunu kapsar.

Modül bazlı geri dönüş kontrolünde gerçek portföy kaydı (Çınar sitesi ve bina kaydı) korunmuştur. Boş kalan tahsilat, gelir-gider, sözleşme, demirbaş ve hatırlatma modülleri ise statik örnek verilerle dolu olarak görünmektedir. Örnek satırlar “Örnek kayıt” durumunu korur; gerçek portföy satırlarındaki düzenleme/silme eylemleri kullanılabilir kalır.
