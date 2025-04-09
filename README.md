# MEB Toplantı Takip Sistemi

Bu proje, Milli Eğitim Bakanlığı için geliştirilmiş bir toplantı takip sistemidir. ASP.NET Core kullanılarak geliştirilmiştir.

## 🚀 Özellikler

- Toplantı yönetimi
- Katılımcı takibi
- Toplantı gündemi oluşturma
- Toplantı sonuçlarının kaydedilmesi

## 🛠️ Teknolojiler

- ASP.NET Core
- Entity Framework Core
- SQL Server
- RESTful API

## 📋 Proje Yapısı

```
MebToplantiTakip/
├── Controllers/        # API Controller'ları
├── Services/          # İş mantığı servisleri
├── Dtos/             # Veri transfer nesneleri
├── Entities/         # Veritabanı varlıkları
├── DbContexts/       # Veritabanı bağlamı
├── Migrations/       # Veritabanı migrasyonları
└── Program.cs        # Uygulama başlangıç noktası
```

## ⚙️ Kurulum

1. Projeyi klonlayın:
```bash
git clone [repo-url]
```

2. Proje dizinine gidin:
```bash
cd MebToplantiTakip
```

3. Bağımlılıkları yükleyin:
```bash
dotnet restore
```

4. Veritabanını oluşturun:
```bash
dotnet ef database update
```

5. Uygulamayı çalıştırın:
```bash
dotnet run
```

## 🔧 Geliştirme

- Visual Studio 2022 veya Visual Studio Code kullanabilirsiniz
- .NET 6.0 SDK gereklidir
- SQL Server gereklidir

## 📝 API Dokümantasyonu

API endpoint'leri için `MebToplantiTakip.http` dosyasını inceleyebilirsiniz.

## 🤝 Katkıda Bulunma

1. Bu depoyu fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. 