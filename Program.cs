using MebToplantiTakip.DbContexts;
using MebToplantiTakip.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<MebToplantiTakipContext>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<MeetingService>();
builder.Services.AddScoped<AttendeeService>();
builder.Services.AddScoped<LocationService>();
builder.Services.AddScoped<QrCodeService>();


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



app.MapControllers();

app.Run();
