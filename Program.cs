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

builder.Services.AddDbContext<MebToplantiTakipContext>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<MeetingService>();
builder.Services.AddScoped<AttendeeService>();
builder.Services.AddScoped<LocationService>();
builder.Services.AddScoped<QrCodeService>();
builder.Services.AddScoped<FileService>();

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.MapOpenApi();
}
else
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
