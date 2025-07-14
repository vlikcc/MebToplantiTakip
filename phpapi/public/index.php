<?php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;
use DI\Container;
use App\Config\Database;
use App\Middleware\CorsMiddleware;

require_once __DIR__ . '/../vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

// Create Container
$container = new Container();
AppFactory::setContainer($container);

// Create App
$app = AppFactory::create();

// Add Error Middleware
$errorMiddleware = $app->addErrorMiddleware(true, true, true);

// Add CORS Middleware
$app->add(new CorsMiddleware());

// Database connection
$container->set(Database::class, function () {
    return new Database();
});

// Routes
$app->group('/api/v1', function ($group) {
    // Users routes
    $group->get('/users', '\App\Controllers\UsersController:getAllUsers');
    $group->get('/users/{id}', '\App\Controllers\UsersController:getUserById');
    $group->get('/users/device/{deviceId}', '\App\Controllers\UsersController:getUserByDeviceId');
    $group->post('/users', '\App\Controllers\UsersController:createUser');
    $group->put('/users/{id}', '\App\Controllers\UsersController:updateUser');
    $group->delete('/users/{id}', '\App\Controllers\UsersController:deleteUser');
    
    // Meetings routes
    $group->get('/meetings', '\App\Controllers\MeetingsController:getAllMeetings');
    $group->get('/meetings/{id}', '\App\Controllers\MeetingsController:getMeetingById');
    $group->post('/meetings', '\App\Controllers\MeetingsController:createMeeting');
    $group->put('/meetings/{id}', '\App\Controllers\MeetingsController:updateMeeting');
    $group->delete('/meetings/{id}', '\App\Controllers\MeetingsController:deleteMeeting');
    
    // Attendees routes
    $group->get('/attendees', '\App\Controllers\AttendeesController:getAllAttendees');
    $group->get('/attendees/meeting/{meetingId}', '\App\Controllers\AttendeesController:getMeetingAttendees');
    $group->get('/attendees/user/{userId}', '\App\Controllers\AttendeesController:getUserMeetings');
    $group->post('/attendees', '\App\Controllers\AttendeesController:addAttendee');
    $group->delete('/attendees/{id}', '\App\Controllers\AttendeesController:deleteAttendee');
    
    // Locations routes
    $group->get('/locations', '\App\Controllers\LocationsController:getAllLocations');
    $group->get('/locations/{id}', '\App\Controllers\LocationsController:getLocationById');
    $group->post('/locations', '\App\Controllers\LocationsController:createLocation');
    $group->put('/locations/{id}', '\App\Controllers\LocationsController:updateLocation');
    $group->delete('/locations/{id}', '\App\Controllers\LocationsController:deleteLocation');
    
    // QR Code routes
    $group->get('/qrcode/meeting/{meetingId}', '\App\Controllers\QrCodeController:generateMeetingQrCode');
    $group->post('/qrcode/custom', '\App\Controllers\QrCodeController:generateCustomQrCode');
    
    // File upload routes
    $group->post('/files/upload', '\App\Controllers\FilesController:uploadFile');
    $group->get('/files/download/{filename}', '\App\Controllers\FilesController:downloadFile');
});

$app->run(); 