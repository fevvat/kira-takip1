# Detaylı Bölüm ve Geciken Tahsilat Kontrolü

Bağımsız bölüm formu; bina, bölüm numarası, tür, kat, oda sayısı, net/brüt alan, eşyalı durumu, hedef kira, aidat, doluluk, otopark ve elektrik/su/doğalgaz sayaç numaralarını kapsar. Sunucu tarafındaki doğrulama şeması bu alanların geçerli değerlerini kontrol eder.

Genel Bakış ekranı, geciken tahsilatları kırmızı öncelikli bir yüzeyde kiracı, bağımsız bölüm, vade ve kalan tutar ile gösterir. Hatırlatmalar ekranındaki günlük kural, Türkiye saatiyle 09:00'da geciken tahsilatları kontrol edecek şekilde yapılandırılır; kullanıcı “Kuralı başlat” ile kuralı kendi çalışma alanı için etkinleştirir.

Tip denetimi, üretim derlemesi ve 21 Vitest testi başarıyla tamamlandı. Zamanlanmış callback uygulama yayını sonrasında kullanıcı tarafından etkinleştirilmeye hazırdır.

Günlük hatırlatma, sadece proje sahibi hesabının etkinleştirebildiği owner bildirim kanalıyla çalışır. Zamanlanmış callback; cron isteği olduğunu ve istek görev kimliğinin kuralda saklanan görev kimliğiyle eşleştiğini kontrol eder. Ek testler, owner yetkisi, görev eşleşmesi ve geciken kayıt bulunduğunda bildirim gönderilmesini kapsar. Güncel test kümesi 24 testten oluşur.

Zamanlanmış kontrol artık ilgili kullanıcı için `appNotifications` kaydı oluşturur ve bu kayıt Hatırlatmalar ekranında gösterilir. Günlük görev için oluşturma, tekrar etkinleştirme ve duraklatma akışları, ayrıca uygulama içi bildirim kaydı Vitest ile sınanmıştır. Güncel test kümesi 28 testten oluşur.

Hatırlatma router yordamları doğrudan sınanmıştır: yetkisiz kullanıcı reddi, ilk görev oluşturma, var olan görevi yeniden etkinleştirme ve duraklatma davranışları doğrulanmıştır. Zamanlanmış callback için cron olmayan istek, taskUid uyuşmazlığı, duraklatılmış kural ve başarılı uygulama içi bildirim/owner uyarısı senaryoları da doğrudan Vitest kapsamındadır. Güncel test kümesi 35 testten oluşur.
