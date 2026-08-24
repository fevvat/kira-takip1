# Statik Veri Görünürlüğü Bulgusu

Ön izleme, çalışma alanında mevcut gerçek site ve bina kayıtları bulunduğunu; ancak tahakkuk gibi bazı modüllerin boş kaldığını gösterdi. Mevcut global örnek veri geri dönüşü, herhangi bir gerçek kayıt saptandığında tüm demo veriyi gizlemektedir. Bu nedenle geri dönüş davranışı modül bazında uygulanacak; gerçek kayıtlar korunduktan sonra yalnızca boş modüller statik örneklerle doldurulacaktır.
