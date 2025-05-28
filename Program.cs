using MebToplantiTakip.DbContexts;
using MebToplantiTakip.Services;

var builder = WebApplication.CreateBuilder(args);

// CORS politikasını ekleyin
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddDbContext<MebToplantiTakipContext>(options =>
{
    options.EnableSensitiveDataLogging();
    options.EnableDetailedErrors();
});
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<MeetingService>();
builder.Services.AddScoped<AttendeeService>();
builder.Services.AddScoped<LocationService>();
builder.Services.AddScoped<QrCodeService>();
builder.Services.AddScoped<FileService>();

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddEndpointsApiExplorer();

// Swagger yapılandırması
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "MEB Toplantı Takip API",
        Version = "v1",
        Description = "MEB Toplantı Takip Sistemi API Dokümantasyonu",
        Contact = new Microsoft.OpenApi.Models.OpenApiContact
        {
            Name = "Veli Keçeci",
            Email = "velikececi@gmail.com"
        }
    });
});

var app = builder.Build();

// Swagger UI'ı her ortamda aktif et
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "MEB Toplantı Takip API V1");
    c.RoutePrefix = "swagger"; // URL'de /swagger olarak erişilebilir
});

if (!app.Environment.IsDevelopment())
{
    // Production ortamında HTTPS yönlendirmesi
    app.UseHsts();
}

app.UseHttpsRedirection();

// Güvenlik başlıkları
app.Use(async (context, next) =>
{
    context.Response.Headers.Add("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Add("X-Frame-Options", "DENY");
    context.Response.Headers.Add("X-XSS-Protection", "1; mode=block");
    context.Response.Headers.Add("Referrer-Policy", "strict-origin-when-cross-origin");
    await next();
});

// CORS middleware'ini etkinleştirin
app.UseCors("AllowReactApp");

app.MapControllers();

app.Run();
